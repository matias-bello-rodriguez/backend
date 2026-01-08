import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPresignedDownloadUrlDto {
  @ApiProperty({ example: 'vehicles/image.jpg', description: 'Public ID del archivo en Cloudinary' })
  @IsString()
  key: string;
}
