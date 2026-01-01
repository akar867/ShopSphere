import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admin } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Ensure this route runs on Node.js runtime (jsonwebtoken requires Node APIs)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    const adminId = Number((decoded as any).adminId);

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    const adminRecord = await db.select()
      .from(admin)
      .where(eq(admin.id, adminId))
      .limit(1);

    if (adminRecord.length === 0) {
      return NextResponse.json(
        { error: 'Admin not found', code: 'ADMIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    const { password, ...adminData } = adminRecord[0];

    return NextResponse.json(adminData, { status: 200 });

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}