import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PaginationMeta } from '../../../model/pagination';
import { User } from '../../../model/user';
import { AuthService } from '../../../service/auth.service';
import { UserService } from '../../../service/user.service';

@Component({
  selector: 'user-list',
  standalone: true,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  pagination = {
    offset: 1,
    limit: 10,
    count: -1
  };
  meta!: PaginationMeta;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService) { }

  ngOnInit(): void {
    this.setUsers(1, 10);
  }

  setUsers(page: number, limit: number) {
    // this.userService.search({ page, limit }).subscribe(resp => {
    //   this.users.set(resp.items);
    //   this.meta = resp.meta;
    //   // this.pagination = { limit: resp.meta.itemsPerPage, offset: resp.meta.currentPage, count: resp.meta.totalItems };
    // });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}