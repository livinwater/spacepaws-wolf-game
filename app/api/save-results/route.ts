import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const RESULTS_FILE = path.join(DATA_DIR, 'tweets-response.json');
const EVALUATION_FILE = path.join(DATA_DIR, 'evaluation-results.json');
const GAME_STATE_FILE = path.join(DATA_DIR, 'game-state.json');

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

    // Initialize tweets response file if it doesn't exist
    let data = { batches: [] };
    try {
      const fileContent = await fs.readFile(RESULTS_FILE, 'utf-8');
      data = JSON.parse(fileContent);
    } catch {
      await fs.writeFile(RESULTS_FILE, JSON.stringify(data, null, 2));
    }

    // Remove any existing batch with the same batch number
    data.batches = data.batches.filter((batch: any) => batch.batchNumber !== batchNumber);

    // Add new batch
    data.batches.push({
      batchNumber,
      startIndex,
      endIndex,
      answers,
      timestamp: new Date().toISOString()
    });

    // Write back to tweets response file
    await fs.writeFile(RESULTS_FILE, JSON.stringify(data, null, 2));

    // If this is the final batch (batchNumber 0), create evaluation and game state
    if (batchNumber === 0) {
      console.log('Final batch received, triggering evaluation...');
      
      // Trigger evaluation
      const evalResponse = await fetch('http://localhost:3000/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchNumber: 0,
          answers
        })
      });

      if (!evalResponse.ok) {
        console.error('Failed to trigger evaluation');
        return NextResponse.json({ success: true }); // Continue without game state
      }

      const evalData = await evalResponse.json();
      console.log('Evaluation complete:', evalData);

      // Wait a bit for evaluation to be written
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update game state
      try {
        console.log('Updating game state with health:', body.health);
        const gameStateResponse = await fetch('http://localhost:3000/api/game-state', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            health: body.health
          })
        });

        if (!gameStateResponse.ok) {
          console.error('Failed to update game state:', await gameStateResponse.text());
        } else {
          const gameStateData = await gameStateResponse.json();
          console.log('Game state updated successfully:', gameStateData);
        }
      } catch (error) {
        console.error('Error updating game state:', error);
      }
    }

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
