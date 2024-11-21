import { OpenAI } from 'openai';
import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: message
      }],
      temperature: 0.7,
    });

    const response = completion.choices[0].message;

    await db.insert(messages).values({
      content: response.content || '',
      role: 'assistant',
      metadata: {
        translation: '', // Will be filled by the language detection logic
        vocabulary: [] // Will be filled by the vocabulary extraction logic
      }
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 