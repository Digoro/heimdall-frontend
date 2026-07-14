import { Order } from "./order";
import { Product } from "./product";
import { User } from "./user";

export interface SpatialExtent {
  bbox: number[][];
}

export interface TemporalExtent {
  interval: (string | null)[][];
}

export interface Extent {
  spatial: SpatialExtent;
  temporal: TemporalExtent;
}

export interface Summaries {
  platform: string[];
  'sar:product_type': string[];
}

export interface CatalogCollection {
  collectionId: string;
  type: string;
  stacVersion: string;
  title: string;
  description: string;
  license: string;
  extent: {
    spatial: { bbox: number[][] },
    temporal: {
      interval: (string | null)[][]
    }
  }
  summaries: object;
  links?: object[];
  items: CatalogItem[];
}

export interface CatalogResponse {
  type: string;
  features: CatalogItem[];
  context: any;
  link: any;
}

export interface CatalogItem {
  id: string;
  itemId: string;
  type: string;
  stacVersion: string;
  collection: string;
  geometry: object;
  bbox: number[];
  properties: {
    title: string;
    datetime: string;
    start_datetime: string;
    end_datetime: string;
    platform: string;
    mission: string;
    instruments: string;

    // SAR Extension
    'sar:instrument_mode': string;
    'sar:product_type': string;
    'sar:frequency_band': string;
    'sar:center_frequency': number;
    'sar:polarizations': string[];
    'sar:observation_direction': string;
    'sar:pixel_spacing_range': number;
    'sar:pixel_spacing_azimuth': number;
    'sar:looks_range': number;
    'sar:looks_azimuth': number;
    'sar:beam_ids': string[];

    // View Extension
    'view:look_direction': string;
    'view:azimuth': number;
    'view:incidence_angle': number;

    // Satellite Extension
    'sat:orbit_state': string;

    // Cosmos
    'cosmos:resolution': number;
  };
  assets: {
    thumbnail?: { href: string, type: string, title: string, roles: string[] };
    data?: { href: string, type: string, title: string, roles: string[] };
    metadata?: { href: string, type: string, title: string, roles: string[] };
  }
  links?: object[];
  collectionEntity: CatalogCollection;
  user: User;
  product: Product;
  orders: Order[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ImagingMode {
  STRIPMAP = "Stripmap",
  SCANSAR = "ScanSAR",
  SPOTLIGHT_SINGLE = "Spotlight_Single",
  SPOTLIGHT_DWELL = "Spotlight_Dwell",
  SPOTLIGHT_SINGLE_UHR = "Spotlight_Single_UHR",
  SPOTLIGHT_DWELL_UHR = "Spotlight_Dwell_UHR"
}

export class CatalogSearchDto {
  constructor(
    public page: number,
    public limit: number,
  ) { }
}