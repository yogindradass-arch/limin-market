import { supabase } from './supabase';
import imageCompression from 'browser-image-compression';

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export interface ImageVariants {
  original: string;
  full: string;
  medium: string;
  thumb: string;
}

interface UploadResult {
  variants: ImageVariants | null;
  error: string | null;
}

interface UploadProgress {
  stage: 'validating' | 'compressing' | 'uploading' | 'complete';
  variant?: 'thumb' | 'medium' | 'full' | 'original';
  progress: number;
}

/**
 * Uploads a product image and generates optimized variants
 * @param file - The original image file
 * @param onProgress - Optional callback for upload progress
 * @returns Object containing image variant URLs or error
 */
export async function uploadProductImage(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file type
    onProgress?.({ stage: 'validating', progress: 0 });

    if (!file.type.startsWith('image/')) {
      return {
        variants: null,
        error: `File "${file.name}" is not an image. Please select a JPG, PNG, or other image file.`
      };
    }

    // Validate file size (max 5MB for original)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const actualSize = formatFileSize(file.size);
      return {
        variants: null,
        error: `Image "${file.name}" is ${actualSize}. Maximum size is 5 MB. Please compress or choose a smaller image.`
      };
    }

    // Generate unique base filename
    const baseFileName = `${Math.random().toString(36).substring(2)}-${Date.now()}`;
    const variants: Partial<ImageVariants> = {};

    // Compression options for different variants
    const variantConfigs = [
      { name: 'thumb' as const, maxWidth: 300, maxHeight: 300, quality: 0.8 },
      { name: 'medium' as const, maxWidth: 800, maxHeight: 600, quality: 0.85 },
      { name: 'full' as const, maxWidth: 1200, maxHeight: 900, quality: 0.9 },
    ];

    // Generate and upload compressed variants
    for (let i = 0; i < variantConfigs.length; i++) {
      const config = variantConfigs[i];
      onProgress?.({
        stage: 'compressing',
        variant: config.name,
        progress: (i / (variantConfigs.length + 1)) * 100
      });

      try {
        // Compress image
        const compressedFile = await imageCompression(file, {
          maxWidthOrHeight: Math.max(config.maxWidth, config.maxHeight),
          maxSizeMB: 1,
          useWebWorker: true,
          initialQuality: config.quality,
        });

        // Upload variant
        onProgress?.({
          stage: 'uploading',
          variant: config.name,
          progress: ((i + 0.5) / (variantConfigs.length + 1)) * 100
        });

        const variantPath = `${baseFileName}-${config.name}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(variantPath, compressedFile, {
            cacheControl: '31536000', // 1 year
            upsert: false,
          });

        if (uploadError) {
          console.error(`Upload error for ${config.name}:`, uploadError);
          throw new Error(`Failed to upload ${config.name} variant: ${uploadError.message}`);
        }

        // Get public URL
        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(variantPath);

        variants[config.name] = data.publicUrl;
      } catch (err) {
        console.error(`Error processing ${config.name} variant:`, err);
        throw err;
      }
    }

    // Upload original (with light compression to ensure it's under 5MB)
    onProgress?.({
      stage: 'uploading',
      variant: 'original',
      progress: 90
    });

    const originalCompressed = await imageCompression(file, {
      maxSizeMB: 4,
      useWebWorker: true,
      initialQuality: 0.95,
    });

    const originalPath = `${baseFileName}-original.jpg`;
    const { error: originalUploadError } = await supabase.storage
      .from('product-images')
      .upload(originalPath, originalCompressed, {
        cacheControl: '31536000',
        upsert: false,
      });

    if (originalUploadError) {
      throw new Error(`Failed to upload original: ${originalUploadError.message}`);
    }

    const { data: originalData } = supabase.storage
      .from('product-images')
      .getPublicUrl(originalPath);

    variants.original = originalData.publicUrl;

    onProgress?.({ stage: 'complete', progress: 100 });

    // Ensure all variants exist
    if (!variants.thumb || !variants.medium || !variants.full || !variants.original) {
      throw new Error('Failed to generate all image variants');
    }

    return {
      variants: variants as ImageVariants,
      error: null
    };
  } catch (err) {
    console.error('Image upload error:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { variants: null, error: errorMessage };
  }
}

/**
 * Legacy function for backward compatibility - uses medium variant as primary URL
 * @deprecated Use uploadProductImage instead for full variant support
 */
export async function uploadProductImageLegacy(file: File): Promise<{ url: string | null; error: string | null }> {
  const result = await uploadProductImage(file);
  return {
    url: result.variants?.medium || null,
    error: result.error,
  };
}
