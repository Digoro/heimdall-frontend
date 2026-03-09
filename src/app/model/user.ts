
export class User {
  constructor(
    public id: number,
    public email: string,
    public password: string,
    public name: string,
    public department: string,
    public role: Role,
    public dailyUsage: number,
    public dailyLimit: number,
    public monthlyUsage: number,
    public monthlyLimit: number,
    public createdAt: Date,
    public updatedAt: Date
  ) { }
}

export class UserSearchDto {
  constructor(
    public page: number,
    public limit: number,
    public roleList?: Role[],
  ) { }
}

export class UserCreateDto {
  constructor(
    public name: string,
    public email: string,
    public department: string,
    public password: string,
  ) { }
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}