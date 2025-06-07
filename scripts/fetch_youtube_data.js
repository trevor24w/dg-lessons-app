require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');
const Papa = require('papaparse');

const API_KEY = process.env.YOUTUBE_API_KEY;
const INPUT_CSV = 'public/YOUTUBE_SEARCH_RESULTS__224055434.csv';
const OUTPUT_CSV = 'public/YOUTUBE_VIDEOS_CACHE.csv';

function extractVideoId(url) {
  const match = url.match(/[?&]v=([\w-]{11})/);
  return match ? match[1] : null;
}

async function fetchVideoData(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items || !data.items[0]) return null;
  const item = data.items[0];
  return {
    videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    duration: item.contentDetails.duration,
    views: item.statistics.viewCount,
    thumbnail: item.snippet.thumbnails.high.url,
    url: `https://www.youtube.com/watch?v=${videoId}`
  };
}

function parseISODuration(iso) {
  // Converts ISO 8601 duration to mm:ss or hh:mm:ss
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] || 0, 10);
  const m = parseInt(match[2] || 0, 10);
  const s = parseInt(match[3] || 0, 10);
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

(async () => {
  const input = fs.readFileSync(INPUT_CSV, 'utf8');
  const { data } = Papa.parse(input, { header: true });
  const results = [];
  for (const row of data) {
    const videoId = extractVideoId(row.url);
    if (!videoId) continue;
    const info = await fetchVideoData(videoId);
    if (info) {
      info.duration = parseISODuration(info.duration);
      results.push(info);
    }
  }
  const csv = Papa.unparse(results, { columns: ['videoId', 'title', 'channel', 'duration', 'views', 'thumbnail', 'url'] });
  fs.writeFileSync(OUTPUT_CSV, csv);
  console.log(`Fetched and cached ${results.length} videos to ${OUTPUT_CSV}`);
})(); 