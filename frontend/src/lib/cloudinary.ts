// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
}

// Cloudinary widget types (since @cloudinary/upload-widget doesn't have good types)
interface CloudinaryWidgetOptions {
  cloudName: string
  uploadPreset: string
  sources: string[]
  multiple: boolean
  maxFileSize: number
  clientAllowedFormats: string[]
  cropping: boolean
  croppingAspectRatio?: number
  croppingShowDimensions?: boolean
  showSkipCropButton?: boolean
  styles?: {
    palette?: Record<string, string>
    fonts?: Record<string, string>
  }
}

interface CloudinaryUploadResult {
  event: string
  info?: {
    secure_url: string
    public_id: string
    width: number
    height: number
    format: string
    resource_type: string
    bytes: number
  }
}

interface CloudinaryWidget {
  open: () => void
  close: () => void
  destroy: () => void
}

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: CloudinaryWidgetOptions,
        callback: (error: Error | null, result: CloudinaryUploadResult) => void
      ) => CloudinaryWidget
    }
  }
}

/**
 * Create and open the Cloudinary upload widget
 */
export function openUploadWidget(
  onSuccess: (url: string, publicId: string) => void,
  onError: (error: string) => void
): CloudinaryWidget | null {
  if (!window.cloudinary) {
    onError('Cloudinary widget not loaded. Please refresh the page.')
    return null
  }

  if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
    onError('Cloudinary configuration is missing. Please check environment variables.')
    return null
  }

  const widget = window.cloudinary.createUploadWidget(
    {
      cloudName: CLOUDINARY_CONFIG.cloudName,
      uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
      sources: ['local', 'camera', 'url'],
      multiple: false,
      maxFileSize: 10000000, // 10MB
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      cropping: false,
      styles: {
        palette: {
          window: '#FFFFFF',
          windowBorder: '#000000',
          tabIcon: '#000000',
          menuIcons: '#000000',
          textDark: '#000000',
          textLight: '#FFFFFF',
          link: '#0066FF',
          action: '#FFCC00',
          inactiveTabIcon: '#666666',
          error: '#FF3333',
          inProgress: '#0066FF',
          complete: '#00CC66',
          sourceBg: '#F5F5F5',
        },
      },
    },
    (error, result) => {
      if (error) {
        onError(error.message || 'Upload failed')
        return
      }

      if (result.event === 'success' && result.info) {
        onSuccess(result.info.secure_url, result.info.public_id)
        widget.close()
      }
    }
  )

  widget.open()
  return widget
}

/**
 * Generate a Cloudinary thumbnail URL
 */
export function getThumbnailUrl(
  url: string,
  width: number = 400,
  height: number = 300
): string {
  if (!url.includes('cloudinary.com')) {
    return url
  }

  // Insert transformation parameters before /upload/
  return url.replace(
    '/upload/',
    `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`
  )
}

/**
 * Generate a full-size optimized URL
 */
export function getOptimizedUrl(url: string): string {
  if (!url.includes('cloudinary.com')) {
    return url
  }

  return url.replace('/upload/', '/upload/q_auto,f_auto/')
}
