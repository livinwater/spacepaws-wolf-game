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
