import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ProductService {

  constructor(private http: HttpClient) { }

  upload(formData: any) {
    return this.http.post('/api/products/upload', formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
