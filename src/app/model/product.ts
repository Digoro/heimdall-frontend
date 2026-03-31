import { Catalog } from "./catalog";

export class Product {
  constructor(
    public id: number,
    public productType: ProductType,
    public thumbnail: string,
    public filePath: string,
    public fileFormat: string,
    public catalog: Catalog,
    public createdAt: Date,
    public updatedAt: Date,
  ) { }
}

export enum ProductType {
  SLC = "SLC",
  GEC = "GEC",
  GEO = "GEO"
}