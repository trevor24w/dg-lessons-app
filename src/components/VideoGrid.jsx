import React from 'react';
import VideoCard from './VideoCard';

export default function VideoGrid({ videos }) {
  return (
    <section className="video-grid-section">
      <div className="videos-found-label">{videos.length} Videos Found</div>
      {videos.length === 0 ? (
        <div className="no-videos">No videos match your filters.</div>
      ) : (
        <div className="video-grid">
          {videos.map((video, i) => (
            <VideoCard key={i} video={video} />
          ))}
        </div>
      )}
    </section>
  );
} 