import { User } from "./user";

export class APIKey {
  constructor(
    public id: number,
    public maskKey: string,
    public label: string,
    public status: APIKeyStatus,
    public lastUsedAt: Date,
    public apiFeatureUsageList: APIFeatureUsage[],
    public createdAt: Date,
    public updatedAt: Date
  ) { }
}

export enum APIKeyStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export class APIFeatureUsage {
  constructor(
    public id: number,
    public feature: string,
    public usagePoint: number,
    public user: User,
    public apiKey: APIKey,
    public createdAt: Date,
    public updatedAt: Date
  ) { }
}

export class CreateAPIKeyDto {
  constructor(
    public label: string
  ) { }
}

export interface ResponseCreateAPIKey {
  key: string;
  maskKey: string;
}

export class UpdateAPIKeyDto {
  constructor(
    public status: APIKeyStatus
  ) { }
}