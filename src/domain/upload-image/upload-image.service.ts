import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class UploadImageService {
  async upload(
    file: MulterFile,
    folder: string = 'general',
  ): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(new BadRequestException(error.message));
          if (!result) return reject(new BadRequestException('Upload falhou.'));
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  // upload-image/upload-image.service.ts
  async uploadFromUrl(url: string, folder: string) {
    const result = await cloudinary.uploader.upload(url, {
      folder,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}