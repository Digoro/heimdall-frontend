import { FileSlot } from "@/model/product";
import { ProductService } from "@/service/product.service";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardInputDirective } from "@/shared/components/input";
import { ZardProgressBarComponent } from "@/shared/components/progress-bar";
import { Component, OnInit, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCircleCheck, lucideFile } from "@ng-icons/lucide";
import { toast } from "ngx-sonner";

@Component({
  standalone: true,
  imports: [
    NgIcon,
    ZardButtonComponent,
    ZardButtonComponent,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardProgressBarComponent
  ],
  providers: [
    ProductService
  ],
  templateUrl: './product-upload.page.html',
  viewProviders: [
    provideIcons({
      lucideCircleCheck, lucideFile
    })
  ]
})
export class ProductUploadPage implements OnInit {
  form = new FormGroup({
    orderId: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)])
  });
  slots = signal<FileSlot[]>([
    {
      key: 'data', label: 'SAR Image',
      description: 'Upload the original SAR Imagery file (.tif)',
      accept: '.tif,image/tiff',
      file: null, previewUrl: null, previewText: null
    },
    {
      key: 'metadata', label: 'Metadata',
      description: 'Upload the metadata file (.json)',
      accept: '.json,application/json',
      file: null, previewUrl: null, previewText: null
    },
    {
      key: 'thumbnail', label: 'Thumbnail',
      description: 'Upload a preview thumbnail image (.png)',
      accept: '.png,.jpg,.jpeg,.webp',
      file: null, previewUrl: null, previewText: null
    }
  ]);
  result = signal<string>('');
  hasError = signal<boolean>(false);

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('orderId');
      if (id) this.form.controls.orderId.setValue(id);
    })
  }

  onFileChange(event: Event, key: FileSlot['key']) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.slots.update(slots => slots.map(s => (s.key == key ? { ...s, file } : s)));
    if (key == 'thumbnail') this.readAsDataURL(file, key);
    if (key == 'metadata') this.readAsText(file, key);
  }

  upload() {
    if (!this.hasAnyFile() || this.productService.isUploading()) return;

    const fileMap = {
      data: this.slots().find(s => s.key == 'data')?.file,
      metadata: this.slots().find(s => s.key == 'metadata')?.file,
      thumbnail: this.slots().find(s => s.key == 'thumbnail')?.file,
    };

    this.result.set('');
    this.hasError.set(false);

    this.productService.uploadProductFiles(this.form.controls.orderId.value!, {
      data: fileMap.data!,
      metadata: fileMap.metadata!,
      thumbnail: fileMap.thumbnail!
    }).subscribe({
      next: event => {
        if (event.type == 'complete') {
          this.result.set(event.body.message);
          this.hasError.set(event.body.errors.length > 0);
          this.slots.update(slots => slots.map(s => (event.body.uploaded.includes(s.key) ? { ...s, file: null, previewText: null, previewUrl: null } : s)));
          toast.success('SAR product uploaded successfully', {
            description: event.body.message,
          });
        }
      },
      error: err => {
        this.result.set(`Upload failed: ${err.error?.message ?? err.message}`);
        this.hasError.set(true);
        this.productService.isUploading.set(false);
        toast.error('SAR product uploaded failed', {
          description: `${err.error?.message ?? err.message}`
        });
      }
    })
  }

  private readAsDataURL(file: File, key: FileSlot['key']) {
    const reader = new FileReader();
    reader.onload = () => {
      this.slots.update(slots => slots.map(s => (s.key == key) ? { ...s, previewUrl: reader.result as string } : s));
    }
    reader.readAsDataURL(file);
  }

  private readAsText(file: File, key: FileSlot['key']) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        this.slots.update(slots => slots.map(s => (s.key == key ? { ...s, previewText: JSON.stringify(parsed, null, 2) } : s)));
      } catch {
        this.slots.update(slots => slots.map(s => (s.key == key) ? { ...s, previewText: 'Invalid JSON format' } : s));
      }
    }
    reader.readAsText(file);
  }

  hasAnyFile(): boolean {
    return this.slots().some(s => s.file != null);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}