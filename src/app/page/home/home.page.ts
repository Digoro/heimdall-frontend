import { Role } from '@/model/user';
import { AuthService } from '@/service/auth.service';
import { ThemeService } from '@/service/theme.service';
import { ZardAvatarComponent } from '@/shared/components/avatar';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import { LayoutImports } from '@/shared/components/layout/layout.imports';
import { ZardMenuImports } from '@/shared/components/menu';
import { ZardToastComponent } from '@/shared/components/toast';
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLinkActive, RouterLinkWithHref, RouterModule, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBookOpen, lucideChevronsUpDown, lucideFolderUp, lucideKeyRound, lucideLogOut, lucideMoon, lucideShoppingCart, lucideSun, lucideUserRoundCog } from '@ng-icons/lucide';
import { filter } from 'rxjs';

interface Menu {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  icon: string;
  label: string;
  page: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    LayoutImports,
    ZardMenuImports,
    ZardBreadcrumbImports,
    RouterOutlet,
    ZardToastComponent,
    RouterLinkWithHref,
    RouterLinkActive,
    RouterModule,
    ZardAvatarComponent,
    NgIcon
  ],
  providers: [
  ],
  templateUrl: './home.page.html',
  viewProviders: [
    provideIcons({
      lucideBookOpen, lucideFolderUp, lucideUserRoundCog, lucideKeyRound, lucideShoppingCart,
      lucideChevronsUpDown, lucideSun, lucideMoon, lucideLogOut
    })
  ]
})
export class HomePage implements OnInit {
  readonly sidebarCollapsed = signal(false);
  pageTitle = signal('');
  menus: Menu[] = [
    {
      title: 'API', items: [
        { icon: 'lucideKeyRound', label: 'API Keys', page: 'apiKeys' },
        { icon: 'lucideBookOpen', label: 'API Documents', page: 'api-docs' }
      ]
    }
  ];
  adminMenu: Menu[] = [
    {
      title: 'Order', items: [
        { icon: 'lucideShoppingCart', label: 'Order Management', page: 'orders' }
      ]
    },
    {
      title: 'Catalog', items: [
        { icon: 'lucideFolderUp', label: 'Upload Product', page: 'upload-product' }
      ]
    },
    {
      title: 'User', items: [
        { icon: 'lucideUserRoundCog', label: 'User Management', page: 'users' }
      ]
    }
  ]
  name = signal('');
  email = signal('');
  themeMode = signal('');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private titleService: Title,
    public themeService: ThemeService
  ) { }

  ngOnInit(): void {
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

    this.themeMode.set(this.themeService.themeMode);
    this.themeService.themeChanged.subscribe(mode => {
      this.themeMode.set(mode);
    })
  }

  toggleTheme(): void {
    this.themeService.toggle();
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
