import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('stopwords')

# Read the CSV file
df = pd.read_csv('/home/ubuntu/upload/YOUTUBE_SEARCH_RESULTS__224055434.csv')

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

df['processed_title'] = df['Title'].apply(preprocess_title)

# Extract key terms using TF-IDF
vectorizer = TfidfVectorizer(max_features=100)
X = vectorizer.fit_transform(df['processed_title'])
feature_names = vectorizer.get_feature_names_out()

# Perform clustering
num_clusters = 10  # Start with 10 topics
kmeans = KMeans(n_clusters=num_clusters, random_state=42)
kmeans.fit(X)
df['cluster'] = kmeans.labels_

# Analyze clusters to identify topics
topics = {}
for cluster_id in range(num_clusters):
    cluster_docs = df[df['cluster'] == cluster_id]['processed_title'].tolist()
    cluster_text = ' '.join(cluster_docs)
    words = cluster_text.split()
    word_counts = Counter(words)
    most_common = word_counts.most_common(5)
    
    # Create topic name from most common words
    topic_name = ' '.join([word for word, count in most_common[:2]])
    topics[cluster_id] = {
        'name': topic_name,
        'keywords': [word for word, count in most_common],
        'count': len(cluster_docs)
    }

# Manual topic refinement based on common disc golf techniques and shots
disc_golf_topics = {
    'putting': ['putt', 'putting', 'putter', 'confidence', 'straddle', 'turbo'],
    'driving': ['drive', 'driving', 'distance', 'power', 'long', 'max'],
    'forehand': ['forehand', 'sidearm', 'flick'],
    'backhand': ['backhand', 'form', 'technique', 'throw', 'throwing'],
    'approach': ['approach', 'upshot', 'shot', 'shots'],
    'grip': ['grip', 'hand', 'finger', 'hold'],
    'beginner': ['beginner', 'basic', 'basics', 'start', 'first'],
    'advanced': ['advanced', 'pro', 'professional', 'expert'],
    'angle': ['angle', 'angles', 'anhyzer', 'hyzer', 'flat'],
    'specialty': ['roller', 'overhead', 'thumber', 'tomahawk', '360']
}

# Function to assign topics based on keywords
def assign_topics(title):
    title_lower = title.lower()
    assigned_topics = []
    
    for topic, keywords in disc_golf_topics.items():
        if any(keyword in title_lower for keyword in keywords):
            assigned_topics.append(topic)
    
    # If no topics assigned, use the cluster-based topic
    if not assigned_topics:
        cluster_id = df[df['Title'] == title]['cluster'].values[0]
        assigned_topics.append(topics[cluster_id]['name'])
    
    return assigned_topics

# Apply topic assignment
df['topics'] = df['Title'].apply(assign_topics)

# Flatten the topics for analysis
all_topics = []
for topic_list in df['topics']:
    all_topics.extend(topic_list)

# Count topic occurrences
topic_counts = Counter(all_topics)
print("Topic distribution:")
for topic, count in topic_counts.most_common():
    print(f"{topic}: {count}")

# Save results to CSV
df[['Title', 'Channel', 'Duration', 'Views', 'topics']].to_csv('/home/ubuntu/topic_analysis_results.csv', index=False)

# Print summary
print(f"\nTotal videos analyzed: {len(df)}")
print(f"Total unique topics identified: {len(topic_counts)}")
print("\nSample videos by topic:")
for topic in topic_counts.keys():
    sample_videos = df[df['topics'].apply(lambda x: topic in x)]['Title'].head(3).tolist()
    print(f"\n{topic.upper()}:")
    for video in sample_videos:
        print(f"- {video}")
