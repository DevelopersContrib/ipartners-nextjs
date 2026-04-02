import { NextRequest, NextResponse } from 'next/server';
import { checkInviteExist, getInviteInfo, getAppInviteInfo } from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'standard'; // 'standard' or 'app'

  if (!id) {
    return NextResponse.json(
      { error: 'Invite ID is required' },
      { status: 400 }
    );
  }

  try {
    const exists = await checkInviteExist(id);

    if (!exists) {
      return NextResponse.json(
        { error: 'Invite not found', exists: false },
        { status: 404 }
      );
    }

    const invite =
      type === 'app'
        ? await getAppInviteInfo(id)
        : await getInviteInfo(id);

    return NextResponse.json({ exists: true, invite });
  } catch {
    return NextResponse.json(
      { error: 'Failed to verify invite' },
      { status: 500 }
    );
  }
}
