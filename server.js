import express from 'express';
import { WebSocketServer } from 'ws';
import 'dotenv/config'; // Pastikan file .env ada
import { GoogleGenerativeAI } from '@google/generative-ai'; // Hanya untuk inisialisasi dasar

const app = express();
const port = 3000;

app.use(express.static('public')); // Sajikan file statis dari folder public

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', ws => {
  console.log('Klien terhubung melalui WebSocket');

  // **CATATAN PENTING:**
  // Integrasi langsung dengan Gemini Live API di Node.js menggunakan WebSocket
  // membutuhkan implementasi yang lebih kompleks. Contoh ini hanya menunjukkan
  // cara dasar WebSocket. Untuk integrasi penuh, Anda harus mengikuti
  // dokumentasi Gemini Live API secara rinci.
  // Lihat contoh dari Google di:
  // https://github.com/GoogleCloudPlatform/generative-ai/tree/main/gemini/multimodal-live-api/websocket-demo-app

  ws.on('message', message => {
    // Di sini, aliran audio dan video akan diproses
    // dari klien. Data ini kemudian akan diteruskan ke Gemini Live API.
    // Respons dari Gemini akan dikirim kembali ke klien.
    // Untuk tujuan demonstrasi ini, kita akan melakukan echo sederhana.
    console.log('Menerima pesan dari klien:', message.toString());
    ws.send(`Echo: ${message.toString()}`);
  });

  ws.on('close', () => {
    console.log('Klien terputus');
  });

  ws.on('error', error => {
    console.error('Terjadi kesalahan WebSocket:', error);
  });
});

app.listen(port, () => {
  console.log(`Server HTTP berjalan di http://localhost:${port}`);
  console.log(`Server WebSocket berjalan di ws://localhost:3001`);
});
