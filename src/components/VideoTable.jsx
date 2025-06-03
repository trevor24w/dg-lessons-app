import React, { useState, useMemo } from 'react';

// Helper to parse topic from title
function parseTopic(title = '') {
  const topics = ['Putting', 'Forehand', 'Backhand', 'Distance', 'Approach', 'Grip', 'Roller', 'Overhand', 'Hyzer', 'Anhyzer', 'Sidearm', 'Upshot', 'Drive', 'Form', 'Routine', 'Mindset', 'Biomechanics', 'Freestyle'];
  const found = topics.find(t => title.toLowerCase().includes(t.toLowerCase()));
  return found || 'General';
}

// Helper to parse coach from channel or title
function parseCoach(row) {
  // Prefer Channel, fallback to first name in Title
  if (row.Channel && row.Channel.trim()) return row.Channel;
  const match = row.Title && row.Title.match(/by ([^,\-\|]+)/i);
  if (match) return match[1].trim();
  return 'Unknown';
}

// Helper to convert duration string to seconds
function durationToSeconds(duration) {
  if (!duration) return 0;
  if (duration === 'SHORTS') return 60;
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

const columns = [
  { key: 'Title', label: 'Title' },
  { key: 'Channel', label: 'Channel' },
  { key: 'Duration', label: 'Duration' },
  { key: 'Views', label: 'Views' },
  { key: 'Topic', label: 'Topic' },
  { key: 'Coach', label: 'Coach' },
];

export default function VideoTable({ videos }) {
  const [sortKey, setSortKey] = useState('Title');
  const [sortDir, setSortDir] = useState('asc');

  // Enhance data with Topic and Coach
  const enhancedVideos = useMemo(() =>
    videos.map(row => ({
      ...row,
      Topic: parseTopic(row.Title),
      Coach: parseCoach(row),
      _DurationSec: durationToSeconds(row.Duration),
    })), [videos]
  );

  // Sorting logic
  const sortedVideos = useMemo(() => {
    const sorted = [...enhancedVideos];
    sorted.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === 'Duration') {
        aVal = a._DurationSec;
        bVal = b._DurationSec;
      }
      if (sortKey === 'Views') {
        // Remove non-numeric chars
        const parseViews = v => parseInt((v||'').replace(/[^\d]/g, '')) || 0;
        aVal = parseViews(a.Views);
        bVal = parseViews(b.Views);
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [enhancedVideos, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  if (!videos.length) return <p style={{ textAlign: 'center', marginTop: 32 }}>No lessons found.</p>;

  return (
    <div className="video-table-container">
      <table className="video-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={sortKey === col.key ? 'sorted' : ''}
                style={{ cursor: 'pointer' }}
              >
                {col.label}
                {sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedVideos.map((row, i) => (
            <tr key={i}>
              <td>{row.Title}</td>
              <td>{row.Channel}</td>
              <td>{row.Duration}</td>
              <td>{row.Views}</td>
              <td>{row.Topic}</td>
              <td>{row.Coach}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 