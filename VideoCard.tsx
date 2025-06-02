
import { VideoData } from '../lib/types';
import { formatDuration, formatViews } from '../lib/utils';

interface VideoCardProps {
  video: VideoData;
  onClick: (video: VideoData) => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <div 
      className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={() => onClick(video)}
    >
      <div className="relative">
        <img 
          src={video.thumbnailUrl} 
          alt={`${video.title} thumbnail`} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {video.isShort ? 'SHORT' : formatDuration(video.durationSeconds)}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{video.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{video.channel}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-auto">{formatViews(video.viewCount)}</p>
      </div>
    </div>
  );
}
