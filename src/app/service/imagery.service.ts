import { CatalogItem, CatalogResponse } from '@/model/collection';
import {
  ImagerySearchCriteria,
  ImagerySearchResult,
  INCIDENCE_RANGE,
  PAGE_SIZE,
  SortOption,
  StacSearchDto,
} from '@/model/imagery-search';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

/** 백엔드 sar:instrument_mode 표기(소문자 가정)로 변환 */
export const toInstrumentMode = (mode: string) => mode.toLowerCase();

const toIsoStart = (d: Date) => `${toYmd(d)}T00:00:00Z`;
const toIsoEnd = (d: Date) => `${toYmd(d)}T23:59:59Z`;
const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function buildSearchDto(
  criteria: ImagerySearchCriteria,
  page: number,
  sort: SortOption,
  pageSize = PAGE_SIZE,
): StacSearchDto {
  const dto: StacSearchDto = {
    collections: ['cosmos'],
    limit: pageSize,
    page,
    sortBy: [{ field: 'datetime', direction: sort === 'newest' ? 'desc' : 'asc' }],
  };
  const query: NonNullable<StacSearchDto['query']> = {};

  if (criteria.aoi) dto.intersects = criteria.aoi.geometry;
  if (criteria.from || criteria.to) {
    const start = criteria.from ? toIsoStart(criteria.from) : '..';
    const end = criteria.to ? toIsoEnd(criteria.to) : '..';
    dto.datetime = `${start}/${end}`;
  }
  if (criteria.imagingModes.length) {
    query['sar:instrument_mode'] = { in: criteria.imagingModes.map(toInstrumentMode) };
  }
  if (criteria.productTypes.length) {
    query['sar:product_type'] = { in: criteria.productTypes };
  }
  if (criteria.polarizations.length) {
    // 배열 속성이라 `in`이 아니라 `any`(하나라도 포함)를 쓴다.
    query['sar:polarizations'] = { any: criteria.polarizations };
  }
  const [minAngle, maxAngle] = criteria.incidenceAngle;
  if (minAngle > INCIDENCE_RANGE.min || maxAngle < INCIDENCE_RANGE.max) {
    query['view:incidence_angle'] = { gte: minAngle, lte: maxAngle };
  }
  if (Object.keys(query).length) dto.query = query;

  return dto;
}

@Injectable()
export class ImageryService {
  constructor(private http: HttpClient) { }

  search(
    criteria: ImagerySearchCriteria,
    page: number,
    sort: SortOption,
    pageSize = PAGE_SIZE,
  ): Observable<ImagerySearchResult> {
    return this.http.post<CatalogResponse>('/api/catalog/web/search', buildSearchDto(criteria, page, sort, pageSize)).pipe(
      map((resp) => ({
        items: resp.features as CatalogItem[],
        total: resp.context?.matched ?? resp.features.length,
      })),
    );
  }
}
