import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeneratePresignedUrlDto {
  @ApiProperty({ example: 'image.jpg', description: 'Nombre del archivo' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'image/jpeg', description: 'Tipo MIME del archivo' })
  @IsString()
  contentType: string;

  @ApiPropertyOptional({ enum: ['vehicles', 'inspections', 'users', 'publications'], default: 'vehicles' })
  @IsEnum(['vehicles', 'inspections', 'users', 'publications'])
  @IsOptional()
  folder?: string;
}
