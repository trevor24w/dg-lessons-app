import React, { useState, useEffect } from 'react';
// import './App.css';
import { VideoGrid } from './VideoGrid';
import { VideoData } from './types';
import { parseCSVData } from './csvParser';

function App() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/YOUTUBE_SEARCH_RESULTS__224055434.csv');
      const csvData = await response.text();
      const parsedVideos = parseCSVData(csvData);
      setVideos(parsedVideos);
      setError(null);
    } catch (err) {
      console.error('Error loading video data:', err);
      setError('Failed to load video data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadVideos();
      setError(null);
    } catch (err) {
      console.error('Error refreshing video data:', err);
      setError('Failed to refresh video data. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Disc Golf Clinics & Lessons</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Discover the best disc golf tutorials
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  Refreshing...
                </>
              ) : (
                'Refresh Videos'
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button
              onClick={loadVideos}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-8">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Disc Golf Clinics & Lessons Finder
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
