# Disc Golf Clinics & Lessons Finder - YouTube API Version

A web application that allows users to discover, sort, and filter disc golf clinics and lessons directly from YouTube using the YouTube API.

## Features

- **Live YouTube Integration**: Fetches videos directly from YouTube using the API
- **Real-time Refresh**: Update video listings with the latest content from YouTube
- **Pagination**: Load more videos beyond the initial set with "Load More" functionality
- **Advanced Filtering**: Filter videos by:
  - Channel
  - Duration (short videos, under 5 min, 5-10 min, 10-20 min, over 20 min)
  - Video type (regular videos or shorts)
  - Search by title or channel name
- **Sorting Options**: Sort videos by:
  - Views (most to least popular)
  - Duration (shortest to longest or vice versa)
  - Title (alphabetically)
  - Channel (alphabetically)
- **Video Playback**: Watch videos directly within the application
- **Responsive Design**: Works on both desktop and mobile devices

## Technical Details

- Built with React and TypeScript
- Uses Tailwind CSS for styling
- Integrates with YouTube Data API v3
- Implements pagination for loading additional videos
- Handles API rate limits and quotas appropriately

## YouTube API Integration

The application uses the YouTube Data API v3 to:
1. Search for disc golf clinic videos
2. Fetch video details (duration, view count)
3. Generate thumbnails and embed videos

## Usage

1. Browse the video grid to discover disc golf tutorials
2. Use the "Refresh Videos" button to get the latest content
3. Use the sidebar filters to narrow down videos by your preferences
4. Sort videos using the dropdown menu
5. Click on any video card to open the video player
6. Click "Load More Videos" to see additional content
7. Watch the video directly in the app or click "Watch on YouTube" to open in YouTube

## Development

To run the development server:

```bash
cd disc-golf-clinics
pnpm install
pnpm run dev
```

To build for production:

```bash
pnpm run build
```

To preview the production build:

```bash
pnpm run preview
```

## API Key Configuration

The YouTube API key is configured in the `youtubeApi.ts` file. For security in a production environment, this should be moved to environment variables.
