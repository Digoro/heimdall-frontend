import { OrderStatus } from "./order";

export class WebhookLog {
  constructor(
    public id: string,
    public orderId: string,
    public userId: string,
    public status: OrderStatus,
    public payload: object,
    public responseCode: number,
    public success: boolean,
    public attemp: number,
  ) { }
}