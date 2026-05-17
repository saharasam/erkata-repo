import { IsEmail, IsEnum, IsString, Matches } from 'class-validator';
import { UserRole } from '@prisma/client';

export class InviteDto {
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  @Matches(/^(?:\+251|251|0)?([79]\d{8})$/, {
    message:
      'Invalid Ethiopian phone number. Please use a valid format starting with 09, 07, +2519, or +2517 followed by 8 digits.',
  })
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;
}
