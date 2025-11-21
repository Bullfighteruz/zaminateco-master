import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ImpactArea {
  SCHOOL = 'SCHOOL',
  PARK = 'PARK',
  MAHALLA = 'MAHALLA',
  KINDERGARTEN = 'KINDERGARTEN',
  HOSPITAL = 'HOSPITAL',
  STREET = 'STREET',
  OTHER = 'OTHER',
}

export class VoteDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsEnum(ImpactArea)
  impactArea: ImpactArea;
}

