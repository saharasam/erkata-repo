import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RequestDetailsDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  budget?: number;
}

export class RequestMetadataDto {
  @IsOptional()
  @IsString()
  intent?: string;

  @IsOptional()
  @IsString()
  constructionStatus?: string;

  @IsOptional()
  @IsString()
  bedrooms?: string;

  @IsOptional()
  @IsString()
  bankLoan?: string;

  @IsOptional()
  @IsString()
  customization?: string;

  @IsOptional()
  @IsString()
  targetRoom?: string;

  @IsOptional()
  @IsString()
  paymentPlan?: string;
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
  @ValidateNested()
  @Type(() => RequestMetadataDto)
  metadata?: RequestMetadataDto;

  @ValidateNested()
  @Type(() => LocationZoneDto)
  locationZone: LocationZoneDto;
}
