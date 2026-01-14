import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RefundStatus } from '../../../entities/RefundRequest.entity';

export class UpdateRefundStatusDto {
  @ApiProperty({ enum: RefundStatus })
  @IsEnum(RefundStatus)
  status: RefundStatus;
}
