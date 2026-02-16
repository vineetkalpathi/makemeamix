/**
 * Utility functions for YouTube URL handling
 */

export interface YouTubeUrlInfo {
  videoId: string;
  isValid: boolean;
  startTime?: number;
  endTime?: number;
}

/**
 * Extracts video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null;

  // Remove any whitespace
  url = url.trim();

  // Handle different YouTube URL formats
  const patterns = [
    // Standard watch URLs
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    // Short URLs
    /youtu\.be\/([^&\n?#]+)/,
    // Embed URLs
    /youtube\.com\/embed\/([^&\n?#]+)/,
    // Mobile URLs
    /youtube\.com\/v\/([^&\n?#]+)/,
    // Just the video ID (11 characters)
    /^[a-zA-Z0-9_-]{11}$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extracts start and end time parameters from YouTube URL
 */
export function extractTimeParams(url: string): { startTime?: number; endTime?: number } {
  // Return empty object if URL is empty or invalid
  if (!url || url.trim().length === 0) {
    return {};
  }

  try {
    const urlObj = new URL(url);
    const startTime = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');
    const endTime = urlObj.searchParams.get('end');

    return {
      startTime: startTime ? parseTimeParameter(startTime) : undefined,
      endTime: endTime ? parseFloat(endTime) : undefined
    };
  } catch {
    // If URL is invalid (e.g., user is still typing), return empty object
    // This prevents runtime errors when users are typing the URL
    return {};
  }
}

/**
 * Parses time parameter (supports both seconds and mm:ss format)
 */
function parseTimeParameter(timeParam: string): number {
  // If it's just a number, treat as seconds
  if (/^\d+$/.test(timeParam)) {
    return parseInt(timeParam, 10);
  }

  // If it contains 'm' or 's', parse as mm:ss format
  if (timeParam.includes('m') || timeParam.includes('s')) {
    const parts = timeParam.match(/(\d+)m(\d+)s/);
    if (parts) {
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2], 10);
      return minutes * 60 + seconds;
    }
  }

  // Try to parse as mm:ss format
  const timeParts = timeParam.split(':');
  if (timeParts.length === 2) {
    const minutes = parseInt(timeParts[0], 10);
    const seconds = parseInt(timeParts[1], 10);
    return minutes * 60 + seconds;
  }

  // Fallback to parsing as seconds
  return parseFloat(timeParam) || 0;
}

/**
 * Validates if a string is a valid YouTube URL
 */
export function validateYouTubeUrl(url: string): boolean {
  if (!url || url.length < 10) return false;
  
  const videoId = extractVideoId(url);
  return videoId !== null && videoId.length === 11;
}

/**
 * Checks if a URL looks like it could be a YouTube URL (for typing validation)
 */
export function isPotentialYouTubeUrl(url: string): boolean {
  if (!url) return true; // Allow empty input
  
  // Allow partial URLs that could become valid YouTube URLs
  const youtubePatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/,
    /^https?:\/\/youtu\.be\//,
    /^https?:\/\/(www\.)?youtube\.com\/embed\//,
    /^https?:\/\/(www\.)?youtube\.com\/v\//,
    /^youtube\.com\/watch\?v=/,
    /^youtu\.be\//,
    /^www\.youtube\.com\/watch\?v=/,
    /^[a-zA-Z0-9_-]{0,11}$/ // Allow partial video IDs
  ];
  
  return youtubePatterns.some(pattern => pattern.test(url)) || url.length < 20;
}

/**
 * Parses a YouTube URL and returns comprehensive information
 */
export function parseYouTubeUrl(url: string): YouTubeUrlInfo {
  const videoId = extractVideoId(url);
  const timeParams = extractTimeParams(url);

  return {
    videoId: videoId || '',
    isValid: videoId !== null,
    startTime: timeParams.startTime,
    endTime: timeParams.endTime
  };
}

/**
 * Generates a YouTube embed URL with custom parameters
 */
export function generateEmbedUrl(
  videoId: string, 
  options: {
    startTime?: number;
    endTime?: number;
    autoplay?: boolean;
    controls?: boolean;
    modestbranding?: boolean;
  } = {}
): string {
  const params = new URLSearchParams();
  
  if (options.startTime) {
    params.set('start', options.startTime.toString());
  }
  
  if (options.endTime) {
    params.set('end', options.endTime.toString());
  }
  
  if (options.autoplay) {
    params.set('autoplay', '1');
  }
  
  if (options.controls === false) {
    params.set('controls', '0');
  }
  
  if (options.modestbranding) {
    params.set('modestbranding', '1');
  }

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? '?' + queryString : ''}`;
}
