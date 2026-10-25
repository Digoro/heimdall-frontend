import { CatalogItem, ImagingMode } from '@/model/collection';
import { ProductType } from '@/model/product';

export type Polarization = 'HH' | 'VV' | 'HV' | 'VH';
export const POLARIZATIONS: Polarization[] = ['HH', 'VV', 'HV', 'VH'];
export const PRODUCT_TYPES = Object.values(ProductType);
export const IMAGING_MODES = Object.values(ImagingMode);

/** Incidence angle 슬라이더가 허용하는 범위(도) */
export const INCIDENCE_RANGE = { min: 15, max: 60 } as const;

export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Aoi {
  shape: 'rectangle' | 'polygon';
  geometry: PolygonGeometry;
  areaKm2: number;
}

export interface ImagerySearchCriteria {
  aoi: Aoi | null;
  from: Date | null;
  to: Date | null;
  imagingModes: ImagingMode[];
  productTypes: ProductType[];
  polarizations: Polarization[];
  incidenceAngle: [number, number];
}

export function createDefaultCriteria(): ImagerySearchCriteria {
  return {
    aoi: null,
    from: null,
    to: null,
    imagingModes: [],
    productTypes: [],
    polarizations: [],
    incidenceAngle: [INCIDENCE_RANGE.min, INCIDENCE_RANGE.max],
  };
}

export type SortOption = 'newest' | 'oldest';

type QueryOperators<T> = { eq?: T; neq?: T; gt?: T; gte?: T; lt?: T; lte?: T; in?: T[]; any?: T[] };

/** 백엔드 STAC 검색(SearchDto) 요청 본문 */
export interface StacSearchDto {
  collections?: string[];
  ids?: string[];
  bbox?: number[];
  intersects?: PolygonGeometry;
  datetime?: string;
  query?: Record<string, QueryOperators<string | number>>;
  sortBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  page?: number;
}

export interface ImagerySearchResult {
  items: CatalogItem[];
  total: number;
}

export const PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
