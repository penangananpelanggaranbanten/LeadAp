import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Scale, 
  Calendar, 
  Layers, 
  Users, 
  Gavel, 
  GitPullRequestDraft, 
  History, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2,
  Youtube,
  Radio,
  Eye,
  UploadCloud,
  FileCheck,
  X,
  HardDrive
} from 'lucide-react';
import { 
  Perkara, 
  UserRole, 
  JadwalSidang, 
  AlatBukti, 
  KeteranganSaksiAhli,
  PenetapanMajelis,
  PutusanPerkara,
  BerkasDokumenPerkara
} from '../types/leadAp';
import { STATUS_PERKARA_MAP, getStatusTenggatHK } from '../utils/businessLogic';
import { BerkasDokumenSection } from './BerkasDokumenSection';
import { EditJadwalSidangModal } from './EditJadwalSidangModal';
import { YouTubeStreamModal } from './YouTubeStreamModal';
import { PdfPreviewModal, GenericFilePreviewData } from './PdfPreviewModal';

interface PerkaraDetailProps {
  perkara: Perkara;
  onBack: () => void;
  currentRole: UserRole;
  onOpenSidangSimulator: (perkara: Perkara) => void;
  onOpenFormGenerator: (perkara: Perkara, formKode?: string) => void;
  onOpenAiAnalyst: (perkara: Perkara) => void;
  onUpdatePerkara: (updated: Perkara) => void;
  onOpenKoreksiModal: (perkara: Perkara) => void;
  onOpenEditPerkara?: (perkara: Perkara) => void;
  onOpenDriveManager?: () => void;
}

export const PerkaraDetail: React.FC<PerkaraDetailProps> = ({
  perkara,
  onBack,
  currentRole,
  onOpenSidangSimulator,
  onOpenFormGenerator,
  onOpenAiAnalyst,
  onUpdatePerkara,
  onOpenKoreksiModal,
  onOpenEditPerkara,
  onOpenDriveManager
}) => {
  const isAdmin = currentRole === 'admin';
  const [activeTab, setActiveTab] = useState<
    'data_umum' | 'penetapan' | 'jadwal_sidang' | 'alat_bukti' | 'saksi_ahli' | 'putusan' | 'koreksi' | 'riwayat' | 'berkas_drive'
  >('data_umum');

  useEffect(() => {
    if (!isAdmin && activeTab === 'berkas_drive') {
      setActiveTab('data_umum');
    }
  }, [isAdmin, activeTab]);

  const statusMeta = STATUS_PERKARA_MAP[perkara.status] || {
    kode: perkara.status,
    nama: perkara.status,
    badgeColor: 'bg-slate-100 text-slate-800',
    badgeBorder: 'border-slate-300'
  };
  const tenggatInfo = getStatusTenggatHK(perkara.lama_proses_hk);
  const isInternal = currentRole !== 'publik';

  // Preview modal for generic files (Alat Bukti & Putusan PDF)
  const [previewGenericDoc, setPreviewGenericDoc] = useState<GenericFilePreviewData | null>(null);

  // 1. State Alat Bukti
  const [showAddBukti, setShowAddBukti] = useState<boolean>(false);
  const [newBuktiKode, setNewBuktiKode] = useState<string>('P-' + ((perkara.alat_bukti?.length || 0) + 1));
  const [newBuktiPengaju, setNewBuktiPengaju] = useState<'Pelapor' | 'Penemu' | 'Terlapor'>('Pelapor');
  const [newBuktiBentuk, setNewBuktiBentuk] = useState<'Surat' | 'Dokumen Elektronik' | 'Media Simpan / Flashdisk' | 'Barang Bukti Fisik'>('Surat');
  const [newBuktiKeaslian, setNewBuktiKeaslian] = useState<'Asli' | 'Salinan Legalisir' | 'Fotokopi' | 'Tangkapan Layar Digital'>('Asli');
  const [newBuktiUraian, setNewBuktiUraian] = useState<string>('');
  const [newBuktiFile, setNewBuktiFile] = useState<File | null>(null);
  const [newBuktiDataUrl, setNewBuktiDataUrl] = useState<string>('');
  const [newBuktiDisahkan, setNewBuktiDisahkan] = useState<boolean>(true);
  const buktiFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Bukti Modal state
  const [editingBukti, setEditingBukti] = useState<AlatBukti | null>(null);
  const [editBuktiKode, setEditBuktiKode] = useState<string>('');
  const [editBuktiPengaju, setEditBuktiPengaju] = useState<'Pelapor' | 'Penemu' | 'Terlapor'>('Pelapor');
  const [editBuktiBentuk, setEditBuktiBentuk] = useState<any>('Surat');
  const [editBuktiKeaslian, setEditBuktiKeaslian] = useState<any>('Asli');
  const [editBuktiUraian, setEditBuktiUraian] = useState<string>('');
  const [editBuktiFile, setEditBuktiFile] = useState<File | null>(null);
  const [editBuktiDataUrl, setEditBuktiDataUrl] = useState<string>('');
  const [editBuktiDisahkan, setEditBuktiDisahkan] = useState<boolean>(true);
  const editBuktiFileInputRef = useRef<HTMLInputElement>(null);

  // 2. State Saksi / Ahli / Pihak Terkait
  const [showAddSaksi, setShowAddSaksi] = useState<boolean>(false);
  const [newSaksiJenis, setNewSaksiJenis] = useState<'Saksi' | 'Ahli' | 'Pihak Terkait' | 'Lembaga Terkait' | 'Investigator'>('Saksi');
  const [newSaksiNama, setNewSaksiNama] = useState<string>('');
  const [newSaksiPengaju, setNewSaksiPengaju] = useState<'Pelapor' | 'Penemu' | 'Terlapor' | 'Inisiatif Majelis'>('Pelapor');
  const [newSaksiSumpah, setNewSaksiSumpah] = useState<boolean>(true);
  const [newSaksiAgama, setNewSaksiAgama] = useState<'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu'>('Islam');
  const [newSaksiRingkasan, setNewSaksiRingkasan] = useState<string>('');

  // Edit Saksi Modal state
  const [editingSaksi, setEditingSaksi] = useState<KeteranganSaksiAhli | null>(null);
  const [editSaksiJenis, setEditSaksiJenis] = useState<'Saksi' | 'Ahli' | 'Pihak Terkait' | 'Lembaga Terkait' | 'Investigator'>('Saksi');
  const [editSaksiNama, setEditSaksiNama] = useState<string>('');
  const [editSaksiPengaju, setEditSaksiPengaju] = useState<'Pelapor' | 'Penemu' | 'Terlapor' | 'Inisiatif Majelis'>('Pelapor');
  const [editSaksiSumpah, setEditSaksiSumpah] = useState<boolean>(true);
  const [editSaksiAgama, setEditSaksiAgama] = useState<'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu'>('Islam');
  const [editSaksiRingkasan, setEditSaksiRingkasan] = useState<string>('');

  // 3. State Putusan Perkara
  const [showPutusanModal, setShowPutusanModal] = useState<boolean>(false);
  const [putusanNomor, setPutusanNomor] = useState<string>('');
  const [putusanAmar, setPutusanAmar] = useState<'Terbukti' | 'Tidak Terbukti'>('Terbukti');
  const [putusanTglPleno, setPutusanTglPleno] = useState<string>(new Date().toISOString().split('T')[0]);
  const [putusanTglDibacakan, setPutusanTglDibacakan] = useState<string>(new Date().toISOString().split('T')[0]);
  const [putusanAmarLengkap, setPutusanAmarLengkap] = useState<string>('');
  const [putusanSanksiText, setPutusanSanksiText] = useState<string>('');
  const [putusanPdfFile, setPutusanPdfFile] = useState<File | null>(null);
  const [putusanPdfDataUrl, setPutusanPdfDataUrl] = useState<string>('');
  const putusanFileInputRef = useRef<HTMLInputElement>(null);

  // 4. State Penetapan Majelis
  const [showPenetapanModal, setShowPenetapanModal] = useState<boolean>(false);
  const [penetapanNomorKeputusan, setPenetapanNomorKeputusan] = useState<string>('');
  const [penetapanTanggalKeputusan, setPenetapanTanggalKeputusan] = useState<string>(new Date().toISOString().split('T')[0]);
  const [penetapanKetuaMajelis, setPenetapanKetuaMajelis] = useState<string>('');
  const [penetapanAnggotaMajelis, setPenetapanAnggotaMajelis] = useState<string>('');
  const [penetapanSekretaris, setPenetapanSekretaris] = useState<string>('');
  const [penetapanAsisten, setPenetapanAsisten] = useState<string>('');
  const [penetapanPerisalah, setPenetapanPerisalah] = useState<string>('');
  const [penetapanJuruSumpah, setPenetapanJuruSumpah] = useState<string>('');

  // State untuk form tambah cepat jadwal oleh admin
  const [showAddJadwal, setShowAddJadwal] = useState<boolean>(false);
  const [newJadwalAgenda, setNewJadwalAgenda] = useState<string>('');
  const [newJadwalTgl, setNewJadwalTgl] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newJadwalJam, setNewJadwalJam] = useState<string>('09:00 WIB');

  // State untuk modal edit jadwal sidang dan pemutar siaran YouTube
  const [editingJadwal, setEditingJadwal] = useState<JadwalSidang | null>(null);
  const [activeStreamJadwal, setActiveStreamJadwal] = useState<JadwalSidang | null>(null);

  // Evaluasi kecukupan bukti sah (Pasal 36 ayat 2)
  const buktiSahCount = (perkara.alat_bukti || []).filter((b) => Boolean(b.tgl_disahkan)).length;
  const isBuktiCukup = buktiSahCount >= 2;

  // Syarat pengajuan koreksi (Pasal 45)
  const canAjukanKoreksi = 
    perkara.tingkatan !== 'BWSL' &&
    perkara.jalur !== 'acara_cepat' &&
    (perkara.status === 'S09' || perkara.status === 'S10') &&
    !perkara.koreksi;

  // Handlers Alat Bukti
  const handleBuktiFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (isEdit) {
      setEditBuktiFile(f);
    } else {
      setNewBuktiFile(f);
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (isEdit) {
        setEditBuktiDataUrl(reader.result as string);
      } else {
        setNewBuktiDataUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(f);
  };

  const handleAdminAddBukti = () => {
    if (!newBuktiUraian.trim() || !newBuktiKode.trim()) {
      alert('Lengkapi kode bukti dan uraian materi bukti.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const newB: AlatBukti = {
      id: 'ab-' + Date.now(),
      perkara_id: perkara.id,
      kode: newBuktiKode.trim().toUpperCase(),
      pengaju: newBuktiPengaju,
      bentuk: newBuktiBentuk,
      asli_salinan: newBuktiKeaslian,
      uraian: newBuktiUraian.trim(),
      tgl_disahkan: newBuktiDisahkan ? today : undefined,
      disahkan_oleh: newBuktiDisahkan ? 'Ketua Majelis' : undefined,
      berkas_url: newBuktiDataUrl || undefined,
      berkas_nama: newBuktiFile?.name || undefined,
      berkas_tipe: newBuktiFile?.type || undefined
    };

    let updatedDokumen = perkara.berkas_dokumen || [];
    if (newBuktiDataUrl) {
      const newDok: BerkasDokumenPerkara = {
        id: 'dok-ab-' + Date.now(),
        perkara_id: perkara.id,
        kategori: 'daftar_alat_bukti',
        nama_kategori: `Alat Bukti ${newB.kode}`,
        nama_file: newBuktiFile?.name || `Berkas_${newB.kode}.pdf`,
        ukuran_file: newBuktiFile ? `${Math.round(newBuktiFile.size / 1024)} KB` : 'Dokumen',
        tipe_file: newBuktiFile?.type || 'application/pdf',
        data_url: newBuktiDataUrl,
        tgl_upload: today,
        pengunggah: 'Administrator',
        keterangan: newB.uraian
      };
      updatedDokumen = [...updatedDokumen, newDok];
    }

    const updated: Perkara = {
      ...perkara,
      alat_bukti: [...(perkara.alat_bukti || []), newB],
      berkas_dokumen: updatedDokumen
    };

    onUpdatePerkara(updated);
    setNewBuktiUraian('');
    setNewBuktiFile(null);
    setNewBuktiDataUrl('');
    setNewBuktiKode('P-' + ((updated.alat_bukti.length || 0) + 1));
    setShowAddBukti(false);
  };

  const handleOpenEditBukti = (b: AlatBukti) => {
    setEditingBukti(b);
    setEditBuktiKode(b.kode);
    setEditBuktiPengaju(b.pengaju);
    setEditBuktiBentuk(b.bentuk);
    setEditBuktiKeaslian(b.asli_salinan);
    setEditBuktiUraian(b.uraian);
    setEditBuktiDisahkan(Boolean(b.tgl_disahkan));
    setEditBuktiFile(null);
    setEditBuktiDataUrl(b.berkas_url || '');
  };

  const handleSaveEditBukti = () => {
    if (!editingBukti) return;
    const today = new Date().toISOString().split('T')[0];
    const updatedList = (perkara.alat_bukti || []).map((b) => {
      if (b.id === editingBukti.id) {
        return {
          ...b,
          kode: editBuktiKode.trim().toUpperCase(),
          pengaju: editBuktiPengaju,
          bentuk: editBuktiBentuk,
          asli_salinan: editBuktiKeaslian,
          uraian: editBuktiUraian.trim(),
          tgl_disahkan: editBuktiDisahkan ? (b.tgl_disahkan || today) : undefined,
          disahkan_oleh: editBuktiDisahkan ? 'Ketua Majelis' : undefined,
          berkas_url: editBuktiDataUrl || b.berkas_url,
          berkas_nama: editBuktiFile?.name || b.berkas_nama,
          berkas_tipe: editBuktiFile?.type || b.berkas_tipe
        };
      }
      return b;
    });

    const updated: Perkara = {
      ...perkara,
      alat_bukti: updatedList
    };
    onUpdatePerkara(updated);
    setEditingBukti(null);
  };

  const handleAdminDeleteBukti = (buktiId: string) => {
    if (window.confirm('Hapus alat bukti ini beserta berkas dukungnya?')) {
      const updated: Perkara = {
        ...perkara,
        alat_bukti: (perkara.alat_bukti || []).filter((b) => b.id !== buktiId)
      };
      onUpdatePerkara(updated);
    }
  };

  // Handlers Saksi / Ahli / Pihak Terkait
  const handleAdminAddSaksi = () => {
    if (!newSaksiNama.trim() || !newSaksiRingkasan.trim()) {
      alert('Lengkapi nama dan ringkasan keterangan saksi/ahli.');
      return;
    }
    const newS: KeteranganSaksiAhli = {
      id: 'ksa-' + Date.now(),
      perkara_id: perkara.id,
      jenis: newSaksiJenis,
      nama: newSaksiNama.trim(),
      pengaju: newSaksiPengaju,
      sumpah: newSaksiSumpah,
      agama_sumpah: newSaksiSumpah ? newSaksiAgama : undefined,
      ringkasan: newSaksiRingkasan.trim()
    };
    const updated: Perkara = {
      ...perkara,
      keterangan: [...(perkara.keterangan || []), newS]
    };
    onUpdatePerkara(updated);
    setNewSaksiNama('');
    setNewSaksiRingkasan('');
    setShowAddSaksi(false);
  };

  const handleOpenEditSaksi = (s: KeteranganSaksiAhli) => {
    setEditingSaksi(s);
    setEditSaksiJenis(s.jenis);
    setEditSaksiNama(s.nama);
    setEditSaksiPengaju(s.pengaju);
    setEditSaksiSumpah(s.sumpah);
    setEditSaksiAgama(s.agama_sumpah || 'Islam');
    setEditSaksiRingkasan(s.ringkasan);
  };

  const handleSaveEditSaksi = () => {
    if (!editingSaksi) return;
    const updatedList = (perkara.keterangan || []).map((s) => {
      if (s.id === editingSaksi.id) {
        return {
          ...s,
          jenis: editSaksiJenis,
          nama: editSaksiNama.trim(),
          pengaju: editSaksiPengaju,
          sumpah: editSaksiSumpah,
          agama_sumpah: editSaksiSumpah ? editSaksiAgama : undefined,
          ringkasan: editSaksiRingkasan.trim()
        };
      }
      return s;
    });
    const updated: Perkara = {
      ...perkara,
      keterangan: updatedList
    };
    onUpdatePerkara(updated);
    setEditingSaksi(null);
  };

  const handleAdminDeleteSaksi = (saksiId: string) => {
    if (window.confirm('Hapus keterangan saksi / ahli ini?')) {
      const updated: Perkara = {
        ...perkara,
        keterangan: (perkara.keterangan || []).filter((s) => s.id !== saksiId)
      };
      onUpdatePerkara(updated);
    }
  };

  // Handlers Putusan
  const handlePutusanPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPutusanPdfFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setPutusanPdfDataUrl(reader.result as string);
    };
    reader.readAsDataURL(f);
  };

  const handleOpenPutusanModal = (isEdit: boolean) => {
    if (isEdit && perkara.putusan) {
      setPutusanNomor(perkara.putusan.nomor_putusan);
      setPutusanAmar(perkara.putusan.amar);
      setPutusanTglPleno(perkara.putusan.tgl_pleno);
      setPutusanTglDibacakan(perkara.putusan.tgl_dibacakan);
      setPutusanAmarLengkap(perkara.putusan.amar_lengkap);
      setPutusanSanksiText(perkara.putusan.sanksi?.join(', ') || '');
      setPutusanPdfDataUrl(perkara.putusan.pdf_data_url || '');
    } else {
      setPutusanNomor(`001/PUT/ADM.PL/BWSL.PROV/11.00/V/${new Date().getFullYear()}`);
      setPutusanAmar('Terbukti');
      setPutusanTglPleno(new Date().toISOString().split('T')[0]);
      setPutusanTglDibacakan(new Date().toISOString().split('T')[0]);
      setPutusanAmarLengkap(
        '1. Menyatakan Terlapor terbukti secara sah dan meyakinkan melakukan pelanggaran tata cara administrasi pemilu;\n2. Memberikan sanksi teguran tertulis kepada Terlapor;\n3. Memerintahkan KPU untuk melakukan perbaikan tata cara penyusunan daftar pemilih dalam batas waktu 3 (tiga) hari kerja.'
      );
      setPutusanSanksiText('Teguran Tertulis, Perbaikan Tata Cara');
      setPutusanPdfDataUrl('');
    }
    setPutusanPdfFile(null);
    setShowPutusanModal(true);
  };

  const handleSavePutusan = () => {
    if (!putusanNomor.trim() || !putusanAmarLengkap.trim()) {
      alert('Lengkapi nomor putusan dan amar putusan lengkap.');
      return;
    }
    const sanksiArr = putusanSanksiText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newPutusan: PutusanPerkara = {
      perkara_id: perkara.id,
      nomor_putusan: putusanNomor.trim(),
      tgl_pleno: putusanTglPleno,
      tgl_dibacakan: putusanTglDibacakan,
      amar: putusanAmar,
      amar_ringkas: putusanAmar === 'Terbukti' ? 'Terlapor Terbukti Melanggar' : 'Tidak Terbukti Melanggar',
      amar_lengkap: putusanAmarLengkap.trim(),
      sanksi: sanksiArr,
      tgl_salinan: '≤ 1 Hari Kerja',
      tgl_publikasi: 'Laman Resmi Bawaslu Banten',
      pdf_nama: putusanPdfFile?.name || perkara.putusan?.pdf_nama || `Putusan_${putusanNomor.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      pdf_data_url: putusanPdfDataUrl || perkara.putusan?.pdf_data_url || undefined
    };

    const riwayatBaru = [
      ...(perkara.riwayat || []),
      {
        id: 'rw-' + Date.now(),
        perkara_id: perkara.id,
        waktu: new Date().toISOString().replace('T', ' ').substring(0, 16),
        tahapan: 'Putusan Sidang Terbuka',
        proses: `Pembacaan Putusan ${newPutusan.nomor_putusan} (${newPutusan.amar})`,
        pengguna: 'Majelis Pemeriksa',
        peran: 'Ketua Majelis'
      }
    ];

    const updated: Perkara = {
      ...perkara,
      status: perkara.status === 'S09' || perkara.status === 'S10' || perkara.status === 'S11' || perkara.status === 'S12' || perkara.status === 'S13' || perkara.status === 'S14' ? perkara.status : 'S09',
      putusan: newPutusan,
      riwayat: riwayatBaru
    };
    onUpdatePerkara(updated);
    setShowPutusanModal(false);
  };

  const handleAdminDeletePutusan = () => {
    if (window.confirm('Hapus putusan perkara ini? Status perkara akan disesuaikan kembali.')) {
      const copy = { ...perkara };
      delete copy.putusan;
      if (copy.status === 'S09' || copy.status === 'S10') {
        copy.status = 'S08'; // Musyawarah / Pleno
      }
      onUpdatePerkara(copy);
    }
  };

  const handleDirectUploadPutusanPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !perkara.putusan) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updatedPutusan: PutusanPerkara = {
        ...perkara.putusan!,
        pdf_nama: f.name,
        pdf_data_url: dataUrl
      };
      const updated: Perkara = {
        ...perkara,
        putusan: updatedPutusan
      };
      onUpdatePerkara(updated);
      alert(`Berkas PDF Putusan "${f.name}" berhasil diunggah!`);
    };
    reader.readAsDataURL(f);
  };

  const handleDownloadPutusanPdf = () => {
    if (!perkara.putusan) return;
    const filename = perkara.putusan.pdf_nama || `Putusan_${perkara.putusan.nomor_putusan.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    if (perkara.putusan.pdf_data_url) {
      const link = document.createElement('a');
      link.href = perkara.putusan.pdf_data_url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const textContent = `BADAN PENGAWAS PEMILIHAN UMUM PROVINSI BANTEN\nSALINAN RESMI PUTUSAN\nNomor: ${perkara.putusan.nomor_putusan}\n\nDEMI KEADILAN BERDASARKAN KETUHANAN YANG MAHA ESA\n\nNomor Register: ${perkara.nomor_register}\nPelapor: ${perkara.pelapor.nama}\nTerlapor: ${perkara.terlapor.nama}\n\nAMAR PUTUSAN (${perkara.putusan.amar}):\n${perkara.putusan.amar_lengkap}\n\nSanksi: ${perkara.putusan.sanksi?.join(', ') || '-'}\nPleno: ${perkara.putusan.tgl_pleno} | Sidang Pembacaan: ${perkara.putusan.tgl_dibacakan}\n\nMAJELIS PEMERIKSA BAWASLU PROVINSI BANTEN`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Salinan_Putusan_${perkara.putusan.nomor_putusan.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handlePreviewPutusanPdf = () => {
    if (!perkara.putusan) return;
    if (perkara.putusan.pdf_data_url) {
      setPreviewGenericDoc({
        nama_file: perkara.putusan.pdf_nama || `Putusan_${perkara.putusan.nomor_putusan}.pdf`,
        data_url: perkara.putusan.pdf_data_url,
        nama_kategori: 'Salinan Putusan Resmi',
        pengunggah: 'Majelis Pemeriksa Bawaslu',
        tgl_upload: perkara.putusan.tgl_dibacakan
      });
    } else {
      const textContent = `BADAN PENGAWAS PEMILIHAN UMUM PROVINSI BANTEN\nSALINAN RESMI PUTUSAN SIDANG TERBUKA\nNomor: ${perkara.putusan.nomor_putusan}\n\nDEMI KEADILAN BERDASARKAN KETUHANAN YANG MAHA ESA\n\nPerkara Nomor Register: ${perkara.nomor_register}\nPelapor: ${perkara.pelapor.nama} (${perkara.pelapor.jenis})\nTerlapor: ${perkara.terlapor.nama} (${perkara.terlapor.jenis})\n\nMENGADILI:\n${perkara.putusan.amar_lengkap}\n\nSanksi yang Dijatuhkan:\n${(perkara.putusan.sanksi || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nDiputus dalam Rapat Pleno Bawaslu Provinsi Banten tanggal ${perkara.putusan.tgl_pleno} dan dibacakan dalam sidang terbuka untuk umum pada tanggal ${perkara.putusan.tgl_dibacakan}.\n\nKETUA MAJELIS PEMERIKSA,\nttd\nAli Faisal, S.H., M.H.`;
      const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent);
      setPreviewGenericDoc({
        nama_file: `Salinan_Putusan_${perkara.putusan.nomor_putusan}.txt`,
        data_url: dataUri,
        nama_kategori: 'Salinan Putusan Resmi',
        pengunggah: 'Majelis Pemeriksa Bawaslu',
        tgl_upload: perkara.putusan.tgl_dibacakan
      });
    }
  };

  // Handlers Penetapan Majelis
  const handleOpenPenetapanModal = () => {
    if (perkara.penetapan) {
      setPenetapanNomorKeputusan(perkara.penetapan.nomor_keputusan);
      setPenetapanTanggalKeputusan(perkara.penetapan.tanggal_keputusan);
      setPenetapanKetuaMajelis(perkara.penetapan.ketua_majelis);
      setPenetapanAnggotaMajelis(perkara.penetapan.anggota_majelis.join(', '));
      setPenetapanSekretaris(perkara.penetapan.sekretaris_pemeriksa);
      setPenetapanAsisten(perkara.penetapan.asisten_pemeriksa);
      setPenetapanPerisalah(perkara.penetapan.perisalah);
      setPenetapanJuruSumpah(perkara.penetapan.juru_sumpah || '');
    } else {
      setPenetapanNomorKeputusan(`01/PS.REG/${perkara.nomor_register}`);
      setPenetapanTanggalKeputusan(new Date().toISOString().split('T')[0]);
      setPenetapanKetuaMajelis('Ali Faisal, S.H., M.H.');
      setPenetapanAnggotaMajelis('Ade Wahyu Hidayat, M.Si, Drs. Badrul Munir');
      setPenetapanSekretaris('Drs. H. Narun, M.Si');
      setPenetapanAsisten('Rifki Pratama, S.H.');
      setPenetapanPerisalah('Siti Aisyah, S.Kom');
      setPenetapanJuruSumpah('H. Ahmad Baihaki, S.Ag');
    }
    setShowPenetapanModal(true);
  };

  const handleSavePenetapan = () => {
    if (!penetapanNomorKeputusan.trim() || !penetapanKetuaMajelis.trim()) {
      alert('Lengkapi nomor keputusan dan ketua majelis pemeriksa.');
      return;
    }
    const anggotaArr = penetapanAnggotaMajelis
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const newPenetapan: PenetapanMajelis = {
      perkara_id: perkara.id,
      nomor_keputusan: penetapanNomorKeputusan.trim(),
      tanggal_keputusan: penetapanTanggalKeputusan,
      ketua_majelis: penetapanKetuaMajelis.trim(),
      anggota_majelis: anggotaArr.length > 0 ? anggotaArr : ['Anggota Majelis Pemeriksa'],
      sekretaris_pemeriksa: penetapanSekretaris.trim() || 'Sekretaris Pemeriksa',
      asisten_pemeriksa: penetapanAsisten.trim() || 'Asisten Pemeriksa',
      perisalah: penetapanPerisalah.trim() || 'Perisalah Sidang',
      juru_sumpah: penetapanJuruSumpah.trim() || undefined
    };

    const riwayatBaru = [
      ...(perkara.riwayat || []),
      {
        id: 'rw-' + Date.now(),
        perkara_id: perkara.id,
        waktu: new Date().toISOString().replace('T', ' ').substring(0, 16),
        tahapan: 'Penetapan Majelis',
        proses: `Penetapan Majelis Pemeriksa (${newPenetapan.nomor_keputusan})`,
        pengguna: 'Ketua Bawaslu',
        peran: 'Ketua Bawaslu'
      }
    ];

    const updated: Perkara = {
      ...perkara,
      status: perkara.status === 'S01' ? 'S02' : perkara.status,
      penetapan: newPenetapan,
      riwayat: riwayatBaru
    };
    onUpdatePerkara(updated);
    setShowPenetapanModal(false);
  };

  const handleAdminDeletePenetapan = () => {
    if (window.confirm('Hapus penetapan majelis pemeriksa perkara ini?')) {
      const copy = { ...perkara };
      delete copy.penetapan;
      if (copy.status === 'S02') {
        copy.status = 'S01';
      }
      onUpdatePerkara(copy);
    }
  };

  const handleAdminAddJadwal = () => {
    if (!newJadwalAgenda) return;
    const newJ: JadwalSidang = {
      id: 'js-' + Date.now(),
      perkara_id: perkara.id,
      ke: (perkara.jadwal_sidang?.length || 0) + 1,
      tanggal: newJadwalTgl,
      jam: newJadwalJam,
      agenda: newJadwalAgenda,
      mode: 'Luring',
      lokasi_atau_tautan: 'Ruang Sidang Utama Bawaslu Provinsi Banten',
      status: 'Terjadwal',
      jumlah_pemberitahuan: 1
    };
    const updated = {
      ...perkara,
      jadwal_sidang: [...(perkara.jadwal_sidang || []), newJ]
    };
    onUpdatePerkara(updated);
    setNewJadwalAgenda('');
    setShowAddJadwal(false);
  };

  const handleAdminDeleteJadwal = (jadwalId: string) => {
    if (window.confirm('Hapus jadwal sidang ini?')) {
      const updated = {
        ...perkara,
        jadwal_sidang: (perkara.jadwal_sidang || []).filter((j) => j.id !== jadwalId)
      };
      onUpdatePerkara(updated);
    }
  };

  const handleSaveEditedJadwal = (updatedSidang: JadwalSidang) => {
    const updatedJadwalList = (perkara.jadwal_sidang || []).map((j) =>
      j.id === updatedSidang.id ? updatedSidang : j
    );
    const newRiwayat = {
      id: 'rw-' + Date.now(),
      perkara_id: perkara.id,
      waktu: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tahapan: 'Jadwal Sidang',
      proses: `Pembaruan jadwal sidang ke-${updatedSidang.ke} (${updatedSidang.agenda}): Status ${updatedSidang.status}${updatedSidang.alasan_ditunda ? ` [Alasan: ${updatedSidang.alasan_ditunda}]` : ''}${updatedSidang.tautan_siaran ? ' [Tautan Siaran YouTube Terpasang]' : ''}`,
      pengguna: 'Administrator',
      peran: 'Admin Bawaslu'
    };
    const updated = {
      ...perkara,
      jadwal_sidang: updatedJadwalList,
      riwayat: [newRiwayat, ...(perkara.riwayat || [])]
    };
    onUpdatePerkara(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Navigation Bar & Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 bg-slate-100 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Perkara</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Admin Edit Perkara */}
          {isInternal && (
            <button
              onClick={() => onOpenEditPerkara && onOpenEditPerkara(perkara)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg shadow-sm border border-slate-600 transition-colors cursor-pointer"
              title="Edit data pokok perkara, pihak, status, petitum (Admin)"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Perkara</span>
            </button>
          )}

          {/* Jalankan Sidang Simulator jika internal */}
          {isInternal && (
            <button
              onClick={() => onOpenSidangSimulator(perkara)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded-lg shadow-sm border border-red-800 cursor-pointer"
              title="Simulator Persidangan Pemeriksaan"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Buka Ruang Sidang</span>
            </button>
          )}

          {/* Ajukan Koreksi jika status putusan Prov/Kab/Kota (Admin Only) */}
          {isInternal && canAjukanKoreksi && (
            <button
              onClick={() => onOpenKoreksiModal(perkara)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
            >
              <GitPullRequestDraft className="w-3.5 h-3.5" />
              <span>Ajukan Koreksi (≤ 3 HK)</span>
            </button>
          )}
        </div>
      </div>

      {/* Ringkasan Satu Baris (Matching Bab 6.3 Gambar 2) */}
      <div className="bg-slate-900 text-white rounded-xl shadow-md border-b-2 border-amber-500 overflow-hidden">
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            INFORMASI DETAIL PERKARA
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {perkara.nama_wilayah}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-3 text-xs">
          <div className="p-2 min-w-0 overflow-hidden">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Nomor Register
            </span>
            <span
              className="font-mono font-bold text-amber-300 text-xs sm:text-sm block break-all [overflow-wrap:anywhere] whitespace-normal leading-snug"
              style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
            >
              {perkara.nomor_register.split(/([/-])/).map((part, idx) => (
                <React.Fragment key={idx}>
                  {part}
                  {(part === '/' || part === '-') && <wbr />}
                </React.Fragment>
              ))}
            </span>
          </div>
          <div className="p-2 min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Pelapor / Penemu
            </span>
            <span className="font-semibold text-slate-200 block break-words">
              {currentRole === 'publik' && perkara.pelapor.flag_disamarkan
                ? 'Disamarkan'
                : perkara.pelapor.nama}
            </span>
          </div>
          <div className="p-2 min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Terlapor
            </span>
            <span className="font-semibold text-slate-200 block break-words">
              {perkara.terlapor.nama}
            </span>
          </div>
          <div className="p-2 min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Status Perkara
            </span>
            <div className="mt-0.5">
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${statusMeta.badgeColor}`}>
                {statusMeta.kode} • {statusMeta.nama}
              </span>
            </div>
          </div>
          <div className="p-2 min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Batas Putusan (14 HK)
            </span>
            <span className="font-mono font-bold text-slate-100 block break-words">
              {perkara.batas_putusan}
            </span>
            <span className={`text-[10px] font-semibold mt-0.5 inline-block ${tenggatInfo.badgeClass} px-1.5 rounded`}>
              {perkara.lama_proses_hk}/14 HK ({tenggatInfo.label})
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Menu (Bab 6.3) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 flex items-center overflow-x-auto no-scrollbar">
          {[
            { id: 'data_umum', label: 'Data Umum', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'penetapan', label: 'Penetapan', icon: <Scale className="w-3.5 h-3.5" /> },
            { id: 'jadwal_sidang', label: 'Jadwal Sidang', icon: <Calendar className="w-3.5 h-3.5" />, badge: perkara.jadwal_sidang?.length },
            { id: 'alat_bukti', label: 'Alat Bukti', icon: <Layers className="w-3.5 h-3.5" />, badge: perkara.alat_bukti?.length },
            { id: 'saksi_ahli', label: 'Saksi/Ahli/Terkait', icon: <Users className="w-3.5 h-3.5" />, badge: perkara.keterangan?.length },
            { id: 'putusan', label: 'Putusan', icon: <Gavel className="w-3.5 h-3.5" /> },
            { id: 'koreksi', label: 'Koreksi', icon: <GitPullRequestDraft className="w-3.5 h-3.5" />, highlight: Boolean(perkara.koreksi) },
            { id: 'riwayat', label: 'Riwayat Perkara', icon: <History className="w-3.5 h-3.5" /> },
            ...(isAdmin
              ? [{ id: 'berkas_drive', label: 'Berkas Dokumen', icon: <FileText className="w-3.5 h-3.5" /> }]
              : [])
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-amber-600 text-amber-900 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && (
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Data Umum */}
        {activeTab === 'data_umum' && (
          <div className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>Data Pokok Perkara Sidang Administratif</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500 w-44">Tanggal Registrasi</td>
                    <td className="py-2.5 font-mono font-medium text-slate-900">
                      {perkara.tgl_registrasi} (Mulai hitung 14 HK)
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500 w-44">Nomor Register Resmi</td>
                    <td className="py-2.5 font-mono font-bold text-blue-900 break-all [overflow-wrap:anywhere] whitespace-normal">
                      <span
                        className="block break-all [overflow-wrap:anywhere] whitespace-normal"
                        style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                      >
                        {perkara.nomor_register.split(/([/-])/).map((part, idx) => (
                          <React.Fragment key={idx}>
                            {part}
                            {(part === '/' || part === '-') && <wbr />}
                          </React.Fragment>
                        ))}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Sumber Perkara</td>
                    <td className="py-2.5 text-slate-900">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800 border">
                        {perkara.sumber === 'TM' ? 'Temuan Pengawas Pemilu' : 'Laporan Masyarakat'}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Jenis Perkara / Tahapan</td>
                    <td className="py-2.5 text-slate-900 font-medium">
                      {perkara.kode_jenis} • {perkara.tahapan_pemilu}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Mode Persidangan</td>
                    <td className="py-2.5 text-slate-900">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                        perkara.mode_sidang === 'Luring' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        Sidang {perkara.mode_sidang}
                      </span>
                      {perkara.alasan_daring && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          Alasan: {perkara.alasan_daring}
                        </p>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500 w-44">
                      {perkara.sumber === 'TM' ? 'Penemu' : 'Pelapor'}
                    </td>
                    <td className="py-2.5 text-slate-900 font-semibold">
                      {currentRole === 'publik' && perkara.pelapor.flag_disamarkan ? (
                        <span className="italic text-slate-500">
                          Disamarkan (WNI yang mempunyai hak pilih)
                        </span>
                      ) : (
                        <span>{perkara.pelapor.nama} ({perkara.pelapor.jenis})</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Kuasa Hukum Pelapor</td>
                    <td className="py-2.5 text-slate-900">
                      {perkara.kuasa_pelapor ? (
                        <div>
                          <span className="font-medium">{perkara.kuasa_pelapor.nama}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {perkara.kuasa_pelapor.dasar_kuasa}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Tidak menggunakan kuasa</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Terlapor</td>
                    <td className="py-2.5 text-slate-900 font-semibold">
                      {perkara.terlapor.nama} ({perkara.terlapor.jenis})
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Kuasa Hukum Terlapor</td>
                    <td className="py-2.5 text-slate-900">
                      {perkara.kuasa_terlapor ? (
                        <span className="font-medium">{perkara.kuasa_terlapor.nama}</span>
                      ) : (
                        <span className="text-slate-400 italic">Tidak ada / Mandiri</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Publikasi Data Pribadi</td>
                    <td className="py-2.5 text-slate-700">
                      Terlapor: Ya | Pelapor: {perkara.pelapor.flag_disamarkan ? 'Disamarkan (Publik)' : 'Terbuka'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pokok Laporan & Petitum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Pokok Laporan / Temuan
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {perkara.pokok_laporan}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Hal yang Dimohonkan (Petitum)
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {perkara.hal_dimohonkan}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Penetapan */}
        {activeTab === 'penetapan' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-700" />
                  <span>Penetapan Majelis Pemeriksa & Tim Pendukung Persidangan</span>
                </h3>
                {perkara.penetapan && (
                  <span
                    className="text-xs font-mono font-semibold text-slate-600 block sm:inline mt-0.5 break-all [overflow-wrap:anywhere] whitespace-normal"
                    style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                  >
                    SK: {perkara.penetapan.nomor_keputusan} ({perkara.penetapan.tanggal_keputusan})
                  </span>
                )}
              </div>
              {/* Admin Actions: Input, Edit, Hapus (Public only views) */}
              <div className="flex items-center gap-2">
                {isInternal && (
                  <>
                    {perkara.penetapan ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleOpenPenetapanModal}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                          title="Edit Keputusan Penetapan Majelis"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Penetapan</span>
                        </button>
                        <button
                          onClick={handleAdminDeletePenetapan}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                          title="Hapus Penetapan Majelis"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleOpenPenetapanModal}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Input Penetapan Majelis</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {perkara.penetapan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-amber-800" />
                    <span>Susunan Majelis Pemeriksa</span>
                  </h4>
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 font-medium block">Ketua Majelis Pemeriksa:</span>
                      <span className="font-bold text-slate-900 text-sm">{perkara.penetapan.ketua_majelis}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Anggota Majelis Pemeriksa:</span>
                      <ul className="list-disc list-inside text-slate-800 font-semibold space-y-0.5 mt-0.5">
                        {perkara.penetapan.anggota_majelis.map((anggota, i) => (
                          <li key={i}>{anggota}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 text-[11px] text-amber-800 italic">
                      * Jumlah Majelis: {1 + perkara.penetapan.anggota_majelis.length} orang (Memenuhi syarat minimal 
                      {perkara.jalur === 'tsm' ? ' 3 orang untuk TSM' : ' 2 orang untuk biasa'}).
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-700" />
                    <span>Tim Pendukung Sidang</span>
                  </h4>
                  <div className="text-xs space-y-2.5">
                    <div>
                      <span className="text-slate-500 font-medium block">Sekretaris Pemeriksa:</span>
                      <span className="font-bold text-slate-900">{perkara.penetapan.sekretaris_pemeriksa}</span>
                      <span className="text-[11px] text-slate-500 block">Menyiapkan sidang, menyusun ADM.BA-SP & ceklis bukti</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Asisten Pemeriksa:</span>
                      <span className="font-bold text-slate-900">{perkara.penetapan.asisten_pemeriksa}</span>
                      <span className="text-[11px] text-slate-500 block">Menyiapkan materi kajian yuridis, ringkasan bukti & draf putusan</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Perisalah Sidang:</span>
                      <span className="font-bold text-slate-900">{perkara.penetapan.perisalah}</span>
                      <span className="text-[11px] text-slate-500 block">Menyusun risalah sidang lengkap (ADM.RISALAH) per sesi</span>
                    </div>
                    {perkara.penetapan.juru_sumpah && (
                      <div>
                        <span className="text-slate-500 font-medium block">Juru Sumpah / Protokol:</span>
                        <span className="font-bold text-slate-900">{perkara.penetapan.juru_sumpah}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                <p className="font-medium text-xs">Majelis Pemeriksa belum ditetapkan oleh Ketua Bawaslu.</p>
                {isInternal ? (
                  <div className="mt-3">
                    <p className="text-[11px] text-slate-400 mb-2">
                      Admin dapat mengisikan Surat Keputusan Penetapan Majelis Pemeriksa untuk perkara ini.
                    </p>
                    <button
                      onClick={handleOpenPenetapanModal}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-xl shadow-xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Input Penetapan Majelis Sekarang</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Informasi susunan Majelis Pemeriksa akan ditampilkan setelah diterbitkan SK oleh Ketua Bawaslu.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Jadwal Sidang (Bab 6.3 & Gambar 3) */}
        {activeTab === 'jadwal_sidang' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>Jadwal Persidangan Terbuka</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tata Urutan: Pembacaan → Jawaban → Pembuktian → Kesimpulan → Putusan
                </p>
              </div>
              {isInternal && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddJadwal(!showAddJadwal)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Jadwal</span>
                  </button>
                  <button
                    onClick={() => onOpenSidangSimulator(perkara)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Jalankan Sidang Aktif</span>
                  </button>
                </div>
              )}
            </div>

            {/* Form Tambah Jadwal oleh Admin */}
            {isInternal && showAddJadwal && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 text-xs block">Tambah Agenda Sidang Baru:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newJadwalAgenda}
                    onChange={(e) => setNewJadwalAgenda(e.target.value)}
                    placeholder="Agenda sidang (cth: Pembacaan Jawaban)..."
                    className="p-2 border rounded-lg bg-white text-xs sm:col-span-2"
                  />
                  <input
                    type="date"
                    value={newJadwalTgl}
                    onChange={(e) => setNewJadwalTgl(e.target.value)}
                    className="p-2 border rounded-lg bg-white text-xs font-mono"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddJadwal(false)}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAdminAddJadwal}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs cursor-pointer"
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-28">Tanggal Sidang</th>
                    <th className="py-2.5 px-3 w-24">Jam</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Agenda Sidang</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Ruang / Tautan Daring</th>
                    <th className="py-2.5 px-3 w-28 text-center">Status</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Alasan Ditunda / Catatan</th>
                    <th className="py-2.5 px-3 w-28 text-center">Siaran Langsung</th>
                    {isInternal && <th className="py-2.5 px-3 w-16 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perkara.jadwal_sidang && perkara.jadwal_sidang.length > 0 ? (
                    perkara.jadwal_sidang.map((sidang) => (
                      <tr key={sidang.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-600">
                          {sidang.ke}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                          {sidang.tanggal}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                          {sidang.jam}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {sidang.agenda}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <span className="block font-medium">{sidang.lokasi_atau_tautan}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Mode: {sidang.mode}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {sidang.status === 'Sedang Berlangsung' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white shadow-xs animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              <span>Live Sidang</span>
                            </span>
                          ) : sidang.status === 'Ditunda' ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Ditunda
                            </span>
                          ) : sidang.status === 'Terlaksana' ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              Terlaksana
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                              Terjadwal
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[11px]">
                          {sidang.status === 'Ditunda' && sidang.alasan_ditunda ? (
                            <div className="bg-amber-50/90 border border-amber-300 rounded-lg p-2 text-amber-900 space-y-0.5">
                              <div className="flex items-center gap-1 font-bold text-[10px] text-amber-800 uppercase tracking-wide">
                                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Alasan Penundaan:</span>
                              </div>
                              <p className="font-medium text-slate-800 leading-tight">
                                {sidang.alasan_ditunda}
                              </p>
                              {sidang.catatan_sidang && (
                                <p className="text-[10px] text-slate-500 italic pt-0.5 border-t border-amber-200">
                                  Catatan: {sidang.catatan_sidang}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-slate-600">
                              {sidang.catatan_sidang || '-'}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {sidang.tautan_siaran ? (
                            <button
                              onClick={() => setActiveStreamJadwal(sidang)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 px-2.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                              title="Tonton Siaran Langsung YouTube Sidang Terbuka"
                            >
                              <Youtube className="w-3.5 h-3.5" />
                              <span>Live Stream</span>
                            </button>
                          ) : isInternal ? (
                            <button
                              onClick={() => setEditingJadwal(sidang)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-semibold cursor-pointer"
                              title="Cantumkan tautan siaran YouTube"
                            >
                              + Tautkan Live
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        {isInternal && (
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setEditingJadwal(sidang)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Agenda, Status, Alasan & Siaran Sidang"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleAdminDeleteJadwal(sidang.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Jadwal Sidang (Admin)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isInternal ? 9 : 8} className="py-6 text-center text-slate-400">
                        Belum ada jadwal persidangan yang dimasukkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Alat Bukti */}
        {activeTab === 'alat_bukti' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>Daftar Alat Bukti (P-n dan T-n)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pengesahan bukti dengan verifikasi checklist asli/salinan & penegasan Majelis
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isInternal && (
                  <button
                    onClick={() => setShowAddBukti(!showAddBukti)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Bukti</span>
                  </button>
                )}
                {/* Status Kecukupan 2 Bukti Sah (Pasal 36 ayat 2) */}
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                  isBuktiCukup
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {isBuktiCukup ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {buktiSahCount} Disahkan ({isBuktiCukup ? 'Syarat Terpenuhi' : 'Kurang dari 2 Bukti'})
                  </span>
                </div>
              </div>
            </div>

            {/* Form Tambah Bukti oleh Admin */}
            {isInternal && showAddBukti && (
              <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3 shadow-xs">
                <span className="font-bold text-slate-900 text-xs block uppercase tracking-wide">
                  Tambah Alat Bukti Baru:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Kode Bukti <span className="text-rose-600">*</span>:
                    </label>
                    <input
                      type="text"
                      value={newBuktiKode}
                      onChange={(e) => setNewBuktiKode(e.target.value)}
                      placeholder="Kode (cth: P-1, T-1)"
                      className="w-full p-2 border rounded-lg bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Pihak Pengaju <span className="text-rose-600">*</span>:
                    </label>
                    <select
                      value={newBuktiPengaju}
                      onChange={(e) => setNewBuktiPengaju(e.target.value as any)}
                      className="w-full p-2 border rounded-lg bg-white text-xs font-semibold cursor-pointer"
                    >
                      <option value="Pelapor">Pelapor</option>
                      <option value="Penemu">Penemu</option>
                      <option value="Terlapor">Terlapor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Bentuk Bukti <span className="text-rose-600">*</span>:
                    </label>
                    <select
                      value={newBuktiBentuk}
                      onChange={(e) => setNewBuktiBentuk(e.target.value as any)}
                      className="w-full p-2 border rounded-lg bg-white text-xs font-semibold cursor-pointer"
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
                      value={newBuktiKeaslian}
                      onChange={(e) => setNewBuktiKeaslian(e.target.value as any)}
                      className="w-full p-2 border rounded-lg bg-white text-xs font-semibold cursor-pointer"
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
                    value={newBuktiUraian}
                    onChange={(e) => setNewBuktiUraian(e.target.value)}
                    placeholder="Uraian dokumen / fakta materi alat bukti..."
                    className="w-full p-2 border rounded-lg bg-white text-xs"
                  />
                </div>

                {/* Upload berkas lampiran pendukung & Checklist pengesahan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1 border-t border-amber-200">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Upload Berkas Lampiran Pendukung (PDF / Gambar / Dokumen):
                    </label>
                    <input
                      type="file"
                      ref={buktiFileInputRef}
                      onChange={(e) => handleBuktiFileChange(e, false)}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                    />
                    {newBuktiFile && (
                      <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                        📁 File terpilih: {newBuktiFile.name} ({(newBuktiFile.size / 1024).toFixed(1)} KB)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={newBuktiDisahkan}
                        onChange={(e) => setNewBuktiDisahkan(e.target.checked)}
                        className="rounded text-emerald-600 w-4 h-4 cursor-pointer"
                      />
                      <span>Sahkan oleh Majelis Pemeriksa</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddBukti(false)}
                        className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleAdminAddBukti}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
                      >
                        Simpan Bukti
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b text-[11px] uppercase">
                    <th className="py-2.5 px-3 w-16 text-center">Kode</th>
                    <th className="py-2.5 px-3 w-24">Pengaju</th>
                    <th className="py-2.5 px-3 w-28">Bentuk</th>
                    <th className="py-2.5 px-3 w-28">Keaslian</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Uraian Materi Bukti</th>
                    <th className="py-2.5 px-3 w-36 text-center">Berkas Lampiran</th>
                    <th className="py-2.5 px-3 w-28 text-center">Pengesahan</th>
                    {isInternal && <th className="py-2.5 px-3 w-24 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perkara.alat_bukti && perkara.alat_bukti.length > 0 ? (
                    perkara.alat_bukti.map((bukti) => (
                      <tr key={bukti.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center">
                          <span className={`font-mono font-extrabold px-2 py-0.5 rounded text-xs ${
                            bukti.kode.startsWith('P')
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-rose-100 text-rose-900 border border-rose-200'
                          }`}>
                            {bukti.kode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {bukti.pengaju}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                          {bukti.bentuk}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600 border border-slate-200">
                            {bukti.asli_salinan}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 leading-relaxed font-sans">
                          {bukti.uraian}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {bukti.berkas_url ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewGenericDoc({
                                    nama_file: bukti.berkas_nama || `Bukti_${bukti.kode}.pdf`,
                                    data_url: bukti.berkas_url!,
                                    nama_kategori: `Alat Bukti ${bukti.kode}`,
                                    pengunggah: bukti.pengaju,
                                    ukuran_file: 'Berkas Sah'
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                                title="Lihat Pratinjau Berkas"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                              <a
                                href={bukti.berkas_url}
                                download={bukti.berkas_nama || `Bukti_${bukti.kode}.pdf`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                title="Unduh Berkas"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">Fisik (Tanpa file)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {bukti.tgl_disahkan ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Sah</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum sah</span>
                          )}
                        </td>
                        {isInternal && (
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditBukti(bukti)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="Edit Alat Bukti (Admin)"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleAdminDeleteBukti(bukti.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                title="Hapus Bukti (Admin)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isInternal ? 8 : 7} className="py-6 text-center text-slate-400">
                        Belum ada alat bukti yang diajukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Saksi / Ahli / Terkait */}
        {activeTab === 'saksi_ahli' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>Keterangan Saksi, Ahli, dan Pihak/Lembaga Terkait</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Saksi dan Ahli wajib disumpah terlebih dahulu (Formulir ADM.BA-SUMPAH)
                </p>
              </div>
              {isInternal && (
                <button
                  type="button"
                  onClick={() => setShowAddSaksi(!showAddSaksi)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Saksi / Ahli</span>
                </button>
              )}
            </div>

            {/* Form Tambah Saksi / Ahli oleh Admin */}
            {isInternal && showAddSaksi && (
              <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3 shadow-xs">
                <span className="font-bold text-slate-900 text-xs block uppercase tracking-wide">
                  Input Keterangan Saksi / Ahli Baru:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Jenis Keterangan <span className="text-rose-600">*</span>:
                    </label>
                    <select
                      value={newSaksiJenis}
                      onChange={(e) => setNewSaksiJenis(e.target.value as any)}
                      className="w-full p-2 border rounded-lg bg-white text-xs font-semibold cursor-pointer"
                    >
                      <option value="Saksi">Saksi Fakta</option>
                      <option value="Ahli">Ahli Hukum / Pemilu</option>
                      <option value="Pihak Terkait">Pihak Terkait</option>
                      <option value="Lembaga Terkait">Lembaga Terkait (cth: KPU / Bawaslu)</option>
                      <option value="Investigator">Investigator / Tim Penemu</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nama Lengkap <span className="text-rose-600">*</span>:
                    </label>
                    <input
                      type="text"
                      value={newSaksiNama}
                      onChange={(e) => setNewSaksiNama(e.target.value)}
                      placeholder="Nama saksi / gelar ahli..."
                      className="w-full p-2 border rounded-lg bg-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Pihak Pengaju <span className="text-rose-600">*</span>:
                    </label>
                    <select
                      value={newSaksiPengaju}
                      onChange={(e) => setNewSaksiPengaju(e.target.value as any)}
                      className="w-full p-2 border rounded-lg bg-white text-xs font-semibold cursor-pointer"
                    >
                      <option value="Pelapor">Pelapor</option>
                      <option value="Terlapor">Terlapor</option>
                      <option value="Penemu">Penemu</option>
                      <option value="Inisiatif Majelis">Inisiatif Majelis Pemeriksa</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={newSaksiSumpah}
                        onChange={(e) => setNewSaksiSumpah(e.target.checked)}
                        className="rounded text-emerald-600 w-4 h-4 cursor-pointer"
                      />
                      <span>Telah Mengucapkan Sumpah / Janji (ADM.BA-SUMPAH)</span>
                    </label>
                  </div>
                  {newSaksiSumpah && (
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                        Agama Sumpah:
                      </label>
                      <select
                        value={newSaksiAgama}
                        onChange={(e) => setNewSaksiAgama(e.target.value as any)}
                        className="flex-1 p-2 border rounded-lg bg-white text-xs font-semibold cursor-pointer"
                      >
                        <option value="Islam">Islam (Al-Qur'an)</option>
                        <option value="Kristen">Kristen Protestan (Alkitab)</option>
                        <option value="Katolik">Katolik (Alkitab)</option>
                        <option value="Hindu">Hindu (Weda)</option>
                        <option value="Buddha">Buddha (Tripitaka)</option>
                        <option value="Konghucu">Konghucu (Si Shu Wu Jing)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Ringkasan Pokok Keterangan di Muka Sidang <span className="text-rose-600">*</span>:
                  </label>
                  <textarea
                    value={newSaksiRingkasan}
                    onChange={(e) => setNewSaksiRingkasan(e.target.value)}
                    placeholder="Ringkasan keterangan mengenai peristiwa, waktu, tempat, fakta yang dilihat/didengar/dialami sendiri atau pendapat keahlian..."
                    rows={2}
                    className="w-full p-2 border rounded-lg bg-white text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => setShowAddSaksi(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminAddSaksi}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
                  >
                    Simpan Saksi / Ahli
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase text-[11px]">
                    <th className="py-2.5 px-3 w-12 text-center">No</th>
                    <th className="py-2.5 px-3 w-28">Jenis</th>
                    <th className="py-2.5 px-3 w-44">Nama</th>
                    <th className="py-2.5 px-3 w-28">Pengaju</th>
                    <th className="py-2.5 px-3 w-32 text-center">Status Sumpah</th>
                    <th className="py-2.5 px-3 min-w-[280px]">Ringkasan Pokok Keterangan</th>
                    {isInternal && <th className="py-2.5 px-3 w-20 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perkara.keterangan && perkara.keterangan.length > 0 ? (
                    perkara.keterangan.map((ket, idx) => (
                      <tr key={ket.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                            {ket.jenis}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{ket.nama}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">{ket.pengaju}</td>
                        <td className="py-2.5 px-3 text-center">
                          {ket.sumpah ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold" title={`Disumpah agama ${ket.agama_sumpah || 'Islam'}`}>
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>ADM.BA-SUMPAH</span>
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[11px] font-bold">
                              Belum Sumpah
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 leading-relaxed font-sans">
                          {ket.ringkasan}
                        </td>
                        {isInternal && (
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditSaksi(ket)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="Edit Saksi / Ahli"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdminDeleteSaksi(ket.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Hapus Saksi / Ahli"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isInternal ? 7 : 6} className="py-6 text-center text-slate-400">
                        Belum ada saksi, ahli, atau pihak terkait yang diperiksa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Putusan */}
        {activeTab === 'putusan' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-amber-700" />
                  <span>Salinan Putusan & Publikasi ADM.STATUS</span>
                </h3>
                {perkara.putusan && (
                  <span
                    className="text-xs font-mono font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded mt-0.5 inline-block break-all [overflow-wrap:anywhere] whitespace-normal"
                    style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                  >
                    Nomor: {perkara.putusan.nomor_putusan}
                  </span>
                )}
              </div>
              {/* Action buttons: Admin (Edit, Hapus, Input) vs Public */}
              <div className="flex items-center gap-2">
                {isInternal && (
                  <>
                    {perkara.putusan ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPutusanModal(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                          title="Edit Hasil Putusan Sidang (Admin)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Putusan</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAdminDeletePutusan}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                          title="Hapus Putusan (Admin)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenPutusanModal(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors"
                        title="Input Hasil Putusan Sidang & Unggah Berkas PDF (Admin)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Input & Unggah Putusan Baru</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {perkara.putusan ? (
              <div className="space-y-4">
                {/* Dokumen PDF Putusan Card (Preview, Download, Upload) */}
                <div className="p-4 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-900/60 text-red-300 rounded-xl border border-red-700/50">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                          Berkas Salinan Putusan Resmi (Format PDF)
                        </span>
                        {perkara.putusan.pdf_data_url ? (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                            PDF Terunggah
                          </span>
                        ) : (
                          <span className="bg-amber-950 text-amber-400 border border-amber-700 text-[10px] px-2 py-0.5 rounded font-mono">
                            Draf Dokumen
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        {perkara.putusan.pdf_nama || `Putusan_${perkara.putusan.nomor_putusan.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    {/* Pratinjau PDF (Bisa dilihat publik & admin) */}
                    <button
                      type="button"
                      onClick={handlePreviewPutusanPdf}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer transition-colors"
                      title="Lihat Pratinjau Dokumen PDF Putusan"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Pratinjau PDF</span>
                    </button>
                    {/* Unduh PDF (Bisa diunduh publik & admin) */}
                    <button
                      type="button"
                      onClick={handleDownloadPutusanPdf}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs cursor-pointer transition-colors"
                      title="Unduh Salinan Putusan PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh PDF</span>
                    </button>
                    {/* Admin Only: Upload / Ganti Berkas PDF */}
                    {isInternal && (
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs cursor-pointer transition-colors">
                        <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ganti Berkas PDF</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleDirectUploadPutusanPdf}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold uppercase">Amar Putusan:</span>
                      <span className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                        perkara.putusan.amar === 'Terbukti'
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-700 text-white'
                      }`}>
                        {perkara.putusan.amar.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Pleno: {perkara.putusan.tgl_pleno} | Sidang Pembacaan: {perkara.putusan.tgl_dibacakan}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      AMAR PUTUSAN LENGKAP:
                    </span>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-serif leading-relaxed text-slate-900 whitespace-pre-line shadow-xs">
                      {perkara.putusan.amar_lengkap}
                    </div>
                  </div>

                  {perkara.putusan.sanksi && perkara.putusan.sanksi.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        SANKSI YANG DIJATUHKAN:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {perkara.putusan.sanksi.map((s, i) => (
                          <span key={i} className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-xs border border-amber-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                    <div className="flex items-center gap-3">
                      <span>Salinan Para Pihak: {perkara.putusan.tgl_salinan || '≤ 1 HK'}</span>
                      <span>Publikasi Laman: {perkara.putusan.tgl_publikasi || 'ADM.STATUS Resmi'}</span>
                    </div>
                  </div>
                </div>

                {/* Masa Permintaan Koreksi */}
                {perkara.tingkatan !== 'BWSL' && perkara.jalur !== 'acara_cepat' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                        <GitPullRequestDraft className="w-4 h-4 text-blue-700" />
                        <span>Masa Permintaan Koreksi ke Bawaslu RI</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                        Tenggat: ≤ 3 Hari Kerja
                      </span>
                    </div>
                    <p className="text-xs text-blue-900 leading-relaxed">
                      Para pihak (Pelapor/Penemu atau Terlapor) berhak mengajukan permintaan koreksi kepada Bawaslu RI
                      dalam waktu paling lambat 3 (tiga) hari kerja sejak putusan dibacakan, terbatas pada alasan kesalahan penerapan hukum.
                    </p>
                    {canAjukanKoreksi && (
                      <div className="pt-2">
                        <button
                          onClick={() => onOpenKoreksiModal(perkara)}
                          className="bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                        >
                          Ajukan Permintaan Koreksi ke Bawaslu RI Sekarang
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed flex flex-col items-center justify-center">
                <Gavel className="w-8 h-8 text-slate-400 mb-2" />
                <p className="font-semibold text-xs text-slate-700">Putusan belum dibacakan dalam sidang terbuka.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Batas putusan: {perkara.batas_putusan} ({perkara.sisa_hk} HK tersisa).
                </p>
                {isInternal && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleOpenPutusanModal(false)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Input & Unggah Putusan Baru (Admin)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Koreksi (Bab 4.3 & Diagram 3) */}
        {activeTab === 'koreksi' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <GitPullRequestDraft className="w-4 h-4 text-amber-700" />
                <span>Alur Permintaan Koreksi di Bawaslu RI</span>
              </h3>
            </div>

            {perkara.koreksi ? (
              <div className="space-y-4">
                {/* Penanda Penundaan Eksekusi */}
                <div className="p-3 bg-red-100 border border-red-300 rounded-xl flex items-center gap-2.5 text-red-900 font-bold text-xs">
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
                  <span>
                    PERHATIAN: Pelaksanaan putusan Bawaslu Provinsi/Kabupaten/Kota DITUNDA selama proses koreksi berjalan di Bawaslu RI.
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="min-w-0 overflow-hidden">
                      <span className="text-slate-500 block font-semibold">Nomor Register Koreksi (KS):</span>
                      <span
                        className="font-mono font-bold text-blue-900 text-sm block break-all [overflow-wrap:anywhere] whitespace-normal"
                        style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                      >
                        {perkara.koreksi.nomor_KS.split(/([/-])/).map((part, idx) => (
                          <React.Fragment key={idx}>
                            {part}
                            {(part === '/' || part === '-') && <wbr />}
                          </React.Fragment>
                        ))}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Pemohon Koreksi:</span>
                      <span className="font-bold text-slate-900">{perkara.koreksi.nama_pemohon} ({perkara.koreksi.pemohon})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Tanggal Diajukan & Register:</span>
                      <span className="font-mono text-slate-900">{perkara.koreksi.tgl_diajukan} (Reg: {perkara.koreksi.tgl_register})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Tenggat Putusan Koreksi:</span>
                      <span className="font-mono text-slate-900">≤ 7 Hari Kerja sejak registrasi</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <span className="text-slate-500 block font-semibold mb-1">
                      Alasan Koreksi (Kesalahan Penerapan Hukum):
                    </span>
                    <p className="p-3 bg-white rounded border text-slate-800 italic leading-relaxed">
                      {perkara.koreksi.alasan_koreksi}
                    </p>
                  </div>

                  {perkara.koreksi.amar_koreksi && (
                    <div className="p-3 bg-white rounded-lg border border-slate-300">
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        PUTUSAN KOREKSI BAWASLU RI:
                      </span>
                      <span className="font-bold text-sm text-purple-900">
                        {perkara.koreksi.amar_koreksi}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed space-y-2">
                <p className="font-medium text-xs">Belum ada permohonan koreksi yang diajukan untuk perkara ini.</p>
                {canAjukanKoreksi && (
                  <button
                    onClick={() => onOpenKoreksiModal(perkara)}
                    className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                  >
                    <GitPullRequestDraft className="w-3.5 h-3.5" />
                    <span>Ajukan Permintaan Koreksi</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Riwayat Perkara (Bab 6.3 & Gambar 3) */}
        {activeTab === 'riwayat' && (
          <div className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b pb-2">
              <History className="w-4 h-4 text-amber-700" />
              <span>Log Kronologis Riwayat Perkara & Dokumen Formulir Terbit</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-36">Waktu / Tanggal</th>
                    <th className="py-2.5 px-3 w-36">Tahapan</th>
                    <th className="py-2.5 px-3 min-w-[280px]">Uraian Proses Hukum</th>
                    <th className="py-2.5 px-3 w-36">Dokumen Resmi</th>
                    <th className="py-2.5 px-3 w-36">Pengguna / Peran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perkara.riwayat && perkara.riwayat.length > 0 ? (
                    perkara.riwayat.map((rw, idx) => (
                      <tr key={rw.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">{rw.waktu}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{rw.tahapan}</td>
                        <td className="py-2.5 px-3 text-slate-900 leading-relaxed font-sans">{rw.proses}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-blue-900">
                          {rw.dokumen_nama ? (
                            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded">
                              {rw.dokumen_nama}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="font-medium text-slate-800 block">{rw.pengguna}</span>
                          <span className="text-[10px] text-slate-400">{rw.peran}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Log kronologis perkara tersimpan otomatis sesuai peristiwa persidangan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 8: Berkas Dokumen (Khusus Admin) */}
        {isAdmin && activeTab === 'berkas_drive' && (
          <BerkasDokumenSection
            perkara={perkara}
            currentRole={currentRole}
            onUpdatePerkara={onUpdatePerkara}
          />
        )}
      </div>

      {/* Modal Edit Agenda & Jadwal Sidang (Admin) */}
      <EditJadwalSidangModal
        isOpen={Boolean(editingJadwal)}
        onClose={() => setEditingJadwal(null)}
        sidang={editingJadwal}
        perkara={perkara}
        onSave={handleSaveEditedJadwal}
      />

      {/* Modal Pemutar Siaran Langsung YouTube Sidang Terbuka */}
      <YouTubeStreamModal
        isOpen={Boolean(activeStreamJadwal)}
        onClose={() => setActiveStreamJadwal(null)}
        sidang={activeStreamJadwal}
        perkara={perkara}
      />

      {/* Pratinjau Dokumen & Berkas (PDF / Gambar) */}
      {previewGenericDoc && (
        <PdfPreviewModal
          dokumen={previewGenericDoc}
          nomorRegister={perkara.nomor_register}
          onClose={() => setPreviewGenericDoc(null)}
        />
      )}

      {/* Modal Edit Alat Bukti (Admin) */}
      {editingBukti && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500 text-slate-950">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Edit Alat Bukti</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Kode Bukti: {editingBukti.kode}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingBukti(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Kode Bukti:
                  </label>
                  <input
                    type="text"
                    value={editBuktiKode}
                    onChange={(e) => setEditBuktiKode(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Pihak Pengaju:
                  </label>
                  <select
                    value={editBuktiPengaju}
                    onChange={(e) => setEditBuktiPengaju(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold cursor-pointer"
                  >
                    <option value="Pelapor">Pelapor</option>
                    <option value="Penemu">Penemu</option>
                    <option value="Terlapor">Terlapor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Bentuk Bukti:
                  </label>
                  <select
                    value={editBuktiBentuk}
                    onChange={(e) => setEditBuktiBentuk(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold cursor-pointer"
                  >
                    <option value="Surat">Surat</option>
                    <option value="Dokumen Elektronik">Dokumen Elektronik</option>
                    <option value="Media Simpan / Flashdisk">Media Simpan / Flashdisk</option>
                    <option value="Barang Bukti Fisik">Barang Bukti Fisik</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Keaslian Bukti:
                  </label>
                  <select
                    value={editBuktiKeaslian}
                    onChange={(e) => setEditBuktiKeaslian(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold cursor-pointer"
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
                  Uraian Materi Bukti:
                </label>
                <textarea
                  value={editBuktiUraian}
                  onChange={(e) => setEditBuktiUraian(e.target.value)}
                  rows={2}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Unggah / Ganti Berkas Lampiran:
                </label>
                <input
                  type="file"
                  ref={editBuktiFileInputRef}
                  onChange={(e) => handleBuktiFileChange(e, true)}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 cursor-pointer"
                />
                {editBuktiFile ? (
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    📁 Berkas baru: {editBuktiFile.name} ({(editBuktiFile.size / 1024).toFixed(1)} KB)
                  </span>
                ) : editingBukti.berkas_nama ? (
                  <span className="text-[10px] text-slate-600 block">
                    Berkas saat ini: <span className="font-mono font-bold">{editingBukti.berkas_nama}</span>
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editBuktiDisahkan}
                    onChange={(e) => setEditBuktiDisahkan(e.target.checked)}
                    className="rounded text-emerald-600 w-4 h-4 cursor-pointer"
                  />
                  <span>Disahkan oleh Majelis Pemeriksa</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingBukti(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditBukti}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Saksi / Ahli (Admin) */}
      {editingSaksi && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500 text-slate-950">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Edit Data Saksi / Ahli</h3>
                  <p className="text-[11px] text-slate-400">Pembaruan keterangan di muka sidang</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSaksi(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Jenis:
                  </label>
                  <select
                    value={editSaksiJenis}
                    onChange={(e) => setEditSaksiJenis(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold cursor-pointer"
                  >
                    <option value="Saksi">Saksi Fakta</option>
                    <option value="Ahli">Ahli Hukum / Pemilu</option>
                    <option value="Pihak Terkait">Pihak Terkait</option>
                    <option value="Lembaga Terkait">Lembaga Terkait</option>
                    <option value="Investigator">Investigator</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nama Lengkap:
                  </label>
                  <input
                    type="text"
                    value={editSaksiNama}
                    onChange={(e) => setEditSaksiNama(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Pihak Pengaju:
                  </label>
                  <select
                    value={editSaksiPengaju}
                    onChange={(e) => setEditSaksiPengaju(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold cursor-pointer"
                  >
                    <option value="Pelapor">Pelapor</option>
                    <option value="Terlapor">Terlapor</option>
                    <option value="Penemu">Penemu</option>
                    <option value="Inisiatif Majelis">Inisiatif Majelis</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Agama Sumpah:
                  </label>
                  <select
                    value={editSaksiAgama}
                    onChange={(e) => setEditSaksiAgama(e.target.value as any)}
                    disabled={!editSaksiSumpah}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editSaksiSumpah}
                    onChange={(e) => setEditSaksiSumpah(e.target.checked)}
                    className="rounded text-emerald-600 w-4 h-4 cursor-pointer"
                  />
                  <span>Telah Mengucapkan Sumpah / Janji (ADM.BA-SUMPAH)</span>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Ringkasan Pokok Keterangan:
                </label>
                <textarea
                  value={editSaksiRingkasan}
                  onChange={(e) => setEditSaksiRingkasan(e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSaksi(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditSaksi}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input & Edit Putusan Sidang (Admin) */}
      {showPutusanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-700 text-white">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {perkara.putusan ? 'Edit Putusan Perkara' : 'Input Putusan Sidang Terbuka'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Hasil Musyawarah Pleno & Sidang Pembacaan Putusan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPutusanModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nomor Putusan:
                  </label>
                  <input
                    type="text"
                    value={putusanNomor}
                    onChange={(e) => setPutusanNomor(e.target.value)}
                    placeholder="Contoh: 001/PUT/ADM.PL/BWSL.PROV/11.00/V/2024"
                    className="w-full p-2 border rounded-lg bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Amar Putusan:
                  </label>
                  <select
                    value={putusanAmar}
                    onChange={(e) => setPutusanAmar(e.target.value as any)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-bold cursor-pointer"
                  >
                    <option value="Terbukti">Terbukti Melanggar</option>
                    <option value="Tidak Terbukti">Tidak Terbukti Melanggar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tanggal Rapat Pleno Tertutup:
                  </label>
                  <input
                    type="date"
                    value={putusanTglPleno}
                    onChange={(e) => setPutusanTglPleno(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tanggal Pembacaan Sidang Terbuka:
                  </label>
                  <input
                    type="date"
                    value={putusanTglDibacakan}
                    onChange={(e) => setPutusanTglDibacakan(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Amar Putusan Lengkap (Diktum Mengadili):
                </label>
                <textarea
                  value={putusanAmarLengkap}
                  onChange={(e) => setPutusanAmarLengkap(e.target.value)}
                  rows={4}
                  placeholder="1. Menyatakan Terlapor terbukti secara sah dan meyakinkan...&#10;2. Memberikan sanksi teguran tertulis...&#10;3. Memerintahkan KPU untuk..."
                  className="w-full p-2 border rounded-lg bg-slate-50 font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Sanksi yang Dijatuhkan (pisahkan dengan koma):
                </label>
                <input
                  type="text"
                  value={putusanSanksiText}
                  onChange={(e) => setPutusanSanksiText(e.target.value)}
                  placeholder="Contoh: Teguran Tertulis, Perbaikan Tata Cara Administrasi"
                  className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                />
              </div>

              {/* Upload Berkas PDF Putusan */}
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 space-y-2">
                <label className="text-[11px] font-bold text-red-950 block">
                  Unggah Berkas PDF Salinan Resmi Putusan:
                </label>
                <input
                  type="file"
                  ref={putusanFileInputRef}
                  onChange={handlePutusanPdfChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-100 file:text-red-900 hover:file:bg-red-200 cursor-pointer"
                />
                {putusanPdfFile ? (
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    📁 File PDF terpilih: {putusanPdfFile.name} ({(putusanPdfFile.size / 1024).toFixed(1)} KB)
                  </span>
                ) : perkara.putusan?.pdf_nama ? (
                  <span className="text-[10px] text-slate-600 block">
                    File saat ini: <span className="font-mono font-bold">{perkara.putusan.pdf_nama}</span>
                  </span>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPutusanModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePutusan}
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Simpan Putusan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input & Edit Penetapan Majelis (Admin) */}
      {showPenetapanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500 text-slate-950">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {perkara.penetapan ? 'Edit Penetapan Majelis Pemeriksa' : 'Input Penetapan Majelis Pemeriksa'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Keputusan Ketua Bawaslu / Pimpinan (Pasal 19-21 Perbawaslu 8/2022)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPenetapanModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nomor Keputusan SK Penetapan:
                  </label>
                  <input
                    type="text"
                    value={penetapanNomorKeputusan}
                    onChange={(e) => setPenetapanNomorKeputusan(e.target.value)}
                    placeholder="Contoh: 01/PS.REG/001/LP/ADM.PL/..."
                    className="w-full p-2 border rounded-lg bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tanggal Keputusan:
                  </label>
                  <input
                    type="date"
                    value={penetapanTanggalKeputusan}
                    onChange={(e) => setPenetapanTanggalKeputusan(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Ketua Majelis Pemeriksa:
                </label>
                <input
                  type="text"
                  value={penetapanKetuaMajelis}
                  onChange={(e) => setPenetapanKetuaMajelis(e.target.value)}
                  placeholder="Nama & gelar Ketua Majelis..."
                  className="w-full p-2 border rounded-lg bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Anggota Majelis Pemeriksa (pisahkan koma untuk multiple):
                </label>
                <input
                  type="text"
                  value={penetapanAnggotaMajelis}
                  onChange={(e) => setPenetapanAnggotaMajelis(e.target.value)}
                  placeholder="Nama anggota majelis 1, Nama anggota majelis 2..."
                  className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Sekretaris Pemeriksa:
                  </label>
                  <input
                    type="text"
                    value={penetapanSekretaris}
                    onChange={(e) => setPenetapanSekretaris(e.target.value)}
                    placeholder="Sekretaris Pemeriksa..."
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Asisten Pemeriksa:
                  </label>
                  <input
                    type="text"
                    value={penetapanAsisten}
                    onChange={(e) => setPenetapanAsisten(e.target.value)}
                    placeholder="Asisten Pemeriksa..."
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Perisalah Persidangan:
                  </label>
                  <input
                    type="text"
                    value={penetapanPerisalah}
                    onChange={(e) => setPenetapanPerisalah(e.target.value)}
                    placeholder="Perisalah Sidang..."
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Juru Sumpah:
                  </label>
                  <input
                    type="text"
                    value={penetapanJuruSumpah}
                    onChange={(e) => setPenetapanJuruSumpah(e.target.value)}
                    placeholder="Juru Sumpah..."
                    className="w-full p-2 border rounded-lg bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPenetapanModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePenetapan}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Simpan Penetapan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
