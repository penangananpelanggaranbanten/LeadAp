import { 
  StatusPerkaraKode, 
  StatusMeta, 
  HariLibur, 
  Perkara,
  KodeJenisPerkara,
  SumberPerkara,
  TingkatanBawaslu 
} from '../types/leadAp';

// Daftar Status S01 - S14 sesuai Bab V & Diagram 5
export const STATUS_PERKARA_MAP: Record<StatusPerkaraKode, StatusMeta> = {
  S01: {
    kode: 'S01',
    nama: 'Diregistrasi',
    deskripsi: 'ADM.BA-REG diunggah; nomor register terbit; timer 14 HK dimulai.',
    badgeColor: 'bg-blue-100 text-blue-800',
    badgeBorder: 'border-blue-300'
  },
  S02: {
    kode: 'S02',
    nama: 'Penetapan Majelis',
    deskripsi: 'Keputusan Ketua tentang Majelis Pemeriksa & tim pendukung disimpan.',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    badgeBorder: 'border-indigo-300'
  },
  S03: {
    kode: 'S03',
    nama: 'Panggilan Sidang',
    deskripsi: 'ADM.SPS terkirim kepada para pihak (bukti kirim tersimpan).',
    badgeColor: 'bg-cyan-100 text-cyan-800',
    badgeBorder: 'border-cyan-300'
  },
  S04: {
    kode: 'S04',
    nama: 'Sidang Pembacaan',
    deskripsi: 'Sidang pertama pembacaan Laporan/Temuan dibuka.',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    badgeBorder: 'border-emerald-300'
  },
  S05: {
    kode: 'S05',
    nama: 'Jawaban Terlapor',
    deskripsi: 'ADM.JAWABAN diterima dalam persidangan.',
    badgeColor: 'bg-teal-100 text-teal-800',
    badgeBorder: 'border-teal-300'
  },
  S06: {
    kode: 'S06',
    nama: 'Pembuktian',
    deskripsi: 'Bukti pertama disahkan (ketuk palu) atau saksi/ahli pertama disumpah.',
    badgeColor: 'bg-amber-100 text-amber-800',
    badgeBorder: 'border-amber-300'
  },
  S07: {
    kode: 'S07',
    nama: 'Kesimpulan',
    deskripsi: 'Agenda kesimpulan para pihak dibuka (lisan/tertulis).',
    badgeColor: 'bg-orange-100 text-orange-800',
    badgeBorder: 'border-orange-300'
  },
  S08: {
    kode: 'S08',
    nama: 'Musyawarah / Pleno',
    deskripsi: 'Sidang pemeriksaan ditutup, Majelis musyawarah pleno merumuskan putusan.',
    badgeColor: 'bg-purple-100 text-purple-800',
    badgeBorder: 'border-purple-300'
  },
  S09: {
    kode: 'S09',
    nama: 'Putusan Dibacakan',
    deskripsi: 'ADM.PUTUSAN diunggah dan dibacakan dalam sidang terbuka.',
    badgeColor: 'bg-rose-100 text-rose-800',
    badgeBorder: 'border-rose-300'
  },
  S10: {
    kode: 'S10',
    nama: 'Masa Koreksi',
    deskripsi: 'Masa pengajuan koreksi 3 HK (khusus putusan Prov/Kab/Kota).',
    badgeColor: 'bg-amber-100 text-amber-900',
    badgeBorder: 'border-amber-400'
  },
  S11: {
    kode: 'S11',
    nama: 'Dalam Koreksi',
    deskripsi: 'Permintaan koreksi teregistrasi di Bawaslu RI; pelaksanaan putusan ditunda.',
    badgeColor: 'bg-red-100 text-red-800',
    badgeBorder: 'border-red-300'
  },
  S12: {
    kode: 'S12',
    nama: 'Putusan Koreksi',
    deskripsi: 'ADM.PUTUSAN-KOREKSI diunggah oleh Bawaslu RI.',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800',
    badgeBorder: 'border-fuchsia-300'
  },
  S13: {
    kode: 'S13',
    nama: 'Pelaksanaan Putusan',
    deskripsi: 'Putusan berkekuatan mengikat; pengawasan pelaksanaan putusan oleh Bawaslu.',
    badgeColor: 'bg-blue-100 text-blue-900',
    badgeBorder: 'border-blue-400'
  },
  S14: {
    kode: 'S14',
    nama: 'Selesai / Minutasi',
    deskripsi: 'Hasil pengawasan pelaksanaan putusan dicatat; berkas perkara diarsipkan.',
    badgeColor: 'bg-gray-100 text-gray-800',
    badgeBorder: 'border-gray-400'
  }
};

// Tabel Hari Libur Kalender Kerja (Bawaslu)
export const DEFAULT_HARI_LIBUR: HariLibur[] = [
  { tanggal: '2028-01-01', keterangan: 'Tahun Baru Masehi', tipe: 'Libur Nasional' },
  { tanggal: '2028-02-08', keterangan: 'Isra Mikraj Nabi Muhammad SAW', tipe: 'Libur Nasional' },
  { tanggal: '2028-02-14', keterangan: 'Pemungutan Suara Pemilu 2028', tipe: 'Libur Nasional' },
  { tanggal: '2028-03-29', keterangan: 'Hari Suci Nyepi', tipe: 'Libur Nasional' },
  { tanggal: '2028-04-09', keterangan: 'Hari Raya Idul Fitri 1449 H', tipe: 'Libur Nasional' },
  { tanggal: '2028-04-10', keterangan: 'Hari Raya Idul Fitri 1449 H', tipe: 'Libur Nasional' },
  { tanggal: '2028-04-11', keterangan: 'Cuti Bersama Idul Fitri', tipe: 'Cuti Bersama' },
  { tanggal: '2028-05-01', keterangan: 'Hari Buruh Internasional', tipe: 'Libur Nasional' },
  { tanggal: '2028-05-18', keterangan: 'Kenaikan Isa Almasih', tipe: 'Libur Nasional' },
  { tanggal: '2028-06-01', keterangan: 'Hari Lahir Pancasila', tipe: 'Libur Nasional' },
  { tanggal: '2028-08-17', keterangan: 'Hari Kemerdekaan RI', tipe: 'Libur Nasional' },
  { tanggal: '2028-12-25', keterangan: 'Hari Raya Natal', tipe: 'Libur Nasional' }
];

// Romawi Converter
export function toRoman(monthNumber: number): string {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romans[monthNumber - 1] || 'I';
}

// Format Generator Nomor Register (ADM.NRL)
// Format: [No. urut]/[TM|LP|KS|TM.AC|LP.AC]/[ADM.PL|ADM.PP|ADM.TSM.PL|ADM.TSM.PP]/[BWSL|BWSL.PROV|BWSL.KOTA|BWSL.KAB|PWSL.LN]/[Kode wilayah]/[Bulan Romawi]/[Tahun]
export function generateNomorRegister(params: {
  nomorUrut: number;
  sumber: SumberPerkara | 'KS' | 'TM.AC' | 'LP.AC';
  kodeJenis: KodeJenisPerkara;
  tingkatan: TingkatanBawaslu;
  kodeWilayah: string;
  tanggal: Date;
}): string {
  const urutStr = params.nomorUrut.toString().padStart(3, '0');
  const romanMonth = toRoman(params.tanggal.getMonth() + 1);
  const year = params.tanggal.getFullYear();
  return `${urutStr}/${params.sumber}/${params.kodeJenis}/${params.tingkatan}/${params.kodeWilayah}/${romanMonth}/${year}`;
}

// Cek apakah tanggal adalah hari kerja (bukan Sabtu/Minggu dan bukan Hari Libur)
export function isHariKerja(date: Date, holidays: HariLibur[] = DEFAULT_HARI_LIBUR): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // 0 = Minggu, 6 = Sabtu
  const yyyyMmDd = date.toISOString().split('T')[0];
  const isHoliday = holidays.some((h) => h.tanggal === yyyyMmDd);
  return !isHoliday;
}

// Menghitung jumlah Hari Kerja (HK) antara dua tanggal
export function hitungHariKerjaAntara(
  startDate: Date,
  endDate: Date,
  holidays: HariLibur[] = DEFAULT_HARI_LIBUR
): number {
  if (endDate < startDate) return 0;
  let current = new Date(startDate);
  let count = 0;
  while (current <= endDate) {
    if (isHariKerja(current, holidays)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

// Menambahkan sejumlah Hari Kerja (HK) ke tanggal awal
export function tambahHariKerja(
  startDate: Date,
  hariKerjaToAdd: number,
  holidays: HariLibur[] = DEFAULT_HARI_LIBUR
): Date {
  let current = new Date(startDate);
  let added = 0;
  while (added < hariKerjaToAdd) {
    current.setDate(current.getDate() + 1);
    if (isHariKerja(current, holidays)) {
      added++;
    }
  }
  return current;
}

// Evaluasi status ambang batas 14 HK (Normal, Kuning Waspada <= 5 HK, Merah Kritis <= 2 HK)
export function getStatusTenggatHK(lamaProsesHK: number, maxHK: number = 14): {
  sisaHK: number;
  status: 'normal' | 'waspada' | 'kritis';
  label: string;
  badgeClass: string;
} {
  const sisa = Math.max(0, maxHK - lamaProsesHK);
  if (sisa <= 2) {
    return {
      sisaHK: sisa,
      status: 'kritis',
      label: `Kritis (sisa ${sisa} HK)`,
      badgeClass: 'bg-red-600 text-white font-bold animate-pulse'
    };
  } else if (sisa <= 5) {
    return {
      sisaHK: sisa,
      status: 'waspada',
      label: `Waspada (sisa ${sisa} HK)`,
      badgeClass: 'bg-amber-500 text-white font-semibold'
    };
  } else {
    return {
      sisaHK: sisa,
      status: 'normal',
      label: `Normal (sisa ${sisa} HK)`,
      badgeClass: 'bg-emerald-600 text-white'
    };
  }
}

// Validasi Aturan Bisnis (Bab IX)
export function validateBisnisPerkara(perkara: Partial<Perkara>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Aturan 3: Pilihan Terlapor
  if (perkara.jalur === 'tsm') {
    const jenisTerlapor = perkara.terlapor?.jenis;
    if (jenisTerlapor !== 'Pasangan Calon' && jenisTerlapor !== 'Calon Anggota DPR/DPD/DPRD') {
      errors.push('Pada jalur TSM, Terlapor dibatasi hanya Calon atau Pasangan Calon.');
    }
  }

  // Aturan 4: Jumlah Majelis
  if (perkara.penetapan) {
    const totalMajelis = 1 + (perkara.penetapan.anggota_majelis?.length || 0);
    if (perkara.jalur === 'tsm' && totalMajelis < 3) {
      errors.push('Majelis Pemeriksa untuk jalur TSM paling sedikit 3 orang.');
    } else if (totalMajelis < 2) {
      errors.push('Majelis Pemeriksa paling sedikit 2 orang.');
    }
  }

  // Aturan 7: Minimal 2 alat bukti sah untuk penetapan putusan
  if (perkara.status === 'S09' || perkara.putusan) {
    const buktiSah = (perkara.alat_bukti || []).filter((b) => Boolean(b.tgl_disahkan));
    if (buktiSah.length < 2) {
      errors.push('Putusan tidak dapat disimpan bila jumlah alat bukti yang disahkan kurang dari 2 alat bukti sah.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 18 Formulir Model Perbawaslu 8/2022 Daftar Referensi
export const DAFTAR_18_FORMULIR = [
  {
    kode: 'ADM.NRL',
    nama: 'Nomor Register Laporan / Temuan',
    fungsi: 'Standar penomoran register perkara resmi otomatis',
    penandaTangan: 'Sistem / Petugas Registrasi',
    tahap: 'Registrasi'
  },
  {
    kode: 'ADM.BA-REG',
    nama: 'Berita Acara Registrasi',
    fungsi: 'Pencatatan resmi penerimaan & registrasi Laporan/Temuan',
    penandaTangan: 'Petugas Registrasi',
    tahap: 'Registrasi'
  },
  {
    kode: 'ADM.SPS',
    nama: 'Surat Pemberitahuan & Panggilan Sidang',
    fungsi: 'Panggilan resmi sidang kepada Pelapor dan Terlapor',
    penandaTangan: 'Ketua Bawaslu',
    tahap: 'Panggilan Sidang'
  },
  {
    kode: 'ADM.JAWABAN',
    nama: 'Jawaban Terlapor',
    fungsi: 'Dokumen sanggahan dan bukti tanggapan Terlapor (3 rangkap)',
    penandaTangan: 'Terlapor / Kuasa',
    tahap: 'Sidang Pemeriksaan'
  },
  {
    kode: 'ADM.BA-SP',
    nama: 'Berita Acara Sidang Pemeriksaan',
    fungsi: 'Catatan resmi jalannya setiap sesi persidangan',
    penandaTangan: 'Sekretaris Pemeriksa',
    tahap: 'Sidang Pemeriksaan'
  },
  {
    kode: 'ADM.RISALAH',
    nama: 'Risalah Sidang',
    fungsi: 'Transkrip lengkap tanya-jawab dan kejadian di persidangan',
    penandaTangan: 'Perisalah',
    tahap: 'Sidang Pemeriksaan'
  },
  {
    kode: 'ADM.BA-SUMPAH',
    nama: 'Berita Acara Sumpah / Janji Saksi dan Ahli',
    fungsi: 'Pengambilan sumpah saksi atau ahli bermeterai sebelum bersaksi',
    penandaTangan: 'Saksi/Ahli & Ketua Majelis',
    tahap: 'Pembuktian'
  },
  {
    kode: 'ADM.BA-PST',
    nama: 'Berita Acara Pemeriksaan Setempat',
    fungsi: 'Pemeriksaan lokasi kejadian pelanggaran di lapangan',
    penandaTangan: 'Majelis & Sekretaris',
    tahap: 'Pembuktian'
  },
  {
    kode: 'ADM.PUTUSAN',
    nama: 'Putusan Sidang Administratif Pemilu',
    fungsi: 'Putusan final persidangan terbuka dengan paraf tiap halaman',
    penandaTangan: 'Ketua & Seluruh Anggota Majelis',
    tahap: 'Putusan'
  },
  {
    kode: 'ADM.STATUS',
    nama: 'Status Temuan / Laporan',
    fungsi: 'Publikasi resmi status penyelesaian perkara di laman terbuka',
    penandaTangan: 'Ketua Bawaslu',
    tahap: 'Pasca Putusan'
  },
  {
    kode: 'ADM.KOREKSI',
    nama: 'Permintaan Koreksi',
    fungsi: 'Pengajuan koreksi putusan Bawaslu Prov/Kab/Kota ke Bawaslu RI',
    penandaTangan: 'Pemohon / Kuasa Hukum',
    tahap: 'Koreksi'
  },
  {
    kode: 'ADM.TT-KOREKSI',
    nama: 'Tanda Terima Permintaan Koreksi',
    fungsi: 'Bukti tanda terima berkas koreksi dari pemohon',
    penandaTangan: 'Penerima & Pemohon',
    tahap: 'Koreksi'
  },
  {
    kode: 'ADM.BA-REG.KOREKSI',
    nama: 'Berita Acara Registrasi Koreksi',
    fungsi: 'Pencatatan registrasi permohonan koreksi di Bawaslu RI',
    penandaTangan: 'Petugas Register Koreksi',
    tahap: 'Koreksi'
  },
  {
    kode: 'ADM.SP-KOREKSI',
    nama: 'Pemberitahuan Permintaan Koreksi',
    fungsi: 'Pemberitahuan kepada pihak lawan atas permohonan koreksi',
    penandaTangan: 'Ketua Bawaslu RI',
    tahap: 'Koreksi'
  },
  {
    kode: 'ADM.JAWABAN-KOREKSI',
    nama: 'Jawaban atas Permintaan Koreksi',
    fungsi: 'Tanggapan pihak lawan atas dalil koreksi yang diajukan',
    penandaTangan: 'Pihak Lawan / Kuasa',
    tahap: 'Koreksi'
  },
  {
    kode: 'ADM.PUTUSAN-KOREKSI',
    nama: 'Putusan Koreksi Bawaslu RI',
    fungsi: 'Putusan koreksi menerima/menolak/tidak dapat diterima',
    penandaTangan: 'Ketua & Anggota Bawaslu RI',
    tahap: 'Koreksi'
  },
  {
    kode: 'ADM.STL-KOREKSI',
    nama: 'Status Permintaan Koreksi',
    fungsi: 'Publikasi keterbukaan status penanganan koreksi di laman',
    penandaTangan: 'Ketua Bawaslu RI',
    tahap: 'Koreksi'
  },
  {
    kode: 'ADM.ACARA CEPAT',
    nama: 'Putusan Pemeriksaan Acara Cepat',
    fungsi: 'Formulir lapangan satu layar penetapan putusan seketika',
    penandaTangan: 'Anggota Pengawas di Tempat Kejadian',
    tahap: 'Acara Cepat'
  }
];

// Tabel Kode Wilayah Bawaslu (Perbawaslu 8/2022)
export const KODE_WILAYAH_BAWASLU = [
  { kode: '00.00', nama: 'Bawaslu Republik Indonesia', level: 'Pusat' },
  { kode: '11.00', nama: 'Bawaslu Provinsi Banten', level: 'Provinsi' },
  { kode: '11.01', nama: 'Bawaslu Kabupaten Pandeglang', level: 'Kabupaten' },
  { kode: '11.02', nama: 'Bawaslu Kabupaten Lebak', level: 'Kabupaten' },
  { kode: '11.03', nama: 'Bawaslu Kabupaten Serang', level: 'Kabupaten' },
  { kode: '11.04', nama: 'Bawaslu Kota Cilegon', level: 'Kota' },
  { kode: '11.08', nama: 'Bawaslu Kabupaten Tangerang', level: 'Kabupaten' },
  { kode: '12.00', nama: 'Bawaslu Provinsi DKI Jakarta', level: 'Provinsi' },
  { kode: '12.04', nama: 'Bawaslu Kota Administrasi Jakarta Timur', level: 'Kota' },
  { kode: '12.01', nama: 'Bawaslu Kota Jakarta Pusat', level: 'Kota' },
  { kode: '12.02', nama: 'Bawaslu Kota Jakarta Utara', level: 'Kota' },
  { kode: '23.00', nama: 'Bawaslu Provinsi Kalimantan Timur', level: 'Provinsi' },
  { kode: '23.01', nama: 'Bawaslu Kota Samarinda', level: 'Kota' },
  { kode: '23.02', nama: 'Bawaslu Kota Balikpapan', level: 'Kota' },
  { kode: '31.00', nama: 'Bawaslu Provinsi Jawa Barat', level: 'Provinsi' },
  { kode: '31.01', nama: 'Bawaslu Kota Bandung', level: 'Kota' },
  { kode: '32.00', nama: 'Bawaslu Provinsi Jawa Tengah', level: 'Provinsi' },
  { kode: '33.00', nama: 'Bawaslu Provinsi Jawa Timur', level: 'Provinsi' },
  { kode: '99.01', nama: 'Panwaslu LN Kuala Lumpur', level: 'Luar Negeri' },
  { kode: '99.02', nama: 'Panwaslu LN Tokyo', level: 'Luar Negeri' },
  { kode: '99.03', nama: 'Panwaslu LN Jeddah', level: 'Luar Negeri' }
];

export const TAHAPAN_PEMILU_LIST = [
  'Pemutakhiran Data Pemilih dan Penyusunan Daftar Pemilih',
  'Pendaftaran dan Verifikasi Peserta Pemilu',
  'Penetapan Peserta Pemilu',
  'Penetapan Jumlah Kursi dan Daerah Pemilihan',
  'Pencalonan Anggota DPR, DPD, dan DPRD',
  'Pencalonan Presiden dan Wakil Presiden',
  'Masa Kampanye Pemilu',
  'Masa Tenang',
  'Pemungutan dan Penghitungan Suara (TPS)',
  'Rekapitulasi Hasil Penghitungan Suara',
  'Penetapan Hasil Pemilu'
];
