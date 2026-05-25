import { uploadApi } from "@/lib/api/upload";
import { VIDEO_SOURCE_TYPES, VIDEO_VALIDATION } from "./constants";

// Image resize utility function
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Canvas to blob conversion failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Upload image to backend
export const uploadImageToBackend = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await uploadApi.uploadFileOrImage(formData);
  if (!res?.url) throw new Error("No image URL returned");

  return res.url;
};

// Validate image file
export const validateImageFile = (file: File): string | null => {
  if (!file.type.startsWith("image/")) {
    return "Only image files are allowed.";
  }
  
  if (file.size > 10 * 1024 * 1024) {
    return "Image must be smaller than 10MB.";
  }
  
  return null;
}; 

// Video Validation
export const validateVideoUrl = (url: string, sourceType: string): string | null => {
  if (!url || !url.trim()) {
    return "Please enter a video URL";
  }

  const source = VIDEO_SOURCE_TYPES[sourceType as keyof typeof VIDEO_SOURCE_TYPES];
  if (!source) {
    return "Invalid video source type";
  }

  if (!source.pattern.test(url)) {
    return `Invalid ${source.label} URL format. Expected format: ${source.placeholder}`;
  }

  return null;
};

export const validateVideoFile = (file: File): string | null => {
  // Check file size
  if (file.size > VIDEO_VALIDATION.MAX_FILE_SIZE) {
    const sizeMB = (VIDEO_VALIDATION.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return `Video size must be less than ${sizeMB}MB`;
  }

  // Check file type
  if (!VIDEO_VALIDATION.ALLOWED_TYPES.includes(file.type as any)) {
    return `Only ${VIDEO_VALIDATION.ALLOWED_EXTENSIONS.join(", ")} video formats are allowed`;
  }

  // Additional check for file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = VIDEO_VALIDATION.ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return `Only ${VIDEO_VALIDATION.ALLOWED_EXTENSIONS.join(", ")} video formats are allowed`;
  }

  return null;
};


export const uploadVideoToBackend = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await uploadApi.uploadFileOrImage(formData);

  if (!res?.url) { 
    throw new Error("No video URL returned");
  }

  return res.url;
};


export const extractVideoId = (url: string, sourceType: string): string | null => {
  switch (sourceType) {
    case "youtube": {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      return match ? match[1] : null;
    }
    case "vimeo": {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : null;
    }
    case "dailymotion": {
      const match = url.match(/dailymotion\.com\/video\/([\w-]+)/);
      return match ? match[1] : null;
    }
    case "twitch": {
      const match = url.match(/twitch\.tv\/videos\/(\d+)/);
      return match ? match[1] : null;
    }
    default:
      return null;
  }
};

export const getVideoEmbedUrl = (url: string, sourceType: string): string => {
  const videoId = extractVideoId(url, sourceType);
  
  if (!videoId) return url;

  switch (sourceType) {
    case "youtube":
      return `https://www.youtube.com/embed/${videoId}`;
    case "vimeo":
      return `https://player.vimeo.com/video/${videoId}`;
    case "dailymotion":
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    default:
      return url;
  }
};