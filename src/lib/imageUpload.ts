import { supabase } from './supabase';

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export async function uploadProductImage(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: `File "${file.name}" is not an image. Please select a JPG, PNG, or other image file.` };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const actualSize = formatFileSize(file.size);
      return { url: null, error: `Image "${file.name}" is ${actualSize}. Maximum size is 5 MB. Please compress or choose a smaller image.` };
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: null, error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err) {
    console.error('Image upload error:', err);
    return { url: null, error: 'An unexpected error occurred' };
  }
}
