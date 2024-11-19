import OpenAI from 'openai';
import { db } from '../../db';
import { vocabularyItems } from '@db/schema';
import { eq, or } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a Spanish language tutor. Respond in Spanish and help the user learn Spanish. 
Follow these rules:
1. Keep responses concise (2-3 sentences)
2. Use simple, everyday Spanish
3. Incorporate common vocabulary and phrases
4. Correct any Spanish grammar mistakes in user messages
5. If the user writes in English, respond in both Spanish and English`;

export async function generateChatResponse(userMessage: string): Promise<{
  content: string;
  detectedVocabulary: Array<{ word: string; translation: string }>;
}> {
  try {
    // Get chat completion from OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content || 'Lo siento, no entiendo.';

    // Extract Spanish words for vocabulary detection
    const words = response.match(/\b\w+\b/g) || [];
    const uniqueWords = [...new Set(words)];

    // Check against existing vocabulary using OR conditions
    const detectedVocabulary = await db
      .select()
      .from(vocabularyItems)
      .where(
        or(...uniqueWords.map(word => eq(vocabularyItems.spanish, word.toLowerCase())))
      );

    console.log('Chat response generated:', {
      messageLength: response.length,
      detectedVocabularyCount: detectedVocabulary.length,
    });

    return {
      content: response,
      detectedVocabulary: detectedVocabulary.map(item => ({
        word: item.spanish,
        translation: item.chinese,
      })),
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response');
  }
}
