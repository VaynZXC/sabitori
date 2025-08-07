// src/app/api/jobs/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { type, payload } = await req.json()
  const { model, prompt, max_tokens, temperature } = payload
  const [provider, modelName] = model.split('/')

  // 1. создаём пустую Job
  const job = await prisma.job.create({
    data: { type, payload, status: 'QUEUED' }
  })

  try {
    // 2. вызываем Eden AI
    const edenRes = await fetch('https://api.edenai.run/v2/text/generation', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EDEN_AI_API_KEY!}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        providers: [provider, 'openai'],            // + fallback
        text: prompt,
        temperature: temperature ?? 0.7,
        max_tokens : max_tokens  ?? 800,
        settings: { [provider]: modelName }
      })
    })

    const edenJson = await edenRes.json()
    console.log('Eden AI raw →', edenJson)

    const providerData = edenJson[provider] ?? edenJson['openai']

    if (!edenRes.ok || providerData?.status === 'fail') {
      throw new Error(
        providerData?.error?.message ??
        `Eden AI error (${edenRes.status})`
      )
    }

    const text = providerData.generated_text?.trim() ?? ''
    if (!text) throw new Error('Eden AI вернул пустой текст')

    // 3. обновляем Job
    await prisma.job.update({
      where: { id: job.id },
      data : { status: 'DONE', result: { generated_text: text } }
    })
  } catch (err: any) {
    await prisma.job.update({
      where: { id: job.id },
      data : { status: 'FAIL', error: err.message ?? 'unknown error' }
    })
  }

  // 4. сообщаем фронту id
  return NextResponse.json({ id: job.id }, { status: 202 })
}
