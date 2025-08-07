// src/lib/edenAi.ts
import { modelMap } from './model-map'

type ScenarioParams = {
  prompt: string
  uiModel: string          // строка из селекта UI
  maxTokens?: number
  temperature?: number
}

export async function generateScenario({
  prompt,
  uiModel,
  maxTokens = 2000,
  temperature = 0.7,
}: ScenarioParams) {
  const map = modelMap[uiModel]
  if (!map) throw new Error(`Модель «${uiModel}» пока не поддерживается`)

  const res = await fetch('https://api.edenai.run/v2/text/generation', {
    method: 'POST',
    headers: {
      Authorization : `Bearer ${process.env.EDEN_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      providers : [map.provider],
      text      : prompt,
      temperature,
      max_tokens: maxTokens,
      settings  : { [map.provider]: map.model },
    }),
  })

  // Eden AI присылает text/plain при ошибке → пытаемся безопасно распарсить
  const raw = await res.text()
  let data: any = {}
  try { data = JSON.parse(raw) } catch (_) {}

  if (!res.ok) {
    const msg = data?.error?.message ?? raw.slice(0, 300)
    throw new Error(`Eden AI ${res.status}: ${msg}`)
  }

  const gText =
    data[map.provider]?.generated_text ??
    data.openai?.generated_text ?? // если сработал fallback
    ''

  return gText.trim()
}
