import React from 'react';
import { VideoData } from './types';
import { formatDuration, formatViews } from './utils';

interface VideoModalProps {
  video: VideoData | null;
  onClose: () => void;
}

export function VideoModal({ video, onClose }: VideoModalProps) {
  if (!video) return null;
  
  const videoId = video.id;
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold truncate">{video.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full"
            allowFullScreen
          ></iframe>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{video.channel}</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatViews(video.viewCount)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {video.isShort ? 'SHORT' : formatDuration(video.durationSeconds)}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <a 
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Watch on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
