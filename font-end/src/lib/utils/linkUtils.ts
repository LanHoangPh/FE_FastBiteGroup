/**
 * Utility functions for URL detection and link preview functionality
 */

/**
 * Regular expression to detect URLs in text
 * Supports http, https, and common domain patterns
 */
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi;

/**
 * More strict URL regex for validation
 */
const STRICT_URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

/**
 * Extract URLs from a text string
 * @param text - The text to search for URLs
 * @returns Array of detected URLs
 */
export function extractUrls(text: string): string[] {
  if (!text) return [];
  
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  
  // Normalize URLs (add https:// if missing)
  return matches.map(url => {
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    } else if (trimmed.startsWith('www.')) {
      return `https://${trimmed}`;
    } else {
      // For domain-only matches, add https://
      return `https://${trimmed}`;
    }
  }).filter(url => isValidUrl(url));
}

/**
 * Check if a string is a valid URL
 * @param url - The URL to validate
 * @returns True if the URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return STRICT_URL_REGEX.test(url);
  } catch {
    return false;
  }
}

/**
 * Get the domain from a URL
 * @param url - The URL to extract domain from
 * @returns The domain or null if invalid
 */
export function getDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if a URL is a video link (YouTube, Vimeo, etc.)
 * @param url - The URL to check
 * @returns True if it's a video URL
 */
export function isVideoUrl(url: string): boolean {
  const domain = getDomain(url);
  if (!domain) return false;
  
  const videoDomains = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv',
    'tiktok.com'
  ];
  
  return videoDomains.some(videoDomain => 
    domain === videoDomain || domain.endsWith(`.${videoDomain}`)
  );
}

/**
 * Check if a URL is an image link
 * @param url - The URL to check
 * @returns True if it's an image URL
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Get YouTube video ID from URL
 * @param url - YouTube URL
 * @returns Video ID or null
 */
export function getYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Get URL positions in text for rendering
 * @param text - The text containing URLs
 * @returns Array of URL positions and text parts
 */
export function getUrlPositions(text: string): Array<{ type: 'text' | 'url', content: string, start: number, end: number }> {
  if (!text) return [{ type: 'text', content: text, start: 0, end: text.length }];
  
  const urls = extractUrls(text);
  if (urls.length === 0) return [{ type: 'text', content: text, start: 0, end: text.length }];
  
  const parts: Array<{ type: 'text' | 'url', content: string, start: number, end: number }> = [];
  let lastIndex = 0;
  
  urls.forEach((url) => {
    const urlIndex = text.indexOf(url, lastIndex);
    
    // Add text before URL
    if (urlIndex > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, urlIndex),
        start: lastIndex,
        end: urlIndex
      });
    }
    
    // Add URL
    parts.push({
      type: 'url',
      content: url,
      start: urlIndex,
      end: urlIndex + url.length
    });
    
    lastIndex = urlIndex + url.length;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
      start: lastIndex,
      end: text.length
    });
  }
  
  return parts;
}
