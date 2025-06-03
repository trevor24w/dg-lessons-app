import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { VideoData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parse duration string (e.g., "12:38") to seconds
export function parseDuration(duration: string): number {
  if (duration === "SHORTS") return 0;
  
  const parts = duration.split(":");
  if (parts.length === 2) {
    // MM:SS format
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }
  return 0;
}

// Parse view count string (e.g., "1.3M views") to number
export function parseViews(views: string): number {
  if (!views) return 0;
  
  const match = views.match(/^([\d.]+)([KMB])?/);
  if (!match) return 0;
  
  const num = parseFloat(match[1]);
  const multiplier = match[2] ? 
    (match[2] === 'K' ? 1000 : 
     match[2] === 'M' ? 1000000 : 
     match[2] === 'B' ? 1000000000 : 1) : 1;
  
  return num * multiplier;
}

// Format seconds to MM:SS or HH:MM:SS
export function formatDuration(seconds: number): string {
  if (seconds === 0) return "SHORT";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

// Format view count to human-readable format
export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  } else {
    return `${views} views`;
  }
}

// Generate YouTube video ID from title and channel (for demo purposes)
export function generateVideoId(title: string, channel: string): string {
  // This is a simplified hash function for demo purposes
  // In a real app, you would use actual YouTube video IDs
  const str = title + channel;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 11);
}

// Generate YouTube thumbnail URL from video ID
export function generateThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// Sort videos based on sort option and direction
export function sortVideos(videos: VideoData[], sortBy: string, sortDirection: string) {
  return [...videos].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'views':
        comparison = a.viewCount - b.viewCount;
        break;
      case 'duration':
        comparison = a.durationSeconds - b.durationSeconds;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'channel':
        comparison = a.channel.localeCompare(b.channel);
        break;
      default:
        comparison = a.viewCount - b.viewCount;
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });
}

// Extract unique channels from video data
export function extractChannels(videos: VideoData[]): string[] {
  const channelSet = new Set<string>();
  videos.forEach(video => channelSet.add(video.channel));
  return Array.from(channelSet).sort();
}
