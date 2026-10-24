import { CatalogItem } from '@/model/collection';
import { PAGE_SIZE, PAGE_SIZE_OPTIONS, SortOption } from '@/model/imagery-search';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardPaginationImports } from '@/shared/components/pagination';
import { ZardSelectImports } from '@/shared/components/select';
import { ZardSwitchComponent } from '@/shared/components/switch';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideImage, lucideInfo, lucideShoppingCart, lucideSquare } from '@ng-icons/lucide';
import { formatUtc, incidence, itemTitle } from './imagery-format';

@Component({
  selector: 'result-list',
  standalone: true,
  imports: [
    NgIcon,
    ZardButtonComponent,
    ZardPaginationImports,
    ZardSelectImports,
    ZardSwitchComponent,
  ],
  viewProviders: [provideIcons({ lucideSquare, lucideImage, lucideInfo, lucideShoppingCart })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  template: `
    <div class="flex items-center justify-between px-4 pt-2 text-sm">
      <span class="font-medium">{{ total() }} results</span>
      <z-select
        class="w-32"
        zSize="sm"
        [zValue]="sort()"
        (zValueChange)="sortChange.emit($any($event))"
      >
        <z-select-item zValue="newest">Sort: Newest</z-select-item>
        <z-select-item zValue="oldest">Sort: Oldest</z-select-item>
      </z-select>
    </div>

    <div class="flex items-center gap-4 px-4 py-3 text-sm">
      <z-switch [(zChecked)]="showFootprints">Footprints</z-switch>
      <z-switch [(zChecked)]="showBrowse">Browse images</z-switch>
    </div>

    <div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-2">
      @if (loading()) {
        <div class="text-muted-foreground py-10 text-center text-sm">Searching...</div>
      } @else {
        @for (item of items(); track item.itemId) {
          <article
            class="hover:bg-accent/50 flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors"
            [class.border-primary]="selectedId() === item.itemId"
            [class.bg-accent]="selectedId() === item.itemId"
            tabindex="0"
            [attr.data-item-id]="item.itemId"
            (click)="itemSelect.emit(item.itemId)"
            (keydown.enter)="itemSelect.emit(item.itemId)"
            (mouseenter)="hover.emit(item.itemId)"
            (mouseleave)="hover.emit(null)"
          >
            <div class="bg-muted size-14 shrink-0 overflow-hidden rounded-md">
              @if (item.assets.thumbnail?.href; as src) {
                <img [src]="src" alt="" class="h-full w-full object-cover" />
              }
            </div>

            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <div class="truncate text-sm font-medium">{{ title(item) }}</div>
              <div class="text-muted-foreground text-xs">
                {{ time(item) }} · Inc. {{ inc(item) }}
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span class="bg-muted rounded-md px-2 py-0.5 text-xs">
                  {{ item.properties['sar:product_type'] }}
                </span>
                @for (pol of item.properties['sar:polarizations']; track pol) {
                  <span class="bg-muted rounded-md px-2 py-0.5 text-xs">{{ pol }}</span>
                }
              </div>
              <div class="mt-1 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  z-button
                  zType="outline"
                  zSize="xs"
                  [class]="
                    footprintIds().includes(item.itemId)
                      ? 'border-primary/50 bg-primary/10 text-foreground hover:bg-primary/15 hover:text-foreground dark:bg-primary/20 dark:hover:bg-primary/25'
                      : ''
                  "
                  [attr.aria-pressed]="footprintIds().includes(item.itemId)"
                  (click)="$event.stopPropagation(); toggleFootprint.emit(item.itemId)"
                >
                  <ng-icon name="lucideSquare" />
                  Footprint
                </button>
                <button
                  type="button"
                  z-button
                  zType="outline"
                  zSize="xs"
                  [disabled]="!item.assets.thumbnail?.href"
                  [class]="
                    browseIds().includes(item.itemId)
                      ? 'border-primary/50 bg-primary/10 text-foreground hover:bg-primary/15 hover:text-foreground dark:bg-primary/20 dark:hover:bg-primary/25'
                      : ''
                  "
                  [attr.aria-pressed]="browseIds().includes(item.itemId)"
                  (click)="$event.stopPropagation(); toggleBrowse.emit(item.itemId)"
                >
                  <ng-icon name="lucideImage" />
                  Browse
                </button>
                <button
                  type="button"
                  z-button
                  zType="outline"
                  zSize="xs"
                  (click)="$event.stopPropagation(); itemDetail.emit(item.itemId)"
                >
                  <ng-icon name="lucideInfo" />
                  Details
                </button>
              </div>
            </div>

            <button
              type="button"
              z-button
              zType="outline"
              zSize="icon"
              class="shrink-0 self-center"
              aria-label="Add to cart"
              (click)="$event.stopPropagation(); addToCart.emit(item)"
            >
              <ng-icon name="lucideShoppingCart" />
            </button>
          </article>
        } @empty {
          <div class="text-muted-foreground py-10 text-center text-sm">No results.</div>
        }
      }
    </div>

    @if (total() > 0) {
      <div class="flex shrink-0 items-center gap-2 border-t px-3 py-3">
        <div class="min-w-0 flex-1">
          <z-pagination class="block" [zContent]="pager" />
        </div>

        <div class="shrink-0">
          <z-select
            class="w-20"
            zSize="sm"
            [zValue]="'' + pageSize()"
            (zValueChange)="pageSizeChange.emit(+$any($event))"
          >
            @for (size of pageSizeOptions; track size) {
              <z-select-item [zValue]="'' + size">{{ size }}</z-select-item>
            }
          </z-select>
        </div>
      </div>

      <ng-template #pager>
        <ul z-pagination-content class="w-full gap-1">
          <li z-pagination-item class="shrink-0">
            <z-pagination-previous
              zSize="sm"
              class="[&_span[aria-hidden]]:hidden"
              [zDisabled]="page() <= 1"
              (click)="goTo(page() - 1)"
            />
          </li>
          <li z-pagination-item class="flex min-w-0 flex-1 justify-center overflow-hidden">
            <ul class="flex items-center gap-0.5">
              @for (p of visiblePages(); track $index) {
                <li z-pagination-item>
                  @if (p === null) {
                    <z-pagination-ellipsis />
                  } @else {
                    <button
                      type="button"
                      z-pagination-button
                      zSize="sm"
                      [zActive]="p === page()"
                      [attr.aria-current]="p === page() ? 'page' : null"
                      (click)="goTo(p)"
                    >
                      {{ p }}
                    </button>
                  }
                </li>
              }
            </ul>
          </li>
          <li z-pagination-item class="shrink-0">
            <z-pagination-next
              zSize="sm"
              class="[&_span[aria-hidden]]:hidden"
              [zDisabled]="page() >= totalPages()"
              (click)="goTo(page() + 1)"
            />
          </li>
        </ul>
      </ng-template>
    }
  `,
})
export class ResultListComponent {
  readonly items = input<CatalogItem[]>([]);
  readonly total = input(0);
  readonly page = input(1);
  readonly pageSize = input<number>(PAGE_SIZE);
  readonly sort = input<SortOption>('newest');
  readonly loading = input(false);
  readonly selectedId = input<string | null>(null);
  readonly browseIds = input<string[]>([]);
  readonly footprintIds = input<string[]>([]);
  readonly showFootprints = model(true);
  readonly showBrowse = model(false);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();
  readonly sortChange = output<SortOption>();
  readonly itemSelect = output<string>();
  readonly itemDetail = output<string>();
  readonly hover = output<string | null>();
  readonly toggleFootprint = output<string>();
  readonly toggleBrowse = output<string>();
  readonly addToCart = output<CatalogItem>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // 지도에서 선택한 항목이 목록 밖에 있으면 스크롤해서 보이게 한다.
    effect(() => {
      const id = this.selectedId();
      this.items();
      if (!id) return;
      queueMicrotask(() =>
        this.host.nativeElement
          .querySelector(`[data-item-id="${CSS.escape(id)}"]`)
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
      );
    });
  }

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  /** 5칸 이내로 줄인 페이지 목록. null은 생략(…) */
  protected readonly visiblePages = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, null, total];
    if (current >= total - 2) return [1, null, total - 2, total - 1, total];
    return [1, null, current, null, total];
  });

  protected goTo(target: number) {
    if (target < 1 || target > this.totalPages() || target === this.page()) return;
    this.pageChange.emit(target);
  }

  protected title = itemTitle;
  protected inc = incidence;
  protected time = (item: CatalogItem) => formatUtc(item.properties?.datetime);
}
