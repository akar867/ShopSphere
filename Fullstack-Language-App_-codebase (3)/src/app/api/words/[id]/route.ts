import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { words } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Require authenticated session
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = params;
    
    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Fetch single word by ID
    const word = await db.select()
      .from(words)
      .where(eq(words.id, parseInt(id)))
      .limit(1);

    if (word.length === 0) {
      return NextResponse.json({ 
        error: 'Word not found',
        code: 'WORD_NOT_FOUND' 
      }, { status: 404 });
    }

    // Convert snake_case to camelCase for response
    const wordData = word[0];
    const response = {
      id: wordData.id,
      hanzi: wordData.hanzi,
      pinyin: wordData.pinyin,
      translation: wordData.translation,
      audioUrl: wordData.audioUrl,
      videoUrl: wordData.videoUrl,
      imageUrl: wordData.imageUrl,
      difficulty: wordData.difficulty
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}