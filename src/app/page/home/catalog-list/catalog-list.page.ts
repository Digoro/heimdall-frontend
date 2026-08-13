import { CatalogItem } from "@/model/collection";
import { CatalogService } from "@/service/catalog.service";
import { ZardDialogService } from "@/shared/components/dialog";
import { ZardMenuImports } from "@/shared/components/menu";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardTableComponent } from "@/shared/components/table";
import { DatePipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArchive, lucideDownload, lucideEllipsis, lucideInfo, lucideMail, lucideSatellite, lucideUpload } from "@ng-icons/lucide";
import { Router } from "@angular/router";

@Component({
  standalone: true,
  imports: [
    NgIcon,
    ZardTableComponent,
    ZardPaginationImports,
    DatePipe,
    ZardMenuImports,
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
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.catalogService.search({ page: 1, limit: 9999 }).subscribe(resp => {
      this.isLoading.set(false);
      this.catalogs.set(resp.features);
    }, error => {
      this.isLoading.set(false);
    });
  }

  viewDetail(catalogItem: CatalogItem) {
    this.router.navigate(['/catalogs', catalogItem.itemId])
  }
}