import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepositDto {
  @ApiProperty({ example: 10000, description: 'Monto a depositar en CLP' })
  @IsNumber()
  @IsPositive()
  amount: number;
}
