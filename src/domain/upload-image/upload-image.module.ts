import { Module } from '@nestjs/common';
import { UploadImageService } from './upload-image.service';
import { CloudinaryConfig } from '../../config/cloudinary.config';

@Module({
  providers: [CloudinaryConfig, UploadImageService],
  exports: [UploadImageService],
})
export class UploadModule {}