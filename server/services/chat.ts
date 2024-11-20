import OpenAI from 'openai';
import { db } from '../../db';
import { vocabularyItems } from '@db/schema';
import { eq, or } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an advanced Spanish language tutor specializing in B2 level instruction. Analyze the context of each user message to provide responses in Spanish with Chinese translations.

Respond in JSON format with the following structure:
{
  "type": "translation" | "explanation" | "conversation",
  "spanish": "Spanish response text",
  "chinese": "Chinese translation of the response",
  "explanation": "Grammatical or cultural explanation in Chinese",
  "vocabulary": [
    {
      "word": "Spanish word or phrase",
      "translation": "Chinese translation",
      "colloquial": boolean,
      "colloquial_indicator": "口语 (if applicable)",
      "type": "noun/verb/adjective/phrase",
      "level": "A1/A2/B1/B2/C1",
      "example": "Example sentence in Spanish",
      "example_translation": "Example translation in Chinese",
      "context": "Cultural or usage context in Chinese",
      "grammar_notes": "Grammar explanations in Chinese"
    }
  ]
}

For translation requests: 
- Provide natural Chinese translations
- Mark colloquial expressions with 口语
- Include usage context in Chinese

For questions: 
- Give detailed explanations in Chinese
- Provide relevant examples with translations

For conversation: 
- Maintain natural flow while explaining idioms
- Highlight colloquial usage with 口语 marker

Always provide:
1. Complete Chinese translations
2. Clear marking of informal/colloquial terms (口语)
3. Cultural context in Chinese
4. Grammar explanations in Chinese`;

interface VocabularyItem {
  word: string;
  translation: string;
  colloquial: boolean;
  colloquial_indicator?: string;
  type: string;
  level: string;
  example: string;
  example_translation: string;
  context: string;
  grammar_notes: string;
}

interface ChatResponse {
  type: 'translation' | 'explanation' | 'conversation';
  spanish: string;
  chinese: string;
  explanation?: string;
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

    console.log('Chat response generated:', {
      messageLength: response.spanish.length,
      detectedVocabularyCount: newVocabulary.length,
    });

    // Construct the display content
    let content = response.spanish;
    
    if (response.type === 'translation' && response.english) {
      content = `${response.spanish}\n\n${response.english}`;
    } else if (response.type === 'explanation' && response.explanation) {
      content = `${response.spanish}\n\n${response.explanation}`;
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
