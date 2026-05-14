import { IsString } from 'class-validator';

export class UpdateBusinessProfileDto {
  @IsString()
  tinNumber: string;

  @IsString()
  tradeLicenseNumber: string;
}
