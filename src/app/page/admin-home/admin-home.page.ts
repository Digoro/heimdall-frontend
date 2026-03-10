import { AuthService } from '@/service/auth.service';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import { ZardIcon, ZardIconComponent } from '@/shared/components/icon';
import { LayoutImports } from '@/shared/components/layout/layout.imports';
import { ZardMenuImports } from '@/shared/components/menu';
import { ZardToastComponent } from '@/shared/components/toast';
import { Component, OnInit, signal } from "@angular/core";
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLinkActive, RouterLinkWithHref, RouterModule, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

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
  templateUrl: './admin-home.page.html',
  styleUrls: ['./admin-home.page.scss'],
})
export class AdminHomePage implements OnInit {
  readonly sidebarCollapsed = signal(false);
  pageTitle = signal('');
  mainMenuItems: MenuItem[] = [
    { icon: 'file-text', label: 'User Management', page: 'apiKeys' },
    { icon: 'book-open', label: 'Order Management', page: 'api-docs' },
  ];
  name = signal('');
  email = signal('');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private titleService: Title
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
      }
    })
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
