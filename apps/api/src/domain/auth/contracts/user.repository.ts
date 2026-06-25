import type { UserEntity } from '../entities/user.entity';

export interface CreateUserDto {
  email: string;
  name?: string;
  passwordHash?: string;
}

export abstract class UserRepository {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract create(dto: CreateUserDto): Promise<UserEntity>;
  abstract updatePasswordHash(userId: string, hash: string): Promise<void>;
  abstract verifyEmail(userId: string): Promise<void>;
}
