import { VideoData, FilterOptions } from './types';
import { filterVideos as originalFilterVideos } from './utils';

// Enhanced filter function that includes topic filtering
export function filterVideos(videos: VideoData[], filters: FilterOptions) {
  return originalFilterVideos(videos, filters).filter(video => {
    // Topic filter
    if (filters.topics && filters.topics.length > 0) {
      // Defensive: ensure video.topics is always an array
      if (!Array.isArray(video.topics) || !video.topics.some(topic => filters.topics.includes(topic))) {
        return false;
      }
    }
    return true;
  });
}

// Parse CSV data into VideoData array with topics
export function parseCSVWithTopics(csvData: string): VideoData[] {
  // Split the CSV into lines
  const lines = csvData.trim().split('\n');
  
  // Skip the header row
  const dataRows = lines.slice(1);
  
  return dataRows.map(row => {
    // Split by comma, but handle commas within quotes
    const columns = row.split(',');
    
    // Basic parsing for simple CSV
    const title = columns[0];
    const channel = columns[1];
    const duration = columns[2];
    const views = columns[3];
    
    // Parse duration and views into numeric values for sorting
    const durationSeconds = parseDuration(duration);
    const viewCount = parseViews(views);
    
    // Determine if this is a short video
    const isShort = duration === 'SHORTS';
    
    // Generate video ID and thumbnail URL
    const id = generateVideoId(title, channel);
    const thumbnailUrl = generateThumbnailUrl(id);
    
    // Assign topics based on title keywords
    const topics = assignTopics(title);
    
    return {
      id,
      title,
      channel,
      duration,
      views,
      durationSeconds,
      viewCount,
      isShort,
      thumbnailUrl,
      topics
    };
  });
}

// Function to assign topics based on keywords in title
function assignTopics(title: string): string[] {
  const titleLower = title.toLowerCase();
  const assignedTopics: string[] = [];
  
  // Define topic categories based on disc golf techniques and shots
  const DISC_GOLF_TOPICS: Record<string, string[]> = {
    'putting': ['putt', 'putting', 'putter', 'confidence', 'straddle', 'turbo'],
    'driving': ['drive', 'driving', 'distance', 'power', 'long', 'max', 'distance'],
    'forehand': ['forehand', 'sidearm', 'flick'],
    'backhand': ['backhand', 'form', 'technique', 'throw', 'throwing'],
    'approach': ['approach', 'upshot', 'shot', 'shots'],
    'grip': ['grip', 'hand', 'finger', 'hold'],
    'beginner': ['beginner', 'basic', 'basics', 'start', 'first'],
    'advanced': ['advanced', 'pro', 'professional', 'expert', 'training', 'camp'],
    'angle': ['angle', 'angles', 'anhyzer', 'hyzer', 'flat', 'control'],
    'specialty': ['roller', 'overhead', 'thumber', 'tomahawk', '360'],
    'mindset': ['mindset', 'mental', 'confidence', 'strategy', 'game'],
    'equipment': ['disc', 'discs', 'equipment', 'bag', 'gear', 'choosing']
  };
  
  for (const [topic, keywords] of Object.entries(DISC_GOLF_TOPICS)) {
    if (keywords.some(keyword => titleLower.includes(keyword))) {
      assignedTopics.push(topic);
    }
  }
  
  // If no topics assigned, use a default topic
  if (assignedTopics.length === 0) {
    assignedTopics.push('general');
  }
  
  return assignedTopics;
}

// Helper functions from utils.ts
function parseDuration(duration: string): number {
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

function parseViews(views: string): number {
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

function generateVideoId(title: string, channel: string): string {
  // This is a simplified hash function for demo purposes
  const str = title + channel;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 11);
}

function generateThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
