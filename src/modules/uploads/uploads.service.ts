import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as crypto from 'crypto';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';
import { GetPresignedDownloadUrlDto } from './dto/get-presigned-download-url.dto';

@Injectable()
export class UploadsService {
  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('⚠️ Cloudinary credentials not fully configured. Uploads will fail.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async generatePresignedUploadUrl(dto: GeneratePresignedUrlDto) {
    const folder = dto.folder || 'vehicles';
    const timestamp = Math.floor(Date.now() / 1000);
    // Sanitize filename to avoid issues
    const sanitizedFileName = dto.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const publicId = `${folder}/${timestamp}_${sanitizedFileName}`;

    try {
      // Generate a signed request for Cloudinary
      // Los parámetros deben estar en orden alfabético para la firma
      const params = {
        folder: folder,
        public_id: publicId,
        timestamp: timestamp,
      };

      // Calcular firma correctamente: SHA-1 de los parámetros en orden alfabético + api_secret
      const paramsArray = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`);
      const stringToSign = paramsArray.join('&');
      const signature = crypto
        .createHash('sha1')
        .update(stringToSign + this.configService.get<string>('CLOUDINARY_API_SECRET'))
        .digest('hex');

      // Direct upload URL for client-side uploads
      const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
      const apiKey = this.configService.get('CLOUDINARY_API_KEY');
      const clientUploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

      // The public URL for display
      const publicUrl = cloudinary.url(publicId, {
        secure: true,
        fetch_format: 'auto',
        quality: 'auto',
      });

      return {
        url: clientUploadUrl,
        uploadUrl: clientUploadUrl,
        publicId,
        publicUrl,
        key: publicId,
        signature,
        timestamp,
        api_key: apiKey,
        folder,
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw new InternalServerErrorException('Could not generate upload URL');
    }
  }

  async generatePresignedUploadMultiple(files: GeneratePresignedUrlDto[]) {
    const urls = await Promise.all(
      files.map((file) => this.generatePresignedUploadUrl(file)),
    );
    return { urls };
  }

  async generatePresignedDownloadUrl(dto: GetPresignedDownloadUrlDto) {
    try {
      // For Cloudinary, we simply return the direct URL with transformations
      const publicUrl = cloudinary.url(dto.key, {
        secure: true,
        fetch_format: 'auto',
        quality: 'auto',
      });

      return {
        url: publicUrl,
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new InternalServerErrorException('Could not generate download URL');
    }
  }

  async deleteFile(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`🗑️ [UPLOADS] File deleted from Cloudinary: ${publicId}`);
      return { success: true, publicId };
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      throw new InternalServerErrorException('Could not delete file');
    }
  }
}
