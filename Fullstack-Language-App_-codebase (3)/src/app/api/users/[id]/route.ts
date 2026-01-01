import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID is provided
    if (!id || id.trim() === '') {
      return NextResponse.json(
        {
          error: 'Valid user ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        {
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related sessions and accounts)
    const deletedUser = await db
      .delete(user)
      .where(eq(user.id, id))
      .returning();

    return NextResponse.json(
      {
        message: 'User deleted successfully',
        deletedUser: deletedUser[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE user error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + error,
      },
      { status: 500 }
    );
  }
}