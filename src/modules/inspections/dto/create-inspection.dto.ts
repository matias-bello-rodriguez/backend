import { IsNotEmpty, IsUUID, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  InspectionStatus,
  PaymentStatus,
} from '../../../entities/Inspection.entity';

export class CreateInspectionDto {
  @ApiProperty({ example: 'uuid-solicitante', description: 'ID del usuario solicitante' })
  @IsUUID()
  @IsOptional() // Allow optional because it's set by controller
  solicitanteId: string;

  @ApiProperty({ example: 'uuid-publicacion', description: 'ID de la publicación' })
  @IsUUID()
  @IsNotEmpty()
  publicacionId: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del horario de sede' })
  @IsInt()
  @IsOptional()
  horarioId?: number;

  @ApiPropertyOptional({ example: '2023-12-25T10:00:00Z', description: 'Fecha programada' })
  @IsOptional()
  fechaProgramada?: Date;

  @ApiPropertyOptional({ example: 'uuid-pago', description: 'ID del pago asociado' })
  @IsUUID()
  @IsOptional()
  paymentId?: string;

  @ApiPropertyOptional({ example: 'uuid-mecanico', description: 'ID del mecánico asignado' })
  @IsUUID()
  @IsOptional()
  mecanicoId?: string;

  @ApiPropertyOptional({ enum: InspectionStatus, default: InspectionStatus.PENDIENTE, description: 'Estado de la inspección' })
  @IsEnum(InspectionStatus)
  @IsOptional()
  estado_insp?: InspectionStatus;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.INCOMPLETO, description: 'Estado del pago' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  estado_pago?: PaymentStatus;

  @ApiPropertyOptional({ example: 35000, description: 'Valor de la inspección' })
  @IsInt()
  @IsOptional()
  valor?: number;
}
