import { NextResponse } from 'next/server';
export const runtime     = 'nodejs';
export const maxDuration = 9000;   

export async function POST(request: Request) {
  console.log('Запрос в /api/generate-scenario получен');

  const body = await request.json();
  const { prompt, model, max_tokens, temperature } = body;
  console.log('Полученные данные:', { prompt, model, max_tokens, temperature });

  if (!process.env.EDEN_AI_API_KEY) {
    console.error('Ошибка: EDEN_AI_API_KEY не найден в env');
    return NextResponse.json({ error: 'API ключ Eden AI не настроен' }, { status: 500 });
  }

  const [provider, modelName] = model.split('/');
  console.log('Разбор модели:', { provider, modelName });

  try {
    const response = await fetch('https://api.edenai.run/v2/text/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EDEN_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providers: [provider],
        text: prompt,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2000,
        settings: {
          [provider]: modelName,
          openai: 'gpt-4o-mini'  // Дефолтная модель для fallback (ChatGPT)
        },
        fallback_providers: ["openai"]  // <-- Здесь добавляем fallback на OpenAI (ChatGPT)
      }),
    });

    console.log('Статус от Eden AI:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка от Eden AI:', errorData);
      throw new Error(`Eden AI error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Ответ от Eden AI:', data);

    // Если основной провайдер fail, Eden AI вернёт данные от fallback, так что берём из data[provider] или data['openai']
    let generatedText = data[provider]?.generated_text || data['openai']?.generated_text || '';

    // Если fail, проверь ошибку
    if (data[provider]?.status === 'fail') {
      console.error('Eden AI fail:', data[provider].error.message);
      generatedText = data['openai']?.generated_text || '';  // Используем fallback текст
    }

    return NextResponse.json({ scenario: generatedText });
  } catch (error) {
    console.error('Общая ошибка в route:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}