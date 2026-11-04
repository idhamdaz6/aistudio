import { GoogleGenAI } from '@google/genai';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Map mood IDs to rich Indonesian audio acting styles
function buildSpeechStylePrompt(params: {
  gender: string;
  mood: string;
  customMood?: string;
  speed: number;
  voice: string;
}): string {
  const { gender, mood, customMood, speed, voice } = params;

  let moodDescription = '';
  switch (mood) {
    case 'ceria':
      moodDescription =
        'Gunakan intonasi sangat ceria, bersahabat, tersenyum hangat, ramah, dan penuh energi positif dalam bahasa Indonesia yang luwes dan alami.';
      break;
    case 'formal':
      moodDescription =
        'Gunakan intonasi resmi, lugas, tenang, jelas, berwibawa, dan kredibel layaknya pembaca berita televisi nasional dalam bahasa Indonesia baku.';
      break;
    case 'santai':
      moodDescription =
        'Gunakan nada santai, hangat, akrab, dan mengalir seperti sedang berbincang akrab dengan sahabat karib dalam percakapan sehari-hari.';
      break;
    case 'semangat':
      moodDescription =
        'Gunakan intonasi bersemangat tinggi, penuh gairah membara, membakar motivasi, tegas, dan membangkitkan inspirasi pendengar.';
      break;
    case 'tenang':
      moodDescription =
        'Gunakan intonasi sangat lembut, ritme hening, menenangkan hati, rileks, dan mendamaikan layaknya panduan relaksasi.';
      break;
    case 'dongeng':
      moodDescription =
        'Bawakan dengan gaya narator dongeng imajinatif: kaya intonasi karakter, ekspresif, hangat, dan memukau pendengar kisah fantasi.';
      break;
    case 'misterius':
      moodDescription =
        'Gunakan intonasi misterius, sedikit berbisik, tegang, dramatis, dan penuh teka-teki yang memikat rasa penasaran.';
      break;
    case 'iklan':
      moodDescription =
        'Gunakan nada promosi komersial yang sangat persuasif, antusias, memikat, cerah, dan percaya diri seperti iklan audio profesional.';
      break;
    case 'sedih':
      moodDescription =
        'Gunakan intonasi sendu, emosional, melankolis, penuh simpati, dan menyentuh lubuk hati.';
      break;
    case 'custom':
      moodDescription = customMood?.trim() || 'Gunakan intonasi ekspresif dan alami dalam bahasa Indonesia.';
      break;
    default:
      moodDescription = 'Gunakan intonasi alami, jernih, dan ekspresif dalam bahasa Indonesia.';
  }

  let tempoGuidance = 'Tempo bicara seimbang dan teratur.';
  if (speed <= 0.8) {
    tempoGuidance = 'Bicaralah dengan tempo lebih lambat, santai, dan artikulasi sangat jelas.';
  } else if (speed >= 1.25) {
    tempoGuidance = 'Bicaralah dengan tempo lebih sigap, cepat, dinamis, dan lincah.';
  }

  const genderPersona =
    gender === 'wanita'
      ? `Karakter suara wanita Indonesia (${voice}), pengucapan fasih dan artikulasi tajam.`
      : `Karakter suara pria Indonesia (${voice}), resonansi vokal mantap dan pengucapan fasih.`;

  return `${genderPersona} ${moodDescription} ${tempoGuidance} Lafalkan singkatan, angka, dan kata serapan bahasa Indonesia dengan alami.`;
}

// Exponential backoff retry helper
async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 1200
): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isTemporary =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');

      if (i < retries && isTemporary) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// User-friendly Indonesian error message translator
function formatGeminiErrorMessage(error: any): string {
  if (!error) return 'Terjadi kesalahan sistem.';

  let raw = error.message || String(error);
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error?.message) {
      raw = parsed.error.message;
    }
  } catch {
    // raw is already a string
  }

  if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE')) {
    return 'Layanan Gemini AI sedang mengalami lonjakan permintaan sesaat. Silakan klik tombol sintesis kembali.';
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return 'Batas kuota harian sementara tercapai. Silakan coba kembali dalam beberapa saat.';
  }
  if (raw.includes('API_KEY_INVALID') || raw.includes('403')) {
    return 'API key tidak valid atau tidak memiliki izin akses. Periksa konfigurasi di menu Secrets.';
  }

  return raw;
}

// Local smart script polish fallback in case model is temporarily unavailable
function fallbackPolishNarration(text: string): string {
  let polished = text
    .replace(/Rp\s?([0-9.,]+)/gi, 'Rp $1 ')
    .replace(/\bdll\b/gi, 'dan lain-lain')
    .replace(/\bdkk\b/gi, 'dan kawan-kawan')
    .replace(/\byg\b/gi, 'yang')
    .replace(/\bdgn\b/gi, 'dengan')
    .replace(/\butk\b/gi, 'untuk')
    .replace(/\bsbg\b/gi, 'sebagai')
    .replace(/\btgl\b/gi, 'tanggal')
    .replace(/\bno\.\b/gi, 'nomor')
    .replace(/\s+/g, ' ')
    .trim();

  if (!/[.!?]$/.test(polished)) {
    polished += '.';
  }
  return polished;
}

// Check status API
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    models: ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts', 'gemini-3.8-flash'],
  });
});

// TTS Generation Endpoint
app.post('/api/tts/generate', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voice = 'Kore',
      gender = 'wanita',
      mood = 'ceria',
      customMood,
      speed = 1.0,
      model = 'gemini-3.8-flash-lite-tts',
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Teks tidak boleh kosong.' });
    }

    if (!ai) {
      return res.status(500).json({
        error:
          'API Key Gemini belum terkonfigurasi di server. Pastikan GEMINI_API_KEY telah disetel pada panel Secrets.',
      });
    }

    const cleanText = text.trim();
    const stylePrompt = buildSpeechStylePrompt({
      gender,
      mood,
      customMood,
      speed: Number(speed) || 1.0,
      voice,
    });

    const chosenModel =
      model === 'gemini-3.8-flash-tts'
        ? 'gemini-3.8-flash-tts'
        : 'gemini-3.8-flash-lite-tts';

    // Unary call returns a complete WAV audio file (audio/wav, 24kHz mono 16-bit)
    const response = await callWithRetry(() =>
      ai.models.generateContent({
        model: chosenModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: stylePrompt,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice,
              },
            },
          },
        },
      })
    );

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts;
    let base64Audio: string | undefined;

    if (parts && parts.length > 0) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          base64Audio = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Audio) {
      return res.status(500).json({
        error: 'Model tidak mengembalikan data audio yang valid. Silakan coba kembali.',
      });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      voice,
      gender,
      mood,
      speed,
      text: cleanText,
      appliedStyle: stylePrompt,
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    return res.status(500).json({
      error: formatGeminiErrorMessage(error),
    });
  }
});

// Script Assistant / Enhancer using Gemini 3.8 Flash
app.post('/api/tts/enhance-script', async (req: Request, res: Response) => {
  try {
    const { text, action, tone } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'API Key Gemini belum disetel di server.' });
    }

    if (!text && action !== 'generate_sample') {
      return res.status(400).json({ error: 'Teks naskah diperlukan.' });
    }

    let prompt = '';
    if (action === 'optimize_narration') {
      prompt = `Anda adalah seorang ahli sutradara suara (voiceover director) dan editor bahasa Indonesia profesional.
Tugas Anda adalah memoles naskah berikut agar SANGAT ENAK, NATURAL, dan BERIRAMA ketika dibacakan oleh mesin Text-to-Speech (TTS).
Perhatikan:
1. Perbaiki tanda baca (koma, titik, tanda seru) agar jeda pernapasan terdengar wajar.
2. Tulis angka atau singkatan menjadi kata penuh jika membingungkan mesin suara (misal: "Rp 50.000" jadi "lima puluh ribu rupiah", "dll" jadi "dan lain-lain").
3. Pertahankan isi pesan aslinya tanpa mengubah makna esensial.
4. Jangan menambahkan pembuka/penutup seperti "Tentu, ini hasilnya...". Berikan HANYA teks naskah hasil polesan.

Naskah Asli:
"""
${text}
"""`;
    } else if (action === 'add_expressive_cues') {
      prompt = `Anda adalah sutradara audio drama Indonesia.
Tambahkan petunjuk ekspresi vokal seperti jeda dramatis ([jeda]), helaan napas (<breath>), tawa kecil (<laugh>), atau backchannel (|mhm|) pada tempat-tempat yang tepat dalam naskah berikut agar terdengar hidup dan dramatis saat dibawakan.
Berikan HANYA teks akhir siap baca tanpa komentar pengantar.

Naskah:
"""
${text}
"""`;
    } else if (action === 'generate_sample') {
      prompt = `Buatkan satu naskah suara pendek (2-3 kalimat, sekitar 30-45 kata) dalam bahasa Indonesia dengan tema/gaya: "${tone || 'Inspiratif & Ramah'}".
Naskah harus sangat menarik didengar, memiliki diksi berima, dan cocok untuk narasi audio TTS.
Keluarkan HANYA naskah suara tersebut tanpa tanda kutip dan tanpa kata pengantar apa pun.`;
    } else {
      prompt = `Tulis ulang naskah berikut menjadi lebih ekspresif, menggugah, dan mengalir dalam bahasa Indonesia:
"""
${text}
"""
Keluarkan HANYA naskah akhir.`;
    }

    try {
      const response = await callWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'Anda adalah asisten naskah suara bahasa Indonesia profesional. Jawaban Anda selalu langsung berupa teks naskah tanpa pengantar basa-basi.',
          },
        })
      );

      const enhancedText = response.text?.trim() || '';
      return res.json({ success: true, enhancedText });
    } catch (aiErr: any) {
      console.warn('Gemini script assistant fallback engaged:', aiErr?.message);
      if (action === 'optimize_narration' && text) {
        return res.json({
          success: true,
          enhancedText: fallbackPolishNarration(text),
        });
      }
      throw aiErr;
    }
  } catch (error: any) {
    console.error('Error enhancing script:', error);
    return res.status(500).json({ error: formatGeminiErrorMessage(error) });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SuaraKita TTS Studio running at http://localhost:${PORT}`);
  });
}

startServer();
