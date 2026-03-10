
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
    public isApproved: boolean,
    public createdAt: Date,
    public updatedAt: Date
  ) { }
}

export class UserSearchDto {
  constructor(
    public page: number,
    public limit: number,
    public term?: string,
    public roles?: Role[],
  ) { }
}

export class UserCreateDto {
  constructor(
    public name: string,
    public email: string,
    public department: string,
    public password: string,
    public role?: Role
  ) { }
}

export class UserUpdateDto {
  constructor(
    public name?: string,
    public email?: string,
    public department?: string,
    public role?: Role,
    public dailyLimit?: number,
    public monthlyLimit?: number,
    public isApproved?: boolean
  ) { }
}

export enum Role {
  ADMIN = 'Admin',
  USER = 'User',
}