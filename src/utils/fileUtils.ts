import { supabase } from '../lib/supabase';

/**
 * Generate a unique file name based on current timestamp and random string
 */
export const generateUniqueFileName = (originalName: string): string => {
  const fileExt = originalName.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomString}.${fileExt}`;
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (file: File, bucket: string = 'media'): Promise<string | null> => {
  try {
    // Create a unique file name to avoid collisions
    const fileName = generateUniqueFileName(file.name);
    const filePath = `${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFile = async (url: string, bucket: string = 'media'): Promise<boolean> => {
  try {
    // Extract file path from URL
    const baseUrl = `${supabase.supabaseUrl}/storage/v1/object/public/${bucket}/`;
    const filePath = url.replace(baseUrl, '');
    
    if (!filePath) {
      console.error('Invalid file URL');
      return false;
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};
