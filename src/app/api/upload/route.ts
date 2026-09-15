import { NextRequest } from 'next/server';
import { storageService } from '@/lib/storage';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`upload_${clientIp}`, { limit: 20, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return apiError('Upload rate limit reached. Please wait a minute before uploading more files.', 429, 'RATE_LIMITED');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as 'products' | 'custom-requests' | 'general') || 'general';

    if (!file) {
      return apiError('No file provided for upload', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await storageService.upload({
      buffer,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      folder,
    });

    return apiSuccess(result, 201);
  } catch (err: any) {
    console.error('[Upload Error]:', err);
    return apiError(err.message || 'File upload failed', 400);
  }
}
