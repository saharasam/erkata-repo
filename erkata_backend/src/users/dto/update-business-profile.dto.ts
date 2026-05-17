import { IsOptional, IsString } from 'class-validator';

export class UpdateBusinessProfileDto {
  @IsOptional()
  @IsString()
  tinNumber?: string;

  @IsOptional()
  @IsString()
  tradeLicenseNumber?: string;
}
