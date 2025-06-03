import React, { useState, useEffect } from 'react';
import { VideoData } from './types';

interface TopicFilterProps {
  videos: VideoData[];
  selectedTopics: string[];
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>;
}

export function TopicFilter({ videos, selectedTopics, setSelectedTopics }: TopicFilterProps) {
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<boolean>(false);
  
  // Extract all unique topics and count occurrences
  useEffect(() => {
    const counts: Record<string, number> = {};
    
    videos.forEach(video => {
      if (Array.isArray(video.topics)) {
        video.topics.forEach(topic => {
          counts[topic] = (counts[topic] || 0) + 1;
        });
      }
    });
    
    setTopicCounts(counts);
  }, [videos]);
  
  // Toggle topic selection
  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };
  
  // Clear all selected topics
  const clearTopics = () => {
    setSelectedTopics([]);
  };
  
  // Sort topics by count (most popular first)
  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);
  
  // Display only top topics when not expanded
  const displayedTopics = expanded ? sortedTopics : sortedTopics.slice(0, 6);
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Topics</h3>
        {selectedTopics.length > 0 && (
          <button
            onClick={clearTopics}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            Clear
          </button>
        )}
      </div>
      <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
        {displayedTopics.map(topic => (
          <label key={topic} className="flex items-center gap-2 capitalize cursor-pointer">
            <input
              type="checkbox"
              checked={selectedTopics.includes(topic)}
              onChange={() => handleTopicToggle(topic)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>{topic} <span className="text-xs text-gray-500">({topicCounts[topic]})</span></span>
          </label>
        ))}
        {sortedTopics.length > 6 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            {expanded ? 'Show Less' : `+${sortedTopics.length - 6} More`}
          </button>
        )}
      </div>
    </div>
  );
}
