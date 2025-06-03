import axios from 'axios';
import { VideoData } from './types';
import { assignTopics } from './topicUtils';


const API_KEY = 'AIzaSyBG_NxQ-tYp75_bTXZZLLNLEwp6R2RcZhE';
const SEARCH_QUERIES = [
  'disc golf lesson',
  'disc golf clinic',
  'disc golf tutorial',
  'disc golf how to'
];
const MAX_RESULTS_PER_REQUEST = 50;
const MAX_TOTAL_RESULTS = 200;

interface YouTubeSearchResult {
  id: {
    kind: string;
    videoId?: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string; // ISO 8601 format
  };
  statistics: {
    viewCount: string;
    likeCount?: string;
  };
}

// Parse ISO 8601 duration format (PT1H2M3S) to seconds
const parseIsoDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
};

// Format seconds to MM:SS or HH:MM:SS
const formatDurationFromSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

// Check if a video is a short (less than 60 seconds)
const isShortVideo = (durationSeconds: number): boolean => {
  return durationSeconds < 60;
};

// Fetch videos from YouTube API
export const fetchYouTubeVideos = async (): Promise<VideoData[]> => {
  try {
    let allVideos: VideoData[] = [];
    for (const query of SEARCH_QUERIES) {
      let nextPageToken: string | undefined = undefined;
      let fetched = 0;
      while (fetched < MAX_TOTAL_RESULTS / SEARCH_QUERIES.length) {
        const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            key: API_KEY,
            q: query,
            part: 'snippet',
            maxResults: MAX_RESULTS_PER_REQUEST,
            type: 'video',
            videoCategoryId: '17',
            videoEmbeddable: true,
            relevanceLanguage: 'en',
            order: 'viewCount',
            ...(nextPageToken ? { pageToken: nextPageToken } : {})
          }
        });
        const videoIds = searchResponse.data.items
          .filter((item: YouTubeSearchResult) => item.id.videoId)
          .map((item: YouTubeSearchResult) => item.id.videoId);
        if (videoIds.length === 0) break;
        const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            key: API_KEY,
            id: videoIds.join(','),
            part: 'contentDetails,statistics'
          }
        });
        const videos: VideoData[] = searchResponse.data.items.map((searchItem: YouTubeSearchResult) => {
          const videoId = searchItem.id.videoId || '';
          const videoDetails = videoDetailsResponse.data.items.find(
            (detailItem: YouTubeVideoDetails) => detailItem.id === videoId
          );
          if (!videoDetails) return null;
          const durationSeconds = parseIsoDuration(videoDetails.contentDetails.duration);
          const viewCount = parseInt(videoDetails.statistics.viewCount || '0');
          const likeCount = videoDetails.statistics.likeCount ? parseInt(videoDetails.statistics.likeCount) : undefined;
          const isShort = isShortVideo(durationSeconds);
          const topics = assignTopics(searchItem.snippet.title);
          return {
            id: videoId,
            title: searchItem.snippet.title,
            channel: searchItem.snippet.channelTitle,
            duration: formatDurationFromSeconds(durationSeconds),
            views: `${(viewCount / 1000).toFixed(1)}K views`,
            durationSeconds,
            viewCount,
            isShort,
            thumbnailUrl: searchItem.snippet.thumbnails.medium.url,
            likeCount,
            topics
          };
        }).filter(Boolean) as VideoData[];
        allVideos = allVideos.concat(videos);
        fetched += videos.length;
        nextPageToken = searchResponse.data.nextPageToken;
        if (!nextPageToken) break;
      }
    }
    // Remove duplicates by video id
    const uniqueVideos = Array.from(new Map(allVideos.map(v => [v.id, v])).values());
    return uniqueVideos.slice(0, MAX_TOTAL_RESULTS);
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw error;
  }
};

// Fetch more videos with pagination token
export const fetchMoreYouTubeVideos = async (pageToken: string): Promise<{ videos: VideoData[], nextPageToken: string | null }> => {
  try {
    // Step 1: Search for videos with page token
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: API_KEY,
        q: SEARCH_QUERIES[0],
        part: 'snippet',
        maxResults: MAX_RESULTS_PER_REQUEST,
        type: 'video',
        videoCategoryId: '17',
        videoEmbeddable: true,
        relevanceLanguage: 'en',
        pageToken,
        order: 'viewCount'
      }
    });
    
    const videoIds = searchResponse.data.items
      .filter((item: YouTubeSearchResult) => item.id.videoId)
      .map((item: YouTubeSearchResult) => item.id.videoId);
    
    if (videoIds.length === 0) {
      return { videos: [], nextPageToken: null };
    }
    
    // Step 2: Get video details (duration, view count, like count)
    const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        key: API_KEY,
        id: videoIds.join(','),
        part: 'contentDetails,statistics'
      }
    });
    
    // Step 3: Combine search results with video details
    const videos: VideoData[] = searchResponse.data.items.map((searchItem: YouTubeSearchResult) => {
      const videoId = searchItem.id.videoId || '';
      const videoDetails = videoDetailsResponse.data.items.find(
        (detailItem: YouTubeVideoDetails) => detailItem.id === videoId
      );
      
      if (!videoDetails) {
        return null;
      }
      
      const durationSeconds = parseIsoDuration(videoDetails.contentDetails.duration);
      const viewCount = parseInt(videoDetails.statistics.viewCount || '0');
      const likeCount = videoDetails.statistics.likeCount ? parseInt(videoDetails.statistics.likeCount) : undefined;
      const isShort = isShortVideo(durationSeconds);
      const topics = assignTopics(searchItem.snippet.title);
      
      return {
        id: videoId,
        title: searchItem.snippet.title,
        channel: searchItem.snippet.channelTitle,
        duration: formatDurationFromSeconds(durationSeconds),
        views: `${(viewCount / 1000).toFixed(1)}K views`,
        durationSeconds,
        viewCount,
        isShort,
        thumbnailUrl: searchItem.snippet.thumbnails.medium.url,
        likeCount,
        topics
      };
    }).filter(Boolean) as VideoData[];
    
    // Optionally, sort by likeCount if desired
    // videos.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    return { 
      videos, 
      nextPageToken: searchResponse.data.nextPageToken || null 
    };
  } catch (error) {
    console.error('Error fetching more YouTube videos:', error);
    throw error;
  }
};
