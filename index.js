import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const GEMINI_MODEL = 'gemini-3.8-flash';

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY belum diatur di file .env');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_INSTRUCTION = `
Kamu adalah FoodFinder AI, asisten rekomendasi makanan yang ramah, santai, dan membantu.

Tugas utama kamu adalah membantu pengguna menemukan ide makanan berdasarkan budget, jenis makanan,
selera, mood, waktu makan, pantangan yang disebutkan pengguna, dan informasi lain yang diberikan.

Aturan percakapan:
1. Gunakan Bahasa Indonesia yang natural, ramah, dan mudah dipahami.
2. Jika informasi pengguna belum cukup, tanyakan satu pertanyaan singkat yang paling relevan.
3. Berikan 2-4 rekomendasi makanan yang sesuai jika pengguna meminta rekomendasi.
4. Jelaskan alasan singkat mengapa rekomendasi tersebut cocok.
5. Jika pengguna memberikan budget, gunakan budget tersebut sebagai pertimbangan utama.
6. Jangan mengklaim harga, ketersediaan, promo, jam buka, atau lokasi restoran tertentu sebagai fakta
   jika informasi tersebut tidak diberikan oleh pengguna.
7. Jika pengguna menyebut lokasi, kamu boleh memberikan ide makanan yang umum untuk daerah tersebut,
   tetapi jangan mengarang nama restoran atau data bisnis spesifik.
8. Jika pengguna belum menentukan makanan, bantu dengan pertanyaan sederhana seperti budget,
   jenis makanan, rasa, atau mood.
9. Jika pengguna meminta hal yang tidak berkaitan dengan makanan atau rekomendasi makanan,
   jawab dengan sopan bahwa kamu fokus sebagai FoodFinder AI lalu arahkan kembali ke topik makanan.
10. Jangan memberikan jawaban terlalu panjang. Gunakan emoji secukupnya agar percakapan terasa hidup.
11. Jangan menggunakan format Markdown yang rumit. Gunakan teks biasa dengan daftar sederhana bila perlu.
`;

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;

  try {
    if (!Array.isArray(conversation) || conversation.length === 0) {
      return res.status(400).json({ error: 'Conversation tidak boleh kosong.' });
    }

    const contents = conversation
      .filter((message) => message && ['user', 'model'].includes(message.role) && typeof message.text === 'string')
      .map(({ role, text }) => ({
        role,
        parts: [{ text }],
      }));

    if (contents.length === 0) {
      return res.status(400).json({ error: 'Pesan tidak valid.' });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const result = response.text?.trim();

    if (!result) {
      return res.status(502).json({ error: 'Gemini tidak memberikan respons.' });
    }

    res.status(200).json({ result });
  } catch (error) {
    console.error('ERROR:', error);

    const message = error?.message || '';

    if (message.includes('429')) {
      return res.status(429).json({
        error: 'Kuota Gemini sedang habis atau terlalu banyak permintaan. Coba lagi beberapa saat lagi.',
      });
    }

    if (message.includes('API key') || message.includes('401') || message.includes('403')) {
      return res.status(500).json({
        error: 'Gemini API key belum valid. Periksa kembali file .env.',
      });
    }

    res.status(500).json({
      error: 'Terjadi kesalahan saat menghubungkan ke Gemini. Coba lagi.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`FoodFinder AI siap di http://localhost:${PORT}`);
});
