/**
 * GET /api/ai/status
 *
 * Returns the current Ollama availability status.
 * Used by the client-side AIProvider to poll connectivity.
 *
 * Requirements: 6.1, 6.4
 */

import { NextResponse } from 'next/server';
import { createOllamaClient } from '@/src/ai/client';

const client = createOllamaClient('http://localhost:11434');

export async function GET() {
  const available = await client.isAvailable();
  return NextResponse.json({ available });
}
