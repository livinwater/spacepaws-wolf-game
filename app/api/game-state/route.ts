import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const EVALUATION_FILE = path.join(process.cwd(), 'data', 'evaluation-results.json');
const GAME_STATE_FILE = path.join(process.cwd(), 'data', 'game-state.json');

// Initialize game state file if it doesn't exist
async function initGameStateFile() {
  try {
    await fs.access(GAME_STATE_FILE);
  } catch {
    console.log('Creating game state file');
    await fs.writeFile(GAME_STATE_FILE, JSON.stringify({ gameStates: [] }, null, 2));
  }
}

export async function POST(request: Request) {
  console.log('Game state endpoint called');
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    const { health } = body;

    // Read evaluation results
    let evaluationData;
    try {
      console.log('Reading evaluation file from:', EVALUATION_FILE);
      const evalContent = await fs.readFile(EVALUATION_FILE, 'utf-8');
      evaluationData = JSON.parse(evalContent);
      console.log('Read evaluation data:', evaluationData);
    } catch (error) {
      console.error('Error reading evaluation file:', error);
      return NextResponse.json({ success: false, error: 'Failed to read evaluation data' });
    }

    const latestEvaluation = evaluationData.evaluations[evaluationData.evaluations.length - 1];
    console.log('Latest evaluation:', latestEvaluation);
    
    if (!latestEvaluation) {
      console.error('No evaluation found');
      return NextResponse.json({ success: false, error: 'No evaluation found' });
    }

    if (!latestEvaluation.results) {
      console.error('No results in latest evaluation');
      return NextResponse.json({ success: false, error: 'No results in latest evaluation' });
    }

    // Create game state
    const totalAnswers = latestEvaluation.results.length;
    const correctAnswers = latestEvaluation.totalCorrect || 0;

    const gameState = {
      timestamp: new Date().toISOString(),
      tweetsAnswered: totalAnswers,
      heartsRemaining: health || 3,
      equipment: [],
      accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
    };
    
    console.log('Created game state:', gameState);

    // Ensure game state file exists
    await initGameStateFile();

    // Read existing game states
    let gameStateData = { gameStates: [] };
    try {
      const gameStateContent = await fs.readFile(GAME_STATE_FILE, 'utf-8');
      gameStateData = JSON.parse(gameStateContent);
    } catch (error) {
      console.error('Error reading game state file:', error);
    }

    // Add new game state
    gameStateData.gameStates.push(gameState);
    console.log('Adding game state:', gameState);

    // Save updated game states
    await fs.writeFile(GAME_STATE_FILE, JSON.stringify(gameStateData, null, 2));
    console.log('Saved game state');

    // Sync latest game state to Walrus
    try {
      console.log('\n🐘 Syncing with Walrus...');
      const response = await fetch('http://localhost:3000/api/walrus/latest', {
        method: 'POST'
      });
      
      if (!response.ok) {
        console.error('❌ Failed to sync with Walrus:', await response.text());
      } else {
        const walrusData = await response.json();
        console.log('✅ Game state synced to Walrus!');
        console.log(`📦 Blob ID: ${walrusData.blobId}`);
        console.log(`🔗 Transaction: ${walrusData.event?.txDigest}`);
        console.log(`⛓️ Epoch: ${walrusData.endEpoch}\n`);
      }
    } catch (error) {
      console.error('❌ Error syncing with Walrus:', error);
    }

    return NextResponse.json({ success: true, gameState });
  } catch (error) {
    console.error('Error in game-state:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update game state'
      }, 
      { status: 500 }
    );
  }
}
