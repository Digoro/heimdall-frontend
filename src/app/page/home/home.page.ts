import { Role } from '@/model/user';
import { AuthService } from '@/service/auth.service';
import { ThemeService } from '@/service/theme.service';
import { ZardAvatarComponent } from '@/shared/components/avatar';
import { LayoutImports } from '@/shared/components/layout/layout.imports';
import { ZardMenuImports } from '@/shared/components/menu';
import { ZardToastComponent } from '@/shared/components/toast';
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLinkActive,
  RouterLinkWithHref,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChartNoAxesColumn,
  lucideChevronRight,
  lucideChevronsUpDown,
  lucideClipboardCheck,
  lucideClipboardList,
  lucideCloudUpload,
  lucideFileCode,
  lucideKeyRound,
  lucideLogOut,
  lucideMapPin,
  lucideMoon,
  lucidePanelLeft,
  lucideSatellite,
  lucideSearch,
  lucideSettings,
  lucideShoppingCart,
  lucideSun,
  lucideUsers,
} from '@ng-icons/lucide';
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
    RouterOutlet,
    ZardToastComponent,
    RouterLinkWithHref,
    RouterLinkActive,
    RouterModule,
    ZardAvatarComponent,
    NgIcon,
  ],
  providers: [],
  templateUrl: './home.page.html',
  viewProviders: [
    provideIcons({
      lucideSearch,
      lucideSatellite,
      lucideShoppingCart,
      lucideClipboardList,
      lucideMapPin,
      lucideChartNoAxesColumn,
      lucideKeyRound,
      lucideFileCode,
      lucideUsers,
      lucideCloudUpload,
      lucideClipboardCheck,
      lucidePanelLeft,
      lucideChevronRight,
      lucideChevronsUpDown,
      lucideSun,
      lucideMoon,
      lucideLogOut,
      lucideSettings,
    }),
  ],
})
export class HomePage implements OnInit {
  readonly sidebarCollapsed = signal(false);
  pageTitle = signal('');
  userMenus: Menu[] = [
    {
      title: 'Orders',
      items: [
        { icon: 'lucideSearch', label: 'Imagery Search', page: 'imagery-search' },
        { icon: 'lucideSatellite', label: 'Tasking Order', page: 'tasking-order' },
        { icon: 'lucideShoppingCart', label: 'Cart', page: 'cart' },
        { icon: 'lucideClipboardList', label: 'My Orders', page: 'my-orders' },
      ],
    },
    {
      title: 'My Data',
      items: [
        { icon: 'lucideMapPin', label: 'AOI', page: 'aoi' },
        { icon: 'lucideChartNoAxesColumn', label: 'Usage', page: 'usage' },
      ],
    },
    {
      title: 'Developer',
      items: [
        { icon: 'lucideKeyRound', label: 'API Keys', page: 'apiKeys' },
        { icon: 'lucideFileCode', label: 'API Docs', page: 'api-docs' },
      ],
    },
    {
      title: 'Account',
      items: [{ icon: 'lucideSettings', label: 'Settings', page: 'settings' }],
    }
  ];
  adminMenus: Menu[] = [
    {
      title: 'Admin',
      items: [
        { icon: 'lucideClipboardCheck', label: 'Order Management', page: 'orders' },
        { icon: 'lucideCloudUpload', label: 'Register Imagery Product', page: 'upload-product' },
        { icon: 'lucideUsers', label: 'User Management', page: 'users' },
      ],
    }
  ];
  menus: Menu[] = [...this.userMenus];
  name = signal('');
  email = signal('');
  themeMode = signal('');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private titleService: Title,
    public themeService: ThemeService,
  ) { }

  ngOnInit(): void {
    this.updateTitle();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateTitle());

    const user = this.authService.currentUser();
    if (user) {
      this.name.set(user.name);
      this.email.set(user.email);
      if (user.role == Role.ADMIN) {
        this.menus = [...this.adminMenus, ...this.userMenus];
      }
    }

    this.themeMode.set(this.themeService.themeMode);
    this.themeService.themeChanged.subscribe((mode) => {
      this.themeMode.set(mode);
    });
  }

  private updateTitle(): void {
    let currentRoute = this.route;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    const title = currentRoute.snapshot.data['pageTitle'];
    if (!title) return;
    this.pageTitle.set(title);
    this.titleService.setTitle(`Heimdall - ${title}`);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout() {
    this.authService.logout();
  }

  goTo(page: string) {
    this.router.navigate([page]);
  }

  toggleSidebar() {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  onCollapsedChange(collapsed: boolean) {
    this.sidebarCollapsed.set(collapsed);
  }
}
