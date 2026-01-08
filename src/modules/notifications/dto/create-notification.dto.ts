import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../../../entities/Notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ example: 'uuid-user-id', description: 'ID del usuario receptor' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Nueva inspección asignada', description: 'Título de la notificación' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Se te ha asignado una nueva inspección para un vehículo', description: 'Mensaje de la notificación' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.CREAR_INSP, description: 'Tipo de notificación' })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiPropertyOptional({ example: 'uuid-related-id', description: 'ID relacionado (inspección, publicación, etc.)' })
  @IsString()
  @IsOptional()
  relatedId?: string;
}
