import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FilePlus2, 
  ShieldCheck, 
  ArrowRight, 
  Save, 
  Scale, 
  HardDrive, 
  Paperclip, 
  Trash2, 
  UploadCloud,
  Eye,
  RefreshCw,
  Plus,
  FileText
} from 'lucide-react';
import { 
  Perkara, 
  JalurPenyelesaian, 
  SumberPerkara, 
  KodeJenisPerkara, 
  TingkatanBawaslu,
  AlatBukti,
  BerkasDokumenPerkara
} from '../types/leadAp';
import { PdfPreviewModal, GenericFilePreviewData } from './PdfPreviewModal';
import { 
  generateNomorRegister, 
  KODE_WILAYAH_BAWASLU, 
  TAHAPAN_PEMILU_LIST, 
  tambahHariKerja 
} from '../utils/businessLogic';
import { 
  uploadBuktiToDrive, 
  uploadDokumenSidangToDrive,
  TARGET_DRIVE_EMAIL 
} from '../services/googleDriveService';
import { uploadFileToGoogleEcosystem } from '../services/googleEcosystemService';

interface RegistrasiPerkaraModalProps {
  onClose: () => void;
  onSavePerkara: (newPerkara: Perkara) => void;
}

export const RegistrasiPerkaraModal: React.FC<RegistrasiPerkaraModalProps> = ({
  onClose,
  onSavePerkara
}) => {
  const today = new Date().toISOString().split('T')[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [sumber, setSumber] = useState<SumberPerkara>('LP');
  const [jalur, setJalur] = useState<JalurPenyelesaian>('biasa');
  const [kodeJenis, setKodeJenis] = useState<KodeJenisPerkara>('ADM.PL');
  const [tingkatan, setTingkatan] = useState<TingkatanBawaslu>('BWSL.PROV');
  const [selectedWilayah, setSelectedWilayah] = useState(KODE_WILAYAH_BAWASLU[1]); // Default Banten 11.00
  const [tahapanPemilu, setTahapanPemilu] = useState<string>(TAHAPAN_PEMILU_LIST[4]);
  const [tglPeristiwa, setTglPeristiwa] = useState<string>(today);

  // Pasal 12 Check: Pasca Penetapan Hasil Nasional & PHPU MK
  const [flagPascaPenetapan, setFlagPascaPenetapan] = useState<boolean>(false);
  const [flagPHPU, setFlagPHPU] = useState<boolean>(false);

  // Syarat Formal & Materiel (Pasal 10)
  const [syaratFormal, setSyaratFormal] = useState<boolean>(true);
  const [syaratMateriel, setSyaratMateriel] = useState<boolean>(true);

  // Pelapor & Terlapor
  const [namaPelapor, setNamaPelapor] = useState<string>('');
  const [jenisPelapor, setJenisPelapor] = useState<any>('Perorangan');
  const [alamatPelapor, setAlamatPelapor] = useState<string>('');
  const [kontakPelapor, setKontakPelapor] = useState<string>('');
  const [namaTerlapor, setNamaTerlapor] = useState<string>('');
  const [jenisTerlapor, setJenisTerlapor] = useState<any>('Penyelenggara Pemilu (KPU)');

  // Kuasa Hukum
  const [adaKuasa, setAdaKuasa] = useState<boolean>(false);
  const [namaKuasa, setNamaKuasa] = useState<string>('');

  // Pokok & Petitum
  const [pokokLaporan, setPokokLaporan] = useState<string>('');
  const [halDimohonkan, setHalDimohonkan] = useState<string>('');

  // Attached evidence items
  const [evidenceList, setEvidenceList] = useState<{
    id: string;
    kode: string;
    bentuk: 'Surat' | 'Dokumen Elektronik' | 'Media Simpan / Flashdisk' | 'Barang Bukti Fisik';
    asli_salinan: 'Asli' | 'Salinan Legalisir' | 'Fotokopi' | 'Tangkapan Layar Digital';
    uraian: string;
    file?: File;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    dataUrl?: string;
  }[]>([]);

  // Current evidence input fields
  const [curBuktiKode, setCurBuktiKode] = useState<string>('P-1');
  const [curBuktiBentuk, setCurBuktiBentuk] = useState<'Surat' | 'Dokumen Elektronik' | 'Media Simpan / Flashdisk' | 'Barang Bukti Fisik'>('Surat');
  const [curBuktiKeaslian, setCurBuktiKeaslian] = useState<'Asli' | 'Salinan Legalisir' | 'Fotokopi' | 'Tangkapan Layar Digital'>('Asli');
  const [curBuktiUraian, setCurBuktiUraian] = useState<string>('');
  const [curBuktiFile, setCurBuktiFile] = useState<File | null>(null);
  const [curBuktiDataUrl, setCurBuktiDataUrl] = useState<string>('');

  const [previewItem, setPreviewItem] = useState<GenericFilePreviewData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mode Sidang (Pasal 35)
  const [modeSidang, setModeSidang] = useState<'Luring' | 'Daring'>('Luring');
  const [alasanDaring, setAlasanDaring] = useState<string>('');

  // Auto generated preview nomor register
  const autoNomorRegister = generateNomorRegister({
    nomorUrut: Math.floor(Math.random() * 80) + 10,
    sumber,
    kodeJenis: jalur === 'tsm' ? (kodeJenis === 'ADM.PP' ? 'ADM.TSM.PP' : 'ADM.TSM.PL') : kodeJenis,
    tingkatan,
    kodeWilayah: selectedWilayah.kode,
    tanggal: new Date()
  });

  const [nomorRegisterInput, setNomorRegisterInput] = useState<string>(autoNomorRegister);

  const handleRegenerateRegister = () => {
    const fresh = generateNomorRegister({
      nomorUrut: Math.floor(Math.random() * 80) + 10,
      sumber,
      kodeJenis: jalur === 'tsm' ? (kodeJenis === 'ADM.PP' ? 'ADM.TSM.PP' : 'ADM.TSM.PL') : kodeJenis,
      tingkatan,
      kodeWilayah: selectedWilayah.kode,
      tanggal: new Date()
    });
    setNomorRegisterInput(fresh);
  };

  const handleEvidenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCurBuktiFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setCurBuktiDataUrl(reader.result as string);
    };
    reader.readAsDataURL(f);
  };

  const handleAddEvidenceItem = () => {
    if (!curBuktiKode.trim() || !curBuktiUraian.trim()) {
      alert('Mohon isi Kode Bukti (misal: P-1) dan Uraian Materi Bukti.');
      return;
    }
    const newItem = {
      id: 'bukti-' + Date.now() + '-' + (evidenceList.length + 1),
      kode: curBuktiKode.trim().toUpperCase(),
      bentuk: curBuktiBentuk,
      asli_salinan: curBuktiKeaslian,
      uraian: curBuktiUraian.trim(),
      file: curBuktiFile || undefined,
      fileName: curBuktiFile?.name,
      fileSize: curBuktiFile ? (curBuktiFile.size > 1024 * 1024 ? `${(curBuktiFile.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(curBuktiFile.size / 1024)} KB`) : undefined,
      fileType: curBuktiFile?.type || (curBuktiFile?.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
      dataUrl: curBuktiDataUrl || undefined
    };
    setEvidenceList((prev) => [...prev, newItem]);
    setCurBuktiKode(`P-${evidenceList.length + 2}`);
    setCurBuktiUraian('');
    setCurBuktiFile(null);
    setCurBuktiDataUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveEvidenceItem = (id: string) => {
    setEvidenceList((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syaratFormal || !syaratMateriel) {
      alert('Peringatan: Registrasi hanya dapat dilakukan bila syarat formal dan materiel terpenuhi.');
      return;
    }

    // Pasca penetapan check
    if (flagPascaPenetapan && flagPHPU) {
      alert('Peringatan: Terdapat permohonan PHPU di Mahkamah Konstitusi. Laporan/Temuan tidak diregistrasi sebagai perkara biasa di Bawaslu, melainkan disampaikan sebagai keterangan tertulis kepada MK.');
      return;
    }

    setIsSubmitting(true);
    const tglReg = new Date();
    const tglBatas = tambahHariKerja(tglReg, 14);
    const batasStr = tglBatas.toISOString().split('T')[0];
    const token = null;

    const createdCaseId = 'perkara-' + Date.now();
    const finalNomorRegister = nomorRegisterInput.trim() || autoNomorRegister;

    // Buat initial alat bukti dari inputan bukti yang dimasukkan
    const initialEvidence: AlatBukti[] = evidenceList.map((item, idx) => ({
      id: item.id || ('bukti-' + Date.now() + '-' + idx),
      perkara_id: createdCaseId,
      kode: item.kode,
      pengaju: 'Pelapor',
      bentuk: item.bentuk,
      asli_salinan: item.asli_salinan,
      uraian: item.uraian,
      tgl_disahkan: today,
      berkas_url: item.dataUrl,
      berkas_nama: item.fileName,
      berkas_tipe: item.fileType
    }));

    // Mirror bukti berberkas ke berkas_dokumen
    const initialDokumenBerkas: BerkasDokumenPerkara[] = evidenceList
      .filter((item) => Boolean(item.dataUrl))
      .map((item, idx) => ({
        id: 'dok-bukti-' + Date.now() + '-' + idx,
        perkara_id: createdCaseId,
        kategori: 'daftar_alat_bukti',
        nama_kategori: `Alat Bukti ${item.kode}`,
        nama_file: item.fileName || `Berkas_${item.kode}.pdf`,
        ukuran_file: item.fileSize || '100 KB',
        tipe_file: item.fileType || 'application/pdf',
        data_url: item.dataUrl || '',
        tgl_upload: today,
        pengunggah: namaPelapor || 'Pelapor',
        keterangan: item.uraian
      }));

    // Upload files ke Google Drive (Ekosistem Google)
    try {
      for (let i = 0; i < evidenceList.length; i++) {
        const item = evidenceList[i];
        if (item.file) {
          if (token) {
            const uploaded = await uploadBuktiToDrive(
              token,
              finalNomorRegister,
              item.kode,
              item.file
            );
            if (uploaded?.webViewLink) {
              initialEvidence[i].berkas_url = uploaded.webViewLink;
            }
          } else {
            const ecoUploaded = await uploadFileToGoogleEcosystem({
              file: item.file,
              fileName: `Bukti_${item.kode}_${finalNomorRegister.replace(/[\/\\]/g, '_')}_${item.fileName || 'berkas.pdf'}`,
              folderCategory: 'bukti',
              nomorRegister: finalNomorRegister,
              keterangan: item.uraian
            });
            if (ecoUploaded?.webViewLink) {
              initialEvidence[i].berkas_url = ecoUploaded.webViewLink;
            }
          }
        }
      }

      // Upload Dokumen Berita Acara Registrasi ke Google Drive
      const baContent = `BERITA ACARA REGISTRASI LAPORAN/TEMUAN (ADM.BA-REG)\nNomor Register: ${finalNomorRegister}\nWilayah: ${selectedWilayah.nama}\nPelapor: ${namaPelapor}\nTerlapor: ${namaTerlapor}\nTanggal: ${today}\nPokok: ${pokokLaporan}\nPetitum: ${halDimohonkan}\n\nDisahkan untuk diproses dalam 14 Hari Kerja sesuai Perbawaslu No 8 Tahun 2022.`;
      if (token) {
        await uploadDokumenSidangToDrive(
          token,
          finalNomorRegister,
          'ADM.BA-REG',
          'Berita Acara Registrasi',
          baContent
        );
      }
    } catch (uploadErr) {
      console.warn('Gagal upload lampiran ke Google Drive saat registrasi:', uploadErr);
    }

    const newCase: Perkara = {
      id: createdCaseId,
      nomor_register: finalNomorRegister,
      jalur,
      sumber,
      kode_jenis: jalur === 'tsm' ? (kodeJenis === 'ADM.PP' ? 'ADM.TSM.PP' : 'ADM.TSM.PL') : kodeJenis,
      tingkatan,
      kode_wilayah: selectedWilayah.kode,
      nama_wilayah: selectedWilayah.nama,
      tahapan_pemilu: tahapanPemilu,
      tgl_peristiwa: tglPeristiwa,
      tgl_registrasi: today,
      batas_putusan: batasStr,
      lama_proses_hk: 0,
      sisa_hk: 14,
      status: 'S01', // Status awal: Diregistrasi (ADM.BA-REG)
      mode_sidang: modeSidang,
      alasan_daring: modeSidang === 'Daring' ? alasanDaring : undefined,
      flag_pasca_penetapan_hasil: flagPascaPenetapan,
      flag_PHPU_MK: flagPHPU,
      pokok_laporan: pokokLaporan,
      hal_dimohonkan: halDimohonkan,
      alat_bukti: initialEvidence,
      berkas_dokumen: initialDokumenBerkas,
      pelapor: {
        id: 'p-' + Date.now(),
        perkara_id: createdCaseId,
        peran: sumber === 'TM' ? 'Penemu' : 'Pelapor',
        jenis: jenisPelapor,
        nama: namaPelapor,
        alamat: alamatPelapor,
        kontak: kontakPelapor,
        flag_disamarkan: jenisPelapor === 'Perorangan'
      },
      terlapor: {
        id: 't-' + Date.now(),
        perkara_id: createdCaseId,
        peran: 'Terlapor',
        jenis: jenisTerlapor,
        nama: namaTerlapor
      },
      kuasa_pelapor: adaKuasa && namaKuasa ? {
        id: 'kp-' + Date.now(),
        perkara_id: createdCaseId,
        peran: 'Kuasa Pelapor',
        jenis: 'Perorangan',
        nama: namaKuasa,
        dasar_kuasa: 'Surat Kuasa Khusus terverifikasi'
      } : undefined,
      penetapan: {
        perkara_id: createdCaseId,
        nomor_keputusan: `0${Math.floor(Math.random()*90)+10}/KEP/${tingkatan}/${today.split('-')[0]}`,
        tanggal_keputusan: today,
        ketua_majelis: 'Drs. H. Didih M. Sudi, M.Si',
        anggota_majelis: ['Ade Mongkito, S.H.', 'Bahrul Ulum, S.Ag'],
        sekretaris_pemeriksa: 'Rina Karlina, S.Sos',
        asisten_pemeriksa: 'Danial Al-Faruq, S.H.',
        perisalah: 'Siti Rohmah, S.I.Kom'
      },
      jadwal_sidang: [],
      keterangan: [],
      dokumen: [
        {
          id: 'dok-reg-' + Date.now(),
          perkara_id: createdCaseId,
          kode_formulir: 'ADM.BA-REG',
          nama_formulir: 'Berita Acara Registrasi',
          nomor: `00${Math.floor(Math.random()*80)+10}/BA-REG/ADM/${today.split('-')[0]}`,
          tanggal: today,
          penanda_tangan: 'Petugas Registrasi',
          status_publikasi: 'Publik'
        }
      ],
      riwayat: [
        {
          id: 'rw-reg-1',
          perkara_id: createdCaseId,
          waktu: `${today} 10:00 WIB`,
          tahapan: 'Registrasi',
          proses: `Perkara dicatat di buku register; Nomor ADM.NRL ${finalNomorRegister} terbit; Berita Acara ADM.BA-REG disahkan. Terhubung ke Google Drive ${TARGET_DRIVE_EMAIL}. Timer 14 Hari Kerja dimulai.`,
          pengguna: 'Petugas Registrasi',
          peran: 'Petugas Registrasi',
          dokumen_nama: 'ADM.BA-REG'
        }
      ]
    };

    setIsSubmitting(false);
    onSavePerkara(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white flex items-center justify-between border-b border-red-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-800 text-amber-300">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>REGISTRASI PERKARA PELANGGARAN ADMINISTRATIF</span>
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Penerbitan Nomor ADM.NRL & Berita Acara ADM.BA-REG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live / Editable Register Input Strip */}
        <div className="bg-slate-900 text-amber-400 p-3 sm:px-6 text-xs border-b border-slate-800">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="text-slate-300 font-bold whitespace-nowrap uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Nomor Register (ADM.NRL):</span>
              </label>
              <div className="flex-1 w-full flex items-center gap-1.5">
                <input
                  type="text"
                  value={nomorRegisterInput}
                  onChange={(e) => setNomorRegisterInput(e.target.value)}
                  placeholder="Contoh: 001/LP/ADM.PL/BWSL.PROV/11.00/X/2024"
                  className="w-full bg-slate-950 border border-amber-500/50 focus:border-amber-400 text-amber-300 font-mono font-bold text-xs px-3 py-1.5 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                  required
                />
                <button
                  type="button"
                  onClick={handleRegenerateRegister}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors"
                  title="Generate otomatis format standar Perbawaslu 8/2022 & Juknis 169"
                >
                  <RefreshCw className="w-3 solid text-amber-400" />
                  <span className="hidden md:inline">Format Standar</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 text-slate-400 text-[11px] font-mono shrink-0">
              <span className="bg-slate-800/80 px-2.5 py-1 rounded text-slate-300 border border-slate-700/60">
                Tenggat: 14 Hari Kerja (Ps. 36)
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Jalur, Sumber & Wilayah */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jalur Penyelesaian:</label>
              <select
                value={jalur}
                onChange={(e) => setJalur(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white font-semibold cursor-pointer"
              >
                <option value="biasa">Pemeriksaan Biasa (Ps. 4-39)</option>
                <option value="tsm">Jalur TSM (Ps. 55-71)</option>
                <option value="acara_cepat">Acara Cepat (Ps. 40-43)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sumber Masukan:</label>
              <select
                value={sumber}
                onChange={(e) => setSumber(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white font-semibold cursor-pointer"
              >
                <option value="LP">Laporan Masyarakat (LP)</option>
                <option value="TM">Temuan Pengawas Pemilu (TM)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jenis Pemilu:</label>
              <select
                value={kodeJenis}
                onChange={(e) => setKodeJenis(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white font-semibold cursor-pointer"
              >
                <option value="ADM.PL">Pemilu Legislatif / Umum (ADM.PL)</option>
                <option value="ADM.PP">Pemilihan Presiden (ADM.PP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tingkatan Lembaga:</label>
              <select
                value={tingkatan}
                onChange={(e) => setTingkatan(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white font-semibold cursor-pointer"
              >
                <option value="BWSL.PROV">Bawaslu Provinsi</option>
                <option value="BWSL.KOTA">Bawaslu Kota</option>
                <option value="BWSL.KAB">Bawaslu Kabupaten</option>
                <option value="BWSL">Bawaslu RI</option>
                <option value="PWSL.LN">Panwaslu Luar Negeri</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Wilayah / Satuan Kerja:</label>
              <select
                value={selectedWilayah.kode}
                onChange={(e) => {
                  const found = KODE_WILAYAH_BAWASLU.find(w => w.kode === e.target.value);
                  if (found) setSelectedWilayah(found);
                }}
                className="w-full p-2 border rounded-lg bg-white font-semibold cursor-pointer"
              >
                {KODE_WILAYAH_BAWASLU.map((w) => (
                  <option key={w.kode} value={w.kode}>
                    [{w.kode}] {w.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tahapan Pemilu:</label>
            <select
              value={tahapanPemilu}
              onChange={(e) => setTahapanPemilu(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white cursor-pointer"
            >
              {TAHAPAN_PEMILU_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Section 2: Syarat Formal & Materiel */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
              Verifikasi Syarat Pendaftaran (Syarat Formal & Materiel):
            </span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={syaratFormal}
                  onChange={(e) => setSyaratFormal(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <span>Syarat Formal Terpenuhi (Identitas, Kuasa, Batas Waktu)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={syaratMateriel}
                  onChange={(e) => setSyaratMateriel(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <span>Syarat Materiel Terpenuhi (Uraian Peristiwa & Bukti Awal)</span>
              </label>
            </div>
          </div>

          {/* Section 3: Skenario Pasca Penetapan Hasil Nasional */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <span className="font-bold text-amber-950 block text-xs uppercase tracking-wide">
              Pengecekan Pasca Penetapan Hasil Perolehan Suara Nasional:
            </span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={flagPascaPenetapan}
                  onChange={(e) => setFlagPascaPenetapan(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <span>Peristiwa terjadi setelah Penetapan Hasil Suara Nasional</span>
              </label>
              {flagPascaPenetapan && (
                <label className="flex items-center gap-2 cursor-pointer text-red-800 font-bold">
                  <input
                    type="checkbox"
                    checked={flagPHPU}
                    onChange={(e) => setFlagPHPU(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded cursor-pointer"
                  />
                  <span>Ada Permohonan PHPU di Mahkamah Konstitusi (MK)</span>
                </label>
              )}
            </div>
          </div>

          {/* Section 4: Data Para Pihak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block uppercase tracking-wide">
                Data {sumber === 'TM' ? 'Penemu' : 'Pelapor'}:
              </span>
              <div>
                <label className="text-slate-600 block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={namaPelapor}
                  onChange={(e) => setNamaPelapor(e.target.value)}
                  placeholder="Nama Pelapor / Lembaga Penemu"
                  className="w-full p-2 border rounded-lg bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Jenis Pihak:</label>
                <select
                  value={jenisPelapor}
                  onChange={(e) => setJenisPelapor(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white cursor-pointer"
                >
                  <option value="Perorangan">WNI yang Mempunyai Hak Pilih (Perorangan)</option>
                  <option value="Peserta Pemilu">Peserta Pemilu</option>
                  <option value="Pemantau Pemilu">Pemantau Pemilu Terdaftar</option>
                  <option value="Bawaslu Bawahan">Pengawas Pemilu (Penemu)</option>
                </select>
              </div>
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={adaKuasa}
                    onChange={(e) => setAdaKuasa(e.target.checked)}
                    className="rounded text-amber-600 cursor-pointer"
                  />
                  <span>Diwakili oleh Kuasa Hukum (Surat Kuasa Khusus)</span>
                </label>
                {adaKuasa && (
                  <input
                    type="text"
                    value={namaKuasa}
                    onChange={(e) => setNamaKuasa(e.target.value)}
                    placeholder="Nama Advokat / Kuasa Hukum..."
                    className="w-full p-2 mt-1.5 border rounded-lg bg-white"
                  />
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block uppercase tracking-wide">
                Data Terlapor:
              </span>
              <div>
                <label className="text-slate-600 block mb-1">Nama Pihak Terlapor:</label>
                <input
                  type="text"
                  value={namaTerlapor}
                  onChange={(e) => setNamaTerlapor(e.target.value)}
                  placeholder="Nama Calon / Parpol / KPU"
                  className="w-full p-2 border rounded-lg bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">
                  Jenis Terlapor {jalur === 'tsm' ? '(Khusus Calon / Pasangan Calon)' : ''}:
                </label>
                <select
                  value={jenisTerlapor}
                  onChange={(e) => setJenisTerlapor(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white font-semibold cursor-pointer"
                >
                  {jalur === 'tsm' ? (
                    <>
                      <option value="Pasangan Calon">Pasangan Calon Presiden & Wapres</option>
                      <option value="Calon Anggota DPR/DPD/DPRD">Calon Anggota DPR/DPD/DPRD</option>
                    </>
                  ) : (
                    <>
                      <option value="Penyelenggara Pemilu (KPU)">KPU / KPU Provinsi / KPU Kab/Kota</option>
                      <option value="Partai Politik">Partai Politik Peserta Pemilu</option>
                      <option value="Calon Anggota DPR/DPD/DPRD">Calon Anggota DPR / DPD / DPRD</option>
                      <option value="Pasangan Calon">Pasangan Calon</option>
                      <option value="Tim Kampanye">Tim Kampanye Terdaftar</option>
                      <option value="Penyelenggara Pemilu (PPK/KPPS)">PPK / PPS / KPPS / KPPSLN</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Pokok Laporan & Petitum */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Uraian Pokok Laporan / Temuan:</label>
            <textarea
              value={pokokLaporan}
              onChange={(e) => setPokokLaporan(e.target.value)}
              placeholder="Uraian ringkas peristiwa dan fakta dugaan pelanggaran tata cara atau prosedur administratif..."
              rows={3}
              className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 font-sans"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Hal yang Dimohonkan (Petitum):</label>
            <textarea
              value={halDimohonkan}
              onChange={(e) => setHalDimohonkan(e.target.value)}
              placeholder="1. Menyatakan Terlapor terbukti melakukan pelanggaran... 2. Memerintahkan perbaikan tata cara..."
              rows={2}
              className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 font-sans"
              required
            />
          </div>

          {/* Section 6: Inputan Barang Bukti Sesuai List Detail Perkara */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div>
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <FilePlus2 className="w-4 h-4 text-amber-700" />
                  <span>Inputan Alat Bukti & Berkas Dukung (P-1, P-2, dst.)</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Wajib mengisi kode, bentuk bukti, keaslian, uraian materi, dan dapat melampirkan berkas dokumen untuk pratinjau.
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-full">
                {evidenceList.length} Bukti Ditambahkan
              </span>
            </div>

            {/* Form Input Item Bukti */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
              <span className="font-bold text-slate-800 text-xs block">
                Tambah Bukti Baru Pelapor:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Kode Bukti <span className="text-rose-600">*</span>:
                  </label>
                  <input
                    type="text"
                    value={curBuktiKode}
                    onChange={(e) => setCurBuktiKode(e.target.value)}
                    placeholder="cth: P-1, P-2"
                    className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Bentuk Bukti <span className="text-rose-600">*</span>:
                  </label>
                  <select
                    value={curBuktiBentuk}
                    onChange={(e) => setCurBuktiBentuk(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white text-xs font-semibold cursor-pointer"
                  >
                    <option value="Surat">Surat</option>
                    <option value="Dokumen Elektronik">Dokumen Elektronik</option>
                    <option value="Media Simpan / Flashdisk">Media Simpan / Flashdisk</option>
                    <option value="Barang Bukti Fisik">Barang Bukti Fisik</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Keaslian Bukti <span className="text-rose-600">*</span>:
                  </label>
                  <select
                    value={curBuktiKeaslian}
                    onChange={(e) => setCurBuktiKeaslian(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white text-xs font-semibold cursor-pointer"
                  >
                    <option value="Asli">Asli</option>
                    <option value="Salinan Legalisir">Salinan Legalisir</option>
                    <option value="Fotokopi">Fotokopi</option>
                    <option value="Tangkapan Layar Digital">Tangkapan Layar Digital</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Uraian Materi Bukti <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  value={curBuktiUraian}
                  onChange={(e) => setCurBuktiUraian(e.target.value)}
                  placeholder="Misal: Fotokopi formulir Model C.Hasil-KWK TPS 05 Desa Sindangsari..."
                  className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              {/* Upload Berkas Lampiran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Upload Berkas Lampiran Bukti (PDF / Gambar / Dokumen):
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleEvidenceFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {curBuktiFile && (
                    <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                      📁 Terpilih: {curBuktiFile.name} ({(curBuktiFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={handleAddEvidenceItem}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambahkan ke Daftar Bukti</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List Tabel Alat Bukti yang Telah Ditambahkan */}
            {evidenceList.length > 0 ? (
              <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b text-[11px] uppercase">
                      <th className="py-2 px-3 w-16 text-center">Kode</th>
                      <th className="py-2 px-3 w-28">Bentuk</th>
                      <th className="py-2 px-3 w-28">Keaslian</th>
                      <th className="py-2 px-3">Uraian Materi Bukti</th>
                      <th className="py-2 px-3 w-40 text-center">Berkas Lampiran</th>
                      <th className="py-2 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evidenceList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 text-center">
                          <span className="font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                            {item.kode}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700 font-medium">
                          {item.bentuk}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600">
                            {item.asli_salinan}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-800 font-medium leading-relaxed">
                          {item.uraian}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {item.dataUrl ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewItem({
                                    nama_file: item.fileName || `Bukti_${item.kode}.pdf`,
                                    data_url: item.dataUrl!,
                                    nama_kategori: `Alat Bukti ${item.kode}`,
                                    ukuran_file: item.fileSize || 'Dokumen Bukti',
                                    pengunggah: 'Pelapor'
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors cursor-pointer border border-blue-200"
                                title="Lihat Pratinjau Berkas"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Tanpa berkas</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveEvidenceItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Hapus bukti ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200">
                Belum ada bukti yang dimasukkan. Silakan lengkapi formulir di atas dan klik <strong>"Tambahkan ke Daftar Bukti"</strong> untuk melampirkan alat bukti awal.
              </p>
            )}
          </div>

          <div className="p-4 bg-slate-100 border-t flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-red-700 hover:bg-red-600 disabled:bg-slate-400 text-white font-bold rounded-lg shadow-md flex items-center gap-2 text-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Menyimpan & Menyambungkan ke Drive...'
                  : 'Daftarkan & Terbitkan ADM.BA-REG (Mulai 14 HK)'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {previewItem && (
        <PdfPreviewModal
          dokumen={previewItem}
          nomorRegister={nomorRegisterInput}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
};
