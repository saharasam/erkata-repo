import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RequestDetailsDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  budget?: number;

  [key: string]: any;
}

export class LocationZoneDto {
  @IsString()
  kifleKetema: string;

  @IsString()
  woreda: string;
}

export class CreateRequestDto {
  @IsString()
  category: string;

  @IsOptional()
  @IsEnum(['real_estate', 'furniture'])
  type?: 'real_estate' | 'furniture';

  @ValidateNested()
  @Type(() => RequestDetailsDto)
  details: RequestDetailsDto;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ValidateNested()
  @Type(() => LocationZoneDto)
  locationZone: LocationZoneDto;
}
