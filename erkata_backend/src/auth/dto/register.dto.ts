import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  fullName: string;

  @IsString()
  @Matches(/^(?:\+251|251|0)?([79]\d{8})$/, {
    message:
      'Invalid Ethiopian phone number. Please use a valid format starting with 09, 07, +2519, or +2517 followed by 8 digits.',
  })
  phone: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/, {
    message:
      'Password is too weak. It must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character.',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  inviteToken?: string;
}
