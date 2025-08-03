import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1', // Уточни в документации xAI
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, model = 'grok-3-mini', max_tokens = 1500, temperature = 0.7 } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Промпт обязателен' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional scriptwriter for an emotional YouTube storytelling channel targeted at older English-speaking viewers (mostly aged 55–70). Write in English, using a calm, deep, reflective, and emotionally engaging tone.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens,
      temperature,
    });

    const story_text = response.choices[0].message.content?.trim() || '';
    const usage = response.usage;
    console.log(`Grok Usage: Input tokens: ${usage?.prompt_tokens}, Output tokens: ${usage?.completion_tokens}, Total: ${usage?.total_tokens}`);
    const cost = (usage?.prompt_tokens! / 1_000_000 * 0.30) + (usage?.completion_tokens! / 1_000_000 * 0.50); // Примерные цены
    console.log(`Grok Cost: $${cost.toFixed(5)}`);

    return NextResponse.json({ scenario: story_text });
  } catch (error) {
    console.error('Ошибка Grok API:', error);
    return NextResponse.json({ error: 'Ошибка генерации сценария' }, { status: 500 });
  }
}