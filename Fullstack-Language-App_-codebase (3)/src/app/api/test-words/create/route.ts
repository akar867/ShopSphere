import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { words } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hanzi, pinyin, translation, difficulty, audioUrl, videoUrl, imageUrl } = body;

    // Validate required fields
    if (!hanzi) {
      return NextResponse.json({
        error: "Hanzi is required",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    if (!pinyin) {
      return NextResponse.json({
        error: "Pinyin is required",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    if (!translation) {
      return NextResponse.json({
        error: "Translation is required",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    if (!difficulty) {
      return NextResponse.json({
        error: "Difficulty is required",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    // Validate difficulty values
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json({
        error: "Difficulty must be 'easy', 'medium', or 'hard'",
        code: "INVALID_DIFFICULTY"
      }, { status: 400 });
    }

    // Sanitize inputs - trim strings and convert empty strings to null
    const sanitizedData = {
      hanzi: hanzi.trim(),
      pinyin: pinyin.trim(),
      translation: translation.trim(),
      difficulty: difficulty.trim(),
      audioUrl: audioUrl ? (audioUrl.trim() || null) : null,
      videoUrl: videoUrl ? (videoUrl.trim() || null) : null,
      imageUrl: imageUrl ? (imageUrl.trim() || null) : null,
      createdAt: new Date().toISOString()
    };

    // Validate sanitized required fields are not empty
    if (!sanitizedData.hanzi) {
      return NextResponse.json({
        error: "Hanzi cannot be empty",
        code: "EMPTY_REQUIRED_FIELD"
      }, { status: 400 });
    }

    if (!sanitizedData.pinyin) {
      return NextResponse.json({
        error: "Pinyin cannot be empty",
        code: "EMPTY_REQUIRED_FIELD"
      }, { status: 400 });
    }

    if (!sanitizedData.translation) {
      return NextResponse.json({
        error: "Translation cannot be empty",
        code: "EMPTY_REQUIRED_FIELD"
      }, { status: 400 });
    }

    // Insert the new word
    const newWord = await db.insert(words)
      .values({
        hanzi: sanitizedData.hanzi,
        pinyin: sanitizedData.pinyin,
        translation: sanitizedData.translation,
        difficulty: sanitizedData.difficulty,
        audioUrl: sanitizedData.audioUrl,
        videoUrl: sanitizedData.videoUrl,
        imageUrl: sanitizedData.imageUrl,
        createdAt: sanitizedData.createdAt
      })
      .returning();

    if (newWord.length === 0) {
      return NextResponse.json({
        error: "Failed to create word",
        code: "CREATE_FAILED"
      }, { status: 500 });
    }

    // Convert snake_case to camelCase for response
    const createdWord = {
      id: newWord[0].id,
      hanzi: newWord[0].hanzi,
      pinyin: newWord[0].pinyin,
      translation: newWord[0].translation,
      difficulty: newWord[0].difficulty,
      audioUrl: newWord[0].audioUrl,
      videoUrl: newWord[0].videoUrl,
      imageUrl: newWord[0].imageUrl,
      createdAt: newWord[0].createdAt
    };

    return NextResponse.json(createdWord, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}