import { Order } from "./order";

export class Imaging {
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
    public orders: Order[],
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