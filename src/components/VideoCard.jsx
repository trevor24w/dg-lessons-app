import React from 'react';

// Helper to get YouTube thumbnail from title (if possible)
function getThumbnail(title) {
  // This is a placeholder. In a real app, you would have a videoId or thumbnail URL in the data.
  // For now, use a static placeholder image.
  return 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg';
}

export default function VideoCard({ video }) {
  return (
    <div className="video-card">
      <div className="video-thumb-container">
        <img className="video-thumb" src={getThumbnail(video.Title)} alt={video.Title} />
        <span className="video-duration-badge">{video.Duration}</span>
      </div>
      <div className="video-info">
        <div className="video-title" title={video.Title}>{video.Title}</div>
        <div className="video-channel">{video.Channel}</div>
        <div className="video-views">{video.Views}</div>
      </div>
    </div>
  );
} 