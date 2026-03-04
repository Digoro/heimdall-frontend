export class User {
  constructor(
    public id: number,
    public email: string,
    public password: string,
    public name: string,
    public department: string,
    public role: Role,
    public createdAt: string,
    public updatedAt: string
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