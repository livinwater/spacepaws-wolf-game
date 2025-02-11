import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const evaluationPath = path.join(process.cwd(), 'data', 'evaluation-results.json');
    const evaluationData = await fs.readFile(evaluationPath, 'utf8');
    return NextResponse.json(JSON.parse(evaluationData));
  } catch (error) {
    console.error('Error reading evaluation results:', error);
    return NextResponse.json({ error: 'Failed to read evaluation results' }, { status: 500 });
  }
}
