import { ZardBadgeComponent } from "@/shared/components/badge";
import { ZardButtonComponent } from "@/shared/components/button";
import { ZardCardComponent } from "@/shared/components/card";
import { ZardMenuImports } from "@/shared/components/menu";
import { ZardPaginationImports } from "@/shared/components/pagination";
import { ZardSelectImports } from "@/shared/components/select";
import { ZardTableComponent, ZardTableCellComponent } from "@/shared/components/table";
import { CommonModule, Location } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArchive, lucideArrowLeft, lucideDownload, lucideSatellite, lucideSquarePen, lucideUpload } from '@ng-icons/lucide';
import { OrderStatusComponent } from "@/shared/components/order-status/order-status.component";
import { UserService } from "@/service/user.service";
import { ZardAlertDialogService } from "@/shared/components/alert-dialog";
import { ZardFormControlComponent, ZardFormFieldComponent, ZardFormLabelComponent } from "@/shared/components/form";
import { ZardInputDirective } from "@/shared/components/input";
import { toast } from "ngx-sonner";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardButtonComponent,
    ZardCardComponent,
    ZardInputDirective,
    ZardFormFieldComponent,
    ZardFormLabelComponent,
    ZardFormControlComponent,
    ZardTableComponent,
    ZardPaginationImports,
    ZardMenuImports,
    ZardSelectImports,
    ZardBadgeComponent,
    NgIcon,
    OrderStatusComponent,
    ZardTableCellComponent,
  ],
  providers: [
    UserService
  ],
  templateUrl: './settings.page.html',
  viewProviders: [
    provideIcons({
      lucideSquarePen, lucideArchive, lucideSatellite, lucideArrowLeft,
      lucideUpload, lucideDownload
    })
  ]
})
export class SettingsPage implements OnInit {
  isEditWebhookSecret = signal(false);
  alertDialogService = inject(ZardAlertDialogService);

  webhookForm = new FormGroup({
    url: new FormControl(''),
    secret: new FormControl(''),
  });

  constructor(
    private location: Location,
    private userSerivce: UserService
  ) { }

  ngOnInit(): void {
    this.userSerivce.getWebhook().subscribe(resp => {
      this.webhookForm.controls.url.patchValue(resp.webhookUrl);
      this.isEditWebhookSecret.set(resp.isExsitWebhookSecret);
    })
  }

  saveWebhook() {
    this.userSerivce.registerWebhook(this.webhookForm.controls.url.value!, !this.isEditWebhookSecret(), this.webhookForm.controls.secret.value!).subscribe(resp => {
      this.webhookForm.controls.url.patchValue(resp.webhookUrl);
      this.webhookForm.controls.secret.reset();
      this.isEditWebhookSecret.set(resp.isExsitWebhookSecret);
      toast.success('Webhook updated successfully', {
        description: 'webhook has been successfully updated.',
      });
    })
  }

  deleteWebhook() {
    this.userSerivce.deleteWebhook().subscribe(resp => {
      this.webhookForm.reset();
      this.isEditWebhookSecret.set(false);
      toast.success('Webhook deleted successfully', {
        description: 'webhook has been successfully deleted .',
      });
    })
  }

  setEditWebhookSecret() {
    this.isEditWebhookSecret.set(!this.isEditWebhookSecret());
  }

  back() {
    this.location.back();
  }
}