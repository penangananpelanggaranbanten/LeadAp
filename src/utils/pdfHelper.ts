import { KategoriBerkasPerkara } from '../types/leadAp';

export interface KategoriBerkasMeta {
  id: KategoriBerkasPerkara;
  nama: string;
  singkatan: string;
  kode: string;
  deskripsi: string;
  wajib: boolean;
  pengunggahDefault: string;
}

export const KATEGORI_BERKAS_LIST: KategoriBerkasMeta[] = [
  {
    id: 'permohonan_pelapor',
    nama: 'Permohonan Pelapor',
    singkatan: 'Permohonan',
    kode: 'DOK.PERMOHONAN',
    deskripsi: 'Naskah permohonan atau laporan resmi yang diajukan oleh Pelapor, memuat identitas para pihak, uraian kronologis peristiwa dugaan pelanggaran, dan hal yang dimohonkan/petitum.',
    wajib: true,
    pengunggahDefault: 'Pelapor / Kuasa Hukum'
  },
  {
    id: 'jawaban_terlapor',
    nama: 'Jawaban Terlapor',
    singkatan: 'Jawaban',
    kode: 'DOK.JAWABAN',
    deskripsi: 'Jawaban tertulis, sanggahan, tanggapan, atau eksepsi dari Terlapor terhadap materi temuan atau laporan Pelapor yang diserahkan dalam persidangan.',
    wajib: true,
    pengunggahDefault: 'Terlapor / Kuasa Hukum'
  },
  {
    id: 'daftar_alat_bukti',
    nama: 'Daftar Alat Bukti',
    singkatan: 'Alat Bukti',
    kode: 'DOK.ALAT_BUKTI',
    deskripsi: 'Daftar rincian dan matriks alat bukti surat/tulisan (P-1 s.d P-n / T-1 s.d T-n), dokumen elektronik, rekaman, petunjuk, serta saksi yang diserahkan kepada Majelis Pemeriksa.',
    wajib: true,
    pengunggahDefault: 'Para Pihak / Panitera'
  },
  {
    id: 'ba_sumpah',
    nama: 'Berita Acara Sumpah Saksi/Ahli',
    singkatan: 'BA Sumpah',
    kode: 'ADM.BA-SUMPAH',
    deskripsi: 'Naskah berita acara resmi pengambilan sumpah atau janji saksi dan ahli di hadapan Majelis Pemeriksa sebelum memberikan keterangan dalam sidang terbuka.',
    wajib: false,
    pengunggahDefault: 'Sekretaris Pemeriksa'
  },
  {
    id: 'ba_pemeriksaan_sidang',
    nama: 'Berita Acara Pemeriksaan Sidang',
    singkatan: 'BA Sidang',
    kode: 'ADM.BA-SIDANG',
    deskripsi: 'Berita acara jalannya sidang pemeriksaan terbuka mulai dari pembacaan laporan, jawaban, pembuktian, kesimpulan, hingga sebelum pembacaan putusan.',
    wajib: true,
    pengunggahDefault: 'Perisalah / Panitera Sidang'
  }
];

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function generateSamplePdfDataUrl(
  judul: string,
  nomorRegister: string,
  kategoriNama: string,
  pelapor: string,
  terlapor: string
): string {
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const contentText = `
BAWASLU PROVINSI BANTEN
SEKRETARIAT SIDANG PELANGGARAN ADMINISTRATIF PEMILU
============================================================
DOKUMEN RESMI SIDANG: ${kategoriNama.toUpperCase()}

Nomor Register Perkara : ${nomorRegister}
Kategori Berkas        : ${kategoriNama}
Pihak Pelapor          : ${pelapor}
Pihak Terlapor         : ${terlapor}
Tanggal Pencatatan     : ${todayStr}
Rujukan Yuridis        : Peraturan Bawaslu Nomor 8 Tahun 2022
============================================================

RINGKASAN DOKUMEN ELEKTRONIK RESMI:
Dokumen ini merupakan salinan resmi elektronik berkas ${kategoriNama} yang telah terdaftar dan terverifikasi dalam Sistem Layanan e-Administrasi (Sidang) Administratif Pemilu (LeAD-AP) Bawaslu Provinsi Banten.

CATATAN RESMI MAJELIS / PANITERA:
1. Berkas diverifikasi keabsahannya oleh Panitera Sidang.
2. Naskah sah disimpan dalam repositori digital perkara ${nomorRegister}.
3. Dokumen dapat dicetak dan diunduh dalam format PDF resmi.

Ditandatangani secara elektronik oleh:
PANITERA SIDANG / SEKRETARIAT PEMERIKSA
BAWASLU PROVINSI BANTEN
============================================================
  `;

  const lines = contentText.trim().split('\n');
  let streamText = 'BT\n/F1 10 Tf\n45 790 Td\n16 TL\n';
  lines.forEach((line) => {
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    streamText += `(${escaped}) '\n`;
  });
  streamText += 'ET';

  const streamLength = streamText.length;

  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${streamLength} >> stream
${streamText}
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000300 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
${370 + streamLength}
%%EOF`;

  return 'data:application/pdf;base64,' + btoa(unescape(encodeURIComponent(pdf)));
}
