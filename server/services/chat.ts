import OpenAI from 'openai';
import { db } from '../../db';
import { vocabularyItems } from '@db/schema';
import { eq, or } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an advanced Spanish language tutor for Chinese speakers at B2 level. Detect the input language and respond accordingly:

For Chinese input:
- Translate to natural Spanish
- Highlight B2+ level vocabulary in the translation
- Explain in Chinese why certain phrases might be challenging
- Provide example sentences for complex terms

For Spanish input:
- Provide accurate Chinese translation
- Identify and explain B2+ level vocabulary
- Include colloquial/formal usage notes in Chinese
- Give example sentences with Chinese translations

Respond in JSON format:
{
  "input_language": "chinese" | "spanish",
  "translation": "Translation in target language",
  "explanation": "Explanation in Chinese about translation choices",
  "vocabulary": [
    {
      "word": "Spanish word/phrase",
      "translation": "Chinese translation",
      "level": "B1/B2/C1",
      "usage_type": "formal/colloquial/idiomatic",
      "explanation": "Detailed explanation in Chinese",
      "example": "Example sentence in Spanish",
      "example_translation": "Example translation in Chinese",
      "grammar_notes": "Grammar explanations in Chinese"
    }
  ]
}

Focus on vocabulary and expressions that B2 learners typically struggle with.
Always explain in Chinese why certain expressions are challenging.`;

interface VocabularyItem {
  word: string;
  translation: string;
  level: string;
  usage_type: 'formal' | 'colloquial' | 'idiomatic';
  explanation: string;
  example: string;
  example_translation: string;
  grammar_notes: string;
}

interface ChatResponse {
  input_language: 'chinese' | 'spanish';
  translation: string;
  explanation: string;
  vocabulary: VocabularyItem[];
}

export async function generateChatResponse(userMessage: string): Promise<{
  content: string;
  explanation?: string;
  detectedVocabulary: VocabularyItem[];
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
        type: 'conversation',
        spanish: responseText,
        chinese: '抱歉，我理解有误。',
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

    // Enhanced logging for debugging
    console.log('Chat processing:', {
      inputLength: userMessage.length,
      responseType: response.type,
      messageLength: response.spanish.length,
      hasChineseTranslation: !!response.chinese,
      hasExplanation: !!response.explanation,
      totalVocabularyDetected: response.vocabulary.length,
      newVocabularyCount: newVocabulary.length,
      existingVocabularyCount: response.vocabulary.length - newVocabulary.length,
    });

    // Construct the display content with Chinese translation
    let content = response.translation;
    
    // Add explanation after translation
    if (response.explanation) {
      content += `\n\n${response.explanation}`;
    }

    return {
      content,
      explanation: response.explanation,
      detectedVocabulary: newVocabulary,
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response');
  }
}
