import { CatalogItem } from '@/model/collection';
import { Aoi } from '@/model/imagery-search';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDarkMode } from '@/shared/services';
import {
  Bounds,
  boundsOfCoordinates,
  imageQuad,
  mergeBounds,
  ringAreaKm2,
} from '@/shared/utils/geo.util';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBookmark,
  lucideMinus,
  lucidePentagon,
  lucidePlus,
  lucideSquare,
} from '@ng-icons/lucide';
import { GeoJSONSource, ImageSource, Map as MapLibreMap, MapLayerMouseEvent } from 'maplibre-gl';
import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawRenderMode,
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';

const STYLE_LIGHT = 'https://tiles.openfreemap.org/styles/bright';
const STYLE_DARK = 'https://tiles.openfreemap.org/styles/positron';
const styleFor = (mode: 'light' | 'dark') => (mode === 'dark' ? STYLE_DARK : STYLE_LIGHT);
const SEOUL: [number, number] = [126.978, 37.5665];
const AOI_COLOR = '#2563eb';

const FOOTPRINT_SOURCE = 'footprints';
const FOOTPRINT_FILL = 'footprint-fill';
const FOOTPRINT_LINE = 'footprint-line';
const browseKey = (itemId: string) => `browse-${itemId}`;

type DrawMode = 'rectangle' | 'polygon';

@Component({
  selector: 'imagery-map',
  standalone: true,
  imports: [NgIcon, ZardButtonComponent],
  viewProviders: [
    provideIcons({
      lucideSquare,
      lucidePentagon,
      lucideBookmark,
      lucidePlus,
      lucideMinus,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-full w-full overflow-hidden">
      <div #mapEl class="h-full w-full"></div>

      <div class="absolute top-4 left-4 z-10 flex gap-2">
        <button
          type="button"
          z-button
          zType="outline"
          zSize="sm"
          [class]="drawMode() === 'rectangle' ? 'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90' : 'bg-background dark:bg-background hover:bg-accent dark:hover:bg-accent'"
          (click)="toggleDraw('rectangle')"
        >
          <ng-icon name="lucideSquare" />
          Rectangle
        </button>
        <button
          type="button"
          z-button
          zType="outline"
          zSize="sm"
          [class]="drawMode() === 'polygon' ? 'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90' : 'bg-background dark:bg-background hover:bg-accent dark:hover:bg-accent'"
          (click)="toggleDraw('polygon')"
        >
          <ng-icon name="lucidePentagon" />
          Polygon
        </button>
        <button
          type="button"
          z-button
          zType="outline"
          zSize="sm"
          class="bg-background dark:bg-background hover:bg-accent dark:hover:bg-accent"
          disabled
          title="Coming soon"
        >
          <ng-icon name="lucideBookmark" />
          Saved AOIs
        </button>
      </div>

      <div class="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          type="button"
          z-button
          zType="outline"
          zSize="icon"
          class="bg-background dark:bg-background hover:bg-accent dark:hover:bg-accent"
          aria-label="Zoom in"
          (click)="zoom(1)"
        >
          <ng-icon name="lucidePlus" />
        </button>
        <button
          type="button"
          z-button
          zType="outline"
          zSize="icon"
          class="bg-background dark:bg-background hover:bg-accent dark:hover:bg-accent"
          aria-label="Zoom out"
          (click)="zoom(-1)"
        >
          <ng-icon name="lucideMinus" />
        </button>
      </div>
    </div>
  `,
  host: { class: 'block h-full w-full' },
})
export class ImageryMapComponent {
  readonly items = input<CatalogItem[]>([]);
  readonly selectedId = input<string | null>(null);
  readonly hoveredId = input<string | null>(null);
  /** footprint를 표시할 itemId 목록 */
  readonly footprintIds = input<string[]>([]);
  /** 브라우즈 이미지를 표시할 itemId 목록 */
  readonly browseIds = input<string[]>([]);
  readonly aoi = input<Aoi | null>(null);
  /** Browse 이미지 불투명도(%) */
  readonly opacity = input(60);

  readonly aoiChange = output<Aoi>();
  readonly itemClick = output<string>();

  protected readonly drawMode = signal<DrawMode | null>(null);
  /** 현재 지도 줌 레벨 (AOI 없는 검색 가능 여부 판단용) */
  readonly zoomLevel = signal(0);

  private readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly darkMode = inject(ZardDarkMode);
  private currentStyle = styleFor(this.darkMode.themeMode());

  private map?: MapLibreMap;
  private draw?: TerraDraw;
  private readonly ready = signal(false);
  private fittedItems?: CatalogItem[];
  private fittedSelected: string | null = null;
  private readonly browseLayers = new Set<string>();
  private appliedState = { selected: null as string | null, hovered: null as string | null };

  constructor() {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.initMap()));

    this.destroyRef.onDestroy(() => {
      this.draw?.stop();
      this.map?.remove();
    });

    effect(() => {
      const url = styleFor(this.darkMode.themeMode());
      untracked(() => this.changeStyle(url));
    });

    // 결과 footprint 갱신 + 결과 영역으로 이동
    effect(() => {
      const items = this.items();
      if (!this.ready()) return;
      // 테마 전환으로 ready가 다시 켜질 때는 지도 위치를 유지한다.
      if (items === this.fittedItems) return;
      this.fittedItems = items;
      untracked(() => this.fitToItems(items));
    });

    effect(() => {
      const items = this.items();
      const ids = this.footprintIds();
      if (!this.ready()) return;
      untracked(() => this.syncFootprints(items, ids));
    });

    effect(() => {
      const selected = this.selectedId();
      const hovered = this.hoveredId();
      if (!this.ready()) return;
      untracked(() => this.applyFeatureState(selected, hovered));
    });

    // 목록에서 선택한 항목의 footprint로 이동
    effect(() => {
      const selected = this.selectedId();
      if (!selected) this.fittedSelected = null;
      if (!this.ready() || !selected) return;
      if (selected === this.fittedSelected) return;
      this.fittedSelected = selected;
      untracked(() => {
        const item = this.items().find((i) => i.itemId === selected);
        if (item) this.fitToItems([item]);
      });
    });

    effect(() => {
      const items = this.items();
      const ids = this.browseIds();
      const opacity = this.opacity();
      if (!this.ready()) return;
      untracked(() => this.syncBrowse(items, ids, opacity));
    });

    // 패널에서 AOI를 지우거나 복원하면 지도에도 반영
    effect(() => {
      const aoi = this.aoi();
      if (!this.ready()) return;
      untracked(() => {
        const draw = this.draw;
        if (!draw) return;
        if (aoi) {
          if (draw.getSnapshot().length) return;
          draw.addFeatures([
            {
              type: 'Feature',
              geometry: aoi.geometry as GeoJSON.Polygon,
              properties: { mode: aoi.shape },
            },
          ]);
          return;
        }
        draw.clear();
        draw.setMode('static');
        this.drawMode.set(null);
      });
    });
  }

  /** 현재 지도 화면 영역을 사각형 AOI로 반환한다. */
  viewportAoi(): Aoi | null {
    const bounds = this.map?.getBounds();
    if (!bounds) return null;
    const [w, s, e, n] = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    const ring = [
      [w, s],
      [e, s],
      [e, n],
      [w, n],
      [w, s],
    ];
    return { shape: 'rectangle', geometry: { type: 'Polygon', coordinates: [ring] }, areaKm2: ringAreaKm2(ring) };
  }

  protected zoom(delta: 1 | -1) {
    if (delta > 0) this.map?.zoomIn();
    else this.map?.zoomOut();
  }

  protected toggleDraw(mode: DrawMode) {
    if (!this.draw) return;
    if (this.drawMode() === mode) {
      this.draw.setMode('static');
      this.drawMode.set(null);
      return;
    }
    this.draw.setMode(mode);
    this.drawMode.set(mode);
  }

  private initMap() {
    const map = new MapLibreMap({
      container: this.mapEl().nativeElement,
      style: this.currentStyle,
      center: SEOUL,
      zoom: 9,
      attributionControl: { compact: true },
    });
    this.map = map;

    const observer = new ResizeObserver(() =>
      requestAnimationFrame(() => {
        map.resize();
        // 크기 변경으로 캔버스가 지워진 채 한 프레임이 그려지지 않도록 즉시 다시 그린다.
        map.redraw();
      }),
    );
    observer.observe(this.mapEl().nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());

    map.on('load', () => {
      map.on('click', FOOTPRINT_FILL, (e: MapLayerMouseEvent) => {
        if (this.drawMode()) return;
        const id = e.features?.[0]?.properties?.['itemId'] as string | undefined;
        if (id) this.zone.run(() => this.itemClick.emit(id));
      });
      map.on('mouseenter', FOOTPRINT_FILL, () => {
        if (!this.drawMode()) map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', FOOTPRINT_FILL, () => (map.getCanvas().style.cursor = ''));

      this.setupLayers(map);
      this.zoomLevel.set(map.getZoom());
      map.on('zoom', () => this.zoomLevel.set(map.getZoom()));
      this.ready.set(true);
    });
  }

  /** 스타일이 바뀌면 사라지는 footprint 레이어와 AOI 그리기 도구를 (다시) 만든다. */
  private setupLayers(map: MapLibreMap) {
    map.addSource(FOOTPRINT_SOURCE, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      promoteId: 'itemId',
    });
    map.addLayer({
      id: FOOTPRINT_FILL,
      type: 'fill',
      source: FOOTPRINT_SOURCE,
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#1e3a8a',
          ['boolean', ['feature-state', 'hovered'], false],
          '#2563eb',
          '#3b82f6',
        ],
        // 테두리만 보이게 하되, 클릭/호버 판정을 위해 fill 레이어는 투명하게 둔다.
        'fill-opacity': 0,
      },
    });
    map.addLayer({
      id: FOOTPRINT_LINE,
      type: 'line',
      source: FOOTPRINT_SOURCE,
      paint: {
        'line-color': '#2563eb',
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          3,
          ['boolean', ['feature-state', 'hovered'], false],
          2.5,
          1.5,
        ],
      },
    });

    this.appliedState = { selected: null, hovered: null };
    this.initDraw(map);
  }

  /** 라이트/다크 테마에 맞는 베이스 지도로 교체한다. */
  private changeStyle(url: string) {
    const map = this.map;
    if (!map || url === this.currentStyle) return;
    this.currentStyle = url;
    this.ready.set(false);
    this.draw?.stop();
    this.draw = undefined;
    this.drawMode.set(null);
    this.browseLayers.clear();
    map.once('style.load', () => {
      this.setupLayers(map);
      this.ready.set(true);
    });
    map.setStyle(url, { diff: false });
  }

  private initDraw(map: MapLibreMap) {
    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        new TerraDrawRectangleMode({
          styles: {
            fillColor: AOI_COLOR,
            fillOpacity: 0.15,
            outlineColor: AOI_COLOR,
            outlineWidth: 2,
          },
        }),
        new TerraDrawPolygonMode({
          styles: {
            fillColor: AOI_COLOR,
            fillOpacity: 0.15,
            outlineColor: AOI_COLOR,
            outlineWidth: 2,
          },
        }),
        new TerraDrawRenderMode({
          modeName: 'static',
          styles: {
            polygonFillColor: AOI_COLOR,
            polygonFillOpacity: 0.15,
            polygonOutlineColor: AOI_COLOR,
            polygonOutlineWidth: 2,
          },
        }),
      ],
    });
    draw.start();
    draw.setMode('static');
    this.draw = draw;

    draw.on('finish', (id) => {
      const snapshot = draw.getSnapshot();
      const feature = snapshot.find((f) => f.id === id);
      if (!feature || feature.geometry.type !== 'Polygon') return;

      // AOI는 하나만 유지한다.
      const stale = snapshot.filter((f) => f.id !== id).map((f) => f.id as string);
      if (stale.length) draw.removeFeatures(stale);
      draw.setMode('static');

      const coordinates = feature.geometry.coordinates as number[][][];
      const aoi: Aoi = {
        shape: feature.properties['mode'] === 'rectangle' ? 'rectangle' : 'polygon',
        geometry: { type: 'Polygon', coordinates },
        areaKm2: ringAreaKm2(coordinates[0]),
      };
      this.zone.run(() => {
        this.drawMode.set(null);
        this.aoiChange.emit(aoi);
      });
    });
  }

  private syncFootprints(items: CatalogItem[], ids: string[]) {
    const source = this.map?.getSource<GeoJSONSource>(FOOTPRINT_SOURCE);
    if (!source) return;
    source.setData({
      type: 'FeatureCollection',
      features: items
        .filter((item) => ids.includes(item.itemId))
        .map((item) => ({
          type: 'Feature',
          geometry: item.geometry as GeoJSON.Geometry,
          properties: { itemId: item.itemId },
        })),
    });
    this.appliedState = { selected: null, hovered: null };
    this.applyFeatureState(this.selectedId(), this.hoveredId());
  }

  private applyFeatureState(selected: string | null, hovered: string | null) {
    const map = this.map;
    if (!map?.getSource(FOOTPRINT_SOURCE)) return;
    const set = (id: string | null, key: 'selected' | 'hovered', value: boolean) => {
      if (id) map.setFeatureState({ source: FOOTPRINT_SOURCE, id }, { [key]: value });
    };
    set(this.appliedState.selected, 'selected', false);
    set(this.appliedState.hovered, 'hovered', false);
    set(selected, 'selected', true);
    set(hovered, 'hovered', true);
    this.appliedState = { selected, hovered };
  }

  private fitToItems(items: CatalogItem[]) {
    const bounds = mergeBounds(
      items.map((i) => (i.bbox?.length === 4 ? (i.bbox as Bounds) : this.boundsOf(i))),
    );
    if (!bounds) return;
    this.map?.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: 60, maxZoom: 12, duration: 600 },
    );
  }

  private boundsOf(item: CatalogItem): Bounds {
    const ring = (item.geometry as { coordinates?: number[][][] }).coordinates?.[0] ?? [];
    return boundsOfCoordinates(ring);
  }

  private syncBrowse(items: CatalogItem[], ids: string[], opacity: number) {
    const map = this.map;
    if (!map) return;

    const wanted = new Map<string, CatalogItem>();
    for (const item of items) {
      if (ids.includes(item.itemId) && item.assets?.thumbnail?.href) wanted.set(item.itemId, item);
    }

    for (const key of [...this.browseLayers]) {
      if (wanted.has(key)) continue;
      if (map.getLayer(browseKey(key))) map.removeLayer(browseKey(key));
      if (map.getSource(browseKey(key))) map.removeSource(browseKey(key));
      this.browseLayers.delete(key);
    }

    for (const [itemId, item] of wanted) {
      const quad = imageQuad(item.geometry);
      if (!quad) continue;
      const key = browseKey(itemId);
      if (!this.browseLayers.has(itemId)) {
        map.addSource(key, { type: 'image', url: item.assets.thumbnail!.href, coordinates: quad });
        map.addLayer(
          { id: key, type: 'raster', source: key, paint: { 'raster-opacity': opacity / 100 } },
          FOOTPRINT_FILL,
        );
        this.browseLayers.add(itemId);
      } else {
        map.setPaintProperty(key, 'raster-opacity', opacity / 100);
        (map.getSource(key) as ImageSource | undefined)?.setCoordinates(quad);
      }
    }
  }
}
