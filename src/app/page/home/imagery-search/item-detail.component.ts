import { CatalogItem } from '@/model/collection';
import { Z_SHEET_DATA } from '@/shared/components/sheet';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { centerCoordinates, formatUtc, incidence } from './imagery-format';

/** ZardSheetService로 열리는 우측 상세 시트의 본문 */
@Component({
  selector: 'item-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4 px-4">
      <div
        class="bg-muted text-muted-foreground flex h-44 items-start overflow-hidden rounded-lg text-xs"
      >
        @if (thumbnail(); as src) {
          <img [src]="src" alt="Browse image preview" class="h-full w-full object-cover" />
        } @else {
          <span class="p-3">No browse image</span>
        }
      </div>

      <h3 class="text-sm font-semibold">Metadata</h3>
      <dl class="text-sm">
        @for (row of rows(); track row.label) {
          <div class="flex items-start justify-between gap-4 border-b py-2 last:border-b-0">
            <dt class="text-muted-foreground">{{ row.label }}</dt>
            <dd class="text-right">{{ row.value }}</dd>
          </div>
        }
      </dl>
    </div>
  `,
})
export class ItemDetailComponent {
  private readonly item: CatalogItem = inject(Z_SHEET_DATA);

  protected readonly thumbnail = computed(() => this.item.assets?.thumbnail?.href ?? null);

  protected readonly rows = computed(() => {
    const p = this.item.properties;
    const spacing =
      p?.['sar:pixel_spacing_range'] != null && p?.['sar:pixel_spacing_azimuth'] != null
        ? `${p['sar:pixel_spacing_range']} × ${p['sar:pixel_spacing_azimuth']} m`
        : '-';
    const rows: { label: string; value: string }[] = [
      { label: 'Imaging mode (sar:instrument_mode)', value: p?.['sar:instrument_mode'] ?? '-' },
      {
        label: 'Polarization (sar:polarizations)',
        value: p?.['sar:polarizations']?.join(', ') || '-',
      },
      { label: 'Collection start', value: formatUtc(p?.start_datetime, true) },
      { label: 'Collection end', value: formatUtc(p?.end_datetime, true) },
      { label: 'Incidence angle (view:incidence_angle)', value: incidence(this.item) },
      {
        label: 'Look side (sar:observation_direction)',
        value: p?.['sar:observation_direction'] ?? '-',
      },
      { label: 'Orbit direction (sat:orbit_state)', value: p?.['sat:orbit_state'] ?? '-' },
      { label: 'Pixel spacing (range × azimuth)', value: spacing },
      { label: 'Center coordinates', value: centerCoordinates(this.item) },
      { label: 'Platform', value: p?.platform ?? '-' },
      { label: 'Scene center time', value: formatUtc(p?.datetime, true) },
    ];
    return rows;
  });
}
