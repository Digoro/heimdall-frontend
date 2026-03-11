import { APIKey, APIKeyStatus, ResponseCreateAPIKey } from "@/model/apiKey";
import { PaginationMeta } from "@/model/pagination";
import { APIService } from "@/service/api.service";
import { AuthService } from "@/service/auth.service";
import { ZardAlertDialogService } from "@/shared/components/alert-dialog";
import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardCardComponent } from "@/shared/components/card";
import { ZardDialogService } from "@/shared/components/dialog";
import { ZardDividerComponent } from "@/shared/components/divider";
import { ZardIconComponent } from "@/shared/components/icon";
import { ZardMenuImports } from "@/shared/components/menu";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardProgressBarComponent } from "@/shared/components/progress-bar";
import { ZardSelectImports } from "@/shared/components/select";
import { ZardTableComponent } from "@/shared/components/table";
import { DatePipe } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { toast } from "ngx-sonner";
import { AddAPIKeyComponent } from "./add-api-key.component";
import { NewAPIKeyComponent } from "./new-api-key.component";

@Component({
  standalone: true,
  imports: [
    ZardCardComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardBadgeComponent,
    ZardProgressBarComponent,
    ZardTableComponent,
    ZardPaginationImports,
    DatePipe,
    ZardButtonComponent,
    ZardIconComponent,
    ZardMenuImports,
    ZardDividerComponent,
    ZardSelectImports
  ],
  providers: [
    APIService,
    AuthService
  ],
  templateUrl: './api-key-list.page.html',
})
export class APIKeyPage implements OnInit {
  private alertDialogService = inject(ZardAlertDialogService);

  apiKeys = signal<APIKey[]>([]);
  meta = signal<PaginationMeta>({
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 0,
    totalPages: 0,
    currentPage: 0
  });
  rows = '10';

  private dialogService = inject(ZardDialogService);
  dailyUsage = signal(0);
  dailyLimit = signal(0);
  dailyStat = signal(0);
  monthlyUsage = signal(0);
  monthlyLimit = signal(0);
  monthlyStat = signal(0);

  constructor(
    public apiService: APIService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.searchAPIKeys(1);
    this.getAPIKeyUsage();
  }

  private searchAPIKeys(page: number) {
    const limit = +this.rows;
    this.apiService.search({ page, limit }).subscribe(resp => {
      this.apiKeys.set(resp.items);
      this.meta.set(resp.meta);
    });
  }

  rowsChange() {
    this.searchAPIKeys(1);
  }

  pageChange(event: number) {
    this.searchAPIKeys(event);
  }

  openDialog() {
    this.dialogService.create({
      zTitle: 'Create New Key',
      zDescription: `A descriptive name used to identify this API key. This label is for your reference only.`,
      zContent: AddAPIKeyComponent,
      zOkText: 'Create Key',
      zOnOk: instance => {
        const label = instance.form.value.label!;
        this.apiService.create({ label: label }).subscribe(resp => {
          this.searchAPIKeys(1);
          this.dialogService.create({
            zTitle: 'Save your key',
            zDescription: `Your API key has been created successfully. Please copy and store it securely. You will not be able to view it again.`,
            zContent: NewAPIKeyComponent,
            zData: resp as ResponseCreateAPIKey,
            zCancelText: null,
            zOkText: 'Done'
          });
        })
      },
    });
  }

  inActive(apiKey: APIKey) {
    this.apiService.update(apiKey.id, { status: APIKeyStatus.INACTIVE }).subscribe(resp => {
      toast.success('API key inactived successfully', {
        description: 'The user has been successfully approved.',
      });
      this.searchAPIKeys(this.meta().currentPage);
    });
  }

  active(apiKey: APIKey) {
    this.apiService.update(apiKey.id, { status: APIKeyStatus.ACTIVE }).subscribe(resp => {
      toast.success('API key actived successfully', {
        description: 'The user has been successfully approved.',
      });
      this.searchAPIKeys(this.meta().currentPage);
    });
  }


  delete(apiKey: APIKey) {
    this.alertDialogService.confirm({
      zTitle: 'Delete API Key?',
      zDescription:
        'This API key will be permanently revoked and can no longer be used to access the API. Any applications using this key will stop working immediately.',
      zOkText: 'Confirm',
      zCancelText: 'Cancel',
      zOnOk: () => {
        this.apiService.delete(apiKey.id).subscribe(resp => {
          this.searchAPIKeys(this.meta().currentPage);
          toast.success('API key deleted successfully', {
            description: 'API key has been successfully deleted.',
          });
        });
      }
    });
  }

  getAPIKeyUsage() {
    this.authService.getCurrentUserFromServer().subscribe(resp => {
      this.dailyUsage.set(resp.dailyUsage);
      this.dailyLimit.set(resp.dailyLimit);
      if (resp.dailyLimit <= 0) {
        this.dailyStat.set(0);
      } else {
        this.dailyStat.set(Math.round(resp.dailyUsage / resp.dailyLimit * 100));
      }

      this.monthlyUsage.set(resp.monthlyUsage);
      this.monthlyLimit.set(resp.monthlyLimit);
      if (resp.monthlyLimit <= 0) {
        this.monthlyStat.set(0)
      } else {
        this.monthlyStat.set(Math.round(resp.monthlyUsage / resp.monthlyLimit * 100));
      }
    })
  }
}

