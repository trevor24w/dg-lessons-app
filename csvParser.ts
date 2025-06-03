import { VideoData } from './types';
import { parseDuration, parseViews, generateVideoId, generateThumbnailUrl } from './utils';

// Function to parse CSV data into VideoData array
export function parseCSVData(csvData: string): VideoData[] {
  // Split the CSV into lines
  const lines = csvData.trim().split('\n');
  
  // Skip the header row
  const dataRows = lines.slice(1);
  
  return dataRows.map(row => {
    // Split by comma, but handle commas within quotes
    const columns = row.split(',');
    
    // Basic parsing for simple CSV
    // In a real app, you'd want a more robust CSV parser
    const title = columns[0];
    const channel = columns[1];
    const duration = columns[2];
    const views = columns[3];
    
    // Generate a video ID based on title and channel
    const id = generateVideoId(title, channel);
    
    // Parse duration and views into numeric values for sorting
    const durationSeconds = parseDuration(duration);
    const viewCount = parseViews(views);
    
    // Determine if this is a short video
    const isShort = duration === 'SHORTS';
    
    // Generate thumbnail URL
    const thumbnailUrl = generateThumbnailUrl(id);
    
    return {
      id,
      title,
      channel,
      duration,
      views,
      durationSeconds,
      viewCount,
      isShort,
      thumbnailUrl
    };
  });
}
