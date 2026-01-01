import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { words } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const parsedId = parseInt(id);

    // Check if record exists
    const existingRecord = await db.select()
      .from(words)
      .where(eq(words.id, parsedId))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Word not found' 
      }, { status: 404 });
    }

    // Get request body
    const requestBody = await request.json();

    // Extract and sanitize fields
    const {
      hanzi,
      pinyin,
      translation,
      audioUrl,
      videoUrl,
      imageUrl,
      difficulty
    } = requestBody;

    // Sanitization helper function
    const sanitizeString = (value: any): string | null => {
      if (value === null || value === undefined) return null;
      if (typeof value !== 'string') return String(value).trim() || null;
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    };

    // Build update object with only provided fields
    const updates: any = {};

    if (hanzi !== undefined) {
      const sanitizedHanzi = sanitizeString(hanzi);
      if (sanitizedHanzi === null) {
        return NextResponse.json({ 
          error: "Hanzi cannot be empty",
          code: "INVALID_HANZI" 
        }, { status: 400 });
      }
      updates.hanzi = sanitizedHanzi;
    }

    if (pinyin !== undefined) {
      const sanitizedPinyin = sanitizeString(pinyin);
      if (sanitizedPinyin === null) {
        return NextResponse.json({ 
          error: "Pinyin cannot be empty",
          code: "INVALID_PINYIN" 
        }, { status: 400 });
      }
      updates.pinyin = sanitizedPinyin;
    }

    if (translation !== undefined) {
      const sanitizedTranslation = sanitizeString(translation);
      if (sanitizedTranslation === null) {
        return NextResponse.json({ 
          error: "Translation cannot be empty",
          code: "INVALID_TRANSLATION" 
        }, { status: 400 });
      }
      updates.translation = sanitizedTranslation;
    }

    if (audioUrl !== undefined) {
      updates.audioUrl = sanitizeString(audioUrl);
    }

    if (videoUrl !== undefined) {
      updates.videoUrl = sanitizeString(videoUrl);
    }

    if (imageUrl !== undefined) {
      updates.imageUrl = sanitizeString(imageUrl);
    }

    if (difficulty !== undefined) {
      const sanitizedDifficulty = sanitizeString(difficulty);
      if (sanitizedDifficulty && !['easy', 'medium', 'hard'].includes(sanitizedDifficulty)) {
        return NextResponse.json({ 
          error: "Difficulty must be 'easy', 'medium', or 'hard'",
          code: "INVALID_DIFFICULTY" 
        }, { status: 400 });
      }
      if (sanitizedDifficulty === null) {
        return NextResponse.json({ 
          error: "Difficulty cannot be empty",
          code: "INVALID_DIFFICULTY" 
        }, { status: 400 });
      }
      updates.difficulty = sanitizedDifficulty;
    }

    // If no valid updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields provided for update",
        code: "NO_UPDATES" 
      }, { status: 400 });
    }

    // Always update timestamp
    updates.updatedAt = new Date().toISOString();

    // Update the record
    const updated = await db.update(words)
      .set(updates)
      .where(eq(words.id, parsedId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update word' 
      }, { status: 500 });
    }

    // Convert snake_case to camelCase for response
    const updatedWord = updated[0];
    const response = {
      id: updatedWord.id,
      hanzi: updatedWord.hanzi,
      pinyin: updatedWord.pinyin,
      translation: updatedWord.translation,
      audioUrl: updatedWord.audioUrl,
      videoUrl: updatedWord.videoUrl,
      imageUrl: updatedWord.imageUrl,
      difficulty: updatedWord.difficulty,
      createdAt: updatedWord.createdAt
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}