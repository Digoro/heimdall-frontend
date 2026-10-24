import { ImagingMode } from '@/model/collection';
import {
  createDefaultCriteria,
  IMAGING_MODES,
  ImagerySearchCriteria,
  INCIDENCE_RANGE,
  Polarization,
  POLARIZATIONS,
  PRODUCT_TYPES,
} from '@/model/imagery-search';
import { ProductType } from '@/model/product';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDatePickerComponent } from '@/shared/components/date-picker';
import { ZardSelectImports } from '@/shared/components/select';
import { ZardSliderComponent } from '@/shared/components/slider';
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMapPin, lucideSearch, lucideX } from '@ng-icons/lucide';

interface Chip {
  key: string;
  label: string;
  remove: () => void;
}

const ANGLE_SPAN = INCIDENCE_RANGE.max - INCIDENCE_RANGE.min;
/** 슬라이더는 0~1 정규화 모드로 쓰고(zMax > 1이면 0~100만 지원), 각도로 변환한다. */
const toFraction = (angle: number) => (angle - INCIDENCE_RANGE.min) / ANGLE_SPAN;
const toAngle = (fraction: number) => Math.round(INCIDENCE_RANGE.min + fraction * ANGLE_SPAN);

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const md = (d: Date) => ymd(d).slice(5);

@Component({
  selector: 'search-criteria',
  standalone: true,
  imports: [
    NgIcon,
    ZardButtonComponent,
    ZardDatePickerComponent,
    ZardSelectImports,
    ZardSliderComponent,
  ],
  viewProviders: [provideIcons({ lucideMapPin, lucideX, lucideSearch })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (summary()) {
      <div class="rounded-lg border p-3">
        <div class="flex flex-wrap items-center gap-2">
          @if (viewSearch() && !criteria().aoi) {
            <span class="bg-muted rounded-full border px-2.5 py-1 text-xs">Map view</span>
          }
          @for (chip of chips(); track chip.key) {
            <span class="bg-muted flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs">
              {{ chip.label }}
              <button
                type="button"
                class="hover:text-foreground text-muted-foreground"
                [attr.aria-label]="'Remove ' + chip.label"
                (click)="chip.remove()"
              >
                <ng-icon name="lucideX" size="12" />
              </button>
            </span>
          }
          @if (chips().length) {
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground text-xs underline"
              (click)="clearAll()"
            >
              Clear all
            </button>
          } @else if (!viewSearch()) {
            <span class="text-muted-foreground text-xs">No filters</span>
          }
        </div>
      </div>
    } @else {
      <div class="flex flex-col gap-5">
        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-medium">Area of interest</h3>
          @if (criteria().aoi; as aoi) {
            <div class="flex items-center gap-3 rounded-lg border p-3">
              <ng-icon name="lucideMapPin" size="20" />
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-medium">Custom AOI</div>
                <div class="text-muted-foreground text-xs">
                  {{ aoi.shape === 'rectangle' ? 'Rectangle' : 'Polygon' }} ·
                  {{ aoi.areaKm2.toFixed(1) }} km²
                </div>
              </div>
              <button type="button" aria-label="Remove AOI" (click)="patch({ aoi: null })">
                <ng-icon name="lucideX" size="16" />
              </button>
            </div>
          } @else {
            <div class="text-muted-foreground rounded-lg border border-dashed p-3 text-xs">
              Draw a rectangle or polygon on the map, or zoom in to search the current map view.
            </div>
          }
        </section>

        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-medium">Collection period</h3>
          <div class="grid grid-cols-2 gap-2">
            <z-date-picker
              class="[&_button]:min-w-0 [&_button]:w-full"
              placeholder="Start date"
              zFormat="yyyy-MM-dd"
              [value]="criteria().from"
              [maxDate]="criteria().to"
              (dateChange)="patch({ from: $event })"
            />
            <z-date-picker
              class="[&_button]:min-w-0 [&_button]:w-full"
              placeholder="End date"
              zFormat="yyyy-MM-dd"
              [value]="criteria().to"
              [minDate]="criteria().from"
              (dateChange)="patch({ to: $event })"
            />
          </div>
        </section>

        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-medium">Imaging mode</h3>
          <z-select
            zPlaceholder="All modes"
            [zMultiple]="true"
            [zMaxLabelCount]="2"
            [zValue]="criteria().imagingModes"
            (zValueChange)="setModes($event)"
          >
            @for (mode of imagingModes; track mode) {
              <z-select-item [zValue]="mode">{{ mode }}</z-select-item>
            }
          </z-select>
        </section>

        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-medium">Product type</h3>
          <div class="flex flex-wrap gap-2">
            @for (type of productTypes; track type) {
              <button
                type="button"
                [class]="chipClass(criteria().productTypes.includes(type))"
                [attr.aria-pressed]="criteria().productTypes.includes(type)"
                (click)="toggleProduct(type)"
              >
                {{ type }}
              </button>
            }
          </div>
        </section>

        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-medium">Polarization</h3>
          <div class="flex flex-wrap gap-2">
            @for (pol of polarizations; track pol) {
              <button
                type="button"
                [class]="chipClass(criteria().polarizations.includes(pol))"
                [attr.aria-pressed]="criteria().polarizations.includes(pol)"
                (click)="togglePolarization(pol)"
              >
                {{ pol }}
              </button>
            }
          </div>
        </section>

        <section class="flex flex-col gap-2">
          <h3 class="text-sm font-medium">Incidence angle</h3>
          <div class="flex items-center gap-4">
            <z-slider
              class="flex-1"
              [zMin]="0"
              [zMax]="1"
              [zStep]="1 / 45"
              [zValue]="sliderValue()"
              (zSlideIndexChange)="setAngles($event)"
            />
            <span class="w-20 text-right text-sm tabular-nums">
              {{ criteria().incidenceAngle[0] }}°~{{ criteria().incidenceAngle[1] }}°
            </span>
          </div>
          <p class="text-muted-foreground text-xs">
            Allowed range: {{ range.min }}°–{{ range.max }}° · handles cannot go outside
          </p>
        </section>

        <div class="grid grid-cols-2 gap-2">
          <button type="button" z-button zType="outline" (click)="reset.emit()">Reset</button>
          <button
            type="button"
            z-button
            [zLoading]="loading()"
            [disabled]="!canSearch()"
            (click)="search.emit()"
          >
            Search
          </button>
        </div>
        @if (!canSearch()) {
          <p class="text-muted-foreground -mt-3 text-xs">Zoom in or draw an AOI to search.</p>
        }
      </div>
    }
  `,
})
export class SearchCriteriaComponent {
  readonly criteria = model.required<ImagerySearchCriteria>();
  /** true면 조건을 칩으로 요약해서 보여준다 */
  readonly summary = input(false);
  readonly loading = input(false);
  /** 마지막 검색이 AOI 없이 지도 화면 영역으로 수행됐는지 */
  readonly viewSearch = input(false);
  /** AOI가 없을 때 지도 줌이 충분한지 포함한 검색 가능 여부 */
  readonly canSearch = input(true);

  readonly search = output<void>();
  readonly reset = output<void>();
  /** 칩 삭제/전체 삭제처럼 조건이 바뀌어 바로 다시 검색해야 할 때 */
  readonly criteriaApplied = output<void>();

  protected readonly imagingModes = IMAGING_MODES;
  protected readonly productTypes = PRODUCT_TYPES;
  protected readonly polarizations = POLARIZATIONS;
  protected readonly range = INCIDENCE_RANGE;

  protected readonly sliderValue = computed(() => this.criteria().incidenceAngle.map(toFraction));

  protected readonly chips = computed<Chip[]>(() => {
    const c = this.criteria();
    const chips: Chip[] = [];
    const apply = (patch: Partial<ImagerySearchCriteria>) => {
      this.patch(patch);
      this.criteriaApplied.emit();
    };

    if (c.aoi) {
      chips.push({ key: 'aoi', label: 'Custom AOI', remove: () => apply({ aoi: null }) });
    }
    if (c.from || c.to) {
      const label =
        c.from && c.to
          ? `${ymd(c.from)} ~ ${md(c.to)}`
          : c.from
            ? `From ${ymd(c.from)}`
            : `Until ${ymd(c.to!)}`;
      chips.push({ key: 'period', label, remove: () => apply({ from: null, to: null }) });
    }
    if (c.imagingModes.length) {
      const [first, ...rest] = c.imagingModes;
      chips.push({
        key: 'modes',
        label: rest.length ? `${first} +${rest.length}` : first,
        remove: () => apply({ imagingModes: [] }),
      });
    }
    for (const type of c.productTypes) {
      chips.push({
        key: `type-${type}`,
        label: type,
        remove: () => apply({ productTypes: c.productTypes.filter((t) => t !== type) }),
      });
    }
    for (const pol of c.polarizations) {
      chips.push({
        key: `pol-${pol}`,
        label: pol,
        remove: () => apply({ polarizations: c.polarizations.filter((p) => p !== pol) }),
      });
    }
    const [min, max] = c.incidenceAngle;
    if (min > INCIDENCE_RANGE.min || max < INCIDENCE_RANGE.max) {
      chips.push({
        key: 'angle',
        label: `Inc. ${min}°~${max}°`,
        remove: () => apply({ incidenceAngle: [INCIDENCE_RANGE.min, INCIDENCE_RANGE.max] }),
      });
    }
    return chips;
  });

  protected chipClass(active: boolean) {
    return [
      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
      active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted',
    ].join(' ');
  }

  protected patch(patch: Partial<ImagerySearchCriteria>) {
    this.criteria.update((c) => ({ ...c, ...patch }));
  }

  protected clearAll() {
    // AOI는 지도에 그려진 값이라 함께 지운다.
    this.criteria.set(createDefaultCriteria());
    this.criteriaApplied.emit();
  }

  protected setModes(value: string | string[]) {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    this.patch({ imagingModes: list as ImagingMode[] });
  }

  protected toggleProduct(type: ProductType) {
    const list = this.criteria().productTypes;
    this.patch({
      productTypes: list.includes(type) ? list.filter((t) => t !== type) : [...list, type],
    });
  }

  protected togglePolarization(pol: Polarization) {
    const list = this.criteria().polarizations;
    this.patch({
      polarizations: list.includes(pol) ? list.filter((p) => p !== pol) : [...list, pol],
    });
  }

  protected setAngles(values: number[]) {
    if (values.length < 2) return;
    this.patch({ incidenceAngle: [toAngle(values[0]), toAngle(values[1])] });
  }
}
