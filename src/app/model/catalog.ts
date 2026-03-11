import { Product } from "./product";
import { User } from "./user";

export class Catalog {
  constructor(
    public id: number,
    public imagingMode: ImagingMode,
    public imagingStartAt: Date,
    public imagingEndAt: Date,
    public cornerCoordinates: {
      topLeft: { x: number; y: number },
      topRight: { x: number; y: number },
      bottomLeft: { x: number; y: number },
      bottomRight: { x: number; y: number },
    },
    public target: string,
    public polarization: string,
    public resolution: string,
    public projection: string,
    public geoTransform: string,
    public nadirAngle: number,
    public offNadirAngle: number,
    public bandColorInterp: string,
    public user: User,
    public product: Product,
    public createdAt: Date,
    public updatedAt: Date,
  ) { }
}

export enum ImagingMode {
  Stripmap = "Stripmap",
  ScanSAR = "ScanSAR",
  Spotlight_Single = "Spotlight_Single",
  Spotlight_Dwell = "Spotlight_Dwell",
  Spotlight_Single_UHR = "Spotlight_Single_UHR",
  Spotlight_Dwell_UHR = "Spotlight_Dwell_UHR"
}