import { CatalogItem } from "./collection";

export class Product {
  constructor(
    public id: number,
    public productType: ProductType,
    public thumbnail: string,
    public filePath: string,
    public fileFormat: string,
    public item: CatalogItem,
    public createdAt: Date,
    public updatedAt: Date,
  ) { }
}

export enum ProductType {
  SLC = "SLC",
  GEC = "GEC",
  GEO = "GEO"
}

export interface UploadResult {
  uploaded: string[];
  errors: string[];
  message: string;
}

export interface FileSlot {
  key: 'data' | 'metadata' | 'thumbnail';
  label: string;
  description: string;
  accept: string;
  file: File | null;
  previewUrl: string | null;
  previewText: string | null;
}