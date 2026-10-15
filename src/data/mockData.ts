import { Perkara, TaskItem } from '../types/leadAp';

export const INITIAL_PERKARA_DATA: Perkara[] = [
  {
    id: 'perkara-005',
    nomor_register: '005/LP/ADM.PL/BWSL.PROV/11.00/X/2028',
    jalur: 'biasa',
    sumber: 'LP',
    kode_jenis: 'ADM.PL',
    tingkatan: 'BWSL.PROV',
    kode_wilayah: '11.00',
    nama_wilayah: 'Bawaslu Provinsi Banten',
    tahapan_pemilu: 'Pencalonan Anggota DPR, DPD, dan DPRD',
    tgl_peristiwa: '2028-09-28',
    tgl_registrasi: '2028-10-02',
    batas_putusan: '2028-10-20',
    lama_proses_hk: 5,
    sisa_hk: 9,
    status: 'S06', // Pembuktian
    mode_sidang: 'Luring',
    pokok_laporan: 'Dugaan pelanggaran tata cara/prosedur penetapan Daftar Calon Tetap (DCT) Anggota DPRD tanpa memverifikasi keabsahan surat pengunduran diri dari jabatan BUMD.',
    hal_dimohonkan: '1. Menyatakan Terlapor terbukti secara sah dan meyakinkan melakukan pelanggaran administratif Pemilu. 2. Memerintahkan KPU untuk membatalkan penetapan calon terkait.',
    pelapor: {
      id: 'p-01',
      perkara_id: 'perkara-005',
      peran: 'Pelapor',
      jenis: 'Perorangan',
      nama: 'H. Ahmad Fauzi, S.H.',
      alamat: 'Jl. Ahmad Yani No. 45, Kota Serang',
      kontak: '0812-9876-5432',
      nomor_identitas: '3671012908810003',
      flag_disamarkan: true
    },
    terlapor: {
      id: 't-01',
      perkara_id: 'perkara-005',
      peran: 'Terlapor',
      jenis: 'Penyelenggara Pemilu (KPU)',
      nama: 'KPU Kabupaten Serang',
      alamat: 'Jl. Raya Petir No. 12, Serang',
      kontak: '0254-201999'
    },
    kuasa_pelapor: {
      id: 'kp-01',
      perkara_id: 'perkara-005',
      peran: 'Kuasa Pelapor',
      jenis: 'Perorangan',
      nama: 'Advokat M. Ridwan, S.H., M.H.',
      alamat: 'Kantor Advokat Ridwan & Partners, Serang',
      dasar_kuasa: 'Surat Kuasa Khusus No. 12/SKK/IX/2028 tertanggal 30 September 2028'
    },
    penetapan: {
      perkara_id: 'perkara-005',
      nomor_keputusan: '014/KEP/BWSL-PROV-11/X/2028',
      tanggal_keputusan: '2028-10-02',
      ketua_majelis: 'Drs. H. Didih M. Sudi, M.Si',
      anggota_majelis: ['Ade Mongkito, S.H.', 'Bahrul Ulum, S.Ag', 'Nurkhayat Santosa, S.Pd'],
      sekretaris_pemeriksa: 'Rina Karlina, S.Sos',
      asisten_pemeriksa: 'Danial Al-Faruq, S.H.',
      perisalah: 'Siti Rohmah, S.I.Kom',
      juru_sumpah: 'M. Yusuf, S.Ag'
    },
    jadwal_sidang: [
      {
        id: 'js-01',
        perkara_id: 'perkara-005',
        ke: 1,
        tanggal: '2028-10-05',
        jam: '09:00 WIB',
        agenda: 'Pembacaan Laporan/Temuan',
        mode: 'Luring',
        lokasi_atau_tautan: 'Ruang Sidang Utama Bawaslu Provinsi Banten',
        status: 'Terlaksana',
        jumlah_pemberitahuan: 1,
        tautan_siaran: 'https://youtube.com/live/bawaslu-banten-sidang005-1',
        hadir_pelapor: true,
        hadir_terlapor: true,
        catatan_sidang: 'Pelapor membacakan materi pokok laporan tanpa perubahan substansi.'
      },
      {
        id: 'js-02',
        perkara_id: 'perkara-005',
        ke: 2,
        tanggal: '2028-10-06',
        jam: '13:00 WIB',
        agenda: 'Jawaban Terlapor',
        mode: 'Luring',
        lokasi_atau_tautan: 'Ruang Sidang Utama Bawaslu Provinsi Banten',
        status: 'Ditunda',
        alasan_ditunda: 'Terlapor tidak hadir; diterbitkan pemberitahuan panggilan ke-2.',
        jumlah_pemberitahuan: 2,
        hadir_pelapor: true,
        hadir_terlapor: false
      },
      {
        id: 'js-03',
        perkara_id: 'perkara-005',
        ke: 3,
        tanggal: '2028-10-09',
        jam: '09:00 WIB',
        agenda: 'Jawaban Terlapor & Pembuktian',
        mode: 'Luring',
        lokasi_atau_tautan: 'Ruang Sidang Utama Bawaslu Provinsi Banten',
        status: 'Terlaksana',
        jumlah_pemberitahuan: 2,
        tautan_siaran: 'https://youtube.com/live/bawaslu-banten-sidang005-3',
        hadir_pelapor: true,
        hadir_terlapor: true,
        catatan_sidang: 'Terlapor menyerahkan jawaban 3 rangkap. Pengesahan alat bukti P-1 s.d. P-6 dan T-1 s.d. T-4.'
      },
      {
        id: 'js-04',
        perkara_id: 'perkara-005',
        ke: 4,
        tanggal: '2028-10-11',
        jam: '09:00 WIB',
        agenda: 'Pemeriksaan Saksi / Ahli & Kesimpulan',
        mode: 'Luring',
        lokasi_atau_tautan: 'Ruang Sidang Utama Bawaslu Provinsi Banten',
        status: 'Terjadwal',
        jumlah_pemberitahuan: 1,
        batas_kirim_sps: '2028-10-09',
        tautan_siaran: 'https://youtube.com/live/bawaslu-banten-sidang005-4'
      }
    ],
    alat_bukti: [
      {
        id: 'ab-01',
        perkara_id: 'perkara-005',
        kode: 'P-1',
        pengaju: 'Pelapor',
        bentuk: 'Surat',
        asli_salinan: 'Salinan Legalisir',
        uraian: 'Salinan Keputusan KPU No. 89/2028 tentang Penetapan Daftar Calon Tetap.',
        tgl_disahkan: '2028-10-09',
        disahkan_oleh: 'Ketua Majelis'
      },
      {
        id: 'ab-02',
        perkara_id: 'perkara-005',
        kode: 'P-2',
        pengaju: 'Pelapor',
        bentuk: 'Surat',
        asli_salinan: 'Asli',
        uraian: 'Surat Keterangan Direksi BUMD tertanggal 15 September 2028 yang menerangkan Calon masih aktif menerima gaji.',
        tgl_disahkan: '2028-10-09',
        disahkan_oleh: 'Ketua Majelis'
      },
      {
        id: 'ab-03',
        perkara_id: 'perkara-005',
        kode: 'P-3',
        pengaju: 'Pelapor',
        bentuk: 'Media Simpan / Flashdisk',
        asli_salinan: 'Tangkapan Layar Digital',
        uraian: 'Rekaman video rapat pleno klarifikasi KPU dan berkas digital Silon.',
        tgl_disahkan: '2028-10-09',
        disahkan_oleh: 'Ketua Majelis'
      },
      {
        id: 'ab-04',
        perkara_id: 'perkara-005',
        kode: 'T-1',
        pengaju: 'Terlapor',
        bentuk: 'Surat',
        asli_salinan: 'Salinan Legalisir',
        uraian: 'Tanda terima berkas pendaftaran calon dari aplikasi SILON KPU.',
        tgl_disahkan: '2028-10-09',
        disahkan_oleh: 'Ketua Majelis'
      },
      {
        id: 'ab-05',
        perkara_id: 'perkara-005',
        kode: 'T-2',
        pengaju: 'Terlapor',
        bentuk: 'Surat',
        asli_salinan: 'Fotokopi',
        uraian: 'Berita Acara Verifikasi Administrasi Dokumen Persyaratan Bakal Calon.',
        tgl_disahkan: '2028-10-09',
        disahkan_oleh: 'Ketua Majelis'
      }
    ],
    keterangan: [
      {
        id: 'sak-01',
        perkara_id: 'perkara-005',
        jenis: 'Saksi',
        nama: 'Wahyu Ramadhan',
        pengaju: 'Pelapor',
        sumpah: true,
        agama_sumpah: 'Islam',
        ringkasan: 'Menerangkan bahwa hingga tanggal penetapan DCT, calon masih bertindak selaku Kepala Divisi di BUMD Aneka Usaha.'
      },
      {
        id: 'sak-02',
        perkara_id: 'perkara-005',
        jenis: 'Ahli',
        nama: 'Dr. Hendra Gunawan, S.H., M.Hum',
        pengaju: 'Pelapor',
        sumpah: true,
        agama_sumpah: 'Islam',
        ringkasan: 'Menjelaskan ratio legis kewajiban pengunduran diri bagi pejabat/pegawai BUMD dalam rangka netralitas dan tertib administrasi Pemilu.'
      }
    ],
    dokumen: [
      {
        id: 'dok-01',
        perkara_id: 'perkara-005',
        kode_formulir: 'ADM.NRL',
        nama_formulir: 'Format Penomoran Register',
        nomor: '005/LP/ADM.PL/BWSL.PROV/11.00/X/2028',
        tanggal: '2028-10-02',
        penanda_tangan: 'Petugas Registrasi',
        status_publikasi: 'Publik'
      },
      {
        id: 'dok-02',
        perkara_id: 'perkara-005',
        kode_formulir: 'ADM.BA-REG',
        nama_formulir: 'Berita Acara Registrasi',
        nomor: '005/BA-REG/ADM/X/2028',
        tanggal: '2028-10-02',
        penanda_tangan: 'Fajar Nugraha (Petugas Register)',
        status_publikasi: 'Publik'
      },
      {
        id: 'dok-03',
        perkara_id: 'perkara-005',
        kode_formulir: 'ADM.SPS',
        nama_formulir: 'Surat Panggilan Sidang',
        nomor: '018/SPS/BWSL-PROV-11/X/2028',
        tanggal: '2028-10-03',
        penanda_tangan: 'Drs. H. Didih M. Sudi, M.Si (Ketua)',
        status_publikasi: 'Publik'
      },
      {
        id: 'dok-04',
        perkara_id: 'perkara-005',
        kode_formulir: 'ADM.BA-SP',
        nama_formulir: 'Berita Acara Sidang Pemeriksaan 1 & 3',
        nomor: '005/BA-SP/ADM/X/2028',
        tanggal: '2028-10-09',
        penanda_tangan: 'Rina Karlina, S.Sos (Sekretaris)',
        status_publikasi: 'Internal'
      },
      {
        id: 'dok-05',
        perkara_id: 'perkara-005',
        kode_formulir: 'ADM.BA-SUMPAH',
        nama_formulir: 'Berita Acara Sumpah Saksi & Ahli',
        nomor: '005/BA-SUMPAH/X/2028',
        tanggal: '2028-10-09',
        penanda_tangan: 'Ketua Majelis & Para Saksi/Ahli',
        status_publikasi: 'Publik'
      }
    ],
    riwayat: [
      {
        id: 'rw-01',
        perkara_id: 'perkara-005',
        waktu: '2028-10-02 09:30 WIB',
        tahapan: 'Registrasi',
        proses: 'Laporan diregistrasi; nomor register resmi 005/LP/ADM.PL/BWSL.PROV/11.00/X/2028 terbit.',
        pengguna: 'Fajar Nugraha',
        peran: 'Petugas Registrasi',
        dokumen_nama: 'ADM.BA-REG'
      },
      {
        id: 'rw-02',
        perkara_id: 'perkara-005',
        waktu: '2028-10-02 14:00 WIB',
        tahapan: 'Penetapan',
        proses: 'Penetapan Majelis Pemeriksa, Sekretaris, Asisten, dan Perisalah oleh Ketua Bawaslu.',
        pengguna: 'Drs. H. Didih M. Sudi, M.Si',
        peran: 'Ketua Bawaslu',
        dokumen_nama: 'SK Majelis Pemeriksa'
      },
      {
        id: 'rw-03',
        perkara_id: 'perkara-005',
        waktu: '2028-10-03 10:15 WIB',
        tahapan: 'Panggilan Sidang',
        proses: 'Pemberitahuan dan panggilan sidang pertama dikirimkan kepada Pelapor dan Terlapor.',
        pengguna: 'Rina Karlina, S.Sos',
        peran: 'Sekretaris Pemeriksa',
        dokumen_nama: 'ADM.SPS'
      },
      {
        id: 'rw-04',
        perkara_id: 'perkara-005',
        waktu: '2028-10-05 11:30 WIB',
        tahapan: 'Sidang Pemeriksaan',
        proses: 'Sidang 1: Pembacaan Pokok Laporan oleh Pelapor didampingi Kuasa Hukum.',
        pengguna: 'Siti Rohmah, S.I.Kom',
        peran: 'Perisalah',
        dokumen_nama: 'ADM.BA-SP & ADM.RISALAH'
      },
      {
        id: 'rw-05',
        perkara_id: 'perkara-005',
        waktu: '2028-10-09 12:45 WIB',
        tahapan: 'Sidang Pembuktian',
        proses: 'Sidang 3: Pembacaan Jawaban Terlapor; Pengesahan bukti P-1 s.d. P-3 dan T-1 s.d. T-2; Pengambilan sumpah saksi dan ahli.',
        pengguna: 'Rina Karlina, S.Sos',
        peran: 'Sekretaris Pemeriksa',
        dokumen_nama: 'ADM.JAWABAN & ADM.BA-SUMPAH'
      }
    ]
  },
  {
    id: 'perkara-004',
    nomor_register: '004/TM/ADM.PL/BWSL.PROV/11.00/IX/2028',
    jalur: 'biasa',
    sumber: 'TM',
    kode_jenis: 'ADM.PL',
    tingkatan: 'BWSL.PROV',
    kode_wilayah: '11.00',
    nama_wilayah: 'Bawaslu Provinsi Banten',
    tahapan_pemilu: 'Pencalonan Anggota DPR, DPD, dan DPRD',
    tgl_peristiwa: '2028-09-20',
    tgl_registrasi: '2028-09-25',
    batas_putusan: '2028-10-13',
    lama_proses_hk: 11,
    sisa_hk: 3,
    status: 'S07', // Kesimpulan
    mode_sidang: 'Luring',
    pokok_laporan: 'Temuan Pengawas Pemilu mengenai manipulasi dokumen ijazah yang digunakan oleh bakal calon legislatif Partai Politik X.',
    hal_dimohonkan: 'Menyatakan terjadi pelanggaran administratif pemilu dan mencoret nama calon bersangkutan.',
    pelapor: {
      id: 'p-04',
      perkara_id: 'perkara-004',
      peran: 'Penemu',
      jenis: 'Bawaslu Bawahan',
      nama: 'Bawaslu Kabupaten Pandeglang',
      alamat: 'Jl. Mayor Widagdo No. 8, Pandeglang'
    },
    terlapor: {
      id: 't-04',
      perkara_id: 'perkara-004',
      peran: 'Terlapor',
      jenis: 'Partai Politik',
      nama: 'Dewan Pimpinan Cabang Partai Politik X',
      alamat: 'Jl. Jenderal Sudirman No. 101, Pandeglang'
    },
    jadwal_sidang: [
      {
        id: 'js-41',
        perkara_id: 'perkara-004',
        ke: 1,
        tanggal: '2028-09-28',
        jam: '09:00 WIB',
        agenda: 'Pembacaan Temuan',
        mode: 'Luring',
        lokasi_atau_tautan: 'Ruang Sidang Bawaslu Banten',
        status: 'Terlaksana',
        jumlah_pemberitahuan: 1
      },
      {
        id: 'js-42',
        perkara_id: 'perkara-004',
        ke: 2,
        tanggal: '2028-10-02',
        jam: '10:00 WIB',
        agenda: 'Jawaban & Pembuktian',
        mode: 'Luring',
        lokasi_atau_tautan: 'Ruang Sidang Bawaslu Banten',
        status: 'Terlaksana',
        jumlah_pemberitahuan: 1
      },
      {
        id: 'js-43',
        perkara_id: 'perkara-004',
        ke: 3,
        tanggal: '2028-10-06',
        jam: '14:00 WIB',
        agenda: 'Penyampaian Kesimpulan',
        mode: 'Luring',
        lokasi_atau_tautan: 'Ruang Sidang Bawaslu Banten',
        status: 'Terlaksana',
        jumlah_pemberitahuan: 1
      }
    ],
    alat_bukti: [
      {
        id: 'ab-41',
        perkara_id: 'perkara-004',
        kode: 'P-1',
        pengaju: 'Penemu',
        bentuk: 'Surat',
        asli_salinan: 'Asli',
        uraian: 'Laporan Hasil Pengawasan No. 044/LHP/BWSL-PDG/IX/2028.',
        tgl_disahkan: '2028-10-02'
      },
      {
        id: 'ab-42',
        perkara_id: 'perkara-004',
        kode: 'P-2',
        pengaju: 'Penemu',
        bentuk: 'Surat',
        asli_salinan: 'Salinan Legalisir',
        uraian: 'Surat Keterangan dari Dinas Pendidikan bahwa ijazah tidak terdaftar.',
        tgl_disahkan: '2028-10-02'
      }
    ],
    keterangan: [],
    dokumen: [],
    riwayat: []
  },
  {
    id: 'perkara-003',
    nomor_register: '003/LP/ADM.PP/BWSL.PROV/11.00/IX/2028',
    jalur: 'biasa',
    sumber: 'LP',
    kode_jenis: 'ADM.PP',
    tingkatan: 'BWSL.PROV',
    kode_wilayah: '11.00',
    nama_wilayah: 'Bawaslu Provinsi Banten',
    tahapan_pemilu: 'Pemutakhiran Data Pemilih dan Penyusunan Daftar Pemilih',
    tgl_peristiwa: '2028-09-15',
    tgl_registrasi: '2028-09-19',
    batas_putusan: '2028-10-07',
    lama_proses_hk: 12,
    sisa_hk: 2,
    status: 'S10', // Masa Koreksi
    mode_sidang: 'Luring',
    pokok_laporan: 'Dugaan penghilangan hak pilih ribuan warga di perumahan baru akibat kelalaian petugas pemutakhiran data pemilih.',
    hal_dimohonkan: 'Memerintahkan Terlapor mendaftarkan pemilih yang memenuhi syarat ke dalam DPT.',
    pelapor: {
      id: 'p-03',
      perkara_id: 'perkara-003',
      peran: 'Pelapor',
      jenis: 'Perorangan',
      nama: 'Siti Nurjanah',
      flag_disamarkan: true
    },
    terlapor: {
      id: 't-03',
      perkara_id: 'perkara-003',
      peran: 'Terlapor',
      jenis: 'Penyelenggara Pemilu (KPU)',
      nama: 'PPK Kecamatan Ciruas, Kab. Serang'
    },
    jadwal_sidang: [],
    alat_bukti: [
      {
        id: 'ab-31',
        perkara_id: 'perkara-003',
        kode: 'P-1',
        pengaju: 'Pelapor',
        bentuk: 'Surat',
        asli_salinan: 'Asli',
        uraian: 'Daftar KTP-el warga yang belum tercatat di DPSHP.',
        tgl_disahkan: '2028-09-24'
      },
      {
        id: 'ab-32',
        perkara_id: 'perkara-003',
        kode: 'P-2',
        pengaju: 'Pelapor',
        bentuk: 'Dokumen Elektronik',
        asli_salinan: 'Tangkapan Layar Digital',
        uraian: 'Tangkapan layar cekdptonline.kpu.go.id nihil.',
        tgl_disahkan: '2028-09-24'
      }
    ],
    keterangan: [],
    dokumen: [],
    putusan: {
      perkara_id: 'perkara-003',
      nomor_putusan: '003/LP/ADM.PP/BWSL.PROV/11.00/IX/2028',
      tgl_pleno: '2028-10-06',
      tgl_dibacakan: '2028-10-07',
      amar: 'Terbukti',
      amar_ringkas: 'Menyatakan Terlapor terbukti secara sah dan meyakinkan melakukan pelanggaran administratif.',
      amar_lengkap: '1. Menyatakan Terlapor terbukti bersalah melakukan pelanggaran administratif Pemilu tata cara pemutakhiran data pemilih. 2. Memerintahkan KPU Kab. Serang melakukan perbaikan administrasi dalam waktu 3 HK.',
      sanksi: ['Teguran Tertulis', 'Perbaikan Tata Cara Administrasi Penyusunan Daftar Pemilih'],
      tgl_salinan: '2028-10-08',
      tgl_publikasi: '2028-10-08'
    },
    riwayat: []
  },
  {
    id: 'perkara-002',
    nomor_register: '001/LP.AC/ADM.PL/BWSL.KAB/11.08/X/2028',
    jalur: 'acara_cepat',
    sumber: 'LP',
    kode_jenis: 'ADM.PL',
    tingkatan: 'BWSL.KAB',
    kode_wilayah: '11.08',
    nama_wilayah: 'Bawaslu Kabupaten Tangerang',
    tahapan_pemilu: 'Masa Kampanye Pemilu',
    tgl_peristiwa: '2028-10-08',
    tgl_registrasi: '2028-10-08',
    batas_putusan: '2028-10-08',
    lama_proses_hk: 0,
    sisa_hk: 0,
    status: 'S14', // Selesai / Minutasi (Hari yang sama)
    mode_sidang: 'Luring',
    pokok_laporan: 'Pemasangan alat peraga kampanye (baliho raksasa) di pagar tempat ibadah Masjid Agung Tigaraksa.',
    hal_dimohonkan: 'Penertiban seketika dan penghentian pelanggaran.',
    pelapor: {
      id: 'p-02',
      perkara_id: 'perkara-002',
      peran: 'Pelapor',
      jenis: 'Perorangan',
      nama: 'Warga Masyarakat Tigaraksa',
      flag_disamarkan: true
    },
    terlapor: {
      id: 't-02',
      perkara_id: 'perkara-002',
      peran: 'Terlapor',
      jenis: 'Tim Kampanye',
      nama: 'Tim Kampanye Paslon Z Tingkat Kabupaten'
    },
    jadwal_sidang: [],
    alat_bukti: [
      {
        id: 'ab-21',
        perkara_id: 'perkara-002',
        kode: 'P-1',
        pengaju: 'Pelapor',
        bentuk: 'Surat',
        asli_salinan: 'Asli',
        uraian: 'Foto dokumentasi APK terpasang di pagar tempat ibadah.',
        tgl_disahkan: '2028-10-08'
      }
    ],
    keterangan: [],
    dokumen: [
      {
        id: 'dok-ac',
        perkara_id: 'perkara-002',
        kode_formulir: 'ADM.ACARA CEPAT',
        nama_formulir: 'Putusan Pemeriksaan Acara Cepat',
        nomor: '001/AC/ADM/BWSL-TGR/X/2028',
        tanggal: '2028-10-08',
        penanda_tangan: 'Iqbal Pratama, S.H. (Anggota Pengawas di Lokasi)',
        status_publikasi: 'Publik'
      }
    ],
    putusan: {
      perkara_id: 'perkara-002',
      nomor_putusan: '001/LP.AC/ADM.PL/BWSL.KAB/11.08/X/2028',
      tgl_pleno: '2028-10-08',
      tgl_dibacakan: '2028-10-08',
      amar: 'Terbukti',
      amar_ringkas: 'Terbukti melanggar larangan kampanye di tempat ibadah.',
      amar_lengkap: 'Memerintahkan Terlapor dan Satpol PP menurunkan alat peraga kampanye dalam waktu 1x24 jam.',
      sanksi: ['Teguran Tertulis', 'Penurunan dan Pembersihan Alat Peraga Kampanye'],
      tgl_salinan: '2028-10-08',
      tgl_publikasi: '2028-10-08'
    },
    riwayat: []
  },
  {
    id: 'perkara-001',
    nomor_register: '001/LP/ADM.PL/BWSL.PROV/11.00/IX/2028',
    jalur: 'biasa',
    sumber: 'LP',
    kode_jenis: 'ADM.PL',
    tingkatan: 'BWSL.PROV',
    kode_wilayah: '11.00',
    nama_wilayah: 'Bawaslu Provinsi Banten',
    tahapan_pemilu: 'Pencalonan Anggota DPR, DPD, dan DPRD',
    tgl_peristiwa: '2028-08-30',
    tgl_registrasi: '2028-09-05',
    batas_putusan: '2028-09-25',
    lama_proses_hk: 13,
    sisa_hk: 1,
    status: 'S11', // Dalam Koreksi (Bawaslu RI)
    mode_sidang: 'Luring',
    pokok_laporan: 'Penolakan berkas pendaftaran calon oleh KPU dengan alasan keterlambatan sistem SILON padahal terjadi server down.',
    hal_dimohonkan: 'Menerima pendaftaran calon dan verifikasi ulang.',
    pelapor: {
      id: 'p-01b',
      perkara_id: 'perkara-001',
      peran: 'Pelapor',
      jenis: 'Calon Anggota DPR/DPD/DPRD',
      nama: 'Bambang Soeroso, S.E.',
      flag_disamarkan: false
    },
    terlapor: {
      id: 't-01b',
      perkara_id: 'perkara-001',
      peran: 'Terlapor',
      jenis: 'Penyelenggara Pemilu (KPU)',
      nama: 'KPU Kota Cilegon'
    },
    jadwal_sidang: [],
    alat_bukti: [],
    keterangan: [],
    dokumen: [],
    putusan: {
      perkara_id: 'perkara-001',
      nomor_putusan: '001/LP/ADM.PL/BWSL.PROV/11.00/IX/2028',
      tgl_pleno: '2028-09-24',
      tgl_dibacakan: '2028-09-25',
      amar: 'Tidak Terbukti',
      amar_ringkas: 'Menyatakan Terlapor tidak terbukti melakukan pelanggaran administratif.',
      amar_lengkap: 'Menolak laporan Pelapor untuk seluruhnya.',
      tgl_salinan: '2028-09-26',
      tgl_publikasi: '2028-09-26'
    },
    koreksi: {
      id: 'kor-01',
      perkara_id: 'perkara-001',
      nomor_KS: '001/KS/ADM.PL/BWSL/00.00/IX/2028',
      pemohon: 'Pelapor',
      nama_pemohon: 'Bambang Soeroso, S.E.',
      tgl_diajukan: '2028-09-27',
      tgl_register: '2028-09-28',
      tgl_pemberitahuan: '2028-09-29',
      tgl_jawaban: '2028-10-01',
      alasan_koreksi: 'Majelis Bawaslu Provinsi Banten dinilai keliru menerapkan ketentuan Pasal 249 UU 7/2017 tentang keadaan kahar teknis server KPU.',
      status_penundaan_eksekusi: true
    },
    riwayat: []
  },
  {
    id: 'perkara-007',
    nomor_register: '007/LP/ADM.TSM.PP/BWSL/00.00/X/2028',
    jalur: 'tsm',
    sumber: 'LP',
    kode_jenis: 'ADM.TSM.PP',
    tingkatan: 'BWSL',
    kode_wilayah: '00.00',
    nama_wilayah: 'Bawaslu Republik Indonesia',
    tahapan_pemilu: 'Masa Kampanye Pemilu',
    tgl_peristiwa: '2028-09-22',
    tgl_registrasi: '2028-10-01',
    batas_putusan: '2028-10-19',
    lama_proses_hk: 6,
    sisa_hk: 8,
    status: 'S06', // Pembuktian
    mode_sidang: 'Luring',
    pokok_laporan: 'Dugaan pelanggaran administratif Pemilu secara Terstruktur, Sistematis, dan Masif (TSM) berupa pengerahan aparatur desa dan bansos di 18 provinsi untuk memenangkan Pasangan Calon X.',
    hal_dimohonkan: 'Menyatakan Terlapor melakukan pelanggaran administratif Pemilu TSM dan membatalkan Pasangan Calon X dari kepesertaan Pemilu.',
    pelapor: {
      id: 'p-07',
      perkara_id: 'perkara-007',
      peran: 'Pelapor',
      jenis: 'Pemantau Pemilu',
      nama: 'Jaringan Pemantau Demokrasi Bersih',
      flag_disamarkan: false
    },
    terlapor: {
      id: 't-07',
      perkara_id: 'perkara-007',
      peran: 'Terlapor',
      jenis: 'Pasangan Calon',
      nama: 'Pasangan Calon Presiden dan Wakil Presiden Nomor Urut X'
    },
    penetapan: {
      perkara_id: 'perkara-007',
      nomor_keputusan: '099/KEP/BWSL-RI/X/2028',
      tanggal_keputusan: '2028-10-01',
      ketua_majelis: 'Rahmat Bagja, S.H., LL.M',
      anggota_majelis: ['Lolly Suhenty, S.Sos.I., M.H.', 'Puadi, S.Pd., M.M.', 'Totok Hariyono, S.H.', 'Herwyn J. H. Malonda, M.Pd., M.H.'],
      sekretaris_pemeriksa: 'Ichsan Fuady, S.Sos',
      asisten_pemeriksa: 'Dr. Budi Arta, S.H., M.H.',
      perisalah: 'Tri Purnomo, S.S.'
    },
    jadwal_sidang: [
      {
        id: 'js-71',
        perkara_id: 'perkara-007',
        ke: 1,
        tanggal: '2028-10-04',
        jam: '10:00 WIB',
        agenda: 'Pembacaan Laporan TSM',
        mode: 'Luring',
        lokasi_atau_tautan: 'Ruang Sidang Pleno Gedung Bawaslu RI, Jl. M.H. Thamrin No. 14 Jakarta Pusat',
        status: 'Terlaksana',
        jumlah_pemberitahuan: 1,
        tautan_siaran: 'https://youtube.com/live/bawaslu-ri-tsm-007'
      },
      {
        id: 'js-72',
        perkara_id: 'perkara-007',
        ke: 2,
        tanggal: '2028-10-08',
        jam: '09:30 WIB',
        agenda: 'Jawaban Terlapor & Pengesahan Bukti',
        mode: 'Luring',
        lokasi_atau_tautan: 'Ruang Sidang Pleno Gedung Bawaslu RI',
        status: 'Terlaksana',
        jumlah_pemberitahuan: 1,
        tautan_siaran: 'https://youtube.com/live/bawaslu-ri-tsm-007-part2'
      },
      {
        id: 'js-73',
        perkara_id: 'perkara-007',
        ke: 3,
        tanggal: '2028-10-12',
        jam: '09:00 WIB',
        agenda: 'Pemeriksaan 15 Saksi & 3 Ahli Hukum Tata Negara',
        mode: 'Luring',
        lokasi_atau_tautan: 'Ruang Sidang Pleno Gedung Bawaslu RI',
        status: 'Terjadwal',
        jumlah_pemberitahuan: 1
      }
    ],
    alat_bukti: [
      {
        id: 'ab-71',
        perkara_id: 'perkara-007',
        kode: 'P-1',
        pengaju: 'Pelapor',
        bentuk: 'Dokumen Elektronik',
        asli_salinan: 'Asli',
        uraian: 'Surat edaran instruksi berjenjang pengerahan aparatur di 18 provinsi.',
        tgl_disahkan: '2028-10-08'
      },
      {
        id: 'ab-72',
        perkara_id: 'perkara-007',
        kode: 'P-2',
        pengaju: 'Pelapor',
        bentuk: 'Media Simpan / Flashdisk',
        asli_salinan: 'Asli',
        uraian: '320 video dokumentasi pembagian sembako berlabel paslon bersama pejabat daerah.',
        tgl_disahkan: '2028-10-08'
      },
      {
        id: 'ab-73',
        perkara_id: 'perkara-007',
        kode: 'T-1',
        pengaju: 'Terlapor',
        bentuk: 'Surat',
        asli_salinan: 'Asli',
        uraian: 'Surat Pernyataan Tim Nasional Paslon bahwa bansos tersebut merupakan program reguler kementerian terkait.',
        tgl_disahkan: '2028-10-08'
      }
    ],
    keterangan: [],
    dokumen: [],
    riwayat: []
  },
  {
    id: 'perkara-025',
    nomor_register: '025/LP/ADM.PP/BWSL.KOTA/12.04/IX/2023',
    jalur: 'biasa',
    sumber: 'LP',
    kode_jenis: 'ADM.PP',
    tingkatan: 'BWSL.KOTA',
    kode_wilayah: '12.04',
    nama_wilayah: 'Bawaslu Kota Jakarta Timur',
    tahapan_pemilu: 'Pencalonan Presiden dan Wakil Presiden',
    tgl_peristiwa: '2023-09-08',
    tgl_registrasi: '2023-09-15',
    batas_putusan: '2023-10-05',
    lama_proses_hk: 14,
    sisa_hk: 0,
    status: 'S14', // Selesai / Minutasi
    mode_sidang: 'Luring',
    pokok_laporan: 'Laporan dugaan pelanggaran tata cara sosialisasi dini sebelum masa kampanye resmi.',
    hal_dimohonkan: 'Tindakan penertiban oleh Bawaslu.',
    pelapor: {
      id: 'p-25',
      perkara_id: 'perkara-025',
      peran: 'Pelapor',
      jenis: 'Perorangan',
      nama: 'WNI Peduli Pemilu Bersih',
      flag_disamarkan: true
    },
    terlapor: {
      id: 't-25',
      perkara_id: 'perkara-025',
      peran: 'Terlapor',
      jenis: 'Tim Kampanye',
      nama: 'Relawan Gerakan Pemuda'
    },
    jadwal_sidang: [],
    alat_bukti: [],
    keterangan: [],
    dokumen: [],
    putusan: {
      perkara_id: 'perkara-025',
      nomor_putusan: '025/LP/ADM.PP/BWSL.KOTA/12.04/IX/2023',
      tgl_pleno: '2023-10-04',
      tgl_dibacakan: '2023-10-05',
      amar: 'Terbukti',
      amar_ringkas: 'Menyatakan terbukti terjadi pelanggaran tata cara sosialisasi.',
      amar_lengkap: 'Memberikan teguran tertulis kepada Terlapor untuk menaati jadwal kampanye KPU.',
      sanksi: ['Teguran Tertulis'],
      tgl_salinan: '2023-10-06',
      tgl_publikasi: '2023-10-06'
    },
    riwayat: []
  },
  {
    id: 'perkara-132',
    nomor_register: '132/TM/ADM.PL/BWSL.PROV/23.00/VIII/2023',
    jalur: 'biasa',
    sumber: 'TM',
    kode_jenis: 'ADM.PL',
    tingkatan: 'BWSL.PROV',
    kode_wilayah: '23.00',
    nama_wilayah: 'Bawaslu Provinsi Kalimantan Timur',
    tahapan_pemilu: 'Pendaftaran dan Verifikasi Peserta Pemilu',
    tgl_peristiwa: '2023-08-01',
    tgl_registrasi: '2023-08-09',
    batas_putusan: '2023-08-30',
    lama_proses_hk: 14,
    sisa_hk: 0,
    status: 'S14',
    mode_sidang: 'Luring',
    pokok_laporan: 'Temuan Bawaslu Kota Samarinda yang dilimpahkan dan diperiksa Bawaslu Provinsi Kalimantan Timur sesuai Pasal 11 Perbawaslu 8/2022.',
    hal_dimohonkan: 'Koreksi administratif data keanggotaan ganda.',
    pelapor: {
      id: 'p-132',
      perkara_id: 'perkara-132',
      peran: 'Penemu',
      jenis: 'Bawaslu Bawahan',
      nama: 'Bawaslu Kota Samarinda'
    },
    terlapor: {
      id: 't-132',
      perkara_id: 'perkara-132',
      peran: 'Terlapor',
      jenis: 'Penyelenggara Pemilu (KPU)',
      nama: 'KPU Kota Samarinda'
    },
    jadwal_sidang: [],
    alat_bukti: [],
    keterangan: [],
    dokumen: [],
    putusan: {
      perkara_id: 'perkara-132',
      nomor_putusan: '132/TM/ADM.PL/BWSL.PROV/23.00/VIII/2023',
      tgl_pleno: '2023-08-29',
      tgl_dibacakan: '2023-08-30',
      amar: 'Terbukti',
      amar_ringkas: 'Menyatakan Terlapor terbukti melakukan pelanggaran administratif verifikasi.',
      amar_lengkap: 'Memerintahkan KPU Kota Samarinda untuk melakukan verifikasi faktual perbaikan keanggotaan.',
      sanksi: ['Perbaikan Tata Cara Administrasi Verifikasi'],
      tgl_salinan: '2023-08-31',
      tgl_publikasi: '2023-08-31'
    },
    riwayat: []
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-01',
    perkara_id: 'perkara-005',
    nomor_register: '005/LP/ADM.PL/BWSL.PROV/11.00/X/2028',
    judul: 'Kirim Panggilan Sidang 4 (ADM.SPS)',
    deskripsi: 'Jadwal sidang 4 pada 11 Okt 2028; ADM.SPS harus terkirim minimal 1 HK sebelumnya.',
    target_role: 'admin',
    tenggat_waktu: '2028-10-09',
    prioritas: 'Kritis',
    status_tugas: 'Menunggu',
    action_type: 'siapkan_sps'
  },
  {
    id: 'task-02',
    perkara_id: 'perkara-004',
    nomor_register: '004/TM/ADM.PL/BWSL.PROV/11.00/IX/2028',
    judul: 'Susun Draf Putusan (Sisa 3 HK)',
    deskripsi: 'Perkara telah selesai tahap kesimpulan. Siapkan draf ADM.PUTUSAN berdasarkan minimal 2 alat bukti sah.',
    target_role: 'admin',
    tenggat_waktu: '2028-10-11',
    prioritas: 'Penting',
    status_tugas: 'Menunggu',
    action_type: 'draf_putusan'
  },
  {
    id: 'task-03',
    perkara_id: 'perkara-003',
    nomor_register: '003/LP/ADM.PP/BWSL.PROV/11.00/IX/2028',
    judul: 'Kirim Salinan Putusan (1 HK)',
    deskripsi: 'Putusan dibacakan kemarin. Salinan putusan wajib disampaikan kepada para pihak dalam 1 HK.',
    target_role: 'admin',
    tenggat_waktu: '2028-10-08',
    prioritas: 'Kritis',
    status_tugas: 'Menunggu',
    action_type: 'kirim_salinan'
  },
  {
    id: 'task-04',
    perkara_id: 'perkara-001',
    nomor_register: '001/LP/ADM.PL/BWSL.PROV/11.00/IX/2028',
    judul: 'Pemeriksaan Dokumen Koreksi Bawaslu RI',
    deskripsi: 'Permohonan koreksi teregistrasi. Lakukan pemeriksaan dokumen permohonan koreksi (7 HK).',
    target_role: 'admin',
    tenggat_waktu: '2028-10-05',
    prioritas: 'Penting',
    status_tugas: 'Menunggu',
    action_type: 'koreksi'
  }
];
