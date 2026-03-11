import { AuthService } from '@/service/auth.service';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'login',
  standalone: true,
  imports: [],
  providers: [
    AuthService
  ],
  templateUrl: './api-docs.page.html',
})
export class APIDocsPage {
  swaggerUrl: SafeResourceUrl = '';

  constructor(
    private santizer: DomSanitizer) {
    this.swaggerUrl = this.santizer.bypassSecurityTrustResourceUrl('http://localhost:3000/api-docs');
  }
}
