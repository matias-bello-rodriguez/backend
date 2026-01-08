import { IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletPaymentDto {
  @ApiProperty({ example: 5000, description: 'Monto a pagar' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Pago de inspección', description: 'Descripción del pago' })
  @IsString()
  description: string;
}
