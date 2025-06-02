import pandas as pd
import numpy as np
import re
import requests
from collections import Counter
import nltk
from nltk.corpus import stopwords
import json
import time

# Download necessary NLTK data
nltk.download('stopwords')

# Define topic categories based on disc golf techniques and shots
DISC_GOLF_TOPICS = {
    'putting': ['putt', 'putting', 'putter', 'confidence', 'straddle', 'turbo'],
    'driving': ['drive', 'driving', 'distance', 'power', 'long', 'max', 'distance'],
    'forehand': ['forehand', 'sidearm', 'flick'],
    'backhand': ['backhand', 'form', 'technique', 'throw', 'throwing'],
    'approach': ['approach', 'upshot', 'shot', 'shots'],
    'grip': ['grip', 'hand', 'finger', 'hold'],
    'beginner': ['beginner', 'basic', 'basics', 'start', 'first'],
    'advanced': ['advanced', 'pro', 'professional', 'expert', 'training', 'camp'],
    'angle': ['angle', 'angles', 'anhyzer', 'hyzer', 'flat', 'control'],
    'specialty': ['roller', 'overhead', 'thumber', 'tomahawk', '360'],
    'mindset': ['mindset', 'mental', 'confidence', 'strategy', 'game'],
    'equipment': ['disc', 'discs', 'equipment', 'bag', 'gear', 'choosing']
}

# API key for YouTube Data API
API_KEY = 'AIzaSyBOkDCfUBKCuSfnHiH_RZtaRNEKXJZLh-c'
SEARCH_QUERY = 'disc golf clinic'

# Preprocess titles
def preprocess_title(title):
    # Convert to lowercase
    title = title.lower()
    # Remove special characters and numbers
    title = re.sub(r'[^a-zA-Z\s]', ' ', title)
    # Simple tokenization by splitting on whitespace
    tokens = title.split()
    # Remove stopwords and disc golf related common words
    stop_words = set(stopwords.words('english'))
    disc_golf_stopwords = {'disc', 'golf', 'clinic', 'tutorial', 'tips', 'how', 'to', 'with', 'and', 'the', 'in', 'of', 'for', 'at', 'on', 'by', 'your', 'you', 'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'a', 'an', 'pt', 'part'}
    stop_words.update(disc_golf_stopwords)
    tokens = [token for token in tokens if token not in stop_words and len(token) > 2]
    return ' '.join(tokens)

# Function to assign topics based on keywords
def assign_topics(title):
    title_lower = title.lower()
    assigned_topics = []
    
    for topic, keywords in DISC_GOLF_TOPICS.items():
        if any(keyword in title_lower for keyword in keywords):
            assigned_topics.append(topic)
    
    # If no topics assigned, use a default topic
    if not assigned_topics:
        assigned_topics.append('general')
    
    return assigned_topics

# Function to fetch videos from YouTube API
def fetch_youtube_videos(api_key, search_query, max_results=50, page_token=None):
    base_url = 'https://www.googleapis.com/youtube/v3/search'
    params = {
        'key': api_key,
        'q': search_query,
        'part': 'snippet',
        'maxResults': max_results,
        'type': 'video',
        'videoCategoryId': '17',  # Sports category
        'videoEmbeddable': 'true',
        'relevanceLanguage': 'en'
    }
    
    if page_token:
        params['pageToken'] = page_token
    
    response = requests.get(base_url, params=params)
    return response.json()

# Function to get video details (duration, view count)
def get_video_details(api_key, video_ids):
    base_url = 'https://www.googleapis.com/youtube/v3/videos'
    params = {
        'key': api_key,
        'id': ','.join(video_ids),
        'part': 'contentDetails,statistics'
    }
    
    response = requests.get(base_url, params=params)
    return response.json()

# Parse ISO 8601 duration format (PT1H2M3S) to seconds
def parse_iso_duration(duration):
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    if not match:
        return 0
    
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    
    return hours * 3600 + minutes * 60 + seconds

# Format seconds to MM:SS or HH:MM:SS
def format_duration(seconds):
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    else:
        return f"{minutes}:{secs:02d}"

# Format view count to human-readable format
def format_views(views):
    if views >= 1000000:
        return f"{views/1000000:.1f}M views"
    elif views >= 1000:
        return f"{views/1000:.1f}K views"
    else:
        return f"{views} views"

# Check if a video is a short (less than 60 seconds)
def is_short_video(duration_seconds):
    return duration_seconds < 60

# Main function to analyze topics and expand dataset
def analyze_and_expand_dataset():
    # Read the CSV file
    csv_df = pd.read_csv('/home/ubuntu/upload/YOUTUBE_SEARCH_RESULTS__224055434.csv')
    
    # Process CSV data
    csv_df['processed_title'] = csv_df['Title'].apply(preprocess_title)
    csv_df['topics'] = csv_df['Title'].apply(assign_topics)
    csv_df['source'] = 'csv'
    
    # Create a unique identifier for CSV videos to avoid duplicates later
    csv_df['id'] = csv_df['Title'].apply(lambda x: re.sub(r'[^a-zA-Z0-9]', '', x.lower())[:11])
    
    # Print topic distribution from CSV
    all_csv_topics = []
    for topic_list in csv_df['topics']:
        all_csv_topics.extend(topic_list)
    
    topic_counts = Counter(all_csv_topics)
    print("Topic distribution from CSV data:")
    for topic, count in topic_counts.most_common():
        print(f"{topic}: {count}")
    
    print(f"\nTotal CSV videos analyzed: {len(csv_df)}")
    print(f"Total unique topics identified: {len(topic_counts)}")
    
    # Fetch additional videos from YouTube API
    print("\nFetching additional videos from YouTube API...")
    api_videos = []
    next_page_token = None
    target_total = 500
    
    # Keep track of video IDs to avoid duplicates
    existing_ids = set(csv_df['id'].tolist())
    
    # Fetch videos until we reach the target total
    while len(api_videos) + len(csv_df) < target_total:
        try:
            search_results = fetch_youtube_videos(API_KEY, SEARCH_QUERY, max_results=50, page_token=next_page_token)
            
            if 'error' in search_results:
                print(f"API Error: {search_results['error']['message']}")
                break
                
            items = search_results.get('items', [])
            if not items:
                print("No more videos found.")
                break
                
            # Extract video IDs
            video_ids = [item['id']['videoId'] for item in items if 'videoId' in item['id']]
            
            # Get video details
            video_details = get_video_details(API_KEY, video_ids)
            
            if 'error' in video_details:
                print(f"API Error: {video_details['error']['message']}")
                break
                
            detail_items = video_details.get('items', [])
            
            # Process each video
            for search_item in items:
                video_id = search_item['id'].get('videoId')
                
                # Skip if this is a duplicate
                if video_id in existing_ids:
                    continue
                    
                existing_ids.add(video_id)
                
                # Find corresponding details
                detail_item = next((item for item in detail_items if item['id'] == video_id), None)
                
                if detail_item:
                    title = search_item['snippet']['title']
                    channel = search_item['snippet']['channelTitle']
                    
                    # Process duration
                    duration_str = detail_item['contentDetails']['duration']
                    duration_seconds = parse_iso_duration(duration_str)
                    duration = format_duration(duration_seconds)
                    
                    # Process view count
                    view_count = int(detail_item['statistics'].get('viewCount', 0))
                    views = format_views(view_count)
                    
                    # Determine if it's a short video
                    is_short = is_short_video(duration_seconds)
                    
                    # Assign topics
                    topics = assign_topics(title)
                    
                    # Add to our list
                    api_videos.append({
                        'id': video_id,
                        'Title': title,
                        'Channel': channel,
                        'Duration': 'SHORTS' if is_short else duration,
                        'Views': views,
                        'processed_title': preprocess_title(title),
                        'topics': topics,
                        'source': 'api',
                        'viewCount': view_count,
                        'durationSeconds': duration_seconds,
                        'isShort': is_short,
                        'thumbnailUrl': search_item['snippet']['thumbnails']['medium']['url']
                    })
            
            # Check if we have a next page token
            next_page_token = search_results.get('nextPageToken')
            if not next_page_token:
                print("No more pages available.")
                break
                
            # Respect API rate limits
            print(f"Fetched {len(api_videos)} additional videos. Waiting before next request...")
            time.sleep(1)
            
        except Exception as e:
            print(f"Error fetching videos: {str(e)}")
            break
    
    # Convert API videos to DataFrame
    api_df = pd.DataFrame(api_videos)
    
    # Combine CSV and API data
    if len(api_videos) > 0:
        # Ensure API DataFrame has all necessary columns
        for col in csv_df.columns:
            if col not in api_df.columns:
                api_df[col] = None
                
        # Combine the datasets
        combined_df = pd.concat([csv_df, api_df], ignore_index=True)
    else:
        combined_df = csv_df
    
    # Print statistics about the combined dataset
    print(f"\nTotal videos in combined dataset: {len(combined_df)}")
    print(f"Videos from CSV: {len(csv_df)}")
    print(f"Additional videos from API: {len(api_df)}")
    
    # Analyze topics in the combined dataset
    all_topics = []
    for topic_list in combined_df['topics']:
        all_topics.extend(topic_list)
    
    combined_topic_counts = Counter(all_topics)
    print("\nTopic distribution in combined dataset:")
    for topic, count in combined_topic_counts.most_common():
        print(f"{topic}: {count}")
    
    # Save the combined dataset
    combined_df.to_csv('/home/ubuntu/combined_video_dataset.csv', index=False)
    
    # Save topic analysis results
    with open('/home/ubuntu/topic_analysis_results.json', 'w') as f:
        json.dump({
            'topics': {k: v for k, v in combined_topic_counts.most_common()},
            'video_count': len(combined_df),
            'topic_count': len(combined_topic_counts),
            'csv_count': len(csv_df),
            'api_count': len(api_df)
        }, f, indent=2)
    
    return {
        'combined_df': combined_df,
        'topics': list(combined_topic_counts.keys())
    }

if __name__ == "__main__":
    results = analyze_and_expand_dataset()
    print("\nAnalysis complete. Results saved to topic_analysis_results.json and combined_video_dataset.csv")
