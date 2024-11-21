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
        { 
          role: 'system', 
          content: SYSTEM_PROMPT 
        },
        { 
          role: 'user', 
          content: userMessage,
        }
      ],
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" },
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    // Validate response exists and is in correct format
    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Ensure proper UTF-8 encoding for the response
    const responseText = new TextDecoder('utf-8').decode(
      new TextEncoder().encode(completion.choices[0].message.content)
    );
    
    if (!responseText) {
      throw new Error('No response received from OpenAI');
    }
    
    let response: ChatResponse;
    
    try {
      try {
        // Parse and validate JSON structure
        response = JSON.parse(responseText);
        
        // Deep validation of response structure
        const validateChineseString = (str: string): string => {
          if (!str) return '';
          try {
            // Test if string contains Chinese characters
            const hasChineseChar = /[\u4E00-\u9FFF]/.test(str);
            if (hasChineseChar) {
              // Ensure proper UTF-8 encoding
              return new TextDecoder('utf-8').decode(
                new TextEncoder().encode(str)
              );
            }
            return str;
          } catch (e) {
            console.error('Chinese character encoding error:', e);
            return str;
          }
        };

        if (!response.input_language || 
            !response.translation || 
            !Array.isArray(response.vocabulary)) {
          throw new Error('Missing required fields in response');
        }

        // Validate and sanitize translation and explanation
        response.translation = validateChineseString(response.translation);
        response.explanation = validateChineseString(response.explanation || '');

        // Validate and sanitize vocabulary items
        response.vocabulary = response.vocabulary.map(item => {
          if (!item.word || !item.translation) {
            throw new Error('Invalid vocabulary item structure');
          }

          return {
            ...item,
            translation: validateChineseString(item.translation),
            explanation: validateChineseString(item.explanation),
            example_translation: validateChineseString(item.example_translation),
            grammar_notes: validateChineseString(item.grammar_notes)
          };
        });

        // Additional validation for Chinese content
        if (!response.vocabulary.some(item => 
          /[\u4E00-\u9FFF]/.test(item.translation) || 
          /[\u4E00-\u9FFF]/.test(item.explanation || '')
        )) {
          console.warn('No Chinese characters found in vocabulary translations');
        }
      } catch (error) {
        console.error('JSON parsing or validation error:', error);
        throw error;
      }
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
