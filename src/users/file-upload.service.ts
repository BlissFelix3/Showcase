import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

export interface FileMetadata {
  originalName: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadDate: Date;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly uploadsDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsDir = path.join(
      process.cwd(),
      'uploads',
      'verification-documents',
    );
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      this.logger.log(`Created uploads directory: ${this.uploadsDir}`);
    }
  }

  async processUploadedFile(file: UploadedFile): Promise<FileMetadata> {
    try {
      this.validateFile(file);

      const fileUrl = this.generateFileUrl(file.filename);

      const metadata: FileMetadata = {
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        fileUrl,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadDate: new Date(),
      };

      this.logger.log(`File processed successfully: ${file.originalname}`);
      return metadata;
    } catch (error) {
      this.logger.error(`Error processing file ${file.originalname}:`, error);
      throw new BadRequestException(`File processing failed: ${error.message}`);
    }
  }

  private validateFile(file: UploadedFile): void {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit. Maximum allowed: 10MB`,
      );
    }

    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.`,
      );
    }
  }

  private generateFileUrl(filename: string): string {
    const baseUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    return `${baseUrl}/uploads/verification-documents/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`File deleted: ${filename}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting file ${filename}:`, error);
    }
  }

  async getFileInfo(filename: string): Promise<FileMetadata | null> {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      const fileUrl = this.generateFileUrl(filename);

      return {
        originalName: filename,
        fileName: filename,
        filePath,
        fileUrl,
        mimeType: this.getMimeType(filename),
        fileSize: stats.size,
        uploadDate: stats.birthtime,
      };
    } catch (error) {
      this.logger.error(`Error getting file info for ${filename}:`, error);
      return null;
    }
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async cleanupOrphanedFiles(): Promise<void> {
    try {
      const files = fs.readdirSync(this.uploadsDir);
      const now = new Date();
      const maxAge = 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = fs.statSync(filePath);
        const age = now.getTime() - stats.mtime.getTime();

        if (age > maxAge) {
          this.logger.log(`Potential orphaned file: ${file} (age: ${age}ms)`);
        }
      }
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }
}
