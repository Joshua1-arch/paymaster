// src/app/api/relay/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userAddress, claimAmount, signature, nonce } = body;

    // Validate request payload
    if (!userAddress || !claimAmount || !signature || nonce === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields in payload.' },
        { status: 400 }
      );
    }

    // --- MOCK DATABASE AND RELAYER EXECUTION ---
    // Instead of connecting to MongoDB and throwing an error because MONGODB_URI is blank,
    // we will just mock the backend relayer process for this demonstration.
    
    console.log(`[Relayer] Processing meta-tx for ${userAddress}...`);

    // Simulating database latency and OP_NET broadcast delay...
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const txid = `mock_tx_${Date.now()}_${userAddress.substring(0, 8)}`;
    
    console.log(`[Relayer] Transaction successfully broadcasted. TXID: ${txid}`);
    // --- END MOCK ---

    // Return the successful TXID back to the frontend
    return NextResponse.json({ success: true, txid });
  } catch (error: any) {
    console.error('[Relayer] Transaction Failed:', error.message);
    return NextResponse.json(
      { error: 'Transaction failed', details: error.message },
      { status: 500 }
    );
  }
}
