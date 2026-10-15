import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API endpoint for Gemini-powered Legal Analysis with ThinkingLevel.HIGH
  app.post('/api/ai/analyze-case', async (req, res) => {
    try {
      const { caseData, analysisType, query } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY belum dikonfigurasi pada environment server.' 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Anda adalah Asisten Hakim Pemeriksa & Analis Hukum Sidang Administratif Pemilu Badan Pengawas Pemilihan Umum (Bawaslu) Republik Indonesia. Anda bertugas memberikan telaah hukum komprehensif berlandaskan:
1. UU No. 7 Tahun 2017 tentang Pemilu (khususnya Pasal 460 s.d. 465).
2. Peraturan Bawaslu Nomor 8 Tahun 2022 tentang Penyelesaian Pelanggaran Administratif Pemilu.
3. Standar Operasional Prosedur Persidangan dan Draft Panduan Sidang Administratif Pemilu Bawaslu.

DATA PERKARA:
Nomor Register: ${caseData?.nomor_register || '-'}
Jalur: ${caseData?.jalur || '-'}
Sumber: ${caseData?.sumber === 'TM' ? 'Temuan Pengawas' : 'Laporan Masyarakat'}
Tahapan Pemilu: ${caseData?.tahapan_pemilu || '-'}
Tingkatan: ${caseData?.tingkatan || '-'}
Pelapor / Penemu: ${caseData?.pelapor?.nama || '-'}
Terlapor: ${caseData?.terlapor?.nama || '-'} (${caseData?.terlapor?.jenis || '-'})
Pokok Laporan / Temuan: ${caseData?.pokok_laporan || '-'}
Hal yang Dimohonkan (Petitum): ${caseData?.hal_dimohonkan || '-'}
Status Perkara: ${caseData?.status || '-'}
Lama Proses: ${caseData?.lama_proses_hk || 0}/14 HK

Daftar Alat Bukti yang Diajukan:
${caseData?.alat_bukti?.map((b: any) => `- [${b.kode}] ${b.pengaju}: ${b.uraian} (Bentuk: ${b.bentuk}, Status Keaslian: ${b.asli_salinan}, Pengesahan Majelis: ${b.tgl_disahkan ? 'Disahkan ' + b.tgl_disahkan : 'Belum disahkan'})`).join('\n') || 'Belum ada bukti'}

Keterangan Saksi / Ahli:
${caseData?.keterangan?.map((k: any) => `- [${k.jenis.toUpperCase()}] ${k.nama} (Diajukan oleh: ${k.pengaju}, Sumpah: ${k.sumpah ? 'Sudah disumpah ADM.BA-SUMPAH' : 'Belum'}, Keterangan ringkas: ${k.ringkasan})`).join('\n') || 'Belum ada saksi/ahli'}

JENIS ANALISIS: ${analysisType || 'TELAAH YURIDIS LENGKAP & REKOMENDASI PUTUSAN'}
PERTANYAAN / FOKUS KHUSUS: ${query || 'Lakukan pengujian yuridis menyeluruh: (1) Kecukupan minimal 2 alat bukti sah sesuai Pasal 36 ayat (2), (2) Pemenuhan unsur pelanggaran tata cara/prosedur administratif Pemilu, (3) Analisis pembuktian pihak Terlapor vs Pelapor, (4) Rekomendasi Amar Putusan (Terbukti / Tidak Terbukti) beserta sanksi yang berkesesuaian dengan Pasal 37 ayat (2), dan (5) Rumusan pertimbangan hukum (Ratio Decidendi).'}

Tuliskan analisis dengan gaya bahasa putusan majelis peradilan yang terstruktur, elegan, profesional, obyektif, dan mengikat secara hukum!`;

      // Must use gemini-3.1-pro-preview with thinkingLevel: ThinkingLevel.HIGH and no maxOutputTokens
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
          systemInstruction: 'Anda adalah Majelis Pemeriksa Senior Bawaslu RI yang ahli dalam penalaran hukum persidangan administratif pemilu berstandar SIPP peradilan modern.',
        },
      });

      res.json({
        analysis: response.text,
        model: 'gemini-3.1-pro-preview',
        thinkingLevel: 'HIGH',
      });
    } catch (err: any) {
      console.error('Gemini Analysis Error:', err);
      res.status(500).json({ 
        error: err.message || 'Terjadi kesalahan saat memproses analisis hukum AI.' 
      });
    }
  });

  // ========================================================
  // GOOGLE ECOSYSTEM PROXY ENDPOINTS (Sheets, Script, Drive)
  // ========================================================
  const OFFICIAL_GAS_URL = 'https://script.google.com/macros/s/AKfycbxQdPf4Jla7Wdn_4Yt6Yjf9iAJGJY0G12-yXIY1KRcmVJWU08wFU2infFJjX_cnwFKs/exec';

  // 1. Verifikasi Admin langsung terhadap Google Apps Script / Google Sheets
  app.post('/api/google-ecosystem/verify-admin', async (req, res) => {
    try {
      const { gasUrl, username, password } = req.body;
      const targetUrl = gasUrl || OFFICIAL_GAS_URL;

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyAdmin',
          username,
          password
        }),
        redirect: 'follow'
      });

      if (!response.ok) {
        return res.status(502).json({ success: false, message: 'Gagal menghubungi Google Apps Script Web App.' });
      }

      const result = await response.json();
      res.json(result);
    } catch (err: any) {
      console.error('Verify Admin Error:', err);
      res.status(500).json({ success: false, message: err.message || 'Kesalahan koneksi ke Google Spreadsheet.' });
    }
  });

  // 2. Ambil seluruh data dari Google Spreadsheet via GAS
  app.get('/api/google-ecosystem/get-data', async (req, res) => {
    try {
      const gasUrl = (req.query.gasUrl as string) || OFFICIAL_GAS_URL;

      const response = await fetch(`${gasUrl}?action=getData`, {
        method: 'GET',
        redirect: 'follow'
      });

      if (!response.ok) {
        return res.status(502).json({ status: 'error', message: 'Gagal mengambil data dari Google Apps Script.' });
      }

      const result = await response.json();
      res.json(result);
    } catch (err: any) {
      console.error('Get Data Error:', err);
      res.status(500).json({ status: 'error', message: err.message || 'Gagal terhubung ke Google Spreadsheet.' });
    }
  });

  // 3. Sinkronisasi Seluruh Perkara ke Google Spreadsheet
  app.post('/api/google-ecosystem/sync-all', async (req, res) => {
    try {
      const { gasUrl, perkaraList, tasks } = req.body;
      const targetUrl = gasUrl || OFFICIAL_GAS_URL;

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'syncAll',
          perkaraList,
          tasks
        }),
        redirect: 'follow'
      });

      if (!response.ok) {
        return res.status(502).json({ status: 'error', message: 'Gagal sinkronisasi ke Google Apps Script.' });
      }

      const result = await response.json();
      res.json(result);
    } catch (err: any) {
      console.error('Sync All Error:', err);
      res.status(500).json({ status: 'error', message: err.message || 'Gagal sinkronisasi ke Google Spreadsheet.' });
    }
  });

  // 4. Upload File ke Google Drive via GAS
  app.post('/api/google-ecosystem/upload-file', async (req, res) => {
    try {
      const { gasUrl, fileName, mimeType, base64Data, folderCategory, nomorRegister, keterangan } = req.body;
      const targetUrl = gasUrl || OFFICIAL_GAS_URL;

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'uploadFile',
          fileName,
          mimeType,
          base64Data,
          folderCategory,
          nomorRegister,
          keterangan
        }),
        redirect: 'follow'
      });

      if (!response.ok) {
        return res.status(502).json({ success: false, message: 'Gagal mengunggah ke Google Drive via Apps Script.' });
      }

      const result = await response.json();
      res.json(result);
    } catch (err: any) {
      console.error('Upload File Error:', err);
      res.status(500).json({ success: false, message: err.message || 'Gagal mengunggah file ke Google Drive.' });
    }
  });

  // Handle Vite in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`[LeAD-AP Bawaslu Server] Running on http://localhost:${port}`);
  });
}

startServer();
