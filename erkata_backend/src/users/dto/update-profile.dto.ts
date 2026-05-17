import { IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters.' })
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:\+251|251|0)?([79]\d{8})$/, {
    message:
      'Invalid Ethiopian phone number. Please use a valid format (e.g. 0911234567 or +251911234567).',
  })
  phone?: string;
}
