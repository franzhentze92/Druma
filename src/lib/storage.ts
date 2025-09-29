import { supabase } from './supabase';

// Storage bucket names
export const STORAGE_BUCKETS = {
  SHELTER_IMAGES: 'shelter-images',
  SHELTER_VIDEOS: 'shelter-videos',
} as const;

// File type validation
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGES: 5 * 1024 * 1024, // 5MB
  VIDEOS: 50 * 1024 * 1024, // 50MB
} as const;

// Storage utility functions
export const storage = {
  // Upload shelter image
  async uploadShelterImage(
    shelterId: string,
    file: File,
    fileName?: string
  ): Promise<{ path: string; url: string } | null> {
    try {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      }

      // Validate file size
      if (file.size > FILE_SIZE_LIMITS.IMAGES) {
        throw new Error('File too large. Maximum size is 5MB.');
      }

      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileNameWithoutExt = fileName || file.name.split('.')[0];
      const sanitizedFileName = fileNameWithoutExt
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const filePath = `${shelterId}/${sanitizedFileName}.${fileExt}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.SHELTER_IMAGES)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.SHELTER_IMAGES)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error uploading shelter image:', error);
      return null;
    }
  },

  // Upload shelter video
  async uploadShelterVideo(
    shelterId: string,
    file: File,
    fileName?: string
  ): Promise<{ path: string; url: string } | null> {
    try {
      // Validate file type
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Only MP4, WebM, OGG, and QuickTime are allowed.');
      }

      // Validate file size
      if (file.size > FILE_SIZE_LIMITS.VIDEOS) {
        throw new Error('File too large. Maximum size is 50MB.');
      }

      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileNameWithoutExt = fileName || file.name.split('.')[0];
      const sanitizedFileName = fileNameWithoutExt
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const filePath = `${shelterId}/${sanitizedFileName}.${fileExt}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.SHELTER_VIDEOS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.SHELTER_VIDEOS)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error uploading shelter video:', error);
      return null;
    }
  },

  // Delete shelter image
  async deleteShelterImage(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.SHELTER_IMAGES)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting shelter image:', error);
      return false;
    }
  },

  // Delete shelter video
  async deleteShelterVideo(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.SHELTER_VIDEOS)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting shelter video:', error);
      return false;
    }
  },

  // Get public URL for shelter image
  getShelterImageUrl(filePath: string | undefined): string {
    if (!filePath) {
      return '/placeholder.svg'; // Return placeholder if no file path
    }
    
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.SHELTER_IMAGES)
      .getPublicUrl(filePath);
    
    return data?.publicUrl || '/placeholder.svg';
  },

  // Get public URL for shelter video
  getShelterVideoUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.SHELTER_VIDEOS)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  },

  // List files in shelter folder
  async listShelterFiles(shelterId: string, bucket: keyof typeof STORAGE_BUCKETS) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS[bucket])
        .list(shelterId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error listing files in ${bucket}:`, error);
      return [];
    }
  }
};

// File validation helpers
export const fileValidation = {
  // Check if file is an allowed image type
  isValidImageType(file: File): boolean {
    return ALLOWED_IMAGE_TYPES.includes(file.type);
  },

  // Check if file is an allowed video type
  isValidVideoType(file: File): boolean {
    return ALLOWED_VIDEO_TYPES.includes(file.type);
  },

  // Check if file size is within limits
  isValidFileSize(file: File, type: 'image' | 'video'): boolean {
    const limit = type === 'image' ? FILE_SIZE_LIMITS.IMAGES : FILE_SIZE_LIMITS.VIDEOS;
    return file.size <= limit;
  },

  // Get human-readable file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file extension from filename
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
};
