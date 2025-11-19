import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum WasteCategory {
  PLASTIC = 'PLASTIC',
  PAPER = 'PAPER',
  GLASS = 'GLASS',
  METAL = 'METAL',
  ORGANIC = 'ORGANIC',
  ELECTRONIC = 'ELECTRONIC',
  OTHER = 'OTHER',
}

export enum WasteLogStatus {
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export class CreateWasteLogDto {
  @IsNumber()
  @Min(0.1)
  weightKg: number;

  @IsEnum(WasteCategory)
  category: WasteCategory;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  photoURL?: string;

  @IsOptional()
  date?: string;
}

export class UpdateWasteLogStatusDto {
  @IsEnum(WasteLogStatus)
  status: WasteLogStatus;
}

export class WasteLogFiltersDto {
  @IsOptional()
  @IsEnum(WasteLogStatus)
  status?: WasteLogStatus;

  @IsOptional()
  @IsEnum(WasteCategory)
  category?: WasteCategory;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

