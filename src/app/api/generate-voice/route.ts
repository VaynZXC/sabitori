// app/api/generate-voice/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

/* ---------- ОБЯЗАТЕЛЬНО! ---------- */
/* .env.local (в корне проекта)      */
/* ELEVENLABS_API_KEY=sk_**********  */
/* EU_PROXY=http://user:pass@ip:port (опционально) */

export const runtime = 'nodejs';           // даём настоящий Node, а не Edge

const API_KEY   = process.env.ELEVENLABS_API_KEY!;
const PROXY_URL = process.env.EU_PROXY;    // можешь не задавать, если сервер уже в ЕС

const DEFAULT_VOICE = 'JBFqnCBsd6RMkjVDRZzb'; // Adam

export async function POST(req: Request) {
  /* 1. --- Парсим вход --- */
  const { text, voice = DEFAULT_VOICE } = await req.json();

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Поле "text" обязательно' }, { status: 400 });
  }
  if (!API_KEY) {
    // если забыли положить ключ — ругаемся прямо сейчас
    return NextResponse.json({ error: 'API-ключ не найден (ELEVENLABS_API_KEY)' }, { status: 500 });
  }

  /* 2. --- Готовим Axios-конфиг --- */
  const axiosCfg: any = {
    headers: {
      'xi-api-key'  : API_KEY,           // только так, без Bearer
      'Accept'      : 'audio/mpeg',
      'Content-Type': 'application/json',
    },
    responseType: 'arraybuffer',         // сразу получаем «сырая mp3»
    timeout: 60_000,
  };
  if (PROXY_URL) axiosCfg.httpsAgent = new HttpsProxyAgent(PROXY_URL);

  /* 3. --- Делаем запрос к ElevenLabs --- */
  try {
    const elevenURL = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;
    const resp = await axios.post(
      elevenURL,
      {
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: { stability: 0.4, similarity_boost: 0.9 },
      },
      axiosCfg,
    );

    /* 4. --- Валидируем ответ --- */
    const ctype = resp.headers['content-type'] ?? '';
    if (!ctype.includes('audio')) {
      throw new Error(`ElevenLabs вернул не audio/mpeg, а ${ctype}`);
    }

    /* 5. --- Сохраняем mp3 в /public/audio --- */
    const fileName = `${uuidv4()}.mp3`;
    const filePath = path.join(process.cwd(), 'public', 'audio', fileName);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, Buffer.from(resp.data));

    /* 6. --- Отправляем клиенту путь к файлу --- */
    return NextResponse.json({ audioUrl: `/audio/${fileName}` });
  } catch (e: any) {
    /* --- Логируем подробности --- */
    if (e.response) {
      console.error('ElevenLabs HTTP', e.response.status, e.response.data);
    } else {
      console.error('ElevenLabs ERR', e.message);
    }
    return NextResponse.json(
      { error: `ElevenLabs failed: ${e.message}` },
      { status: 500 },
    );
  }
}
