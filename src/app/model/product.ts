import { Catalog } from "./catalog";

export class Product {
  constructor(
    public id: number,
    public productLevel: ProductLevel,
    public thumbnail: string,
    public filePath: string,
    public fileFormat: string,
    public catalog: Catalog,
    public createdAt: Date,
    public updatedAt: Date,
  ) { }
}

export enum ProductLevel {
  L1A = "L1A",
  L1C = "L1C",
  L1D = "L1D"
}