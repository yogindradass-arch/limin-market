import { supabase } from './supabase';

export async function uploadProductImage(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Please select an image file' };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'Image must be less than 5MB' };
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
      return { url: null, error: 'Failed to upload image' };
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
