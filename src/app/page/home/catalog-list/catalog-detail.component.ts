import { Z_MODAL_DATA } from '@/shared/components/dialog';
import { CommonModule, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'catalog-detail-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    JsonPipe
  ],
  templateUrl: './catalog-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogDetailComponent {
  zData: any = inject(Z_MODAL_DATA);
}