import { IsOptional, IsString, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterPublicationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxYear?: number;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  comuna?: string;

  @IsOptional()
  @IsString()
  transmision?: string;

  @IsOptional()
  @IsString()
  combustible?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
