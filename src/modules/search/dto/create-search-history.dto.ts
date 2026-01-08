import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateSearchHistoryDto {
  @IsOptional()
  @IsString()
  terminoBusqueda?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  precioMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  precioMax?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  anioMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  anioMax?: number;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  transmision?: string;

  @IsOptional()
  @IsString()
  combustible?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  resultadosEncontrados?: number;
}
