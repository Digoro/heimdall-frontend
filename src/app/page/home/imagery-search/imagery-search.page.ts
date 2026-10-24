import { CatalogItem } from '@/model/collection';
import {
  Aoi,
  createDefaultCriteria,
  ImagerySearchCriteria,
  MIN_VIEW_SEARCH_ZOOM,
  PAGE_SIZE,
  SortOption,
} from '@/model/imagery-search';
import { ImageryService } from '@/service/imagery.service';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardSheetService } from '@/shared/components/sheet';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronDown,
  lucideChevronUp,
  lucidePanelLeftClose,
  lucidePanelLeftOpen,
  lucideSearch,
} from '@ng-icons/lucide';
import { toast } from 'ngx-sonner';
import { itemTitle } from './imagery-format';
import { ImageryMapComponent } from './imagery-map.component';
import { ItemDetailComponent } from './item-detail.component';
import { ResultListComponent } from './result-list.component';
import { SearchCriteriaComponent } from './search-criteria.component';

@Component({
  standalone: true,
  imports: [
    NgIcon,
    ZardButtonComponent,
    SearchCriteriaComponent,
    ResultListComponent,
    ImageryMapComponent,
  ],
  providers: [ImageryService],
  viewProviders: [
    provideIcons({
      lucideChevronDown,
      lucideChevronUp,
      lucidePanelLeftClose,
      lucidePanelLeftOpen,
      lucideSearch,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './imagery-search.page.html',
  host: { class: 'block h-full' },
})
export class ImagerySearchPage {
  private readonly imagery = inject(ImageryService);
  private readonly sheet = inject(ZardSheetService);

  private readonly map = viewChild.required(ImageryMapComponent);

  /** 편집 중인 조건 */
  protected readonly criteria = signal<ImagerySearchCriteria>(createDefaultCriteria());
  /** 마지막으로 검색한 조건 (검색 없이 접으면 이 값으로 복원) */
  private readonly appliedCriteria = signal<ImagerySearchCriteria | null>(null);
  /** 마지막 검색이 AOI 없이 지도 화면 영역으로 수행됐는지 */
  protected readonly viewSearch = signal(false);
  /** 실제 요청에 쓰는 조건 (화면 영역 검색이면 aoi가 채워져 있다) */
  private requestCriteria = createDefaultCriteria();
  protected readonly items = signal<CatalogItem[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly pageSize = signal<number>(PAGE_SIZE);
  protected readonly sort = signal<SortOption>('newest');
  protected readonly loading = signal(false);
  /** 한 번이라도 검색했는지 (조건 폼 ↔ 결과 화면 전환) */
  protected readonly searched = signal(false);
  protected readonly criteriaOpen = signal(true);
  protected readonly resultsOpen = signal(true);
  protected readonly panelCollapsed = signal(false);

  protected readonly selectedId = signal<string | null>(null);
  protected readonly hoveredId = signal<string | null>(null);
  protected readonly showFootprints = signal(true);
  protected readonly showBrowse = signal(false);
  /** 항목별 Browse 버튼으로 개별 표시 중인 itemId */
  private readonly browseSet = signal<ReadonlySet<string>>(new Set());
  /** 항목별 Footprint 버튼으로 개별 표시 중인 itemId (전체 표시가 꺼져 있을 때만 사용) */
  private readonly footprintSet = signal<ReadonlySet<string>>(new Set());

  protected readonly browseIds = computed(() => {
    const withThumbnail = this.items()
      .filter((i) => i.assets?.thumbnail?.href)
      .map((i) => i.itemId);
    return this.showBrowse()
      ? withThumbnail
      : withThumbnail.filter((id) => this.browseSet().has(id));
  });

  protected readonly footprintIds = computed(() => {
    const ids = this.items().map((i) => i.itemId);
    return this.showFootprints() ? ids : ids.filter((id) => this.footprintSet().has(id));
  });

  protected readonly canSearch = computed(
    () => !!this.criteria().aoi || this.map().zoomLevel() >= MIN_VIEW_SEARCH_ZOOM,
  );

  protected search() {
    const criteria = this.criteria();
    let request = criteria;
    if (!criteria.aoi) {
      const view = this.map().viewportAoi();
      if (!view || this.map().zoomLevel() < MIN_VIEW_SEARCH_ZOOM) return;
      request = { ...criteria, aoi: view };
    }
    this.appliedCriteria.set(criteria);
    this.viewSearch.set(!criteria.aoi);
    this.requestCriteria = request;
    this.page.set(1);
    this.run();
  }

  /** 검색 없이 조건을 접으면 편집 중이던 조건을 버리고 마지막 검색 조건으로 복원한다. */
  protected toggleCriteria() {
    const applied = this.appliedCriteria();
    if (this.criteriaOpen()) {
      if (!applied) return;
      this.criteria.set(applied);
    }
    this.criteriaOpen.update((open) => !open);
  }

  protected toggleResults() {
    this.resultsOpen.update((open) => !open);
  }

  protected selectItem(itemId: string) {
    this.selectedId.set(itemId);
  }

  protected reset() {
    this.criteria.set(createDefaultCriteria());
    this.items.set([]);
    this.total.set(0);
    this.searched.set(false);
    this.appliedCriteria.set(null);
    this.viewSearch.set(false);
    this.criteriaOpen.set(true);
    this.selectedId.set(null);
    this.browseSet.set(new Set());
    this.footprintSet.set(new Set());
  }

  protected changePage(page: number) {
    this.page.set(page);
    this.run();
  }

  protected changePageSize(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
    this.run();
  }

  protected changeSort(sort: SortOption) {
    this.sort.set(sort);
    this.page.set(1);
    this.run();
  }

  protected setAoi(aoi: Aoi) {
    this.criteria.update((c) => ({ ...c, aoi }));
  }

  protected openPanel() {
    this.panelCollapsed.set(false);
  }

  /** 전체 Footprint 스위치: 켜면 전부, 끄면 개별 선택까지 모두 해제 */
  protected setAllFootprints(on: boolean) {
    this.showFootprints.set(on);
    this.footprintSet.set(new Set());
  }

  /** 전체 Browse 스위치: 켜면 전부, 끄면 개별 선택까지 모두 해제 */
  protected setAllBrowse(on: boolean) {
    this.showBrowse.set(on);
    this.browseSet.set(new Set());
  }

  protected toggleFootprint(itemId: string) {
    const current = new Set(this.footprintSet());
    if (this.showFootprints()) {
      // 전체 표시 중에 한 항목을 끄면 나머지를 개별 표시 상태로 전환한다.
      this.showFootprints.set(false);
      this.items().forEach((i) => i.itemId !== itemId && current.add(i.itemId));
      current.delete(itemId);
    } else if (current.has(itemId)) {
      current.delete(itemId);
    } else {
      current.add(itemId);
    }
    this.footprintSet.set(current);
  }

  protected toggleBrowse(itemId: string) {
    const current = new Set(this.browseSet());
    if (this.showBrowse()) {
      // 전체 표시 중에 한 항목을 끄면 나머지를 개별 표시 상태로 전환한다.
      this.showBrowse.set(false);
      this.items().forEach((i) => i.itemId !== itemId && current.add(i.itemId));
      current.delete(itemId);
    } else if (current.has(itemId)) {
      current.delete(itemId);
    } else {
      current.add(itemId);
    }
    this.browseSet.set(current);
  }

  protected openDetail(itemId: string) {
    const item = this.items().find((i) => i.itemId === itemId);
    if (!item) return;
    this.selectedId.set(itemId);
    this.sheet.create({
      zContent: ItemDetailComponent,
      zData: item,
      zSide: 'right',
      zTitle: itemTitle(item),
      zDescription: item.itemId,
      zOkText: 'Add to cart',
      zCancelText: 'Close',
      zOnOk: () => this.addToCart(item),
    });
  }

  protected addToCart(_item: CatalogItem) {
    // Cart 기능이 준비되면 연결한다.
    toast.info('Cart is coming soon');
  }

  private run() {
    this.loading.set(true);
    this.imagery.search(this.requestCriteria, this.page(), this.sort(), this.pageSize()).subscribe({
      next: ({ items, total }) => {
        this.items.set(items);
        this.total.set(total);
        this.searched.set(true);
        this.criteriaOpen.set(false);
        this.resultsOpen.set(true);
        this.selectedId.set(null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        toast.error('Failed to search imagery');
      },
    });
  }
}
