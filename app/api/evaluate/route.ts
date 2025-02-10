import { NextResponse } from 'next/server';
import { evaluateGameDecisions } from '@/lib/game/llm-client';

export async function POST(req: Request) {
  try {
    const { decisions } = await req.json();
    
    if (!Array.isArray(decisions)) {
      return NextResponse.json(
        { error: 'Invalid decisions format' },
        { status: 400 }
      );
    }

    const evaluation = await evaluateGameDecisions(decisions);
    
    return NextResponse.json({
      success: true,
      evaluation
    });
    
  } catch (error) {
    console.error('Error in evaluation endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

    
    console.log('Handling regular chat message');
    // Handle regular chat messages
    const response = await fetch('https://api.atoma.network/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ATOMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stream: false,
        model: "deepseek-ai/DeepSeek-R1",
        messages,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
