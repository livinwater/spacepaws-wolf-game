import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the path to the tweets.json file
    const jsonPath = path.join(process.cwd(), 'data', 'tweets.json');
    
    // Read the JSON file
    const fileContents = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading tweets:', error);
    return NextResponse.json(
      { error: 'Failed to load tweets' },
      { status: 500 }
    );
  }
}
