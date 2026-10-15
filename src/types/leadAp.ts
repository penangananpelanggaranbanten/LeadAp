/**
 * Tipe Data dan Struktur Model LeAD-AP Bawaslu
 * Sesuai Dokumen Perancangan LeAD-AP & Perbawaslu Nomor 8 Tahun 2022
 */

export type UserRole = 'publik' | 'admin';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  perkara_id?: string;
  kode_formulir?: string;
}

export interface AdminCredential {
  username: string;
  passwordHash: string; // Plain/simple hash for admin credential
  fullName: string;
  lastLogin?: string;
}

export type JalurPenyelesaian =
  | 'biasa'         // Jalur Pemeriksaan Biasa (Ps. 4-39)
  | 'acara_cepat'   // Jalur Pemeriksaan Acara Cepat (Ps. 40-43)
  | 'koreksi'       // Jalur Koreksi ke Bawaslu RI (Ps. 44-54)
  | 'tsm';          // Jalur Pelanggaran TSM oleh Bawaslu RI (Ps. 55-71)

export type SumberPerkara = 'TM' | 'LP'; // Temuan | Laporan

export type KodeJenisPerkara =
  | 'ADM.PL'        // Pelanggaran Administratif Pemilu (Temuan/Laporan Pemilu Legislatif / Umum)
  | 'ADM.PP'        // Pelanggaran Administratif Pemilihan Presiden
  | 'ADM.TSM.PL'    // Pelanggaran TSM Pemilu Legislatif
  | 'ADM.TSM.PP'    // Pelanggaran TSM Pemilihan Presiden
  | 'TM.AC'         // Temuan Acara Cepat
  | 'LP.AC'         // Laporan Acara Cepat
  | 'KS';           // Permintaan Koreksi

export type TingkatanBawaslu =
  | 'BWSL'          // Bawaslu RI
  | 'BWSL.PROV'     // Bawaslu Provinsi
  | 'BWSL.KOTA'     // Bawaslu Kota
  | 'BWSL.KAB'      // Bawaslu Kabupaten
  | 'PWSL.LN';      // Panwaslu Luar Negeri

export type StatusPerkaraKode =
  | 'S01' // Diregistrasi
  | 'S02' // Penetapan Majelis
  | 'S03' // Panggilan Sidang
  | 'S04' // Sidang Pembacaan Laporan/Temuan
  | 'S05' // Jawaban Terlapor
  | 'S06' // Pembuktian
  | 'S07' // Kesimpulan
  | 'S08' // Musyawarah / Pleno
  | 'S09' // Putusan Dibacakan
  | 'S10' // Masa Koreksi (3 HK)
  | 'S11' // Dalam Koreksi
  | 'S12' // Putusan Koreksi
  | 'S13' // Pelaksanaan Putusan
  | 'S14';// Selesai / Minutasi

export interface StatusMeta {
  kode: StatusPerkaraKode;
  nama: string;
  deskripsi: string;
  badgeColor: string;
  badgeBorder: string;
}

export interface Pihak {
  id: string;
  perkara_id: string;
  peran: 'Pelapor' | 'Penemu' | 'Terlapor' | 'Kuasa Pelapor' | 'Kuasa Terlapor';
  jenis: 'Perorangan' | 'Partai Politik' | 'Pasangan Calon' | 'Calon Anggota DPR/DPD/DPRD' | 'Tim Kampanye' | 'Penyelenggara Pemilu (KPU)' | 'Bawaslu Bawahan' | 'Pemantau Pemilu';
  nama: string;
  alamat?: string;
  kontak?: string;
  nomor_identitas?: string;
  dasar_kuasa?: string;
  flag_disamarkan?: boolean; // Untuk perlindungan data pribadi publik (UU 27/2022)
}

export interface PenetapanMajelis {
  perkara_id: string;
  nomor_keputusan: string;
  tanggal_keputusan: string;
  ketua_majelis: string;
  anggota_majelis: string[];
  sekretaris_pemeriksa: string;
  asisten_pemeriksa: string;
  perisalah: string;
  juru_sumpah?: string;
}

export type StatusSidang = 'Terjadwal' | 'Sedang Berlangsung' | 'Terlaksana' | 'Ditunda';

export interface JadwalSidang {
  id: string;
  perkara_id: string;
  ke: number;
  tanggal: string; // YYYY-MM-DD
  jam: string;     // cth: "09:00 WIB"
  agenda: string;  // cth: "Pembacaan Laporan/Temuan", "Jawaban Terlapor", "Pembuktian", "Kesimpulan", "Pembacaan Putusan"
  mode: 'Luring' | 'Daring';
  lokasi_atau_tautan: string;
  status: StatusSidang;
  alasan_ditunda?: string;
  jumlah_pemberitahuan: number; // 1 atau 2 (Pasal 20)
  tautan_siaran?: string;       // Link Bawaslu TV / YouTube streaming
  batas_kirim_sps?: string;     // Minimal 1 HK sebelum sidang
  hadir_pelapor?: boolean;
  hadir_terlapor?: boolean;
  catatan_sidang?: string;
}

export interface AlatBukti {
  id: string;
  perkara_id: string;
  kode: string; // cth: P-1, P-2, T-1, T-2
  pengaju: 'Pelapor' | 'Penemu' | 'Terlapor';
  bentuk: 'Surat' | 'Dokumen Elektronik' | 'Media Simpan / Flashdisk' | 'Barang Bukti Fisik';
  asli_salinan: 'Asli' | 'Salinan Legalisir' | 'Fotokopi' | 'Tangkapan Layar Digital';
  uraian: string;
  tgl_disahkan?: string;
  disahkan_oleh?: string;
  berkas_url?: string;
  berkas_nama?: string;
  berkas_tipe?: string;
}

export interface KeteranganSaksiAhli {
  id: string;
  perkara_id: string;
  jenis: 'Saksi' | 'Ahli' | 'Pihak Terkait' | 'Lembaga Terkait' | 'Investigator';
  nama: string;
  pengaju: 'Pelapor' | 'Penemu' | 'Terlapor' | 'Inisiatif Majelis';
  sumpah: boolean; // Wajib ADM.BA-SUMPAH (Pasal 31)
  agama_sumpah?: 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  ringkasan: string;
  surat_tugas?: string;
}

export interface DokumenModel {
  id: string;
  perkara_id: string;
  kode_formulir: string; // cth: ADM.BA-REG, ADM.SPS, ADM.BA-SP, ADM.PUTUSAN
  nama_formulir: string;
  nomor: string;
  tanggal: string;
  penanda_tangan: string;
  status_publikasi: 'Publik' | 'Internal';
  berkas_url?: string;
}

export type KategoriBerkasPerkara = 
  | 'permohonan_pelapor'
  | 'jawaban_terlapor'
  | 'daftar_alat_bukti'
  | 'ba_sumpah'
  | 'ba_pemeriksaan_sidang';

export interface BerkasDokumenPerkara {
  id: string;
  perkara_id: string;
  kategori: KategoriBerkasPerkara;
  nama_kategori: string;
  nama_file: string;
  ukuran_bytes?: number;
  ukuran_file?: string;
  tipe_file: string; // 'application/pdf'
  data_url: string; // base64 / blob URL
  tgl_upload: string;
  pengunggah: string;
  keterangan?: string;
}

export interface PutusanPerkara {
  perkara_id: string;
  nomor_putusan: string;
  tgl_pleno: string;
  tgl_dibacakan: string;
  amar: 'Terbukti' | 'Tidak Terbukti';
  amar_ringkas: string;
  amar_lengkap: string;
  sanksi?: string[]; // cth: Teguran Tertulis, Perbaikan Tata Cara, Pembatalan Calon
  tgl_salinan?: string;
  tgl_publikasi?: string;
  unduhan_url?: string;
  pdf_nama?: string;
  pdf_data_url?: string;
}

export interface PermintaanKoreksi {
  id: string;
  perkara_id: string;
  nomor_KS: string;
  pemohon: 'Pelapor' | 'Terlapor' | 'Keduanya';
  nama_pemohon: string;
  tgl_diajukan: string;
  tgl_register: string;
  tgl_pemberitahuan?: string;
  tgl_jawaban?: string;
  alasan_koreksi: string; // Terbatas pada kesalahan penerapan hukum (Pasal 44)
  amar_koreksi?: 'Menerima (Membatalkan Putusan)' | 'Menolak (Menguatkan Putusan)' | 'Tidak Dapat Diterima';
  tgl_putusan_koreksi?: string;
  nomor_putusan_koreksi?: string;
  status_penundaan_eksekusi: boolean; // Ps. 54: Pelaksanaan putusan ditunda selama koreksi
}

export interface RiwayatPerkara {
  id: string;
  perkara_id: string;
  waktu: string;
  tahapan: string;
  proses: string;
  pengguna: string;
  peran: string;
  dokumen_id?: string;
  dokumen_nama?: string;
}

export interface Perkara {
  id: string;
  nomor_register: string;
  jalur: JalurPenyelesaian;
  sumber: SumberPerkara;
  kode_jenis: KodeJenisPerkara;
  tingkatan: TingkatanBawaslu;
  kode_wilayah: string;
  nama_wilayah: string;
  tahapan_pemilu: string;
  tgl_peristiwa: string;
  tgl_registrasi: string;
  batas_putusan: string; // Maksimal 14 HK sejak registrasi
  lama_proses_hk: number; // Hari kerja berjalan dari 14 HK
  sisa_hk: number;
  status: StatusPerkaraKode;
  mode_sidang: 'Luring' | 'Daring';
  alasan_daring?: string; // Sesuai Pasal 35 ayat (2)
  flag_pasca_penetapan_hasil?: boolean;
  flag_PHPU_MK?: boolean; // Pasal 12
  pokok_laporan: string;
  hal_dimohonkan: string;
  pelapor: Pihak;
  terlapor: Pihak;
  kuasa_pelapor?: Pihak;
  kuasa_terlapor?: Pihak;
  penetapan?: PenetapanMajelis;
  jadwal_sidang: JadwalSidang[];
  alat_bukti: AlatBukti[];
  keterangan: KeteranganSaksiAhli[];
  dokumen: DokumenModel[];
  berkas_dokumen?: BerkasDokumenPerkara[];
  putusan?: PutusanPerkara;
  koreksi?: PermintaanKoreksi;
  riwayat: RiwayatPerkara[];
}

export interface FormModelTemplate {
  kode: string;
  nama: string;
  deskripsi: string;
  penanda_tangan: string;
  dasar_hukum: string;
  kategori: 'Pemeriksaan Biasa' | 'Acara Cepat' | 'Koreksi' | 'Pembuktian & Sumpah';
}

export interface HariLibur {
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
  tipe: 'Libur Nasional' | 'Cuti Bersama';
}

export interface TaskItem {
  id: string;
  perkara_id: string;
  nomor_register: string;
  judul: string;
  deskripsi: string;
  target_role: UserRole;
  tenggat_waktu: string;
  prioritas: 'Normal' | 'Penting' | 'Kritis';
  status_tugas: 'Menunggu' | 'Selesai';
  action_type: 'tetapkan_majelis' | 'siapkan_sps' | 'upload_ba_sp' | 'upload_risalah' | 'draf_putusan' | 'kirim_salinan' | 'buka_sidang' | 'koreksi';
}

export type FormulirAkses =
  | 'Publik'
  | 'Admin'
  | 'Admin / Publik (untuk view putusan)'
  | 'Admin / Publik (untuk view status)';

export interface FormulirDraftFile {
  namaFile: string;
  ukuran?: string;
  tipe?: string; // 'docx' | 'doc' | 'pdf' | 'txt'
  tglUpload: string;
  uploadedBy: string;
  catatan?: string;
  driveFileId?: string;
  driveUrl?: string;
  dataUrl?: string; // base64 data url for direct download
}

export interface FormulirMaster {
  no: number;
  kode: string;
  perihal: string;
  rujukan: string;
  keterangan: FormulirAkses;
  draftFile?: FormulirDraftFile;
}
