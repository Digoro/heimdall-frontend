import { Order } from "./order";

export class Imaging {
  constructor(
    public id: number,
    public geometry: Geometry,
    public name: string,
    public description: string,
    public priority: Priority,
    public windowOpen: Date,
    public windowClose: Date,
    public imagingMode: ImagingMode,
    public polarization: Polarization,
    public resolution: number,
    public minIncidenceAngle: number,
    public maxIncidenceAngle: number,
    public lookSide: LookSide,
    public orbitDirection: OrbitDirection,
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

// CRITICAL: 가장 긴급, 거의 즉시 대응, 재난/군사/긴급 상황
// URGENT: URGENT 바로 아래 우선순위, 스케줄 상위 배치, 중요 감시 대상
// STANDARD: 일반적인 촬영 요청,
// FLEXIBLE: 긴급성 없음, 스케줄 가능할 때 아무때나 촬영, 가장 저렴
export enum Priority {
  CRITICAL = "Critical",
  URGENT = "Urgent",
  STANDARD = "Standard",
  FLEXIBLE = "Flexible"
}

export enum Polarization {
  VV = "VV",
  VH = "VH",
  HV = "HV",
  HH = "HH"
}

export enum OrbitDirection {
  BOTH = "Both",
  ASENDING = "Asending",
  DESENDING = "Desending"
}

export enum LookSide {
  BOTH = "Both",
  LEFT = "Left",
  RIGHT = "Right"
}

export class Geometry {
  constructor(
    public type: string,
    public coordinates: number[][][]
  ) { }
}