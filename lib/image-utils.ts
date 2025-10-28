/**
 * Get the correct image URL for profile pictures
 * Handles various image path formats and provides a fallback
 */
export function getProfileImageUrl(imagePath: string | null | undefined): string {
  const defaultAvatar = '/profile-images/default-avatar.svg';
  
  // If no image or empty string, return default
  if (!imagePath || imagePath.trim().length === 0) {
    return defaultAvatar;
  }
  
  const trimmedPath = imagePath.trim();
  
  // If it's already a full URL (http/https), return as is
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }
  
  // If it starts with /, it's already a correct path
  if (trimmedPath.startsWith('/')) {
    return trimmedPath;
  }
  
  // Otherwise, prepend / to make it a valid path
  return `/${trimmedPath}`;
}

/**
 * Check if an image path is valid (not empty or default)
 */
export function hasValidImage(imagePath: string | null | undefined): boolean {
  if (!imagePath || imagePath.trim().length === 0) {
    return false;
  }
  
  const defaultAvatar = '/profile-images/default-avatar.svg';
  return imagePath.trim() !== defaultAvatar && imagePath.trim().length > 3;
}
