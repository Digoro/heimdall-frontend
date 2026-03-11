import { Role } from '@/model/user';
import { AuthService } from '@/service/auth.service';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import { ZardIcon, ZardIconComponent } from '@/shared/components/icon';
import { LayoutImports } from '@/shared/components/layout/layout.imports';
import { ZardMenuImports } from '@/shared/components/menu';
import { ZardToastComponent } from '@/shared/components/toast';
import { ZardDarkMode } from '@/shared/services';
import { Component, inject, OnInit, signal } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLinkActive, RouterLinkWithHref, RouterModule, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

interface Menu {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  icon: ZardIcon;
  label: string;
  page: string;
}

@Component({
  standalone: true,
  imports: [
    LayoutImports,
    ZardMenuImports,
    ZardIconComponent,
    ZardBreadcrumbImports,
    RouterOutlet,
    ZardToastComponent,
    RouterLinkWithHref,
    RouterLinkActive,
    RouterModule,
  ],
  providers: [

  ],
  templateUrl: './home.page.html',
})
export class HomePage implements OnInit {
  readonly sidebarCollapsed = signal(false);
  pageTitle = signal('');
  menus: Menu[] = [
    {
      title: 'API', items: [
        { icon: 'file-text', label: 'API Keys', page: 'apiKeys' },
        { icon: 'book-open', label: 'API Documents', page: 'api-docs' }
      ]
    }
  ];
  adminMenu: Menu[] = [
    {
      title: 'Order', items: [
        { icon: 'inbox', label: 'Order Management', page: 'orders' }
      ]
    },
    {
      title: 'Catalog', items: [
        { icon: 'folder-plus', label: 'Upload Product', page: 'upload-product' }
      ]
    },
    {
      title: 'User', items: [
        { icon: 'users', label: 'User Management', page: 'users' }
      ]
    }
  ]

  name = signal('');
  email = signal('');
  darkModeService = inject(ZardDarkMode);
  darkMode = signal('white');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    this.darkMode.set(this.darkModeService.currentTheme());
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        let currentRoute = this.route;
        while (currentRoute.firstChild) {
          currentRoute = currentRoute.firstChild;
        }
        const title = currentRoute.snapshot.data['pageTitle'];
        this.pageTitle.set(title);
        this.titleService.setTitle(`OMS - ${title}`);
      });
    this.authService.getCurrentUser().subscribe(resp => {
      if (resp) {
        this.name.set(resp.name);
        this.email.set(resp.email);
        if (resp.role == Role.ADMIN) {
          this.menus = this.menus.concat(this.adminMenu);
        }
      }
    })
  }

  toggleTheme(): void {
    this.darkModeService.toggleTheme();
    this.darkMode.set(this.darkModeService.currentTheme());
  }

  logout() {
    this.authService.logout();
    location.reload();
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  onCollapsedChange(collapsed: boolean) {
    this.sidebarCollapsed.set(collapsed);
  }
}
