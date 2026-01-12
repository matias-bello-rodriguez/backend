import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';
import { GetPresignedDownloadUrlDto } from './dto/get-presigned-download-url.dto';

@Injectable()
export class UploadsService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME');

    if (!accessKeyId || !secretAccessKey || !this.bucketName) {
      console.warn('⚠️ AWS S3 credentials not fully configured. Uploads will fail.');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  async generatePresignedUploadUrl(dto: GeneratePresignedUrlDto) {
    const folder = dto.folder || 'vehicles';
    const timestamp = Math.floor(Date.now() / 1000);
    // Sanitize filename to avoid issues
    const sanitizedFileName = dto.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}_${sanitizedFileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: dto.contentType || 'application/octet-stream',
        // ACL: 'public-read', // Uncomment if you want public access by default and bucket allows it
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      
      // For public access (if bucket policy allows), constructs url
      // const publicUrl = `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
      // Or use the signed url itself for temporary access
      
      // For compatibility with frontend expecting a certain structure:
      return {
        url,       // The PUT URL
        uploadUrl: url, // Alias
        publicId: key,  // S3 Key matches Cloudinary publicId concept in usage
        publicUrl: url.split('?')[0], // The base URL without signature
        key: key,
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
        // Extra fields mock for frontend compatibility if needed
        timestamp,
        folder,
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
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: dto.key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      return {
        url,
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch (error) {
       console.error('Error generating download URL:', error);
       throw new InternalServerErrorException('Could not generate download URL');
    }
  }

  async deleteFile(key: string) {
      try {
          const command = new DeleteObjectCommand({
              Bucket: this.bucketName,
              Key: key,
          });
          await this.s3Client.send(command);
          return { message: 'File deleted successfully', key };
      } catch (error) {
          console.error('Error deleting file:', error);
          throw new InternalServerErrorException('Could not delete file');
      }
  }
}
