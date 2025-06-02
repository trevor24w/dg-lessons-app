import pandas as pd
import numpy as np
import re
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from collections import Counter
import nltk
from nltk.corpus import stopwords
import json

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
    csv_df['video_id'] = csv_df['Title'].apply(lambda x: re.sub(r'[^a-zA-Z0-9]', '', x.lower())[:11])
    
    # Save the processed CSV data
    csv_df.to_csv('/home/ubuntu/processed_csv_videos.csv', index=False)
    
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
    
    # Save topic analysis results
    with open('/home/ubuntu/topic_analysis_results.json', 'w') as f:
        json.dump({
            'topics': {k: v for k, v in topic_counts.most_common()},
            'video_count': len(csv_df),
            'topic_count': len(topic_counts)
        }, f, indent=2)
    
    return {
        'csv_df': csv_df,
        'topics': list(topic_counts.keys())
    }

if __name__ == "__main__":
    results = analyze_and_expand_dataset()
    print("\nAnalysis complete. Results saved to topic_analysis_results.json")
