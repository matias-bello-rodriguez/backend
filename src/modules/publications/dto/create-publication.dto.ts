import { IsNotEmpty, IsUUID, IsInt, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicationStatus } from '../../../entities/Publication.entity';

export class CreatePublicationDto {
  @ApiProperty({ example: 'uuid-vehiculo', description: 'ID del vehículo' })
  @IsUUID()
  @IsNotEmpty()
  vehiculoId: string;

  @ApiProperty({ example: 'uuid-vendedor', description: 'ID del vendedor' })
  @IsUUID()
  @IsNotEmpty()
  vendedorId: string;

  @ApiPropertyOptional({ enum: PublicationStatus, default: PublicationStatus.PENDIENTE, description: 'Estado de la publicación' })
  @IsEnum(PublicationStatus)
  @IsOptional()
  estado?: PublicationStatus;

  @ApiPropertyOptional({ example: 'uuid-pago', description: 'ID del pago asociado' })
  @IsUUID()
  @IsOptional()
  paymentId?: string;

  @ApiProperty({ example: 10000000, description: 'Valor de venta' })
  @IsInt()
  @IsNotEmpty()
  valor: number;
  @ApiPropertyOptional({ example: 'Vendo auto en excelente estado', description: 'Descripción de la publicación' })
  @IsOptional()
  descripcion?: string;
  @ApiPropertyOptional({ example: ['url1', 'url2'], description: 'URLs de las fotos' })
  @IsOptional()
  fotos?: string[];
}
