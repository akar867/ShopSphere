import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Validate required field
    if (!password) {
      return NextResponse.json(
        {
          error: 'Password is required',
          code: 'MISSING_PASSWORD',
        },
        { status: 400 }
      );
    }

    // Validate password is a string
    if (typeof password !== 'string') {
      return NextResponse.json(
        {
          error: 'Password must be a string',
          code: 'INVALID_PASSWORD_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate password is not empty
    if (password.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Password cannot be empty',
          code: 'EMPTY_PASSWORD',
        },
        { status: 400 }
      );
    }

    // Hash the password with 10 salt rounds
    const hash = await bcrypt.hash(password, 10);

    return NextResponse.json({ hash }, { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}