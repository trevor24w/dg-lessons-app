import React from 'react';
import { useState, useEffect } from 'react';
import { VideoData, FilterOptions, SortOption, SortDirection } from './types';
import { VideoCard } from './VideoCard';
import { FilterSidebar } from './FilterSidebar';
import { VideoModal } from './VideoModal';
import { filterVideos } from './topicUtils';
import { sortVideos } from './utils';
import { fetchMoreYouTubeVideos } from './youtubeApi';

interface VideoGridProps {
  videos: VideoData[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    channel: [],
    isShort: null,
    minDuration: null,
    maxDuration: null,
    topics: [] // Initialize empty topics filter
  });
  const [sortBy, setSortBy] = useState<SortOption>('views');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>(videos);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [allVideos, setAllVideos] = useState<VideoData[]>(videos);

  useEffect(() => {
    // Apply filters and sorting
    let result = filterVideos(allVideos, filters);
    result = sortVideos(result, sortBy, sortDirection);
    setFilteredVideos(result);
  }, [allVideos, filters, sortBy, sortDirection]);

  useEffect(() => {
    setAllVideos(videos);
  }, [videos]);

  const handleVideoClick = (video: VideoData) => {
    setSelectedVideo(video);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  const loadMoreVideos = async () => {
    if (!nextPageToken || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const { videos: moreVideos, nextPageToken: newToken } = await fetchMoreYouTubeVideos(nextPageToken);
      
      setAllVideos(prev => [...prev, ...moreVideos]);
      setNextPageToken(newToken);
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64">
        <FilterSidebar
          videos={allVideos}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
        />
      </div>
      
      <div className="flex-1">
        <div className="mb-4">
          <h2 className="text-xl font-bold">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'Video' : 'Videos'} Found
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={handleVideoClick}
            />
          ))}
        </div>
        
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No videos match your filters</p>
            <button
              onClick={() => setFilters({
                search: '',
                channel: [],
                isShort: null,
                minDuration: null,
                maxDuration: null,
                topics: []
              })}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {nextPageToken && filteredVideos.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMoreVideos}
              disabled={loadingMore}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  Loading More...
                </span>
              ) : (
                'Load More Videos'
              )}
            </button>
          </div>
        )}
      </div>
      
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={closeModal} />
      )}
    </div>
  );
}
