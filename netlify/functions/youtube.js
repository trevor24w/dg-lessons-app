const fetch = require('node-fetch');

exports.handler = async (event) => {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const { q } = event.queryStringParameters;
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${encodeURIComponent(q)}&part=snippet&type=video&maxResults=24`;

  const response = await fetch(url);
  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}; 