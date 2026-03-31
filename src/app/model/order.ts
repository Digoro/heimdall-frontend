import { Catalog } from "./catalog";
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
    public exportedAt: Date,
    public pendingAt: Date,
    public approvedAt: Date,
    public rejectedAt: Date,
    public completedAt: Date,
    public failedAt: Date,
    public canceledAt: Date,
    public user: User,
    public catalog: Catalog,
    public imaging: Imaging,
    public createdAt: Date,
    public updatedAt: Date
  ) { }
}

export enum OrderType {
  ARCHVING_ORDER = "ArchvingOrder",
  TASKING_ORDER = "TaskingOrder"
}

export enum OrderStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  COMPLETED = "Completed",
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
  catalogId: number;
  productType: ProductType;
  imagingMode: string;
  imagingStartAt: string;
  imagingEndAt: string;
  geometry: string;
  target: string;
  polarization: string;
  resolution: string;
  projection: string;
  geoTransform: string;
  offNadirAngle: number;
}

export interface TaskingOrderExportJson {
  orderId: number;
  geometry: {};
  productLevel: ProductType;
  imagingMode: string;
  windowOpen: string;
  windowClose: string;
  collectionConstraints: {};
}