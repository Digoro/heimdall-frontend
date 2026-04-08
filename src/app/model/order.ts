import { CatalogItem } from "./collection";
import { Imaging } from "./imaging";
import { ProductType } from "./product";
import { User } from "./user";

export class Order {
  constructor(
    public id: number,
    public type: OrderType,
    public productType: ProductType,
    public status: OrderStatus,
    public downloadUrl: string,
    public receivedAt: Date,
    public estimatingAt: Date,
    public rejectedByAdminAt: Date,
    public pendingAt: Date,
    public rejectedByUserAt: Date,
    public approvedAt: Date,
    public scheduledAt: Date,
    public collectingAt: Date,
    public collectedAt: Date,
    public processingAt: Date,
    public qaAt: Date,
    public deliveredAt: Date,
    public failedAt: Date,
    public canceledAt: Date,
    public user: User,
    public item: CatalogItem,
    public imaging: Imaging,
    public createdAt: Date,
    public updatedAt: Date
  ) { }
}

export enum OrderType {
  ARCHIVE = "Archive",
  TASK = "Task"
}

export enum OrderStatus {
  RECEIVED = "Received",
  ESTIMATING = "Estimating",
  REJECTED_BY_ADMIN = "Rejected by admin",
  PENDING = "Pending",
  REJECTED_BY_USER = "Rejected by user",
  APPROVED = "Approved",
  SCHEDULED = "Scheduled",
  COLLECTING = "Collecting",
  COLLECTED = "Collected",
  PROCESSING = "Processing",
  QA = "QA",
  DELIVERED = "Delivered",
  FAILED = "Failed",
  CANCELED = "Canceled"
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

export class OrderUpdateDto {
  constructor(
    public status: OrderStatus
  ) { }
}

export interface ArchvingOrderExportJson {
  orderId: number;
  productType: ProductType;
  itemId: string;
}

export interface TaskOrderExportJson {
  orderId: number;
  productType: ProductType;
  imaging: Imaging
}