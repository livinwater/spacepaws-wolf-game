const sendtoWalrus = process.env.WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const PUBLISHER_ENDPOINT = process.env.WALRUS_PUBLISHER || 'https://publisher.walrus-testnet.walrus.space';

// Helper function to get local date
function getLocalDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-');
}

// Helper function to save transaction details
async function saveTransaction(responseData: any) {
  const transactionsPath = path.join(process.cwd(), 'data', 'walrus-transactions.json');
  
  // Read existing transactions
  let transactionsData;
  try {
    const existingData = await fs.promises.readFile(transactionsPath, 'utf8');
    transactionsData = JSON.parse(existingData);
  } catch (error) {
    transactionsData = { transactions: [] };
  }

  // Add new transaction
  transactionsData.transactions.push({
    timestamp: new Date().toISOString(),
    date: getLocalDate(),
    blobId: responseData.newlyCreated?.blobObject.blobId,
    transactionId: responseData.newlyCreated?.blobObject.id
  });

  // Save back to file
  await fs.promises.writeFile(transactionsPath, JSON.stringify(transactionsData, null, 2));
}

// Helper function to calculate cumulative stats
async function calculateStats() {
  const evalPath = path.join(process.cwd(), 'data', 'evaluation-results.json');
  const evalData = JSON.parse(await fs.promises.readFile(evalPath, 'utf8'));
  
  let totalAnswers = 0;
  let totalCorrect = 0;
  
  evalData.evaluations.forEach((eval: any) => {
    totalAnswers += eval.results.length;
    totalCorrect += eval.totalCorrect;
  });

  return {
    totalAnswers,
    totalCorrect,
    accuracy: totalAnswers > 0 ? (totalCorrect / totalAnswers * 100).toFixed(2) : 0
  };
}

export async function POST(request) {
  try {
    const { 
      health,
      adventuresCompleted,
      tweetsReplied,
      lastQuestName,
      walletAddress
    } = await request.json();
    
    // Calculate stats
    const stats = await calculateStats();
    
    // Prepare game state payload
    const gameState = {
      timestamp: new Date().toISOString(),
      date: getLocalDate(),
      player: {
        health,
        walletAddress: walletAddress || '',
        progress: {
          adventuresCompleted,
          tweetsReplied,
          lastQuestName,
          totalTweetsEvaluated: stats.totalAnswers,
          totalCorrectEvaluations: stats.totalCorrect,
          accuracyRate: `${stats.accuracy}%`
        }
      }
    };

    // Convert to string for Blob
    const payload = JSON.stringify(gameState, null, 2);
    const contentLength = Buffer.byteLength(payload);

    // Configure storage parameters
    const params = new URLSearchParams({
      epochs: 1,
      deletable: false,
      encodingType: 'utf-8'
    });

    // Push to Walrus
    const url = `${PUBLISHER_ENDPOINT}/v1/blobs?${params}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': contentLength.toString()
      },
      body: new Blob([payload], { type: 'application/json' })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`Walrus API Error: ${JSON.stringify(responseData)}`);
    }

    // Save transaction details
    await saveTransaction(responseData);

    return NextResponse.json({
      success: true,
      gameState,
      transaction: {
        blobId: responseData.newlyCreated?.blobObject.blobId,
        transactionId: responseData.newlyCreated?.blobObject.id
      }
    });
    
  } catch (error) {
    console.error('Error pushing to Walrus:', error);
    return NextResponse.json(
      { error: 'Failed to push to Walrus' },
      { status: 500 }
    );
  }
}
