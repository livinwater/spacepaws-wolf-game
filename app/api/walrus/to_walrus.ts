const sendtoWalrus = process.env.WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space';

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get enhanced prompt from LLM
    const llmResponse = await fetch('https://api.atoma.network/v1/chat/completions', {
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
          content: `Improve this game narrative while keeping the key elements: 
          - Wolf protagonist with 3 health hearts 
          - Rocky alien environment 
          - Swipe choices: left=forest, right=rocky plains
          - Mysterious atmosphere
          Original text: "Waking up the wolf finds himself alone in a rocky place, where should he go next?"`
        }],
        max_tokens: 2048
      })
    });

    const data = await llmResponse.json();
    const enhancedPrompt = data.choices[0].message.content;

    // Save to stage1
    const stageData = {
      id: "stage1",
      background: "#000000",
      assets: {
        wolf: "/wolf.png",
        hearts: 3
      },
      prompt: enhancedPrompt,
      choices: {
        left: { 
          direction: "forest",
          description: "Twisted alien trees glow faintly in the distance"
        },
        right: {
          direction: "rocky_plains", 
          description: "Barren stone fields under crimson skies"
        }
      }
    };

    return NextResponse.json(stageData);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: "Failed to generate adventure prompt",
      fallback: "The wolf awakens in a jagged alien landscape. Strange mineral formations jut from the crimson-tinged ground. To the west, bioluminescent foliage pulses in a twisted forest. To the east, endless rocky plains stretch to the horizon. (Swipe left for forest, right for plains)"
    });
  }
}
