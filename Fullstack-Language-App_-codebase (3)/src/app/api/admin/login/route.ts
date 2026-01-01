import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admin } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Ensure this route runs on Node.js runtime (bcrypt/jwt require Node APIs)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS' 
        },
        { status: 400 }
      );
    }

    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Query admin by email
    const adminRecord = await db
      .select()
      .from(admin)
      .where(eq(admin.email, normalizedEmail))
      .limit(1);

    // Check if admin exists
    if (adminRecord.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS' 
        },
        { status: 401 }
      );
    }

    const foundAdmin = adminRecord[0];

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, foundAdmin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS' 
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      {
        adminId: foundAdmin.id,
        email: foundAdmin.email,
        accessLevel: foundAdmin.accessLevel
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Return success response without password hash
    return NextResponse.json(
      {
        token,
        admin: {
          id: foundAdmin.id,
          email: foundAdmin.email,
          name: foundAdmin.name,
          accessLevel: foundAdmin.accessLevel,
          createdAt: foundAdmin.createdAt
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}