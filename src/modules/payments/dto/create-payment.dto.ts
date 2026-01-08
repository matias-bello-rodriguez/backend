import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../../../entities/Payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-usuario', description: 'ID del usuario que paga' })
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({ example: 50000, description: 'Monto del pago' })
  @IsInt()
  @IsNotEmpty()
  monto: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.WEBPAY, description: 'Método de pago' })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  metodo: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentStatus, default: PaymentStatus.PENDING, description: 'Estado del pago' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  estado?: PaymentStatus;

  @ApiPropertyOptional({ example: 'REF-123456', description: 'Detalles o referencia externa' })
  @IsString()
  @IsOptional()
  detalles?: string;

  @ApiPropertyOptional({ example: 'idem-xxxx', description: 'Idempotency key para evitar duplicados' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
