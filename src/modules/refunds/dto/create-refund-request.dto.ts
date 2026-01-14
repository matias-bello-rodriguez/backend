import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRefundRequestDto {
  @ApiProperty()
  @IsUUID()
  publicationId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
