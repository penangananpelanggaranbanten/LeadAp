import React, { useState } from 'react';
import { X, Printer, Download, Copy, Check, FileText, Scale, HardDrive } from 'lucide-react';
import { Perkara } from '../types/leadAp';
import { DAFTAR_18_FORMULIR } from '../utils/businessLogic';
import { DAFTAR_21_FORMULIR, getDefaultFormulirContent } from '../data/daftarFormulirMaster';
import { 
  uploadDokumenSidangToDrive, 
  TARGET_DRIVE_EMAIL 
} from '../services/googleDriveService';

interface FormulirGeneratorModalProps {
  perkara?: Perkara | null;
  initialKode?: string;
  onClose: () => void;
}

export const FormulirGeneratorModal: React.FC<FormulirGeneratorModalProps> = ({
  perkara,
  initialKode = 'ADM.BA-REG',
  onClose
}) => {
  const [selectedFormKode, setSelectedFormKode] = useState<string>(initialKode);
  const [copied, setCopied] = useState<boolean>(false);
  const [savingToDrive, setSavingToDrive] = useState<boolean>(false);
  const [savedToDriveMsg, setSavedToDriveMsg] = useState<string | null>(null);

  // Check in 21 master list or 18 list
  const formMaster21 = DAFTAR_21_FORMULIR.find(
    (f) => f.kode.toLowerCase() === selectedFormKode.toLowerCase() ||
           f.kode.toLowerCase().includes(selectedFormKode.toLowerCase())
  );

  const selectedForm =
    DAFTAR_18_FORMULIR.find((f) => f.kode === selectedFormKode) || {
      kode: formMaster21?.kode || selectedFormKode,
      nama: formMaster21?.perihal || selectedFormKode,
      fungsi: formMaster21?.rujukan || 'Naskah Dinas Perbawaslu',
      penandaTangan: 'Ketua / Majelis Bawaslu',
      tahap: formMaster21?.keterangan || 'Persidangan'
    };

  // Helper untuk generate isi teks formulir resmi Bawaslu
  const generateFormContent = (kode: string) => {
    const p = perkara || {
      nomor_register: '005/LP/ADM.PL/BWSL.PROV/11.00/X/2028',
      tgl_registrasi: '2028-10-02',
      nama_wilayah: 'Bawaslu Provinsi Banten',
      tahapan_pemilu: 'Pencalonan Anggota DPR, DPD, dan DPRD',
      pelapor: { nama: 'H. Ahmad Fauzi, S.H.', peran: 'Pelapor', jenis: 'Perorangan' },
      terlapor: { nama: 'KPU Kabupaten Serang', peran: 'Terlapor', jenis: 'Penyelenggara Pemilu' },
      pokok_laporan: 'Dugaan pelanggaran tata cara verifikasi syarat administrasi bakal calon.',
      hal_dimohonkan: 'Menyatakan Terlapor terbukti melanggar dan membatalkan calon terkait.',
      penetapan: {
        ketua_majelis: 'Drs. H. Didih M. Sudi, M.Si',
        anggota_majelis: ['Ade Mongkito, S.H.', 'Bahrul Ulum, S.Ag'],
        sekretaris_pemeriksa: 'Rina Karlina, S.Sos',
        perisalah: 'Siti Rohmah, S.I.Kom'
      },
      putusan: {
        amar: 'Terbukti',
        amar_lengkap: '1. Menyatakan Terlapor terbukti secara sah dan meyakinkan melakukan pelanggaran administratif Pemilu.\n2. Memberikan sanksi teguran tertulis kepada Terlapor.'
      }
    };

    switch (kode) {
      case 'ADM.NRL':
        return `FORMAT PENOMORAN REGISTER (Model ADM.NRL)
Peraturan Bawaslu Nomor 8 Tahun 2022
Nomor Register yang Ditetapkan: ${p.nomor_register}
Format Unsur: [No. Urut] / [Sumber TM|LP] / [Kode Jenis] / [Tingkatan] / [Kode Wilayah] / [Bulan Romawi] / [Tahun]
Pencatatan dilakukan secara elektronik dalam Buku Register Pelanggaran Administratif Pemilu pada tanggal ${p.tgl_registrasi}.`;

      case 'ADM.BA-REG':
        return `BERITA ACARA REGISTRASI LAPORAN/TEMUAN
Model ADM.BA-REG
Pada hari ini, ${p.tgl_registrasi}, bertempat di Kantor ${p.nama_wilayah}, telah dilakukan pencatatan dan registrasi atas:
Sumber: ${p.nomor_register.includes('/TM/') ? 'Temuan Pengawas' : 'Laporan Masyarakat'}
Nomor Register: ${p.nomor_register}
Pelapor/Penemu: ${p.pelapor.nama}
Terlapor: ${p.terlapor.nama}
Tahapan Pemilu: ${p.tahapan_pemilu}
Berdasarkan hasil pemeriksaan awal, dokumen dinyatakan memenuhi SYARAT FORMAL dan SYARAT MATERIEL sesuai Pasal 10 Peraturan Bawaslu Nomor 8 Tahun 2022.
Dengan diterbitkannya Berita Acara ini, masa penanganan perkara selama 14 (empat belas) hari kerja resmi dimulai.

Petugas Registrasi,
(Tanda Tangan & Cap Dinas)`;

      case 'ADM.SPS':
        return `SURAT PEMBERITAHUAN DAN PANGGILAN SIDANG
Model ADM.SPS
Nomor: 018/SPS/${p.nomor_register.split('/')[3] || 'BWSL'}/${p.nomor_register.split('/')[6] || '2028'}
Lampiran: 1 (satu) berkas salinan Laporan/Temuan teregistrasi
Sifat: Segera / Panggilan Sidang Terbuka

Kepada Yth:
1. ${p.pelapor.nama} (selaku ${p.pelapor.peran})
2. ${p.terlapor.nama} (selaku ${p.terlapor.peran})

Berdasarkan Pasal 19 Peraturan Bawaslu Nomor 8 Tahun 2022, Majelis Pemeriksa memanggil Saudara untuk hadir pada persidangan:
Hari/Tanggal: Kamis, 05 Oktober 2028
Waktu: Pukul 09.00 WIB s.d. selesai
Tempat: Ruang Sidang Utama ${p.nama_wilayah}
Agenda: Pembacaan Pokok Laporan/Temuan

Catatan: Pihak dapat didampingi kuasa hukum dengan menunjukkan Surat Kuasa Khusus.

Ketua Bawaslu,
${(p as any).penetapan?.ketua_majelis || 'Drs. H. Didih M. Sudi, M.Si'}`;

      case 'ADM.BA-SP':
        return `BERITA ACARA SIDANG PEMERIKSAAN
Model ADM.BA-SP
Nomor Register: ${p.nomor_register}
Sidang ke: 1 (Satu)
Hari/Tanggal: Kamis, 05 Oktober 2028

Susunan Majelis:
Ketua Majelis: ${(p as any).penetapan?.ketua_majelis || 'Ketua Bawaslu'}
Anggota Majelis: ${(p as any).penetapan?.anggota_majelis?.join(', ') || 'Anggota Bawaslu'}
Sekretaris Pemeriksa: ${(p as any).penetapan?.sekretaris_pemeriksa || 'Sekretaris'}

Jalannya Sidang:
1. Majelis membuka sidang terbuka untuk umum pada pukul 09.00 WIB (ketuk palu 3x).
2. Pemeriksaan kehadiran: Pelapor hadir didampingi kuasa hukum; Terlapor hadir.
3. Pelapor membacakan pokok laporan tanpa perbaikan materi.
4. Majelis menunda sidang untuk agenda Jawaban Terlapor.
5. Sidang ditutup pada pukul 10.30 WIB (ketuk palu 1x).

Sekretaris Pemeriksa,
${(p as any).penetapan?.sekretaris_pemeriksa || 'Sekretaris Pemeriksa'}`;

      case 'ADM.RISALAH':
        return `RISALAH SIDANG PEMERIKSAAN LENGKAP
Model ADM.RISALAH
Nomor Register: ${p.nomor_register}
Perisalah: ${(p as any).penetapan?.perisalah || 'Siti Rohmah, S.I.Kom'}

TRANSKRIP JALANNYA PERSIDANGAN:
[09.00] Ketua Majelis: "Sidang pemeriksaan pelanggaran administratif nomor register ${p.nomor_register} dinyatakan dibuka dan terbuka untuk umum." (Ketuk Palu 3x)
[09.05] Ketua Majelis melakukan verifikasi KTP-el dan Surat Kuasa Khusus.
[09.15] Pelapor menyampaikan pokok-pokok dalil terkait verifikasi administrasi...
[09.45] Tanya jawab Majelis kepada pihak Terlapor mengenai regulasi internal KPU...
[10.25] Majelis menetapkan jadwal sidang lanjutan pembuktian.
[10.30] Ketua Majelis menutup persidangan.

Perisalah Sidang,
(Tanda Tangan)`;

      case 'ADM.BA-SUMPAH':
        return `BERITA ACARA SUMPAH / JANJI SAKSI DAN AHLI
Model ADM.BA-SUMPAH (Berita Acara Sumpah Saksi/Ahli)

Pada hari ini, dalam persidangan perkara Nomor Register: ${p.nomor_register}:
Telah diambil sumpah/janji atas saksi/ahli:
Nama: Wahyu Ramadhan
Agama: Islam
Pihak Pengaju: ${p.pelapor.nama}

LAFAL SUMPAH:
"Demi Allah saya bersumpah bahwa saya akan menerangkan dengan sebenarnya dan tiada lain daripada yang sebenarnya."

Yang Bersumpah,                                      Ketua Majelis Pemeriksa,
(Meterai Rp10.000)
(Wahyu Ramadhan)                                    (${(p as any).penetapan?.ketua_majelis || 'Ketua Majelis'})`;

      case 'ADM.PUTUSAN':
        return `PUTUSAN
Model ADM.PUTUSAN
DEMI KEADILAN BERDASARKAN KETUHANAN YANG MAHA ESA

Badan Pengawas Pemilihan Umum, yang memeriksa dan memutus perkara Pelanggaran Administratif Pemilu pada tingkat pertama dan terakhir, menjatuhkan Putusan atas perkara:
Nomor Register: ${p.nomor_register}

ANTARA:
${p.pelapor.nama}, bertempat tinggal di ..., dalam hal ini disebut sebagai PELAPOR;
MELAWAN:
${p.terlapor.nama}, berkedudukan di ..., dalam hal ini disebut sebagai TERLAPOR.

MENGADILI:
1. Menyatakan Terlapor ${((p as any).putusan?.amar || 'TERBUKTI').toUpperCase()} secara sah dan meyakinkan melakukan pelanggaran administratif Pemilu.
2. Memberikan sanksi berupa teguran tertulis kepada Terlapor.
3. Memerintahkan kepada KPU untuk melaksanakan putusan ini paling lama 3 (tiga) hari kerja sejak putusan dibacakan.

Demikian diputuskan dalam Rapat Pleno Bawaslu pada hari ... dan dibacakan dalam sidang terbuka untuk umum pada hari ..., oleh Majelis Pemeriksa dengan dibantu Sekretaris Pemeriksa.

Majelis Pemeriksa:
Ketua & Seluruh Anggota Majelis
(Paraf pada setiap halaman dan tanda tangan basah pada lembar akhir)`;

      case 'ADM.STATUS':
        return `PEMBERITAHUAN STATUS TEMUAN / LAPORAN DI LAMAN RESMI
Model ADM.STATUS (Pemberitahuan Status Putusan Resmi)

Nomor Register: ${p.nomor_register}
Tanggal Registrasi: ${p.tgl_registrasi}
Pelapor: ${p.pelapor.nama}
Terlapor: ${p.terlapor.nama}
Status Akhir: TELAH DIPUTUS / BERKEKUATAN TETAP
Amar Putusan: ${(p as any).putusan?.amar || 'Terbukti'}
Tanggal Pembacaan: ${(p as any).putusan?.tgl_dibacakan || '07 Oktober 2028'}

Dokumen salinan putusan lengkap dapat diakses dan diunduh oleh publik melalui portal LeAD-AP.

Ketua Bawaslu,
(Cap dan Tanda Tangan Resmi)`;

      case 'ADM.ACARA CEPAT':
        return `FORMULIR LAPANGAN PUTUSAN PEMERIKSAAN ACARA CEPAT
Model ADM.ACARA CEPAT (Pemeriksaan Acara Cepat)

Hari/Tanggal: 08 Oktober 2028
Waktu Kejadian: Pukul 14.15 WIB
Lokasi Kejadian: Pagar Pintu Masuk Tempat Ibadah Masjid Agung
Petugas Pengawas: Iqbal Pratama, S.H. (Anggota Pengawas Lapangan)

URAIAN PERISTIWA:
Ditemukan pemasangan Alat Peraga Kampanye (APK) berukuran 4x6 meter pada pagar tempat ibadah yang secara nyata melanggar Pasal 280 ayat (1) huruf h UU Pemilu.

KETERANGAN TERLAPOR / PENANGGUNG JAWAB:
Pihak penanggung jawab lapangan mengakui pemasangan dilakukan oleh pihak ketiga vendor baliho.

ANALISIS HUKUM SINGKAT:
Tindakan pemasangan APK pada fasilitas ibadah memenuhi unsur larangan kampanye secara administratif dan harus segera ditertibkan seketika.

PUTUSAN ACARA CEPAT:
1. Memerintahkan Terlapor dan Petugas Satpol PP untuk menurunkan dan membersihkan alat peraga dalam waktu paling lambat 1x24 jam.
2. Putusan ini bersifat final dan tidak dapat diajukan koreksi.

Anggota Pengawas Pemilu,
(Tanda Tangan di Tempat Kejadian)`;

      default:
        if (formMaster21) {
          return getDefaultFormulirContent(formMaster21);
        }
        return `FORMULIR MODEL ${selectedForm.kode}
${selectedForm.nama}
Peraturan Bawaslu Nomor 8 Tahun 2022

Nomor Register Perkara: ${p.nomor_register}
Para Pihak: ${p.pelapor.nama} (Pelapor) vs ${p.terlapor.nama} (Terlapor)
Lembaga Pemeriksa: ${p.nama_wilayah}
Dasar Hukum: Tata Naskah Dinas Penyelesaian Pelanggaran Administratif Pemilu

Dokumen ini disusun dan disahkan secara sah sesuai standar tata naskah dinas Badan Pengawas Pemilihan Umum.

Pejabat Penanda Tangan: ${selectedForm.penandaTangan}`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFormContent(selectedFormKode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDrive = async () => {
    const token = null;
    if (!token) {
      alert(`Silakan hubungkan Google Drive (${TARGET_DRIVE_EMAIL}) terlebih dahulu melalui tombol Google Drive di bilah atas.`);
      return;
    }
    setSavingToDrive(true);
    setSavedToDriveMsg(null);
    try {
      const regNumber = perkara?.nomor_register || 'TEMPLATE_FORMULIR';
      const textContent = generateFormContent(selectedFormKode);
      await uploadDokumenSidangToDrive(token, regNumber, selectedForm.kode, selectedForm.nama, textContent);
      setSavedToDriveMsg(`Tersimpan ke Drive (${TARGET_DRIVE_EMAIL})!`);
      setTimeout(() => setSavedToDriveMsg(null), 3500);
    } catch (err: any) {
      alert('Gagal menyimpan formulir ke Google Drive: ' + err.message);
    } finally {
      setSavingToDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-amber-500">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-600 text-slate-950 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>GENERATOR 18 FORMULIR RESMI PERBAWASLU 8/2022</span>
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Model Dokumen Peradilan Sidang Administratif Pemilu • Akun Drive: <span className="text-amber-400">{TARGET_DRIVE_EMAIL}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToDrive}
              disabled={savingToDrive}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
              title={`Simpan formulir ini ke folder Dokumen Sidang di Google Drive (${TARGET_DRIVE_EMAIL})`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{savingToDrive ? 'Menyimpan...' : savedToDriveMsg || 'Simpan ke Drive'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>
            <button
              onClick={handleCopy}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layout: Sidebar selector 18 Formulir + Main preview */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Daftar Formulir */}
          <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-3 overflow-y-auto max-h-48 md:max-h-full">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 px-1">
              Daftar 18 Formulir Model (ADM.*):
            </span>
            <div className="space-y-1 text-xs">
              {DAFTAR_18_FORMULIR.map((form) => {
                const isSelected = selectedFormKode === form.kode;
                return (
                  <button
                    key={form.kode}
                    onClick={() => setSelectedFormKode(form.kode)}
                    className={`w-full text-left p-2 rounded-lg transition-all flex flex-col cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{form.kode}</span>
                      <span className="text-[10px] opacity-75">{form.tahap}</span>
                    </div>
                    <span className="text-[11px] line-clamp-1 font-normal">
                      {form.nama}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Preview: Formulir Resmi */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-200/50 flex justify-center">
            <div className="bg-white w-full max-w-2xl p-8 rounded-xl shadow-lg border border-slate-300 font-serif text-slate-900 space-y-6">
              {/* Kop Resmi Bawaslu */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Scale className="w-7 h-7 text-amber-700" />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-widest font-sans text-slate-900">
                  BADAN PENGAWAS PEMILIHAN UMUM
                </h3>
                <h4 className="text-xs font-bold uppercase tracking-wider font-sans text-slate-700">
                  {perkara?.nama_wilayah || 'REPUBLIK INDONESIA'}
                </h4>
                <p className="text-[10px] text-slate-500 font-sans italic">
                  Standar Layanan Publik Sidang Administratif • Rujukan Peraturan Bawaslu Nomor 8 Tahun 2022
                </p>
              </div>

              {/* Form Title & Content */}
              <div className="space-y-4">
                <div className="text-center">
                  <span className="font-sans font-bold text-xs uppercase text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded">
                    FORMULIR MODEL {selectedForm.kode}
                  </span>
                  <h2 className="text-base font-bold uppercase mt-2 text-slate-900 underline">
                    {selectedForm.nama}
                  </h2>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Fungsi: {selectedForm.fungsi}
                  </p>
                </div>

                {/* Body Content */}
                <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-lg text-xs font-mono leading-relaxed whitespace-pre-line text-slate-800">
                  {generateFormContent(selectedFormKode)}
                </div>

                {/* Footer Signatures */}
                <div className="pt-6 grid grid-cols-2 text-center text-xs font-sans">
                  <div>
                    <p className="text-slate-500">Mengesahkan,</p>
                    <p className="font-semibold text-slate-800 mt-0.5">Panitera / Sekretaris Sidang</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 italic font-mono">[Tanda Tangan Elektronik]</span>
                    </div>
                    <p className="font-bold text-slate-900">Rina Karlina, S.Sos</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Penanda Tangan Resmi:</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedForm.penandaTangan}</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 italic font-mono">[Cap & Tanda Tangan]</span>
                    </div>
                    <p className="font-bold text-slate-900">Drs. H. Didih M. Sudi, M.Si</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
