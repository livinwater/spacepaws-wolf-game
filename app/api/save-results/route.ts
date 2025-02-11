import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const RESULTS_FILE = path.join(DATA_DIR, 'tweets-response.json');

// Ensure data directory exists
try {
  await fs.access(DATA_DIR);
} catch {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { batchNumber, startIndex, endIndex, answers } = body;

    // Initialize file if it doesn't exist
    let data = { batches: [] };
    try {
      const fileContent = await fs.readFile(RESULTS_FILE, 'utf-8');
      data = JSON.parse(fileContent);
    } catch {
      // File doesn't exist or is invalid, use default empty data
      await fs.writeFile(RESULTS_FILE, JSON.stringify(data, null, 2));
    }

    // Add new batch
    data.batches[batchNumber] = {
      batchNumber,
      startIndex,
      endIndex,
      answers,
      timestamp: new Date().toISOString()
    };

    // Write back to file
    await fs.writeFile(RESULTS_FILE, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in save-results:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save results'
      }, 
      { status: 500 }
    );
  }
}
