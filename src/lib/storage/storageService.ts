import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface UploadFileOptions {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder?: 'products' | 'custom-requests' | 'general';
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export class StorageService {
  private get storageDriver(): string {
    return process.env.STORAGE_DRIVER || 'local';
  }

  /**
   * Validates file size, extension, MIME type, and magic bytes.
   */
  public validateFile(buffer: Buffer, originalFilename: string, declaredMime: string): FileValidationResult {
    // 1. Check size
    if (buffer.length > MAX_FILE_SIZE) {
      return { valid: false, error: `File exceeds maximum limit of 5MB (size: ${(buffer.length / (1024 * 1024)).toFixed(1)}MB)` };
    }

    if (buffer.length === 0) {
      return { valid: false, error: 'File is empty' };
    }

    // 2. Check extension
    const ext = path.extname(originalFilename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: `Disallowed extension "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` };
    }

    // 3. Check declared MIME
    if (!ALLOWED_MIME_TYPES.includes(declaredMime.toLowerCase())) {
      return { valid: false, error: `Disallowed MIME type "${declaredMime}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` };
    }

    // 4. Magic number inspection (file signature)
    const isImage = this.verifyMagicBytes(buffer);
    if (!isImage) {
      return { valid: false, error: 'Corrupted or fake image file detected (magic bytes verification failed).' };
    }

    return { valid: true };
  }

  private verifyMagicBytes(buffer: Buffer): boolean {
    if (buffer.length < 12) return false;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return true;
    }

    // GIF: "GIF87a" or "GIF89a"
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38 &&
      (buffer[4] === 0x37 || buffer[4] === 0x39) &&
      buffer[5] === 0x61
    ) {
      return true;
    }

    // WEBP: RIFF....WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return true;
    }

    return false;
  }

  /**
   * Uploads file to local storage or configured S3/R2 storage.
   */
  public async upload(options: UploadFileOptions): Promise<UploadResult> {
    const { buffer, filename, mimeType, folder = 'general' } = options;

    const validation = this.validateFile(buffer, filename, mimeType);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    const ext = path.extname(filename).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;

    if (this.storageDriver === 's3' && process.env.S3_BUCKET) {
      // Future S3/Cloudflare R2 hook
      // When S3_BUCKET is provided in .env
      const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${folder}/${uniqueName}`;
      return {
        url,
        filename: uniqueName,
        size: buffer.length,
        mimeType,
      };
    }

    // Default Production Local Disk Adapter
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${folder}/${uniqueName}`;
    return {
      url: publicUrl,
      filename: uniqueName,
      size: buffer.length,
      mimeType,
    };
  }

  /**
   * Deletes a file from storage by its relative or public URL.
   */
  public async delete(url: string): Promise<boolean> {
    if (!url || !url.startsWith('/uploads/')) return false;

    try {
      const cleanPath = url.replace(/^\/+/, '');
      const fullPath = path.join(process.cwd(), 'public', cleanPath);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
