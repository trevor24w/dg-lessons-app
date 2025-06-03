import React, { useState } from 'react';
import { FilterOptions, VideoData } from './types';
import { extractChannels } from './utils';

interface FilterSidebarProps {
  videos: VideoData[];
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
}

export function FilterSidebar({
  videos,
  filters,
  setFilters
}: FilterSidebarProps) {
  const channels = extractChannels(videos);
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleChannelToggle = (channel: string) => {
    setFilters(prev => {
      const updatedChannels = prev.channel.includes(channel)
        ? prev.channel.filter(c => c !== channel)
        : [...prev.channel, channel];
      return { ...prev, channel: updatedChannels };
    });
  };

  const handleShortToggle = (value: boolean | null) => {
    setFilters(prev => ({ ...prev, isShort: value }));
  };

  const handleDurationChange = (min: number | null, max: number | null) => {
    setFilters(prev => ({
      ...prev,
      minDuration: min,
      maxDuration: max
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      channel: [],
      isShort: null,
      minDuration: null,
      maxDuration: null
    });
    setSearchInput('');
  };

  return (
    <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Filters</h2>
      
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full p-2 pr-10 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 text-gray-500 dark:text-gray-400"
          >
            🔍
          </button>
        </div>
      </form>
      
      {/* Video Type */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Video Type</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded-full text-sm ${filters.isShort === null ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => handleShortToggle(null)}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filters.isShort === false ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => handleShortToggle(false)}
          >
            Full Videos
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filters.isShort === true ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => handleShortToggle(true)}
          >
            Shorts
          </button>
        </div>
      </div>
      
      {/* Duration */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Duration</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded-full text-sm ${filters.minDuration === null && filters.maxDuration === null ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => handleDurationChange(null, null)}
          >
            Any
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filters.maxDuration === 300 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => handleDurationChange(0, 300)}
          >
            &lt; 5 min
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filters.minDuration === 300 && filters.maxDuration === 600 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => handleDurationChange(300, 600)}
          >
            5-10 min
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filters.minDuration === 600 && filters.maxDuration === 1200 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => handleDurationChange(600, 1200)}
          >
            10-20 min
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${filters.minDuration === 1200 ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
            onClick={() => handleDurationChange(1200, null)}
          >
            &gt; 20 min
          </button>
        </div>
      </div>
      
      {/* Channels */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Channels</h3>
        <div className="max-h-60 overflow-y-auto">
          {channels.map(channel => (
            <div key={channel} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`channel-${channel}`}
                checked={filters.channel.includes(channel)}
                onChange={() => handleChannelToggle(channel)}
                className="mr-2"
              />
              <label htmlFor={`channel-${channel}`} className="text-sm truncate">
                {channel}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}
