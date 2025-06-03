// Remove API_KEY and all direct YouTube API logic from this file.

// Fetch videos from the Netlify serverless function
import { VideoData } from './types';

export const fetchYouTubeVideos = async (query: string = 'disc golf clinic'): Promise<VideoData[]> => {
  const response = await fetch(`/.netlify/functions/youtube?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  // Transform the YouTube API response into VideoData[]
  if (!data.items) return [];
  return data.items.map((item: any) => {
    const videoId = item.id.videoId || '';
    const snippet = item.snippet;
    return {
      id: videoId,
      title: snippet.title,
      channel: snippet.channelTitle,
      duration: '', // Duration not available in search API, would need a details call
      views: '',    // Views not available in search API, would need a details call
      durationSeconds: 0,
      viewCount: 0,
      isShort: false,
      thumbnailUrl: snippet.thumbnails?.medium?.url || '',
    };
  });
};
