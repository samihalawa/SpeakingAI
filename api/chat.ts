import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../db';
import { chatMessages } from '../db/schema';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are a Spanish language tutor for Chinese speakers..."
        },
        { role: "user", content }
      ]
    });

    const [message] = await db.insert(chatMessages).values({
      content,
      role: 'user'
    }).returning();

    const [response] = await db.insert(chatMessages).values({
      content: completion.choices[0].message.content || '',
      role: 'assistant'
    }).returning();

    res.json({ message, response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
} 