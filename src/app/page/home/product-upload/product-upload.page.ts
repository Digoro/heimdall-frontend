import { ProductService } from "@/service/product.service";
import { ZardAlertDialogService } from "@/shared/components/alert-dialog";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardCardComponent } from "@/shared/components/card";
import { ZardDividerComponent } from "@/shared/components/divider";
import { ZardIconComponent } from "@/shared/components/icon";
import { ZardInputDirective } from "@/shared/components/input";
import { ZardMenuImports } from "@/shared/components/menu";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardProgressBarComponent } from "@/shared/components/progress-bar";
import { ZardSelectImports } from "@/shared/components/select";
import { ZardSkeletonComponent } from "@/shared/components/skeleton";
import { HttpEventType } from "@angular/common/http";
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { toast } from "ngx-sonner";

@Component({
  standalone: true,
  imports: [
    ZardButtonComponent,
    ZardIconComponent,
    ZardPaginationImports,
    ZardButtonComponent,
    ZardIconComponent,
    ZardMenuImports,
    ReactiveFormsModule,
    ZardSelectImports,
    ZardInputDirective,
    ZardCardComponent,
    ZardProgressBarComponent,
    ZardDividerComponent,
    ZardSkeletonComponent
  ],
  providers: [
    ProductService
  ],
  templateUrl: './product-upload.page.html',
})
export class ProductUploadPage implements OnInit {
  sarProgress = signal(0);
  sarFileOk = signal(false);
  @ViewChild('sarFileInput') sarFileInput!: ElementRef;
  sarFile = signal(new File([], ''));

  thumbnailProgress = signal(0);
  thumbnailFileOk = signal(false);
  @ViewChild('thumbnailFileInput') thumbnailFileInput!: ElementRef;
  thumbnailFile = signal(new File([], ''));
  thumbnailPreview = signal('');

  metadataProgress = signal(0);
  metadataFileOk = signal(false);
  @ViewChild('metadataFileInput') metadataFileInput!: ElementRef;
  metadataFile = signal(new File([], ''));
  metadataPreview = signal('');

  form = new FormGroup({
    orderId: new FormControl('')
  });

  alertDialogService = inject(ZardAlertDialogService);

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('orderId');
      if (id) this.form.controls.orderId.setValue(id);
    })
  }

  sarFileChange(event: any) {
    this.sarFile.set(event.target.files[0]);
    const fileName = this.sarFile().name.toLowerCase();
    if (!fileName.endsWith('.tif') && !fileName.endsWith('.tiff')) {
      this.alertDialogService.warning({
        zTitle: 'Invalid File Type',
        zDescription: 'Only TIF/TIFF files are allowed.',
        zOkText: 'Confirm',
      });
      return;
    }

    if (this.sarFile()) {
      this.sarFileOk.set(false);
      const formData = new FormData();
      formData.append('file', this.sarFile());
      this.productService.upload(formData).subscribe(event => {
        if (event.type == HttpEventType.UploadProgress) {
          const percent = Math.round((event.loaded / (event.total ?? 1)) * 100);
          this.sarProgress.set(percent);
        }
        if (event.type == HttpEventType.Response) {
          this.sarFileOk.set(true);
          toast.success('SAR image uploaded successfully', {
            description: 'sar image has been successfully uploaded.',
          });
        }
      })
    }
  }

  thumbnailFileChange(event: any) {
    this.thumbnailFile.set(event.target.files[0]);
    const fileName = this.thumbnailFile().name.toLowerCase();
    if (!fileName.endsWith('.png') && !fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
      this.alertDialogService.warning({
        zTitle: 'Invalid File Type',
        zDescription: 'Only PNG/JPG/JPEG files are allowed.',
        zOkText: 'Confirm',
      });
      return;
    }

    if (this.sarFile()) {
      this.thumbnailFileOk.set(false);
      const formData = new FormData();
      formData.append('file', this.thumbnailFile());
      this.productService.upload(formData).subscribe(event => {
        if (event.type == HttpEventType.UploadProgress) {
          const percent = Math.round((event.loaded / (event.total ?? 1)) * 100);
          this.thumbnailProgress.set(percent);
        }
        if (event.type == HttpEventType.Response) {
          this.thumbnailFileOk.set(true);
          const reader = new FileReader();
          reader.onload = () => {
            this.thumbnailPreview.set(reader.result as string);
          }
          reader.readAsDataURL(this.thumbnailFile());
          toast.success('Thumbnail uploaded successfully', {
            description: 'thumbnail has been successfully uploaded.',
          });
        }
      })
    }
  }

  metadataFileChange(event: any) {
    this.metadataFile.set(event.target.files[0]);
    const fileName = this.metadataFile().name.toLowerCase();
    if (!fileName.endsWith('.json')) {
      this.alertDialogService.warning({
        zTitle: 'Invalid File Type',
        zDescription: 'Only JSON files are allowed.',
        zOkText: 'Confirm',
      });
      return;
    }

    if (this.metadataFile()) {
      this.metadataFileOk.set(false);
      const formData = new FormData();
      formData.append('file', this.metadataFile());
      this.productService.upload(formData).subscribe(event => {
        if (event.type == HttpEventType.UploadProgress) {
          const percent = Math.round((event.loaded / (event.total ?? 1)) * 100);
          this.metadataProgress.set(percent);
        }
        if (event.type == HttpEventType.Response) {
          this.metadataFileOk.set(true);
          const reader = new FileReader();
          reader.onload = () => {
            this.metadataPreview.set(reader.result as string);
          }
          reader.readAsText(this.metadataFile());
          toast.success('Metadata uploaded successfully', {
            description: 'metadata has been successfully uploaded.',
          });
        }
      })
    }
  }

  formatBytes(bytes: number) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes == 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  cancel() {
    this.alertDialogService.confirm({
      zTitle: 'Cancel Upload',
      zDescription: 'Are you sure you want to cancel this upload? The selected file will be removed.',
      zCancelText: 'Cancel',
      zOkText: 'Confirm',
      zOnOk: () => {
        this.sarFile.set(new File([], ''));
        this.sarFileInput.nativeElement.value = '';
        this.sarProgress = signal(0);
        this.sarFileOk = signal(false);

        this.thumbnailFile.set(new File([], ''));
        this.thumbnailFileInput.nativeElement.value = '';
        this.thumbnailProgress = signal(0);
        this.thumbnailFileOk = signal(false);
        this.thumbnailPreview = signal('');

        this.metadataFile.set(new File([], ''));
        this.metadataFileInput.nativeElement.value = '';
        this.metadataProgress = signal(0);
        this.metadataFileOk = signal(false);
        this.metadataPreview = signal('');
      }
    });
  }

  submit() {
    this.productService
  }
}