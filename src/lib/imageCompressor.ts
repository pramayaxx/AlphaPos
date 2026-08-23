export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  mimeType?: string; // 'image/png' | 'image/jpeg' | 'image/webp'
}

export interface CompressionResult {
  dataUrl: string;
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
  savedBytes: number;
  savedPercentage: number;
  width: number;
  height: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Automatically compress an image for fast receipt loading and minimal payload.
 * Keeps aspect ratio, scales to max bounding box, applies canvas smoothing,
 * and encodes to lightweight base64 data URL.
 */
export async function compressImage(
  fileOrBlob: File | Blob,
  options: CompressOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.85,
  } = options;

  const originalSize = fileOrBlob.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file.'));

    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        return reject(new Error('Empty image file content.'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Canvas element for downscaling and compression
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get 2D canvas context.'));
        }

        // Apply high-quality bicubic downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Detect if original has transparency or is PNG
        const isPng = fileOrBlob.type === 'image/png' || src.startsWith('data:image/png');
        const outputMime = options.mimeType || (isPng ? 'image/png' : 'image/jpeg');

        // If converting to JPEG, fill white background for clean receipt rendering
        if (outputMime === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(outputMime, quality);

        // Approximate compressed byte size from base64 string
        const head = `data:${outputMime};base64,`;
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSize = Math.round((base64Length * 3) / 4);

        const savedBytes = Math.max(0, originalSize - compressedSize);
        const savedPercentage = originalSize > 0
          ? Math.round((savedBytes / originalSize) * 100)
          : 0;

        resolve({
          dataUrl,
          originalSize,
          compressedSize,
          savedBytes,
          savedPercentage,
          width,
          height,
        });
      };

      img.src = src;
    };

    reader.readAsDataURL(fileOrBlob);
  });
}
