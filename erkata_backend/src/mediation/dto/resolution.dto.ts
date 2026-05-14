import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ResolutionDto {
  @IsString()
  proposedText: string;
}

export class FinalizeResolutionDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class FinalizeBundleDto {
  @IsString()
  resolutionText: string;
}
