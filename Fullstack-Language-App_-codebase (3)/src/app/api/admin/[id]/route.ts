import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admin } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: any;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Check access level
    if (decoded.accessLevel !== 3) {
      return NextResponse.json(
        {
          error: 'Forbidden - Requires level 3 access',
          code: 'INSUFFICIENT_PERMISSIONS',
        },
        { status: 403 }
      );
    }

    // Validate ID parameter
    const id = params.id;
    const parsedId = parseInt(id);

    if (!id || isNaN(parsedId)) {
      return NextResponse.json(
        { error: 'Valid admin ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if admin exists
    const existingAdmin = await db
      .select()
      .from(admin)
      .where(eq(admin.id, parsedId))
      .limit(1);

    if (existingAdmin.length === 0) {
      return NextResponse.json(
        { error: 'Admin not found', code: 'ADMIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (parsedId === decoded.adminId) {
      return NextResponse.json(
        {
          error: 'Cannot delete your own admin account',
          code: 'CANNOT_DELETE_SELF',
        },
        { status: 400 }
      );
    }

    // Delete admin
    const deleted = await db
      .delete(admin)
      .where(eq(admin.id, parsedId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete admin', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    // Return success response without password
    return NextResponse.json(
      {
        message: 'Admin deleted successfully',
        deletedAdmin: {
          id: deleted[0].id,
          email: deleted[0].email,
          name: deleted[0].name,
          accessLevel: deleted[0].accessLevel,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}