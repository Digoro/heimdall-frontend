import { ZardDarkMode } from '@/shared/services';
import { EventEmitter, inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeService = inject(ZardDarkMode);
  themeMode = 'light';
  themeChanged = new EventEmitter<string>();

  constructor() {
    this.themeMode = localStorage.getItem('theme')!;
  }

  toggle() {
    this.darkModeService.toggleTheme();
    this.themeMode = localStorage.getItem('theme')!;
    this.themeChanged.emit(this.themeMode);
  }
}
