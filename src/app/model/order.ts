import { User } from "./user";

export class Order {
  constructor(
    public id: number,
    public type: OrderType,
    public productLevel: ProductLevel,
    public status: OrderStatus,
    public downloadUrl: string,
    public exportedAt: Date,
    public pendingAt: Date,
    public approvedAt: Date,
    public rejectedAt: Date,
    public completedAt: Date,
    public failedAt: Date,
    public canceledAt: Date,
    public user: User,
    public createdAt: Date,
    public updatedAt: Date
  ) { }
}

export enum OrderType {
  ARCHVING_ORDER = "ArchvingOrder",
  TASKING_ORDER = "TaskingOrder"
}

export enum OrderStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Completed = "Completed",
  Failed = "Failed",
  Canceled = "Canceled"
}

export enum ProductLevel {
  L1A = "L1A",
  L1C = "L1C",
  L1D = "L1D"
}

export class OrderSearchDto {
  constructor(
    public page: number,
    public limit: number,
    public email?: string,
    public statusList?: OrderStatus[],
    public typeList?: OrderType[]
  ) { }
}