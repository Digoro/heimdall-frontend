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
    public filePath: {
      data: string;
      metadata: string;
      thumbnail: string;
    },
    public estimatedDeliveryDate: Date,
    public estimatedCollectionDate: Date,
    public user: User,
    public referencedItem: CatalogItem,
    public deliveredItem: CatalogItem,
    public imaging: Imaging,
    public statusHistory: OrderStatusHistory[],
    public createdAt: Date,
    public updatedAt: Date
  ) { }
}

export class OrderStatusHistory {
  constructor(
    public id: string,
    public order: Order,
    public fromStatus: OrderStatus,
    public toStatus: OrderStatus,
    public createdAt: Date,
    public updatedAt: Date,
    public reason?: string,
  ) { }
}

export enum OrderType {
  ARCHIVE = "Archive",
  TASK = "Task"
}

export enum OrderStatus {
  RECEIVED = "Received",
  ESTIMATING = "Estimating",
  REJECTED = "Rejected",
  PENDING = "Pending",
  CANCELED = "Canceled",
  APPROVED = "Approved",
  SCHEDULED = "Scheduled",
  COLLECTING = "Collecting",
  PROCESSING = "Processing",
  FAILED = "Failed",
  QA = "QA",
  DELIVERED = "Delivered",
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

export class OrderStatusUpdateDto {
  constructor(
    public status: OrderStatus,
    public reason?: string,
    public estimatedCollectionDate?: Date,
    public estimatedDeliveryDate?: Date,
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