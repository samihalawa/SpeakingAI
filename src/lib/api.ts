const API_URL = import.meta.env.VITE_API_URL || '';

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
  basePath: process.env.OPENAI_API_BASE,
  baseOptions: {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  }
};

export const openaiClient = new OpenAIApi(configuration);

export const sendMessage = async (content: string) => {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
};

export async function createChatCompletion(messages: any[]) {
  return await openaiClient.createChatCompletion({
    model: process.env.OPENAI_MODEL,
    messages,
    max_tokens: 500,
    stream: true,
    // Add any other parameters you need
  });
} 