import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to get tweet content
async function getTweets() {
  const tweetsPath = path.join(process.cwd(), 'data', 'tweets.json');
  const tweetsData = await fs.promises.readFile(tweetsPath, 'utf8');
  return JSON.parse(tweetsData).tweets;
}

// Helper function to save evaluation results
async function saveEvaluationResults(evaluation: any) {
  const evalPath = path.join(process.cwd(), 'data', 'evaluation-results.json');
  
  // Read existing evaluations
  let evalData;
  try {
    const existingData = await fs.promises.readFile(evalPath, 'utf8');
    evalData = JSON.parse(existingData);
  } catch (error) {
    evalData = { evaluations: [] };
  }

  // Remove any existing evaluations with the same batch number
  evalData.evaluations = evalData.evaluations.filter(
    (e: any) => e.batchNumber !== evaluation.batchNumber
  );

  // Add new evaluation with timestamp
  evalData.evaluations.push({
    ...evaluation,
    timestamp: new Date().toISOString()
  });

  // Save back to file
  await fs.promises.writeFile(evalPath, JSON.stringify(evalData, null, 2));
}

// Helper function to analyze sentiment using Atoma LLM
async function analyzeSentiment(tweet: string) {
  try {
    const response = await fetch('https://api.atoma.network/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ATOMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stream: false,
        model: "deepseek-ai/DeepSeek-R1",
        messages: [{
          role: "user",
          content: `Analyze if this tweet has a bullish or bearish sentiment about cryptocurrency. Only respond with either "Bullish" or "Bearish". Tweet: "${tweet}"`
        }],
        max_tokens: 2048
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Extract just the final "Bullish" or "Bearish" answer
    const match = content.match(/(Bullish|Bearish)$/);
    if (!match) {
      console.error('Unexpected LLM response format:', content);
      // Default to the last word if we can't find a match
      return content.split(/\s+/).pop() || 'Bearish';
    }
    return match[0];
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { batchNumber, answers } = await req.json();
    
    if (!Array.isArray(answers) || answers.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid answers format - must be array of 4 answers' },
        { status: 400 }
      );
    }

    // Get tweets
    const tweets = await getTweets();
    const batchTweets = tweets.slice(batchNumber * 4, (batchNumber + 1) * 4);

    console.log('Latest batch:', batchTweets);

    if (!batchTweets || batchTweets.length !== 4) {
      console.error('Batch not found:', batchNumber);
      return NextResponse.json({ success: false, error: 'Batch not found' });
    }

    // Analyze each tweet and compare with user answers
    const results = await Promise.all(batchTweets.map(async (tweet, index) => {
      const llmSentiment = await analyzeSentiment(tweet.content);
      const userAnswer = answers[index];
      
      return {
        tweet: tweet.content,
        userAnswer,
        llmAnswer: llmSentiment,
        correct: userAnswer === llmSentiment ? 1 : 0
      };
    }));

    console.log('Evaluation results:', {
      batchNumber,
      results,
      totalCorrect: results.reduce((sum, result) => sum + result.correct, 0),
      passed: results.reduce((sum, result) => sum + result.correct, 0) >= 3
    });

    // Calculate total correct answers
    const totalCorrect = results.reduce((sum, result) => sum + result.correct, 0);
    const passed = totalCorrect >= 3; // Pass if 3 or more are correct

    const evaluation = {
      batchNumber,
      results,
      totalCorrect,
      passed
    };

    // Save evaluation results
    await saveEvaluationResults(evaluation);
    console.log('Saved evaluation results');

    return NextResponse.json({
      success: true,
      ...evaluation
    });
    
  } catch (error) {
    console.error('Error in evaluation endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
