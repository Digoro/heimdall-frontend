import { Catalog } from "./catalog";
import { Imaging } from "./imaging";
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

export class OrderUpdateDto {
  constructor(
    public status: OrderStatus
  ) { }
}

export interface ArchvingOrderExportJson {
  orderId: number;
  catalogId: number;
  productLevel: ProductLevel;
  imagingMode: string;
  imagingStartAt: string;
  imagingEndAt: string;
  cornerCoordinates: {
    topLeft: { x: number; y: number },
    topRight: { x: number; y: number },
    bottomLeft: { x: number; y: number },
    bottomRight: { x: number; y: number },
  };
  target: string;
  polarization: string;
  resolution: string;
  projection: string;
  geoTransform: string;
  nadirAngle: number;
  offNadirAngle: number;
  bandColorInterp: string;
}

export interface TaskingOrderExportJson {
  orderId: number;
  geometry: {};
  productLevel: ProductLevel;
  imagingMode: string;
  windowOpen: string;
  windowClose: string;
  collectionConstraints: {};
}