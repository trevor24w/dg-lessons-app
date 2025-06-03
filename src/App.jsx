import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import Sidebar from './components/Sidebar';
import VideoGrid from './components/VideoGrid';

const CSV_URL = '/YOUTUBE_VIDEOS_CACHE.csv';

const DURATION_OPTIONS = [
  { label: '< 5 min', value: '<5' },
  { label: '5-10 min', value: '5-10' },
  { label: '10-20 min', value: '10-20' },
  { label: '> 20 min', value: '>20' },
];

function getDurationCategory(duration) {
  if (!duration) return null;
  const parts = duration.split(':').map(Number);
  let total = 0;
  if (parts.length === 2) total = parts[0] * 60 + parts[1];
  else if (parts.length === 3) total = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else return null;
  if (total < 300) return '<5';
  if (total < 600) return '5-10';
  if (total < 1200) return '10-20';
  return '>20';
}

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);

  useEffect(() => {
    fetch(CSV_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch CSV');
        return response.text();
      })
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });
        setVideos(parsed.data.filter(row => row.title));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Get unique channels
  const channels = useMemo(() => {
    const set = new Set();
    videos.forEach(v => v.channel && set.add(v.channel));
    return Array.from(set).sort();
  }, [videos]);

  // Filtering logic
  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      // Search
      if (search && !(
        video.title?.toLowerCase().includes(search.toLowerCase()) ||
        video.channel?.toLowerCase().includes(search.toLowerCase())
      )) return false;
      // Duration
      if (selectedDurations.length > 0) {
        const cat = getDurationCategory(video.duration);
        if (!selectedDurations.includes(cat)) return false;
      }
      // Channel
      if (selectedChannels.length > 0 && !selectedChannels.includes(video.channel)) return false;
      return true;
    });
  }, [videos, search, selectedDurations, selectedChannels]);

  // Handlers
  const handleDurationChange = (value) => {
    setSelectedDurations(durs => durs.includes(value) ? durs.filter(d => d !== value) : [...durs, value]);
  };
  const handleChannelChange = (channel) => {
    setSelectedChannels(chs => chs.includes(channel) ? chs.filter(c => c !== channel) : [...chs, channel]);
  };

  return (
    <div className="app-layout">
      <Sidebar
        search={search}
        onSearch={setSearch}
        durations={DURATION_OPTIONS}
        selectedDurations={selectedDurations}
        onDurationChange={handleDurationChange}
        channels={channels}
        selectedChannels={selectedChannels}
        onChannelChange={handleChannelChange}
      />
      <main className="main-content">
        <h1>Disc Golf Clinics & Lessons</h1>
        <p className="subtitle">Discover the best disc golf tutorials on YouTube</p>
        {loading && <p>Loading lessons...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && <VideoGrid videos={filteredVideos} />}
      </main>
    </div>
  );
} 