import { Component, input } from '@angular/core';
import { ZardBadgeComponent } from '../badge/badge.component';
import { Order } from '@/model/order';

@Component({
  selector: 'order-status',
  imports: [
    ZardBadgeComponent
  ],
  templateUrl: './order-status.component.html',
})
export class OrderStatusComponent {
  order = input<Order>();
}