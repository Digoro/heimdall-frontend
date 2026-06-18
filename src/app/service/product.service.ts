import { UploadResult } from '@/model/product';
import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { map } from 'rxjs';

@Injectable()
export class ProductService {
  progress = signal<number>(0);
  isUploading = signal<boolean>(false);


  constructor(private http: HttpClient) { }

  upload(formData: any) {
    return this.http.post('/api/products/admin/upload', formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  uploadProductFiles(orderId: string, files: { data?: File, metadata?: File, thumbnail?: File }) {
    const formData = new FormData();
    if (files.data) formData.append('data', files.data);
    if (files.metadata) formData.append('metadata', files.metadata);
    if (files.thumbnail) formData.append('thumbnail', files.thumbnail);

    const req = new HttpRequest('POST', `/api/products/admin/upload/${orderId}`, formData, { reportProgress: true });
    this.isUploading.set(true);
    this.progress.set(0);

    return this.http.request<UploadResult>(req).pipe(
      map(event => {
        if (event.type == HttpEventType.UploadProgress) {
          const progress = Math.round(100 * event.loaded / event.total!);
          this.progress.set(progress);
        }
        if (event.type == HttpEventType.Response) {
          const res = event as HttpResponse<UploadResult>;
          this.isUploading.set(false);
          this.progress.set(100);
          return { type: 'complete' as const, body: res.body as UploadResult };
        }
        return { type: 'other' as const };
      })
    )
  }
}

