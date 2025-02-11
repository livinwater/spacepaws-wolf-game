import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PUBLISHER_ENDPOINT = process.env.WALRUS_PUBLISHER || 'https://publisher.walrus-testnet.walrus.space';
const GAME_STATE_FILE = path.join(process.cwd(), 'data', 'game-state.json');
const WALRUS_FILE = path.join(process.cwd(), 'data', 'walrus-transactions.json');

// Initialize walrus file if it doesn't exist
async function initWalrusFile() {
  try {
    await fs.access(WALRUS_FILE);
  } catch {
    console.log('Creating walrus transactions file');
    await fs.writeFile(WALRUS_FILE, JSON.stringify({ transactions: [] }, null, 2));
  }
}

// Save transaction details to local file
async function saveTransaction(responseData: any) {
  try {
    // Ensure walrus file exists
    await initWalrusFile();

    // Read existing transactions
    let walrusData = { transactions: [] };
    try {
      const walrusContent = await fs.readFile(WALRUS_FILE, 'utf-8');
      walrusData = JSON.parse(walrusContent);
    } catch (error) {
      console.error('Error reading Walrus file:', error);
    }

    // Add new transaction
    const newTransaction = {
      timestamp: new Date().toISOString(),
      ...(responseData.newlyCreated || responseData.alreadyCertified)
    };
    walrusData.transactions.push(newTransaction);
    console.log('Adding transaction:', newTransaction);

    // Save updated transactions
    await fs.writeFile(WALRUS_FILE, JSON.stringify(walrusData, null, 2));
    console.log('Saved Walrus transaction');
    return true;
  } catch (error) {
    console.error('Error saving transaction:', error);
    return false;
  }
}

export async function POST(request: Request) {
  console.log('Latest Walrus sync called');
  try {
    // Read game states
    const gameStateContent = await fs.readFile(GAME_STATE_FILE, 'utf-8');
    const gameStateData = JSON.parse(gameStateContent);
    
    // Get latest game state
    const latestGameState = gameStateData.gameStates[gameStateData.gameStates.length - 1];
    console.log('Found latest game state:', latestGameState);

    // Prepare the payload
    const payload = JSON.stringify({
      tweetsAnswered: latestGameState.tweetsAnswered,
      heartsRemaining: latestGameState.heartsRemaining,
      accuracy: latestGameState.accuracy,
      timestamp: latestGameState.timestamp
    });
    const contentLength = Buffer.byteLength(payload);

    // Configure storage parameters
    const params = new URLSearchParams({
      epochs: '1',
      deletable: 'false',
      encodingType: 'utf-8'
    });

    // Send to Walrus
    const url = `${PUBLISHER_ENDPOINT}/v1/blobs?${params}`;
    console.log('Sending to Walrus:', url);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': contentLength.toString()
      },
      body: payload
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save to Walrus: ${response.statusText}. ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Walrus response:', responseData);

    // Save transaction details
    await saveTransaction(responseData);

    return NextResponse.json({ 
      success: true,
      message: 'Latest game state synced to Walrus',
      ...(responseData.newlyCreated || responseData.alreadyCertified)
    });
  } catch (error) {
    console.error('Error in latest Walrus sync:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sync latest game state'
      }, 
      { status: 500 }
    );
  }
}
