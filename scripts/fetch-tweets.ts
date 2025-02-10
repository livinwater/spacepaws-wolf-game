import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

interface TweetData {
  id: string;
  author: {
    handle: string;
    name: string;
    title?: string;
  };
  content: string;
}

async function fetchCryptoThreads() {
  // Initialize Twitter client
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_SECRET!,
  });

  try {
    // Search for high-quality crypto-related tweets
    const searchQuery = '(crypto OR bitcoin OR ethereum) (market OR price OR analysis OR prediction OR future) -is:retweet -is:reply lang:en';
    const result = await client.v2.search(searchQuery, {
      'tweet.fields': ['author_id', 'text', 'created_at', 'public_metrics'],
      expansions: ['author_id'],
      'user.fields': ['username', 'name', 'description', 'public_metrics'],
      max_results: 20 // Just fetch 20 at a time
    });

    // Get user details
    const users = result.includes?.users || [];
    const userMap = new Map(users.map(user => [user.id, user]));

    // Filter and transform tweets
    const newTweets: TweetData[] = result.data.data
      .filter(tweet => {
        // Filter tweets that are too short
        if (tweet.text.length < 100) return false;
        
        // Filter out tweets that start with @ (likely replies)
        if (tweet.text.startsWith('@')) return false;
        
        // Filter out tweets with too many hashtags (likely spam)
        const hashtagCount = (tweet.text.match(/#/g) || []).length;
        if (hashtagCount > 3) return false;

        return true;
      })
      .map(tweet => {
        const authorId = tweet.author_id!;
        const user = userMap.get(authorId);
        
        return {
          id: tweet.id,
          author: {
            handle: user?.username ? `@${user.username}` : '@unknown',
            name: user?.name || 'Unknown Author',
            title: user?.description?.match(/(CEO|CTO|Founder|Analyst|Trader)/i)?.[0]
          },
          content: tweet.text
            .replace(/\n+/g, '\n') // Replace multiple newlines with single
            .replace(/https?:\/\/\S+/g, '') // Remove URLs
            .trim()
        };
      });

    if (newTweets.length === 0) {
      console.log('No new tweets matched the criteria. Try running the script again later.');
      return;
    }

    // Read existing tweets and append new ones
    const jsonPath = path.join(process.cwd(), 'data', 'tweets.json');
    const existingData = await fs.readFile(jsonPath, 'utf8');
    const { tweets: existingTweets } = JSON.parse(existingData);
    
    // Combine existing and new tweets
    const allTweets = [...existingTweets, ...newTweets];
    
    // Save back to tweets.json
    await fs.writeFile(jsonPath, JSON.stringify({ tweets: allTweets }, null, 2));
    
    console.log(`Successfully saved ${allTweets.length} tweets (${existingTweets.length} existing + ${newTweets.length} new) to data/tweets.json`);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 429) {
      console.error('Rate limit reached. Try again in 15 minutes.');
    } else {
      console.error('Error fetching tweets:', error);
    }
  }
}

fetchCryptoThreads();