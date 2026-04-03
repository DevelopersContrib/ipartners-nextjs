import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    // API returns empty array [] for invalid users, or an object for valid ones
    if (user && !Array.isArray(user) && typeof user === 'object' && Object.keys(user).length > 0) {
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid email or password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
