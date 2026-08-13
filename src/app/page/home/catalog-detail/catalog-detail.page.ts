import { CatalogItem } from "@/model/collection";
import { CatalogService } from "@/service/catalog.service";
import { ZardMenuImports } from "@/shared/components/menu";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardSelectImports } from "@/shared/components/select";
import { CommonModule, Location } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArchive, lucideArrowLeft, lucideArrowRight, lucideDownload, lucideSatellite, lucideSquarePen, lucideUpload } from '@ng-icons/lucide';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ZardPaginationImports,
    ZardMenuImports,
    ReactiveFormsModule,
    ZardSelectImports,
    NgIcon,
  ],
  providers: [
    CatalogService,
  ],
  templateUrl: './catalog-detail.page.html',
  viewProviders: [
    provideIcons({
      lucideSquarePen, lucideArchive, lucideSatellite, lucideArrowLeft,
      lucideUpload, lucideDownload, lucideArrowRight
    })
  ]
})
export class CatalogDetailPage implements OnInit {
  catalog = signal({} as CatalogItem);

  constructor(
    private catalogService: CatalogService,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  ngOnInit(): void {
    console.log("Test")
    const itemId = this.route.snapshot.params['id'];
    this.catalogService.getCatalogItem(itemId).subscribe(resp => {
      this.catalog.set(resp);
    })
  }

  back() {
    this.location.back();
  }
}