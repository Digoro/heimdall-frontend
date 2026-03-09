import { ZardAvatarComponent } from '@/shared/components/avatar';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDividerComponent } from '@/shared/components/divider';
import { ZardIcon, ZardIconComponent } from '@/shared/components/icon';
import { LayoutImports } from '@/shared/components/layout/layout.imports';
import { ZardMenuImports } from '@/shared/components/menu';
import { ZardToastComponent } from '@/shared/components/toast';
import { Component, signal } from "@angular/core";
import { Router, RouterOutlet } from '@angular/router';

interface MenuItem {
  icon: ZardIcon;
  label: string;
  submenu?: { label: string }[];
}

@Component({
  standalone: true,
  imports: [
    LayoutImports,
    ZardButtonComponent,
    ZardMenuImports,
    ZardDividerComponent,
    ZardAvatarComponent,
    ZardIconComponent,
    ZardBreadcrumbImports,
    RouterOutlet,
    ZardToastComponent,
  ],
  providers: [

  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  readonly sidebarCollapsed = signal(false);

  mainMenuItems: MenuItem[] = [
    { icon: 'file-text', label: 'API Keys' },
    { icon: 'book-open', label: 'API Documents' },
  ];

  constructor(
    private router: Router
  ) { }

  goTo() {
    this.router.navigate(['/api/docs'])
  }
  toggleSidebar() {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  onCollapsedChange(collapsed: boolean) {
    this.sidebarCollapsed.set(collapsed);
  }
}
