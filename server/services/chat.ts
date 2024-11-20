import OpenAI from 'openai';
import { db } from '../../db';
import { vocabularyItems } from '@db/schema';
import { eq, or } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a Spanish language tutor. Respond in JSON format with the following structure:
{
  "spanish": "Spanish response text",
  "english": "English translation (if user wrote in English)",
  "vocabulary": [
    {
      "word": "Spanish word",
      "translation": "Chinese translation",
      "type": "noun/verb/adjective",
      "example": "Example sentence"
    }
  ]
}`;

interface ChatResponse {
  spanish: string;
  english?: string;
  vocabulary: Array<{
    word: string;
    translation: string;
    type: string;
    example: string;
  }>;
}

export async function generateChatResponse(userMessage: string): Promise<{
  content: string;
  detectedVocabulary: Array<{
    word: string;
    translation: string;
    type: string;
    example: string;
  }>;
}> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 300,
    });

    const responseText = completion.choices[0]?.message?.content || '{"spanish": "Lo siento, no entiendo.", "vocabulary": []}';
    let response: ChatResponse;
    
    try {
      response = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      response = {
        spanish: responseText,
        vocabulary: []
      };
    }

    // Check if any vocabulary words already exist in the database
    const existingVocabulary = await db
      .select()
      .from(vocabularyItems)
      .where(
        or(...response.vocabulary.map(v => eq(vocabularyItems.spanish, v.word.toLowerCase())))
      );

    const existingWords = new Set(existingVocabulary.map(v => v.spanish.toLowerCase()));
    
    // Filter out existing vocabulary
    const newVocabulary = response.vocabulary.filter(v => !existingWords.has(v.word.toLowerCase()));

    console.log('Chat response generated:', {
      messageLength: response.spanish.length,
      detectedVocabularyCount: newVocabulary.length,
    });

    // Construct the display content
    const content = userMessage.toLowerCase().startsWith('translate:') || /^[a-zA-Z\s,.!?]+$/.test(userMessage)
      ? `${response.spanish}\n\n${response.english || ''}`
      : response.spanish;

    return {
      content,
      detectedVocabulary: newVocabulary,
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response');
  }
}
