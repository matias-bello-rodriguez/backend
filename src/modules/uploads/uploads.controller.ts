import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';
import { GetPresignedDownloadUrlDto } from './dto/get-presigned-download-url.dto';

@ApiTags('Uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned-upload')
  @ApiOperation({ summary: 'Generar URL firmada para subir un archivo' })
  @ApiResponse({ status: 201, description: 'URL generada exitosamente.' })
  generatePresignedUploadUrl(@Body() dto: GeneratePresignedUrlDto) {
    return this.uploadsService.generatePresignedUploadUrl(dto);
  }

  @Post('presigned-upload-multiple')
  @ApiOperation({ summary: 'Generar URLs firmadas para múltiples archivos' })
  @ApiResponse({ status: 201, description: 'URLs generadas exitosamente.' })
  generatePresignedUploadMultiple(@Body() files: GeneratePresignedUrlDto[]) {
    return this.uploadsService.generatePresignedUploadMultiple(files);
  }

  @Post('presigned-download')
  @ApiOperation({ summary: 'Generar URL firmada para descargar un archivo' })
  @ApiResponse({ status: 201, description: 'URL generada exitosamente.' })
  generatePresignedDownloadUrl(@Body() dto: GetPresignedDownloadUrlDto) {
    return this.uploadsService.generatePresignedDownloadUrl(dto);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Eliminar un archivo' })
  @ApiResponse({ status: 200, description: 'Archivo eliminado exitosamente.' })
  deleteFile(@Param('key') key: string) {
    return this.uploadsService.deleteFile(key);
  }
}
