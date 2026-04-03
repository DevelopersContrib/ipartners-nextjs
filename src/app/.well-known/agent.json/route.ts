import { NextResponse } from 'next/server';
import { buildAgentCard } from '@/lib/agentCapabilities';

export async function GET() {
  const agentCard = buildAgentCard();

  return NextResponse.json(agentCard, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
