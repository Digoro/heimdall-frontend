import { ThemeService } from '@/service/theme.service';
import { Component, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'login',
  standalone: true,
  imports: [],
  providers: [
  ],
  templateUrl: './api-docs.page.html',
})
export class APIDocsPage implements OnInit {
  swaggerUrl = signal<SafeResourceUrl | null>(null);

  constructor(
    private santizer: DomSanitizer,
    private themeService: ThemeService) {
  }

  ngOnInit(): void {
    this.setUrl(this.themeService.themeMode);
    this.themeService.themeChanged.subscribe(mode => {
      this.setUrl(mode);
    })
  }

  setUrl(mode: string) {
    this.swaggerUrl.set(this.santizer.bypassSecurityTrustResourceUrl(mode == 'dark' ? '/api-docs-dark' : '/api-docs-light'));
  }
}
