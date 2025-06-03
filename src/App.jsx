import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import VideoTable from './components/VideoTable';

const CSV_URL = '/YOUTUBE_SEARCH_RESULTS__224055434.csv';

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(CSV_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch CSV');
        return response.text();
      })
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });
        setVideos(parsed.data.filter(row => row.Title)); // filter out empty rows
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <h1>Disc Golf Lessons & Clinics Finder</h1>
      {loading && <p>Loading lessons...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && <VideoTable videos={videos} />}
    </div>
  );
} 