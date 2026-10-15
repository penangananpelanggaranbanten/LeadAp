import React, { useState, useEffect, useRef } from 'react';
import { 
  DownloadCloud, 
  UploadCloud, 
  FileText, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  ExternalLink, 
  Trash2, 
  HardDrive, 
  FileCheck, 
  Printer, 
  FileCode, 
  ShieldCheck, 
  Info, 
  X,
  File as FileIcon,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Plus,
  CloudUpload,
  Edit3
} from 'lucide-react';
import { FormulirMaster, UserRole, FormulirDraftFile, FormulirAkses } from '../types/leadAp';
import { DAFTAR_21_FORMULIR, getDefaultFormulirContent } from '../data/daftarFormulirMaster';
import { 
  googleSignIn,
  getCachedAccessToken, 
  uploadDraftFormulirToDrive, 
  TARGET_DRIVE_EMAIL 
} from '../services/googleDriveService';

interface UnduhFormulirViewProps {
  currentRole: UserRole;
  onOpenLoginModal: () => void;
  onOpenDriveManager: () => void;
}

const STORAGE_KEY = 'leadap_daftar_formulir_master_v1';

export const UnduhFormulirView: React.FC<UnduhFormulirViewProps> = ({
  currentRole,
  onOpenLoginModal,
  onOpenDriveManager
}) => {
  const isAdmin = currentRole === 'admin';

  // State master formulir list (loaded from localStorage or initial master list)
  const [formulirList, setFormulirList] = useState<FormulirMaster[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('leadap_daftar_formulir_master_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sinkronkan data master terbaru (termasuk formulir 22 dan 23 yang baru)
          // sambil tetap mempertahankan file draft kustom yang pernah diunggah oleh admin
          const baseList = DAFTAR_21_FORMULIR.map((masterItem) => {
            const savedItem = parsed.find((p: any) => p.no === masterItem.no);
            if (savedItem && savedItem.draftFile) {
              return {
                ...masterItem,
                draftFile: savedItem.draftFile
              };
            }
            return masterItem;
          });
          // Pertahankan formulir kustom tambahan (no > 23) yang pernah ditambahkan pengguna
          const customItems = parsed.filter(
            (p: any) => !DAFTAR_21_FORMULIR.some((m) => m.no === p.no)
          );
          return [...baseList, ...customItems];
        }
      }
    } catch (e) {
      console.warn('Gagal memuat draft formulir dari localStorage:', e);
    }
    return DAFTAR_21_FORMULIR;
  });

  // Active division tab for Admin ('semua' | 'admin' | 'publik')
  const [adminTab, setAdminTab] = useState<'semua' | 'admin' | 'publik'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRujukan, setFilterRujukan] = useState<string>('semua');

  // Modal Upload State
  const [uploadTarget, setUploadTarget] = useState<FormulirMaster | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCatatan, setUploadCatatan] = useState('');
  const [saveToDriveOption, setSaveToDriveOption] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Tambah Formulir Baru State (Admin)
  const [showAddFormModal, setShowAddFormModal] = useState(false);
  const [newFormKode, setNewFormKode] = useState('');
  const [newFormPerihal, setNewFormPerihal] = useState('');
  const [newFormRujukan, setNewFormRujukan] = useState('Perbawaslu 8/2022');
  const [newFormAkses, setNewFormAkses] = useState<FormulirAkses>('Publik');
  const [newFormFile, setNewFormFile] = useState<File | null>(null);
  const [newFormSaveToDrive, setNewFormSaveToDrive] = useState(true);
  const [isSubmittingNewForm, setIsSubmittingNewForm] = useState(false);
  const addFormFileInputRef = useRef<HTMLInputElement>(null);

  // Modal Edit Formulir State (Admin)
  const [editingFormulir, setEditingFormulir] = useState<FormulirMaster | null>(null);
  const [editFormKode, setEditFormKode] = useState('');
  const [editFormPerihal, setEditFormPerihal] = useState('');
  const [editFormRujukan, setEditFormRujukan] = useState('');
  const [editFormAkses, setEditFormAkses] = useState<FormulirAkses>('Publik');
  const [editFormFile, setEditFormFile] = useState<File | null>(null);
  const [editFormCatatan, setEditFormCatatan] = useState('');
  const [isSubmittingEditForm, setIsSubmittingEditForm] = useState(false);
  const editFormFileInputRef = useRef<HTMLInputElement>(null);

  // Modal Hapus Formulir Lengkap State (Admin)
  const [deletingFormulir, setDeletingFormulir] = useState<FormulirMaster | null>(null);

  // State sinkronisasi massal Google Drive
  const [isSyncingAllDrive, setIsSyncingAllDrive] = useState(false);

  // Modal Access Restricted Alert (for public attempting to download Admin-only form)
  const [restrictedModalTarget, setRestrictedModalTarget] = useState<FormulirMaster | null>(null);

  // Modal View Dokumen & Integrasi Google Docs
  const [previewTarget, setPreviewTarget] = useState<FormulirMaster | null>(null);
  const [previewTab, setPreviewTab] = useState<'gdocs' | 'web_viewer' | 'raw'>('gdocs');
  const [copiedText, setCopiedText] = useState(false);
  const [isExportingToDrive, setIsExportingToDrive] = useState(false);

  // Modal Confirm Delete Custom Draft
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<FormulirMaster | null>(null);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Helper salin teks ke clipboard
  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
    showToast('Teks naskah formulir berhasil disalin ke clipboard!');
  };

  // Helper Buka Dokumen di Google Docs
  const handleOpenGoogleDocs = (item: FormulirMaster) => {
    if (item.draftFile?.driveUrl) {
      window.open(item.draftFile.driveUrl, '_blank');
      showToast('Membuka draft formulir di Google Docs / Google Drive...');
      return;
    }
    const text = getDefaultFormulirContent(item);
    navigator.clipboard.writeText(text);
    window.open('https://docs.google.com/document/create', '_blank');
    showToast(
      'Teks template formulir telah disalin ke clipboard & Google Docs dibuka. Tekan Ctrl+V (Paste) di dokumen Google Docs Anda!',
      'info'
    );
  };

  // Helper Cetak / Print Dokumen Resmi
  const handlePrintDocument = (item: FormulirMaster) => {
    const rawContent = getDefaultFormulirContent(item);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${item.kode} - Bawaslu Provinsi Banten</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; color: #111; margin: 0; padding: 10px; }
            .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 20px; }
            .kop h3 { margin: 0; font-size: 13pt; font-weight: bold; }
            .kop h2 { margin: 2px 0; font-size: 15pt; font-weight: bold; }
            .kop p { margin: 2px 0; font-size: 9pt; }
            pre { font-family: 'Times New Roman', Times, serif; font-size: 11pt; white-space: pre-wrap; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="kop">
            <h3>BADAN PENGAWAS PEMILIHAN UMUM</h3>
            <h2>PROVINSI BANTEN</h2>
            <p>Jalan KH. Abdul Fatah Hasan No. 88, Cipare, Kota Serang, Banten 42117</p>
            <p>Telp: (0254) 8480300 | Laman: banten.bawaslu.go.id</p>
          </div>
          <pre>${rawContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // Helper Simpan & Buka di Google Drive / Docs
  const handleExportPreviewToDrive = async (item: FormulirMaster) => {
    const token = getCachedAccessToken();
    if (!token) {
      handleOpenGoogleDocs(item);
      return;
    }
    setIsExportingToDrive(true);
    try {
      const raw = getDefaultFormulirContent(item);
      const fileBlob = new Blob([raw], { type: 'text/plain' });
      const file = new File([fileBlob], `${item.kode.replace(/[/\\?%*:|"<>]/g, '_')}.doc`, { type: 'text/plain' });
      const driveRes = await uploadDraftFormulirToDrive(token, file, item.kode);
      setIsExportingToDrive(false);
      showToast('Berhasil menyimpan draft ke Google Drive! Membuka di Google Docs...');
      if (driveRes.webViewLink) {
        window.open(driveRes.webViewLink, '_blank');
      }
    } catch (err) {
      console.error(err);
      setIsExportingToDrive(false);
      handleOpenGoogleDocs(item);
    }
  };

  // Save to localStorage whenever formulirList changes
  const saveFormulirList = (newList: FormulirMaster[]) => {
    setFormulirList(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.warn('Gagal menyimpan formulir ke localStorage:', e);
    }
  };

  // Helper check whether the current user has download permission
  const canDownload = (item: FormulirMaster) => {
    if (isAdmin) return true;
    return item.keterangan.toLowerCase().includes('publik');
  };

  // Handle Download Action
  const handleDownload = (item: FormulirMaster) => {
    if (!canDownload(item)) {
      setRestrictedModalTarget(item);
      return;
    }

    // If admin has uploaded a custom draft file with dataUrl
    if (item.draftFile && item.draftFile.dataUrl) {
      const link = document.createElement('a');
      link.href = item.draftFile.dataUrl;
      link.download = item.draftFile.namaFile;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Mengunduh berkas draft: "${item.draftFile.namaFile}"`);
      return;
    }

    // Otherwise generate standard Word (.doc) draft document with official formatting
    const rawContent = getDefaultFormulirContent(item);
    const htmlDoc = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${item.kode} - ${item.perihal}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.3; margin: 2.5cm; }
          h2, h3 { text-align: center; margin: 0; padding: 0; font-weight: bold; }
          .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 8px; margin-bottom: 20px; }
          pre { font-family: 'Times New Roman', Times, serif; white-space: pre-wrap; font-size: 11pt; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>BADAN PENGAWAS PEMILIHAN UMUM</h2>
          <h3>PROVINSI BANTEN</h3>
          <p style="font-size: 10pt; margin: 2px 0;">Jl. KH. Abdul Fatah Hasan No. 88, Cipare, Serang - Banten 42117</p>
        </div>
        <pre>${rawContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeFileName = `${item.kode.replace(/[/\\?%*:|"<>]/g, '_')}_DRAFT.doc`;
    link.href = url;
    link.download = safeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Mengunduh draft resmi Bawaslu: "${safeFileName}"`);
  };

  // Open Upload Modal
  const openUploadModal = (item: FormulirMaster) => {
    if (!isAdmin) {
      onOpenLoginModal();
      return;
    }
    setUploadTarget(item);
    setUploadFile(null);
    setUploadCatatan(item.draftFile?.catatan || '');
  };

  // Process file upload by Admin
  const handleSaveUpload = async () => {
    if (!uploadTarget || !uploadFile) {
      showToast('Pilih berkas draft yang akan diunggah.', 'error');
      return;
    }
    setIsUploading(true);
    try {
      // Convert to base64 for persistent storage in localStorage
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(uploadFile);
      });

      const fileExtension = uploadFile.name.split('.').pop()?.toLowerCase() || 'docx';
      const formattedSize = uploadFile.size > 1024 * 1024 
        ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(uploadFile.size / 1024)} KB`;

      let driveLink = '';
      let driveFileId = '';

      // Upload ke Google Drive jika opsi dicentang
      let token = getCachedAccessToken();
      if (saveToDriveOption) {
        if (!token) {
          try {
            const authRes = await googleSignIn();
            if (authRes) {
              token = authRes.accessToken;
            }
          } catch (driveAuthErr) {
            console.warn('Google Drive auth dilewati / dibatalkan:', driveAuthErr);
          }
        }
        if (token) {
          try {
            const driveRes = await uploadDraftFormulirToDrive(
              token,
              uploadFile,
              uploadTarget.kode
            );
            driveLink = driveRes.webViewLink || '';
            driveFileId = driveRes.id;
          } catch (driveErr) {
            console.warn('Gagal upload ke Google Drive, tetap simpan lokal:', driveErr);
          }
        }
      }

      const draftInfo: FormulirDraftFile = {
        namaFile: uploadFile.name,
        ukuran: formattedSize,
        tipe: fileExtension,
        tglUpload: new Date().toISOString().split('T')[0],
        uploadedBy: 'Administrator Bawaslu',
        catatan: uploadCatatan.trim(),
        driveFileId,
        driveUrl: driveLink,
        dataUrl: base64Data
      };

      const updated = formulirList.map((f) => {
        if (f.no === uploadTarget.no) {
          return {
            ...f,
            draftFile: draftInfo
          };
        }
        return f;
      });

      saveFormulirList(updated);
      setIsUploading(false);
      setUploadTarget(null);
      showToast(
        `Draft formulir "${uploadTarget.kode}" berhasil diunggah (${uploadFile.name})${driveLink ? ' & disinkronkan ke Google Drive!' : '!'}`
      );
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      showToast('Gagal memproses unggahan berkas.', 'error');
    }
  };

  // Sinkronkan berkas draft spesifik ke Google Drive
  const handleSyncFileToDrive = async (item: FormulirMaster) => {
    if (!item.draftFile?.dataUrl) {
      showToast('Tidak ada data berkas yang dapat disinkronkan.', 'error');
      return;
    }
    let token = getCachedAccessToken();
    if (!token) {
      try {
        const authRes = await googleSignIn();
        if (!authRes) return;
        token = authRes.accessToken;
      } catch (authErr: any) {
        showToast('Gagal menghubungkan Google Drive: ' + authErr.message, 'error');
        return;
      }
    }
    showToast(`Mengunggah "${item.draftFile.namaFile}" ke Google Drive...`, 'info');
    try {
      const res = await fetch(item.draftFile.dataUrl);
      const blob = await res.blob();
      const file = new File([blob], item.draftFile.namaFile, { type: blob.type });
      const driveRes = await uploadDraftFormulirToDrive(token, file, item.kode);

      const updated = formulirList.map((f) => {
        if (f.no === item.no && f.draftFile) {
          return {
            ...f,
            draftFile: {
              ...f.draftFile,
              driveFileId: driveRes.id,
              driveUrl: driveRes.webViewLink || ''
            }
          };
        }
        return f;
      });
      saveFormulirList(updated);
      showToast(`Berkas "${item.draftFile.namaFile}" berhasil disimpan ke Google Drive!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal menyimpan ke Google Drive: ' + err.message, 'error');
    }
  };

  // Sinkronkan semua berkas yang belum tersimpan di Drive secara massal
  const handleSyncAllFilesToDrive = async () => {
    let token = getCachedAccessToken();
    if (!token) {
      try {
        const authRes = await googleSignIn();
        if (!authRes) return;
        token = authRes.accessToken;
      } catch (authErr: any) {
        showToast('Gagal menghubungkan Google Drive: ' + authErr.message, 'error');
        return;
      }
    }

    const itemsToSync = formulirList.filter(
      (f) => f.draftFile && f.draftFile.dataUrl && !f.draftFile.driveUrl
    );
    if (itemsToSync.length === 0) {
      showToast('Seluruh berkas formulir sudah tersinkronkan ke Google Drive.', 'info');
      return;
    }

    setIsSyncingAllDrive(true);
    showToast(`Menyinkronkan ${itemsToSync.length} berkas ke Google Drive (${TARGET_DRIVE_EMAIL})...`, 'info');
    let successCount = 0;
    let updatedList = [...formulirList];

    for (const item of itemsToSync) {
      if (!item.draftFile?.dataUrl) continue;
      try {
        const res = await fetch(item.draftFile.dataUrl);
        const blob = await res.blob();
        const file = new File([blob], item.draftFile.namaFile, { type: blob.type });
        const driveRes = await uploadDraftFormulirToDrive(token, file, item.kode);

        updatedList = updatedList.map((f) => {
          if (f.no === item.no && f.draftFile) {
            return {
              ...f,
              draftFile: {
                ...f.draftFile,
                driveFileId: driveRes.id,
                driveUrl: driveRes.webViewLink || ''
              }
            };
          }
          return f;
        });
        successCount++;
      } catch (e) {
        console.warn(`Gagal sync berkas ${item.kode}:`, e);
      }
    }

    saveFormulirList(updatedList);
    setIsSyncingAllDrive(false);
    showToast(`Berhasil menyimpan ${successCount} dari ${itemsToSync.length} berkas ke Google Drive!`, 'success');
  };

  // Tambah formulir baru oleh Administrator
  const handleAddNewForm = async () => {
    if (!newFormKode.trim() || !newFormPerihal.trim()) {
      showToast('Lengkapi Kode dan Perihal formulir.', 'error');
      return;
    }
    setIsSubmittingNewForm(true);
    try {
      let draftInfo: FormulirDraftFile | undefined = undefined;
      if (newFormFile) {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(newFormFile);
        });

        let driveLink = '';
        let driveFileId = '';
        let token = getCachedAccessToken();
        if (newFormSaveToDrive) {
          if (!token) {
            try {
              const authRes = await googleSignIn();
              if (authRes) token = authRes.accessToken;
            } catch (e) {
              console.warn('Sign in dilewati:', e);
            }
          }
          if (token) {
            try {
              const driveRes = await uploadDraftFormulirToDrive(token, newFormFile, newFormKode);
              driveLink = driveRes.webViewLink || '';
              driveFileId = driveRes.id;
            } catch (e) {
              console.warn('Drive upload error:', e);
            }
          }
        }

        const fileExtension = newFormFile.name.split('.').pop()?.toLowerCase() || 'docx';
        const formattedSize = newFormFile.size > 1024 * 1024 
          ? `${(newFormFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(newFormFile.size / 1024)} KB`;

        draftInfo = {
          namaFile: newFormFile.name,
          ukuran: formattedSize,
          tipe: fileExtension,
          tglUpload: new Date().toISOString().split('T')[0],
          uploadedBy: 'Administrator Bawaslu',
          driveFileId,
          driveUrl: driveLink,
          dataUrl: base64Data
        };
      }

      const nextNo = formulirList.reduce((max, f) => Math.max(max, f.no), 0) + 1;
      const newFormItem: FormulirMaster = {
        no: nextNo,
        kode: newFormKode.trim(),
        perihal: newFormPerihal.trim(),
        rujukan: newFormRujukan.trim() || 'Perbawaslu 8/2022',
        keterangan: newFormAkses,
        draftFile: draftInfo
      };

      const updated = [...formulirList, newFormItem];
      saveFormulirList(updated);
      setIsSubmittingNewForm(false);
      setShowAddFormModal(false);
      setNewFormKode('');
      setNewFormPerihal('');
      setNewFormFile(null);
      showToast(`Formulir "${newFormItem.kode}" berhasil ditambahkan!`, 'success');
    } catch (err: any) {
      console.error(err);
      setIsSubmittingNewForm(false);
      showToast('Gagal menambahkan formulir baru: ' + err.message, 'error');
    }
  };

  // Reset / Delete custom draft back to official default
  const executeDeleteDraft = (item: FormulirMaster) => {
    if (!isAdmin) return;
    const updated = formulirList.map((f) => {
      if (f.no === item.no) {
        const copy = { ...f };
        delete copy.draftFile;
        return copy;
      }
      return f;
    });
    saveFormulirList(updated);
    setConfirmDeleteTarget(null);
    showToast(`Draft kustom ${item.kode} dihapus. Templat dikembalikan ke standar resmi.`);
  };

  // Buka modal edit formulir oleh Admin
  const openEditFormModal = (item: FormulirMaster) => {
    setEditingFormulir(item);
    setEditFormKode(item.kode);
    setEditFormPerihal(item.perihal);
    setEditFormRujukan(item.rujukan);
    setEditFormAkses(item.keterangan);
    setEditFormCatatan(item.draftFile?.catatan || '');
    setEditFormFile(null);
  };

  // Simpan perubahan formulir oleh Admin
  const handleSaveEditForm = async () => {
    if (!editingFormulir || !editFormKode.trim() || !editFormPerihal.trim()) {
      showToast('Lengkapi Kode dan Perihal formulir.', 'error');
      return;
    }
    setIsSubmittingEditForm(true);
    try {
      let draftInfo = editingFormulir.draftFile;
      if (editFormFile) {
        let driveLink = '';
        let driveFileId = '';
        let token = getCachedAccessToken();
        if (token) {
          try {
            const driveRes = await uploadDraftFormulirToDrive(token, editFormFile, editFormKode);
            driveLink = driveRes.webViewLink || '';
            driveFileId = driveRes.id;
          } catch (e) {
            console.warn('Drive upload error in edit:', e);
          }
        }
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(editFormFile);
        });
        const fileExtension = editFormFile.name.split('.').pop()?.toLowerCase() || 'docx';
        const formattedSize = editFormFile.size > 1024 * 1024 
          ? `${(editFormFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(editFormFile.size / 1024)} KB`;

        draftInfo = {
          namaFile: editFormFile.name,
          ukuran: formattedSize,
          tipe: fileExtension,
          tglUpload: new Date().toISOString().split('T')[0],
          uploadedBy: 'Administrator Bawaslu',
          catatan: editFormCatatan.trim(),
          driveFileId: driveFileId || draftInfo?.driveFileId,
          driveUrl: driveLink || draftInfo?.driveUrl,
          dataUrl: base64Data
        };
      } else if (draftInfo && editFormCatatan !== draftInfo.catatan) {
        draftInfo = {
          ...draftInfo,
          catatan: editFormCatatan.trim()
        };
      }

      const updated = formulirList.map((f) => {
        if (f.no === editingFormulir.no) {
          return {
            ...f,
            kode: editFormKode.trim(),
            perihal: editFormPerihal.trim(),
            rujukan: editFormRujukan.trim() || 'Perbawaslu 8/2022',
            keterangan: editFormAkses,
            draftFile: draftInfo
          };
        }
        return f;
      });
      saveFormulirList(updated);
      setIsSubmittingEditForm(false);
      setEditingFormulir(null);
      showToast(`Formulir "${editFormKode}" berhasil diperbarui!`, 'success');
    } catch (err: any) {
      console.error(err);
      setIsSubmittingEditForm(false);
      showToast('Gagal memperbarui formulir: ' + err.message, 'error');
    }
  };

  // Hapus formulir secara permanen dari daftar direktori oleh Admin
  const handleDeleteFormulir = (item: FormulirMaster) => {
    const updated = formulirList.filter((f) => f.no !== item.no);
    saveFormulirList(updated);
    setDeletingFormulir(null);
    showToast(`Formulir "${item.kode}" berhasil dihapus dari direktori!`, 'success');
  };

  // Filtered List: Segregated strictly by division
  const filteredList = formulirList.filter((item) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        item.no.toString().includes(q) ||
        item.kode.toLowerCase().includes(q) ||
        item.perihal.toLowerCase().includes(q) ||
        item.rujukan.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q) ||
        (isAdmin && (item.draftFile?.namaFile.toLowerCase().includes(q) ?? false));
      if (!match) return false;
    }

    // Pembagian Formulir:
    // Admin: tampilkan sesuai tab pembagian ('semua' = semua formulir termasuk publik, 'admin' = khusus admin, 'publik' = formulir publik)
    // Publik: HANYA tampilkan formulir pembagian publik (tidak dimunculkan formulir admin)
    if (isAdmin) {
      if (adminTab === 'admin') {
        if (!item.keterangan.toLowerCase().includes('admin')) return false;
      } else if (adminTab === 'publik') {
        if (!item.keterangan.toLowerCase().includes('publik')) return false;
      }
      // 'semua' memunculkan seluruh formulir baik publik maupun admin
    } else {
      // User Publik: khusus formulir publik saja
      if (!item.keterangan.toLowerCase().includes('publik')) return false;
    }

    // Filter Rujukan
    if (filterRujukan === 'perbawaslu_8') {
      if (!item.rujukan.includes('Perbawaslu 8/2022')) return false;
    } else if (filterRujukan === 'perbawaslu_7') {
      if (!item.rujukan.includes('Perbawaslu 7/2022')) return false;
    } else if (filterRujukan === 'juknis_169') {
      if (!item.rujukan.includes('169')) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-md border ${
          toastMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
            : toastMsg.type === 'error'
            ? 'bg-rose-50 text-rose-900 border-rose-300'
            : 'bg-blue-50 text-blue-900 border-blue-300'
        }`}>
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-700 rounded-xl">
                <DownloadCloud className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  DIREKTORI & DRAFT FORMULIR RESMI PERBAWASLU
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAdmin
                    ? 'Layanan unduh dan kelola draft formulir persidangan administratif Pemilu. Admin dapat mengunggah draft Word/PDF untuk internal maupun masyarakat.'
                    : 'Layanan unduh draft dan contoh formulir persidangan administratif Pemilu untuk masyarakat, pelapor, dan terlapor.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Hak Akses: Administrator (Bisa Unggah & Kelola Draft)</span>
              </div>
            )}
            {isAdmin && (
              <button
                onClick={() => setShowAddFormModal(true)}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Tambah formulir baru ke daftar direktori"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Formulir</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleSyncAllFilesToDrive}
                disabled={isSyncingAllDrive}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                title="Simpan semua file unggahan formulir ke Google Drive"
              >
                <CloudUpload className={`w-3.5 h-3.5 ${isSyncingAllDrive ? 'animate-bounce' : ''}`} />
                <span>{isSyncingAllDrive ? 'Menyinkronkan...' : 'Sinkronkan File ke Drive'}</span>
              </button>
            )}
            <button
              onClick={onOpenDriveManager}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Kelola Google Drive Bawaslu Banten"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Drive:</span>
              <span className="font-mono text-[11px] truncate max-w-[170px]">{TARGET_DRIVE_EMAIL}</span>
            </button>
          </div>
        </div>

        {/* Pembagian Tampilan Admin vs Publik */}
        {isAdmin ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
              <button
                onClick={() => setAdminTab('semua')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminTab === 'semua'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Semua Formulir ({formulirList.length})</span>
              </button>
              <button
                onClick={() => setAdminTab('publik')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminTab === 'publik'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Unlock className="w-3.5 h-3.5 text-white" />
                <span>Formulir Publik ({formulirList.filter(f => f.keterangan.toLowerCase().includes('publik')).length})</span>
              </button>
              <button
                onClick={() => setAdminTab('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminTab === 'admin'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Formulir Khusus Admin ({formulirList.filter(f => f.keterangan.toLowerCase().includes('admin')).length})</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {adminTab === 'semua'
                ? 'Menampilkan semua formulir (publik dan admin).'
                : adminTab === 'admin'
                ? 'Menampilkan formulir pembagian internal Admin Bawaslu.'
                : 'Menampilkan formulir pembagian publik.'}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 w-fit">
            <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Daftar Formulir Pembagian Publik (Dapat Diunduh Langsung)</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode formulir, nomor, perihal, atau rujukan (misal: B.1, SPS, Putusan, Juknis)..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={filterRujukan}
                onChange={(e) => setFilterRujukan(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 px-2 focus:outline-hidden cursor-pointer"
              >
                <option value="semua">Semua Rujukan Regulasi</option>
                <option value="perbawaslu_8">Perbawaslu 8/2022</option>
                <option value="perbawaslu_7">Perbawaslu 7/2022</option>
                <option value="juknis_169">Juknis PP 169/2023</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card (Exact Columns Requested by User) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-3 w-12 text-center">No</th>
                <th className="py-3.5 px-4 min-w-[200px] w-56">Formulir</th>
                <th className="py-3.5 px-4 min-w-[240px]">Perihal</th>
                <th className="py-3.5 px-4 min-w-[190px] w-52">Rujukan</th>
                <th className="py-3.5 px-3 w-40 text-center">Keterangan</th>
                {isAdmin && (
                  <th className="py-3.5 px-4 min-w-[160px] w-48 text-center">Draft Berkas</th>
                )}
                <th className="py-3.5 px-4 min-w-[120px] w-40 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Tidak ditemukan formulir sesuai filter atau kata kunci.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setFilterRujukan('semua'); }}
                      className="mt-2 text-xs text-amber-600 underline font-bold cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => {
                  const isPublic = item.keterangan === 'Publik';
                  const hasCustomDraft = Boolean(item.draftFile);

                  return (
                    <tr 
                      key={item.no} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                      }`}
                    >
                      {/* 1. No */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                        {index + 1}
                      </td>

                      {/* 2. Formulir */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {item.kode}
                        </div>
                        {isAdmin && hasCustomDraft && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-fit">
                            <FileCheck className="w-3 h-3 shrink-0" />
                            <span>Draft Kustom Aktif</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Perihal */}
                      <td className="py-3.5 px-4 align-top text-slate-800 font-medium leading-relaxed">
                        {item.perihal}
                      </td>

                      {/* 4. Rujukan */}
                      <td className="py-3.5 px-4 align-top text-slate-600 font-mono text-[11px] leading-tight">
                        <span className="bg-slate-100 px-2 py-1 rounded inline-block text-slate-700 font-semibold border border-slate-200">
                          {item.rujukan}
                        </span>
                      </td>

                      {/* 5. Keterangan */}
                      <td className="py-3.5 px-3 align-top text-center">
                        {isPublic ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Unlock className="w-3 h-3" />
                            <span>Publik</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <Lock className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        )}
                      </td>

                      {/* 6. Draft Berkas Status (Hanya Admin yang Bisa Melihat) */}
                      {isAdmin && (
                        <td className="py-3.5 px-4 align-top text-center">
                          {hasCustomDraft ? (
                            <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-left space-y-1">
                              <div className="flex items-center gap-1 font-semibold text-slate-800 truncate text-[11px]" title={item.draftFile?.namaFile}>
                                <FileIcon className="w-3 h-3 text-blue-600 shrink-0" />
                                <span className="truncate">{item.draftFile?.namaFile}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>{item.draftFile?.ukuran || 'File'}</span>
                                <span>{item.draftFile?.tglUpload}</span>
                              </div>
                              {/* Indikator Status Google Drive */}
                              {item.draftFile?.driveUrl ? (
                                <a
                                  href={item.draftFile.driveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded transition-colors"
                                  title="Berkas tersimpan di Google Drive - Klik untuk buka"
                                >
                                  <HardDrive className="w-3 h-3 text-emerald-600" />
                                  <span>Tersimpan di Drive</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSyncFileToDrive(item)}
                                  className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                                  title="Simpan berkas ini ke Google Drive sekarang"
                                >
                                  <UploadCloud className="w-3 h-3 text-blue-600" />
                                  <span>Simpan ke Drive</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block">
                              Templat Resmi (.doc)
                            </span>
                          )}
                        </td>
                      )}

                      {/* 7. Aksi (Unduh, Unggah Admin) */}
                      <td className="py-3.5 px-4 align-top text-right space-y-1.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Unduh Draft */}
                          <button
                            onClick={() => handleDownload(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950"
                            title="Unduh Draft Formulir (.doc / .docx)"
                          >
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>Unduh</span>
                          </button>

                          {/* Tombol Unggah Draft (HANYA MUNCUL DI ADMIN) */}
                          {isAdmin && (
                            <button
                              onClick={() => openUploadModal(item)}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                              title="Unggah contoh/draft formulir baru"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span className="hidden xl:inline">Unggah</span>
                            </button>
                          )}

                          {/* Admin: Tombol Edit Formulir */}
                          {isAdmin && (
                            <button
                              onClick={() => openEditFormModal(item)}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                              title="Edit Informasi & Metadata Formulir (Admin)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Admin: Tombol Hapus Formulir */}
                          {isAdmin && (
                            <button
                              onClick={() => setDeletingFormulir(item)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                              title="Hapus Formulir dari Direktori (Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Catatan upload draft (Hanya untuk Admin) */}
                        {isAdmin && hasCustomDraft && item.draftFile?.catatan && (
                          <div className="text-[10px] text-slate-500 italic text-right line-clamp-1">
                            Ket: {item.draftFile.catatan}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Table Info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Menampilkan <strong>{filteredList.length}</strong> formulir {isAdmin ? (adminTab === 'admin' ? 'pembagian internal Admin Bawaslu' : 'pembagian publik') : 'resmi untuk publik / masyarakat'}.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            {isAdmin ? (
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Mode: Administrator (Dapat Mengunggah Berkas Draft)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Dapat diunduh langsung dalam format draft resmi (.doc)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Admin Upload Draft Formulir */}
      {uploadTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Unggah Draft / Contoh Formulir</h3>
                  <p className="text-[11px] text-slate-300 font-mono">{uploadTarget.kode}</p>
                </div>
              </div>
              <button
                onClick={() => setUploadTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-xs">{uploadTarget.perihal}</div>
                <div className="text-[11px] text-slate-500">Rujukan: {uploadTarget.rujukan}</div>
                <div className="text-[11px] text-slate-700">
                  Aksesibilitas Unduh: <strong>{uploadTarget.keterangan}</strong>
                </div>
              </div>

              {/* File Input Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Pilih Berkas Draft / Contoh (.docx, .doc, .pdf, .rtf):
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".docx,.doc,.pdf,.rtf,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setUploadFile(f);
                  }}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/20 p-5 rounded-xl text-center cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  {uploadFile ? (
                    <div className="space-y-1">
                      <span className="font-bold text-blue-900 block truncate">{uploadFile.name}</span>
                      <span className="text-[11px] text-slate-500">
                        Ukuran: {(uploadFile.size / 1024).toFixed(1)} KB (Klik untuk ganti file)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-slate-700 block">
                        Klik untuk memilih berkas Word (.docx/.doc) atau PDF
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Berkas ini akan dapat diunduh oleh publik dan user admin lainnya
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Catatan / Keterangan Tambahan */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Keterangan / Catatan Versi Draft (Opsional):
                </label>
                <input
                  type="text"
                  value={uploadCatatan}
                  onChange={(e) => setUploadCatatan(e.target.value)}
                  placeholder="Misal: Format resmi revisi 2026, telah disesuaikan dengan Bawaslu Banten"
                  className="w-full p-2.5 border rounded-xl text-xs bg-white"
                />
              </div>

              {/* Checkbox Simpan ke Google Drive */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToDriveOption}
                      onChange={(e) => setSaveToDriveOption(e.target.checked)}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                    <span className="font-bold text-blue-950 text-xs">
                      Simpan juga salinan ke Google Drive resmi
                    </span>
                  </label>
                  {!getCachedAccessToken() && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await googleSignIn();
                          showToast('Berhasil terhubung ke Google Drive!');
                        } catch (e: any) {
                          showToast('Gagal menghubungkan Google Drive: ' + e.message, 'error');
                        }
                      }}
                      className="text-[11px] font-bold text-blue-700 bg-white hover:bg-blue-100 border border-blue-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      🔗 Hubungkan Drive
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-blue-800 pl-5 font-mono">
                  Target Akun: {TARGET_DRIVE_EMAIL} (Folder 02_Dokumen_Sidang_Resmi)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadTarget(null)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  disabled={isUploading}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveUpload}
                  disabled={!uploadFile || isUploading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengunggah Berkas...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan & Publikasikan Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Restricted Access Alert for Public */}
      {restrictedModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Akses Terbatas: Khusus Internal Bawaslu (Admin)
              </h3>
              <p className="text-slate-500">
                Formulir <strong>{restrictedModalTarget.kode}</strong> ({restrictedModalTarget.perihal}) merupakan tata naskah dinas internal persidangan dan hanya dapat diunduh oleh Pengguna / Staf Bawaslu yang berwenang.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl text-slate-700 font-mono text-[11px] text-center">
              Rujukan: {restrictedModalTarget.rujukan}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRestrictedModalTarget(null)}
                className="flex-1 py-2.5 border rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setRestrictedModalTarget(null);
                  onOpenLoginModal();
                }}
                className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Login Administrator</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Preview Dokumen & Integrasi Google Docs */}
      {previewTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-white truncate">
                      Pratinjau Dokumen: {previewTarget.kode}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      <span>Terintegrasi Google Docs</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 truncate mt-0.5">{previewTarget.perihal}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenGoogleDocs(previewTarget)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  title="Buka naskah formulir ini langsung di Google Docs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Google Docs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTarget(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-bar Navigation: Tabs & Metadata */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              {/* Tab Selector */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-200 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => setPreviewTab('gdocs')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    previewTab === 'gdocs'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lembar Dokumen Google Docs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('web_viewer')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    previewTab === 'web_viewer'
                      ? 'bg-white text-blue-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Docs Web Viewer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('raw')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    previewTab === 'raw'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-600" />
                  <span>Naskah Asli</span>
                </button>
              </div>

              {/* Legal Reference & Access badge */}
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <span>Rujukan: <strong className="text-slate-800">{previewTarget.rujukan}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Akses:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  previewTarget.keterangan === 'Publik'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {previewTarget.keterangan}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 bg-slate-100/70 p-4 sm:p-6">
              {/* TAB 1: Google Docs Visual Sheet View */}
              {previewTab === 'gdocs' && (
                <div className="space-y-3">
                  {/* Google Docs Toolbar Ribbon */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-slate-700 font-medium">Format: <strong>Kertas Standar A4 (210 x 297 mm)</strong></span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">Margin Standar: 2.5 cm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyContent(getDefaultFormulirContent(previewTarget))}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText ? 'Tersalin!' : 'Salin Naskah'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrintDocument(previewTarget)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Dokumen</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenGoogleDocs(previewTarget)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka di Google Docs</span>
                      </button>
                    </div>
                  </div>

                  {/* A4 Sheet Container */}
                  <div className="bg-slate-200/80 p-3 sm:p-6 rounded-2xl flex justify-center overflow-x-auto shadow-inner">
                    <div className="bg-white shadow-xl rounded-sm max-w-2xl w-full p-8 sm:p-12 border border-slate-300 text-slate-900 min-h-[580px] space-y-6">
                      {/* Kop Surat Bawaslu Provinsi Banten */}
                      <div className="text-center border-b-4 border-double border-slate-900 pb-3">
                        <h3 className="font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-800">
                          BADAN PENGAWAS PEMILIHAN UMUM
                        </h3>
                        <h2 className="font-extrabold text-sm sm:text-base tracking-widest uppercase text-slate-950 mt-0.5">
                          PROVINSI BANTEN
                        </h2>
                        <p className="text-[10px] text-slate-600 font-sans mt-1">
                          Jalan KH. Abdul Fatah Hasan No. 88, Cipare, Kota Serang, Banten 42117
                        </p>
                        <p className="text-[9px] text-slate-500 font-sans">
                          Telepon: (0254) 8480300 | Laman Resmi: banten.bawaslu.go.id
                        </p>
                      </div>

                      {/* Info Model Formulir */}
                      <div className="text-center space-y-1">
                        <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-300 rounded-md font-mono font-bold text-xs text-amber-900">
                          {previewTarget.kode}
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm uppercase text-slate-900">
                          {previewTarget.perihal}
                        </h4>
                        <p className="text-[10px] text-slate-500 italic">
                          Dasar Rujukan: {previewTarget.rujukan}
                        </p>
                      </div>

                      {/* Notifikasi draft kustom jika ada */}
                      {previewTarget.draftFile && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>
                              Draft Kustom Aktif: <strong>{previewTarget.draftFile.namaFile}</strong> ({previewTarget.draftFile.ukuran})
                            </span>
                          </div>
                          {previewTarget.draftFile.driveUrl && (
                            <a
                              href={previewTarget.draftFile.driveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-700 underline font-semibold flex items-center gap-1 hover:text-blue-900"
                            >
                              <span>Google Drive</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Lembar Teks Format Dokumen Resmi */}
                      <div className="font-serif text-[11px] sm:text-xs leading-relaxed text-slate-900 whitespace-pre-wrap select-all bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        {getDefaultFormulirContent(previewTarget)}
                      </div>

                      {/* Footer Kop Lembar Kerja */}
                      <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-sans">
                        Dokumen Draft Resmi LeAD-AP Bawaslu Provinsi Banten • Sesuai {previewTarget.rujukan}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Google Docs Web & Drive Viewer */}
              {previewTab === 'web_viewer' && (
                <div className="space-y-4">
                  {previewTarget.draftFile?.driveUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-700">
                          Menampilkan berkas langsung dari <strong>Google Drive / Docs Viewer</strong>
                        </span>
                        <a
                          href={previewTarget.draftFile.driveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka Layar Penuh</span>
                        </a>
                      </div>
                      <div className="bg-white rounded-2xl overflow-hidden border border-slate-300 shadow-md">
                        <iframe
                          src={previewTarget.draftFile.driveUrl.replace('/view', '/preview')}
                          className="w-full h-[520px] bg-slate-100"
                          title="Google Docs Viewer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-base text-slate-900">
                            Integrasi Google Docs & Google Workspace
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Formulir <strong>{previewTarget.kode}</strong> dapat dibuka langsung di Google Docs Web Editor untuk ditinjau, disunting secara kolaboratif, atau disimpan ke penyimpanan Google Drive Anda sebelum diunduh.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Option 1: Buka di Google Docs Editor */}
                        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                              <ExternalLink className="w-4 h-4 text-blue-600" />
                              <span>Buka Google Docs Web</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Menyalin naskah template resmi secara otomatis ke clipboard dan membuka Google Docs web editor baru.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenGoogleDocs(previewTarget)}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka di Google Docs</span>
                          </button>
                        </div>

                        {/* Option 2: Ekspor ke Google Drive */}
                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                              <HardDrive className="w-4 h-4 text-emerald-600" />
                              <span>Simpan ke Google Drive</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Simpan draft formulir ke folder Drive LeAD-AP Bawaslu Anda untuk ditinjau bersama tim secara online.
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={isExportingToDrive}
                            onClick={() => handleExportPreviewToDrive(previewTarget)}
                            className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>{isExportingToDrive ? 'Menyimpan...' : 'Simpan & Buka di Drive'}</span>
                          </button>
                        </div>

                        {/* Option 3: Unduh Berkas .DOC */}
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                              <DownloadCloud className="w-4 h-4 text-amber-600" />
                              <span>Unduh Berkas .DOC</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Unduh berkas draft resmi langsung ke perangkat komputer untuk dibuka di MS Word atau Google Docs.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownload(previewTarget)}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>Unduh File Sekarang</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Naskah Format Teks Asli */}
              {previewTab === 'raw' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-600">
                      Format Naskah Teks Standar Resmi: <strong>{previewTarget.kode}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyContent(getDefaultFormulirContent(previewTarget))}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText ? 'Tersalin ke Clipboard!' : 'Salin Naskah Teks'}</span>
                    </button>
                  </div>
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all max-h-[500px] overflow-y-auto border border-slate-800">
                    {getDefaultFormulirContent(previewTarget)}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewTarget(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer w-full sm:w-auto text-center"
                >
                  Tutup Pratinjau
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyContent(getDefaultFormulirContent(previewTarget))}
                  className="px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Tersalin' : 'Salin Teks'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => handlePrintDocument(previewTarget)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenGoogleDocs(previewTarget)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Google Docs</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const t = previewTarget;
                    setPreviewTarget(null);
                    handleDownload(t);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Unduh Draft (.doc)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Konfirmasi Hapus Draft Kustom */}
      {confirmDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-rose-50 p-4 border-b border-rose-100 flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Draft Kustom</h3>
                <p className="text-xs text-rose-700">Kembalikan ke templat resmi standar</p>
              </div>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <p>
                Apakah Anda yakin ingin menghapus berkas draft kustom untuk{' '}
                <strong className="text-slate-900">{confirmDeleteTarget.kode}</strong>?
              </p>
              {confirmDeleteTarget.draftFile && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
                  <div className="font-semibold text-slate-800 truncate">
                    {confirmDeleteTarget.draftFile.namaFile}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Diunggah: {confirmDeleteTarget.draftFile.tglUpload} ({confirmDeleteTarget.draftFile.ukuran})
                  </div>
                </div>
              )}
              <p className="text-slate-500">
                Setelah dihapus, pengguna akan mengunduh format draft standar resmi Bawaslu bawaan sistem.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmDeleteTarget(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => executeDeleteDraft(confirmDeleteTarget)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Tambah Formulir Baru (Admin) */}
      {showAddFormModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Tambah Formulir / Format Baru</h3>
                  <p className="text-xs text-slate-400">Direktori Naskah Dinas Resmi Bawaslu</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddFormModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Kode / Nama Model Formulir <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  value={newFormKode}
                  onChange={(e) => setNewFormKode(e.target.value)}
                  placeholder="Misal: FORMULIR MODEL ADM.TAMBAHAN atau SURAT KUASA"
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Perihal / Judul Dokumen <span className="text-rose-600">*</span>:
                </label>
                <textarea
                  value={newFormPerihal}
                  onChange={(e) => setNewFormPerihal(e.target.value)}
                  placeholder="Uraian perihal dokumen resmi atau naskah persidangan..."
                  rows={2}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Dasar Regulasi / Rujukan:
                  </label>
                  <input
                    type="text"
                    value={newFormRujukan}
                    onChange={(e) => setNewFormRujukan(e.target.value)}
                    placeholder="Perbawaslu 8/2022 atau Juknis 169"
                    className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Hak Akses Unduh:
                  </label>
                  <select
                    value={newFormAkses}
                    onChange={(e) => setNewFormAkses(e.target.value as FormulirAkses)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-bold cursor-pointer"
                  >
                    <option value="Publik">Publik (Terbuka untuk Umum)</option>
                    <option value="Admin">Admin (Khusus Internal)</option>
                  </select>
                </div>
              </div>

              {/* Upload Draft File (Opsional) */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Unggah Berkas Format / Template (Opsional):
                </label>
                <input
                  type="file"
                  ref={addFormFileInputRef}
                  accept=".docx,.doc,.pdf,.rtf,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setNewFormFile(f);
                  }}
                  className="hidden"
                />
                <div
                  onClick={() => addFormFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 p-3.5 rounded-xl text-center cursor-pointer transition-colors"
                >
                  {newFormFile ? (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 truncate">{newFormFile.name}</span>
                      <span className="text-[11px] text-slate-500">{(newFormFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      <UploadCloud className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                      <span>Klik untuk menyertakan berkas template (.doc / .docx / .pdf)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Opsi Simpan ke Google Drive */}
              {newFormFile && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-blue-950">
                    <input
                      type="checkbox"
                      checked={newFormSaveToDrive}
                      onChange={(e) => setNewFormSaveToDrive(e.target.checked)}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                    <span>Simpan juga berkas ini langsung ke Google Drive resmi</span>
                  </label>
                  <p className="text-[11px] text-blue-800 pl-5 font-mono">
                    Target: {TARGET_DRIVE_EMAIL}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFormModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  disabled={isSubmittingNewForm}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddNewForm}
                  disabled={isSubmittingNewForm || !newFormKode.trim() || !newFormPerihal.trim()}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isSubmittingNewForm ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tambahkan Formulir</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Edit Formulir (Admin) */}
      {editingFormulir && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Edit Informasi Formulir</h3>
                  <p className="text-xs text-slate-400 font-mono">{editingFormulir.kode}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingFormulir(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Kode / Nama Model Formulir <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  value={editFormKode}
                  onChange={(e) => setEditFormKode(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Perihal / Judul Dokumen <span className="text-rose-600">*</span>:
                </label>
                <textarea
                  value={editFormPerihal}
                  onChange={(e) => setEditFormPerihal(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Dasar Regulasi / Rujukan:
                  </label>
                  <input
                    type="text"
                    value={editFormRujukan}
                    onChange={(e) => setEditFormRujukan(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Hak Akses Unduh:
                  </label>
                  <select
                    value={editFormAkses}
                    onChange={(e) => setEditFormAkses(e.target.value as FormulirAkses)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs font-bold cursor-pointer"
                  >
                    <option value="Publik">Publik (Terbuka untuk Umum)</option>
                    <option value="Admin">Admin (Khusus Internal)</option>
                  </select>
                </div>
              </div>

              {/* Ganti / Perbarui Berkas Draft */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Perbarui Berkas Draft / Template (Opsional):
                </label>
                <input
                  type="file"
                  ref={editFormFileInputRef}
                  accept=".docx,.doc,.pdf,.rtf,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setEditFormFile(f);
                  }}
                  className="hidden"
                />
                <div
                  onClick={() => editFormFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 p-3 rounded-xl text-center cursor-pointer transition-colors"
                >
                  {editFormFile ? (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 truncate">{editFormFile.name}</span>
                      <span className="text-[11px] text-slate-500">{(editFormFile.size / 1024).toFixed(1)} KB (Baru)</span>
                    </div>
                  ) : editingFormulir.draftFile ? (
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold truncate">Saat ini: {editingFormulir.draftFile.namaFile}</span>
                      <span className="text-[11px] text-amber-700 font-bold ml-2">Klik untuk ganti file</span>
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      <UploadCloud className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                      <span>Klik untuk mengunggah file template custom (.docx / .pdf)</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Catatan / Keterangan Versi:
                </label>
                <input
                  type="text"
                  value={editFormCatatan}
                  onChange={(e) => setEditFormCatatan(e.target.value)}
                  placeholder="Catatan revisi format dinas..."
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFormulir(null)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  disabled={isSubmittingEditForm}
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditForm}
                  disabled={isSubmittingEditForm || !editFormKode.trim() || !editFormPerihal.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {isSubmittingEditForm ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Konfirmasi Hapus Formulir Lengkap (Admin) */}
      {deletingFormulir && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Formulir dari Direktori</h3>
                <p className="text-xs text-rose-700 font-semibold">{deletingFormulir.kode}</p>
              </div>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-600">
              <p>
                Apakah Anda yakin ingin menghapus formulir ini dari daftar direktori?
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="font-bold text-slate-900">{deletingFormulir.kode}</div>
                <div className="text-slate-700">{deletingFormulir.perihal}</div>
                <div className="text-[11px] text-slate-500 font-mono">Rujukan: {deletingFormulir.rujukan}</div>
              </div>
              <p className="text-rose-600 font-medium">
                Peringatan: Formulir ini tidak akan lagi tersedia di menu unduh formulir baik untuk Admin maupun publik.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeletingFormulir(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteFormulir(deletingFormulir)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Formulir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
