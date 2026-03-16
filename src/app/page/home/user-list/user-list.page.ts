import { PaginationMeta } from "@/model/pagination";
import { Role, User, UserCreateDto, UserUpdateDto } from "@/model/user";
import { AuthService } from "@/service/auth.service";
import { UserService } from "@/service/user.service";
import { ZardAlertDialogService } from "@/shared/components/alert-dialog";
import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardDialogService } from "@/shared/components/dialog";
import { ZardDividerComponent } from "@/shared/components/divider";
import { ZardIconComponent } from "@/shared/components/icon";
import { ZardInputDirective } from "@/shared/components/input";
import { ZardInputGroupComponent } from "@/shared/components/input-group";
import { ZardMenuImports } from "@/shared/components/menu";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardSelectImports } from "@/shared/components/select";
import { ZardTableComponent } from "@/shared/components/table";
import { DatePipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { toast } from "ngx-sonner";
import { AddUserComponent } from "./add-user.component";
import { EditUserComponent } from "./edit-user.component";

@Component({
  standalone: true,
  imports: [
    ZardButtonComponent,
    ZardIconComponent,
    ZardTableComponent,
    ZardPaginationImports,
    DatePipe,
    ZardButtonComponent,
    ZardIconComponent,
    ZardMenuImports,
    ReactiveFormsModule,
    ZardSelectImports,
    ZardInputDirective,
    ZardInputGroupComponent,
    ZardDividerComponent,
    ZardBadgeComponent,
  ],
  providers: [
    UserService,
    AuthService
  ],
  templateUrl: './user-list.page.html',
})
export class UserListPage implements OnInit {
  fb = inject(FormBuilder);
  roles = Object.values(Role);
  selectedValues = signal<Role[]>([]);
  rows = '10';

  searchForm = this.fb.group({
    term: [''],
  });

  users = signal<User[]>([]);
  meta = signal<PaginationMeta>({
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 0,
    totalPages: 0,
    currentPage: 0
  });
  dialogService = inject(ZardDialogService);
  alertDialogService = inject(ZardAlertDialogService);
  isLoading = signal(false);

  constructor(
    public userService: UserService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.searchUsers(1);
  }

  searchUsers(page: number) {
    this.isLoading.set(true);
    const limit = +this.rows;
    const term = this.searchForm.controls.term.value!;
    const roles = this.selectedValues();
    this.userService.search({ page, limit, term, roles }).subscribe(resp => {
      this.isLoading.set(false);
      this.users.set(resp.items);
      this.meta.set(resp.meta);
    }, error => {
      this.isLoading.set(false);
    });
  }

  rowsChange() {
    this.searchUsers(1);
  }

  pageChange(event: number) {
    this.searchUsers(event);
  }

  openAddDialog(data?: any) {
    this.dialogService.create({
      zTitle: 'Add New User',
      zDescription: `Enter the user details to create a new account.`,
      zContent: AddUserComponent,
      zOkText: 'Add',
      zData: data,
      zOnOk: (instance) => {
        if (instance.userForm.invalid) {
          this.openAddDialog(instance.userForm.value);
          this.alertDialogService.warning({
            zTitle: 'Invalid input',
            zDescription:
              'Some of the information entered is invalid. Please review the fields and try again.',
            zOkText: 'Continue',
          });
        } else {
          const dto = instance.userForm.value as UserCreateDto;
          this.userService.create(dto).subscribe(resp => {
            this.searchUsers(1);
            toast.success('User added successfully', {
              description: 'The user has been successfully created.',
            });
          }, error => {
            this.openAddDialog(instance.userForm.value);
            this.alertDialogService.warning({
              zTitle: 'Invalid input',
              zDescription: error.error.message,
              zOkText: 'Continue',
            });
          })
        }
      },
    });
  }

  update(user: User, data?: any) {
    this.dialogService.create({
      zTitle: 'Edit User',
      zDescription: `Enter the user details to update a account.`,
      zContent: EditUserComponent,
      zOkText: 'Done',
      zData: data ?? user,
      zOnOk: (instance) => {
        if (instance.userForm.invalid) {
          this.update(user, instance.userForm.value);
          this.alertDialogService.warning({
            zTitle: 'Invalid input',
            zDescription:
              'Some of the information entered is invalid. Please review the fields and try again.',
            zOkText: 'Continue',
          });
        } else {
          const dto = instance.userForm.value as UserUpdateDto;
          dto.dailyLimit = +dto.dailyLimit!;
          dto.monthlyLimit = +dto.monthlyLimit!;
          this.userService.update(user.id, dto).subscribe(resp => {
            this.searchUsers(1);
            toast.success('User updated successfully', {
              description: 'The user has been successfully updated.',
            });
          }, error => {
            this.update(user, instance.userForm.value);
            this.alertDialogService.warning({
              zTitle: 'Invalid input',
              zDescription: error.error.message,
              zOkText: 'Continue',
            });
          })
        }
      },
    });
  }

  delete(user: User) {
    this.alertDialogService.confirm({
      zTitle: 'Delete User?',
      zDescription:
        'Are you sure you want to delete this user? This action cannot be undone.',
      zOkText: 'Confirm',
      zCancelText: 'Cancel',
      zOnOk: () => {
        this.userService.delete(user.id).subscribe(resp => {
          this.searchUsers(1);
          toast.success('User deleted successfully', {
            description: 'The user has been successfully deleted.',
          });
        })
      }
    });
  }

  approval(user: User) {
    this.userService.update(user.id, { isApproved: true }).subscribe(resp => {
      this.searchUsers(1);
      toast.success('User approved successfully', {
        description: 'The user has been successfully approved.',
      });
    })
  }
}

