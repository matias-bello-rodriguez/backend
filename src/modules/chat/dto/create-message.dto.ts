import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'ID del usuario que envía el mensaje' })
  @IsUUID()
  @IsNotEmpty()
  remitenteId: string;

  @ApiProperty({ description: 'ID del usuario que recibe el mensaje' })
  @IsUUID()
  @IsNotEmpty()
  destinatarioId: string;

  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @ApiProperty({ description: 'ID del vehículo relacionado (opcional)', required: false })
  @IsUUID()
  @IsOptional()
  vehiculoId?: string;
}
