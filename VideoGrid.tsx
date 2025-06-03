import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { VideoData, FilterOptions, SortOption, SortDirection } from './types';
import { VideoCard } from './VideoCard';
import { FilterSidebar } from './FilterSidebar';
import { VideoModal } from './VideoModal';
import { filterVideos } from './topicUtils';
import { sortVideos } from './utils';

interface VideoGridProps {
  videos: VideoData[];
}

const VIDEOS_PER_PAGE = 24;

export function VideoGrid({ videos }: VideoGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    channel: [],
    isShort: null,
    minDuration: null,
    maxDuration: null
  });
  const [sortBy, setSortBy] = useState<SortOption>('views');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [allVideos, setAllVideos] = useState<VideoData[]>(videos);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setAllVideos(videos);
  }, [videos]);

  // Memoize filtered and sorted videos
  const filteredVideos = useMemo(() => {
    let result = filterVideos(allVideos, filters);
    result = sortVideos(result, sortBy, sortDirection);
    return result;
  }, [allVideos, filters, sortBy, sortDirection]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters/sort change
  }, [filters, sortBy, sortDirection, allVideos]);

  const handleVideoClick = (video: VideoData) => {
    setSelectedVideo(video);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * VIDEOS_PER_PAGE,
    currentPage * VIDEOS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-64">
        <FilterSidebar
          videos={allVideos}
          filters={filters}
          setFilters={setFilters}
        />
      </div>
      
      <div className="flex-1">
        {/* Sort By Options at the top */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'Video' : 'Videos'} Found
          </h2>
          <div className="flex items-center gap-2">
            <label htmlFor="sortBy" className="font-semibold">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="p-2 border rounded-md flex-grow dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="views">Views</option>
              <option value="duration">Duration</option>
              <option value="title">Title</option>
              <option value="channel">Channel</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="p-2 border rounded-md dark:border-gray-700"
              title={sortDirection === 'desc' ? 'Descending' : 'Ascending'}
            >
              {sortDirection === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedVideos.map((video) => (
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
                maxDuration: null
              })}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md disabled:opacity-50"
            >
              Previous Page
            </button>
            <span className="text-lg font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md disabled:opacity-50"
            >
              Next Page
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
