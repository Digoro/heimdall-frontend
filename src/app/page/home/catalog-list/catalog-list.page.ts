import { CatalogItem } from "@/model/collection";
import { CatalogService } from "@/service/catalog.service";
import { ZardDialogService } from "@/shared/components/dialog";
import { ZardMenuImports } from "@/shared/components/menu";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardSelectImports } from "@/shared/components/select";
import { ZardTableComponent } from "@/shared/components/table";
import { DatePipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { provideIcons } from "@ng-icons/core";
import { lucideArchive, lucideDownload, lucideEllipsis, lucideInfo, lucideMail, lucideSatellite, lucideUpload } from "@ng-icons/lucide";
import { CatalogDetailComponent } from "./catalog-detail.component";

@Component({
  standalone: true,
  imports: [
    ZardTableComponent,
    ZardPaginationImports,
    DatePipe,
    ZardMenuImports,
    ReactiveFormsModule,
    ZardSelectImports,
  ],
  providers: [
    CatalogService,
  ],
  templateUrl: './catalog-list.page.html',
  viewProviders: [
    provideIcons({
      lucideMail, lucideArchive, lucideSatellite, lucideEllipsis, lucideInfo,
      lucideUpload, lucideDownload
    })
  ]
})
export class CatalogListPage implements OnInit {
  catalogs = signal<CatalogItem[]>([]);
  isLoading = signal(false);
  dialogService = inject(ZardDialogService);

  constructor(
    private catalogService: CatalogService,
  ) { }

  ngOnInit(): void {
    this.catalogService.search({ page: 1, limit: 9999 }).subscribe(resp => {
      this.isLoading.set(false);
      this.catalogs.set(resp.features);
    }, error => {
      this.isLoading.set(false);
    });
  }

  openDetailDialog(catalog: any) {
    this.dialogService.create({
      zTitle: 'Detail',
      zContent: CatalogDetailComponent,
      zOkText: 'Ok',
      zData: catalog,
      zCancelText: null
    });
  }
}