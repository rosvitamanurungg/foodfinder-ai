# FoodFinder AI 🍴

Chatbot rekomendasi makanan berbasis Gemini AI menggunakan Node.js, Express, dan Vanilla JavaScript.

## 1. Persiapan

Pastikan Node.js v18+ sudah terpasang.

## 2. Install dependency

```bash
npm install
```

## 3. Buat file `.env`

Salin `.env.example` menjadi `.env`, lalu isi API key Gemini:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Jangan upload `.env` ke GitHub.

## 4. Jalankan aplikasi

```bash
node index.js
```

Buka:

http://localhost:3000

## Konfigurasi Gemini

Model: `gemini-2.5-flash`

Parameter:
- temperature: 0.7
- topP: 0.9
- topK: 40

System instruction digunakan untuk membentuk persona FoodFinder AI dan membatasi chatbot pada rekomendasi makanan.
