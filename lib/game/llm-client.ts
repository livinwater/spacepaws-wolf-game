import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function evaluateGameDecisions(decisions: any[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are evaluating a player's decisions in a wolf-themed data labeling game. Analyze their context awareness and decision-making."
        },
        {
          role: "user",
          content: JSON.stringify(decisions)
        }
      ]
    });

    return completion.choices[0].message;
  } catch (error) {
    console.error('Error evaluating game decisions:', error);
    throw error;
  }
}
