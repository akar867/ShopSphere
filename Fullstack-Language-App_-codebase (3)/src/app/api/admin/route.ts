import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { admin } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  adminId: number;
  email: string;
  accessLevel: number;
}

function verifyToken(request: NextRequest): JWTPayload | null {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    if (decoded.accessLevel !== 3) {
      return NextResponse.json(
        { error: 'Forbidden - Requires level 3 access', code: 'INSUFFICIENT_PERMISSIONS' },
        { status: 403 }
      );
    }

    const admins = await db.select().from(admin);

    const adminsWithoutPassword = admins.map(({ password, ...rest }) => rest);

    return NextResponse.json(adminsWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided', code: 'NO_TOKEN' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    if (decoded.accessLevel !== 3) {
      return NextResponse.json(
        { error: 'Forbidden - Requires level 3 access', code: 'INSUFFICIENT_PERMISSIONS' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, accessLevel } = body;

    if (!email || !password || !name || accessLevel === undefined || accessLevel === null) {
      return NextResponse.json(
        { error: 'All fields are required: email, password, name, accessLevel', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters', code: 'PASSWORD_TOO_SHORT' },
        { status: 400 }
      );
    }

    if (![1, 2, 3].includes(accessLevel)) {
      return NextResponse.json(
        { error: 'Access level must be 1, 2, or 3', code: 'INVALID_ACCESS_LEVEL' },
        { status: 400 }
      );
    }

    const existingAdmin = await db.select()
      .from(admin)
      .where(eq(admin.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingAdmin.length > 0) {
      return NextResponse.json(
        { error: 'Admin with this email already exists', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await db.insert(admin)
      .values({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        accessLevel,
        createdAt: new Date().toISOString()
      })
      .returning();

    const { password: _, ...adminWithoutPassword } = newAdmin[0];

    return NextResponse.json(adminWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}