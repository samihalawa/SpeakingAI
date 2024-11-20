import OpenAI from 'openai';
import { db } from '../../db';
import { vocabularyItems } from '@db/schema';
import { eq, or } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an advanced Spanish language tutor for Chinese speakers. Detect the input language and respond accordingly:

For Chinese input:
- Translate to natural Spanish
- Identify challenging vocabulary and expressions
- Explain in Chinese why certain phrases might be challenging
- Provide example sentences for complex terms

For Spanish input:
- Provide accurate Chinese translation
- Identify important vocabulary and expressions
- Include colloquial/formal usage notes in Chinese
- Give example sentences with Chinese translations

Respond in JSON format:
{
  "input_language": "chinese" | "spanish",
  "translation": "Translation in target language",
  "explanation": "解释翻译选择的原因和难点",
  "vocabulary": [
    {
      "word": "Spanish word/phrase",
      "translation": "中文翻译",
      "usage_type": "正式/口语/习语",
      "explanation": "详细的中文解释",
      "example": "Spanish example sentence",
      "example_translation": "例句中文翻译",
      "grammar_notes": "语法要点中文说明"
    }
  ]
}

Focus on explaining why expressions are challenging and provide detailed Chinese explanations.
All explanations must be in Chinese.`;

interface VocabularyItem {
  word: string;
  translation: string;
  usage_type: '正式' | '口语' | '习语';
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
  // Validate input message
  if (!userMessage || userMessage.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }

  if (userMessage.length > 1000) {
    throw new Error('Message content is too long (max 1000 characters)');
  }

  // Check if the message contains valid UTF-8 characters
  try {
    decodeURIComponent(encodeURIComponent(userMessage));
  } catch (error) {
    throw new Error('Message contains invalid characters');
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response received from OpenAI');
    }
    
    let response: ChatResponse;
    
    try {
      // Since we use response_format: "json_object", this should always be valid JSON
      response = JSON.parse(responseText);
      
      // Validate response structure
      if (!response.input_language || !response.translation || !Array.isArray(response.vocabulary)) {
        throw new Error('Invalid response structure');
      }
      
      // Ensure all strings are properly encoded for Chinese characters
      response.translation = decodeURIComponent(encodeURIComponent(response.translation));
      response.explanation = response.explanation ? 
        decodeURIComponent(encodeURIComponent(response.explanation)) : '';
      
      response.vocabulary = response.vocabulary.map(item => ({
        ...item,
        translation: decodeURIComponent(encodeURIComponent(item.translation)),
        explanation: decodeURIComponent(encodeURIComponent(item.explanation)),
        example_translation: decodeURIComponent(encodeURIComponent(item.example_translation)),
        grammar_notes: decodeURIComponent(encodeURIComponent(item.grammar_notes))
      }));
      
    } catch (error) {
      console.error('Failed to parse or process JSON response:', error);
      response = {
        input_language: 'chinese',
        translation: '对不起，系统暂时无法处理您的请求。',
        explanation: '系统错误，请稍后再试。',
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

    // Automatically add new vocabulary items to the database
    if (newVocabulary.length > 0) {
      const vocabToAdd = newVocabulary.map(v => ({
        spanish: v.word,
        chinese: v.translation,
        example: v.example,
        notes: `${v.explanation}\n\n用法：${v.usage_type}\n语法：${v.grammar_notes}`
      }));

      try {
        const addedItems = await db
          .insert(vocabularyItems)
          .values(vocabToAdd)
          .returning();

        // Send WebSocket update for new vocabulary items
        process.send?.({ 
          type: 'vocabulary_update',
          items: addedItems
        });
      } catch (error) {
        console.error('Error adding vocabulary items:', error);
      }
    }

    // Enhanced logging for debugging
    console.log('Chat processing:', {
      inputLength: userMessage.length,
      inputLanguage: response.input_language,
      translationLength: response.translation.length,
      hasExplanation: !!response.explanation,
      totalVocabularyDetected: response.vocabulary.length,
      newVocabularyCount: newVocabulary.length,
      existingVocabularyCount: response.vocabulary.length - newVocabulary.length,
    });

    // Sanitize and construct the display content with Chinese translation
    let content = '';
    
    try {
      // Ensure proper encoding of translation
      content = decodeURIComponent(encodeURIComponent(response.translation));
      
      // Add explanation after translation if available
      if (response.explanation) {
        const sanitizedExplanation = decodeURIComponent(encodeURIComponent(response.explanation));
        content += `\n\n${sanitizedExplanation}`;
      }
    } catch (error) {
      console.error('Error sanitizing response content:', error);
      throw new Error('Failed to process response content');
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
