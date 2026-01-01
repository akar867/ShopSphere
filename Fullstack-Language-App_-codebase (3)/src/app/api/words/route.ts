import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { words } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';
// import { auth } from "@/lib/auth";

// Helper function to convert database fields to camelCase
function convertToCamelCase(record: any) {
  return {
    id: record.id,
    hanzi: record.hanzi,
    pinyin: record.pinyin,
    translation: record.translation,
    audioUrl: record.audioUrl,
    videoUrl: record.videoUrl,
    imageUrl: record.imageUrl,
    difficulty: record.difficulty,
    createdAt: record.createdAt
  };
}

export async function GET(request: NextRequest) {
  // Public access: no auth required
  // const session = await auth.api.getSession({ headers: request.headers });
  // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const difficulty = searchParams.get('difficulty');

    let query = db.select().from(words);

    // Build where conditions
    const conditions = [];

    // Search across hanzi, pinyin, and translation
    if (q) {
      const searchCondition = or(
        like(words.hanzi, `%${q}%`),
        like(words.pinyin, `%${q}%`),
        like(words.translation, `%${q}%`)
      );
      conditions.push(searchCondition);
    }

    // Filter by difficulty
    if (difficulty) {
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return NextResponse.json({ 
          error: "Invalid difficulty. Must be 'easy', 'medium', or 'hard'",
          code: "INVALID_DIFFICULTY" 
        }, { status: 400 });
      }
      conditions.push(eq(words.difficulty, difficulty));
    }

    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;
    
    // Convert to camelCase
    const camelCaseResults = results.map(convertToCamelCase);

    return NextResponse.json(camelCaseResults);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Public access: no auth required
  // const session = await auth.api.getSession({ headers: request.headers });
  // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { hanzi, pinyin, translation, audioUrl, videoUrl, imageUrl, difficulty } = body;

    // Validate required fields
    if (!hanzi) {
      return NextResponse.json({ 
        error: "hanzi is required",
        code: "MISSING_HANZI" 
      }, { status: 400 });
    }

    if (!pinyin) {
      return NextResponse.json({ 
        error: "pinyin is required",
        code: "MISSING_PINYIN" 
      }, { status: 400 });
    }

    if (!translation) {
      return NextResponse.json({ 
        error: "translation is required",
        code: "MISSING_TRANSLATION" 
      }, { status: 400 });
    }

    if (!difficulty) {
      return NextResponse.json({ 
        error: "difficulty is required",
        code: "MISSING_DIFFICULTY" 
      }, { status: 400 });
    }

    // Validate difficulty value
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json({ 
        error: "Invalid difficulty. Must be 'easy', 'medium', or 'hard'",
        code: "INVALID_DIFFICULTY" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      hanzi: hanzi.trim(),
      pinyin: pinyin.trim(),
      translation: translation.trim(),
      audioUrl: audioUrl?.trim() || null,
      videoUrl: videoUrl?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      difficulty: difficulty.trim(),
      createdAt: new Date().toISOString()
    };

    const newWord = await db.insert(words)
      .values(sanitizedData)
      .returning();

    if (newWord.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create word',
        code: "CREATE_FAILED" 
      }, { status: 500 });
    }

    // Convert to camelCase
    const camelCaseWord = convertToCamelCase(newWord[0]);

    return NextResponse.json(camelCaseWord, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Public access: no auth required
  // const session = await auth.api.getSession({ headers: request.headers });
  // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { hanzi, pinyin, translation, audioUrl, videoUrl, imageUrl, difficulty } = body;

    // Check if record exists
    const existingRecord = await db.select()
      .from(words)
      .where(eq(words.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Word not found',
        code: "WORD_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate difficulty if provided
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json({ 
        error: "Invalid difficulty. Must be 'easy', 'medium', or 'hard'",
        code: "INVALID_DIFFICULTY" 
      }, { status: 400 });
    }

    // Build update object with only provided fields
    const updates: any = {};
    
    if (hanzi !== undefined) updates.hanzi = hanzi.trim();
    if (pinyin !== undefined) updates.pinyin = pinyin.trim();
    if (translation !== undefined) updates.translation = translation.trim();
    if (audioUrl !== undefined) updates.audioUrl = audioUrl?.trim() || null;
    if (videoUrl !== undefined) updates.videoUrl = videoUrl?.trim() || null;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl?.trim() || null;
    if (difficulty !== undefined) updates.difficulty = difficulty.trim();

    const updatedWord = await db.update(words)
      .set(updates)
      .where(eq(words.id, parseInt(id)))
      .returning();

    if (updatedWord.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update word',
        code: "UPDATE_FAILED" 
      }, { status: 500 });
    }

    // Convert to camelCase
    const camelCaseWord = convertToCamelCase(updatedWord[0]);

    return NextResponse.json(camelCaseWord);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Public access: no auth required
  // const session = await auth.api.getSession({ headers: request.headers });
  // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = await db.select()
      .from(words)
      .where(eq(words.id, parseInt(id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Word not found',
        code: "WORD_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(words)
      .where(eq(words.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete word',
        code: "DELETE_FAILED" 
      }, { status: 500 });
    }

    // Convert to camelCase
    const camelCaseWord = convertToCamelCase(deleted[0]);

    return NextResponse.json({
      message: 'Word deleted successfully',
      deletedWord: camelCaseWord
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}