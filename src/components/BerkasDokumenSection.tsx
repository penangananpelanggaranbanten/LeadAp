import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  FileCheck,
  FileX
} from 'lucide-react';
import { Perkara, UserRole, BerkasDokumenPerkara, KategoriBerkasPerkara } from '../types/leadAp';
import { 
  KATEGORI_BERKAS_LIST, 
  formatFileSize, 
  generateSamplePdfDataUrl 
} from '../utils/pdfHelper';
import { PdfPreviewModal } from './PdfPreviewModal';
import { uploadFileToGoogleEcosystem } from '../services/googleEcosystemService';

interface BerkasDokumenSectionProps {
  perkara: Perkara;
  currentRole: UserRole;
  onUpdatePerkara: (updated: Perkara) => void;
}

export const BerkasDokumenSection: React.FC<BerkasDokumenSectionProps> = ({
  perkara,
  currentRole,
  onUpdatePerkara
}) => {
  const isInternal = currentRole === 'admin';
  const storageKey = `leadap_berkas_${perkara.id}`;

  // Current list of uploaded documents
  const [berkasList, setBerkasList] = useState<BerkasDokumenPerkara[]>(() => {
    // 1. Check perkara.berkas_dokumen
    if (perkara.berkas_dokumen && perkara.berkas_dokumen.length > 0) {
      return perkara.berkas_dokumen;
    }
    // 2. Check localStorage
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [activeUploadCat, setActiveUploadCat] = useState<KategoriBerkasPerkara | null>(null);
  const [previewDoc, setPreviewDoc] = useState<BerkasDokumenPerkara | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync to localStorage and parent perkara whenever berkasList changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(berkasList));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [berkasList, storageKey]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadCat) return;

    // Reset input value so re-selecting same file triggers change
    e.target.value = '';

    // STRICT VALIDATION: File yang dapat di-upload hanya dengan format PDF saja
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdfExt) {
      setErrorMsg(`Format file tidak didukung! File yang dapat di-upload hanya dengan format PDF (.pdf) saja. File "${file.name}" ditolak.`);
      setTimeout(() => setErrorMsg(null), 6000);
      setActiveUploadCat(null);
      return;
    }

    // Limit size (e.g. 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg(`Ukuran file terlalu besar (${formatFileSize(file.size)}). Maksimal ukuran file PDF adalah 25 MB.`);
      setTimeout(() => setErrorMsg(null), 6000);
      setActiveUploadCat(null);
      return;
    }

    const categoryMeta = KATEGORI_BERKAS_LIST.find((c) => c.id === activeUploadCat);
    const catName = categoryMeta?.nama || activeUploadCat;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const newDoc: BerkasDokumenPerkara = {
        id: `berkas-${activeUploadCat}-${Date.now()}`,
        perkara_id: perkara.id,
        kategori: activeUploadCat,
        nama_kategori: catName,
        nama_file: file.name,
        ukuran_bytes: file.size,
        ukuran_file: formatFileSize(file.size),
        tipe_file: 'application/pdf',
        data_url: dataUrl,
        tgl_upload: dateStr,
        pengunggah: isInternal ? 'Administrator Bawaslu' : 'Pihak Berperkara'
      };

      setBerkasList((prev) => {
        // Replace if already exists for this category, or append
        const filtered = prev.filter((item) => item.kategori !== activeUploadCat);
        const updated = [...filtered, newDoc];
        // notify parent
        onUpdatePerkara({
          ...perkara,
          berkas_dokumen: updated
        });
        return updated;
      });

      // Sinkronisasi unggahan ke Google Drive resmi via Ekosistem Google
      uploadFileToGoogleEcosystem({
        file,
        fileName: `${newDoc.kategori.toUpperCase()}_${perkara.nomor_register.replace(/[\/\\]/g, '_')}_${file.name}`,
        folderCategory: 'dokumen',
        nomorRegister: perkara.nomor_register,
        keterangan: `Berkas ${catName} perkara ${perkara.nomor_register}`
      }).catch((err) => {
        console.warn('Gagal background upload ke Google Drive:', err);
      });

      setSuccessMsg(`Berkas PDF "${file.name}" untuk "${catName}" berhasil diunggah.`);
      setTimeout(() => setSuccessMsg(null), 5000);
      setActiveUploadCat(null);
    };

    reader.onerror = () => {
      setErrorMsg('Gagal membaca file. Silakan coba kembali.');
      setTimeout(() => setErrorMsg(null), 5000);
      setActiveUploadCat(null);
    };

    reader.readAsDataURL(file);
  };

  const triggerUpload = (catId: KategoriBerkasPerkara) => {
    setActiveUploadCat(catId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDownload = (doc: BerkasDokumenPerkara) => {
    const link = document.createElement('a');
    link.href = doc.data_url;
    const safeName = doc.nama_file.toLowerCase().endsWith('.pdf')
      ? doc.nama_file
      : `${doc.nama_file}.pdf`;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (docId: string, docName: string) => {
    if (!confirm(`Hapus berkas PDF "${docName}"?`)) return;
    setBerkasList((prev) => {
      const updated = prev.filter((item) => item.id !== docId);
      onUpdatePerkara({
        ...perkara,
        berkas_dokumen: updated
      });
      return updated;
    });
    setSuccessMsg(`Berkas PDF "${docName}" telah dihapus.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Generate a sample PDF for demonstration
  const handleGenerateSample = (catId: KategoriBerkasPerkara) => {
    const meta = KATEGORI_BERKAS_LIST.find((c) => c.id === catId);
    if (!meta) return;

    const dataUrl = generateSamplePdfDataUrl(
      meta.nama,
      perkara.nomor_register,
      meta.nama,
      perkara.pelapor.nama,
      perkara.terlapor.nama
    );

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newDoc: BerkasDokumenPerkara = {
      id: `sample-${catId}-${Date.now()}`,
      perkara_id: perkara.id,
      kategori: catId,
      nama_kategori: meta.nama,
      nama_file: `${meta.kode}_${perkara.nomor_register.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
      ukuran_bytes: 48500,
      ukuran_file: '48.5 KB',
      tipe_file: 'application/pdf',
      data_url: dataUrl,
      tgl_upload: dateStr,
      pengunggah: 'Sistem LeAD-AP Bawaslu'
    };

    setBerkasList((prev) => {
      const filtered = prev.filter((item) => item.kategori !== catId);
      const updated = [...filtered, newDoc];
      onUpdatePerkara({
        ...perkara,
        berkas_dokumen: updated
      });
      return updated;
    });

    setSuccessMsg(`Draf contoh PDF untuk "${meta.nama}" berhasil dibuat. Anda dapat langsung melihat (preview) atau mengunduhnya.`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const uploadedCount = KATEGORI_BERKAS_LIST.filter((cat) => 
    berkasList.some((b) => b.kategori === cat.id)
  ).length;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Hidden file input strictly accepting .pdf */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,application/pdf"
        className="hidden"
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-700 text-white shadow-xs font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>BERKAS DOKUMEN PERKARA</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  {uploadedCount} dari {KATEGORI_BERKAS_LIST.length} Berkas Tersedia
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola dan telusuri dokumen persidangan ({perkara.nomor_register}). Hanya file berekstensi <strong>.PDF</strong> yang dapat diunggah.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            Format Wajib: <strong className="text-red-700 font-mono">.PDF</strong>
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-300 text-red-900 text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Notice info banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-amber-300 block">
              Daftar Unggahan Berkas Dokumen Resmi Persidangan
            </span>
            <span className="text-[11px] text-slate-300">
              Dokumen yang diunggah dapat dilihat (pratinjau) dan diunduh oleh para pihak dalam format PDF asli.
            </span>
          </div>
        </div>
        {uploadedCount === 0 && (
          <button
            onClick={() => {
              // Generate sample for all 5 categories
              KATEGORI_BERKAS_LIST.forEach((cat) => handleGenerateSample(cat.id));
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
            title="Muat contoh berkas PDF untuk seluruh kategori"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Contoh Berkas Lengkap</span>
          </button>
        )}
      </div>

      {/* 5 Specific Document Categories List */}
      <div className="space-y-3.5">
        {KATEGORI_BERKAS_LIST.map((cat, idx) => {
          const doc = berkasList.find((b) => b.kategori === cat.id);
          const isUploaded = Boolean(doc);

          return (
            <div
              key={cat.id}
              className={`border rounded-xl transition-all overflow-hidden ${
                isUploaded
                  ? 'bg-white border-slate-300 shadow-xs'
                  : 'bg-slate-50/70 border-dashed border-slate-300'
              }`}
            >
              <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left: Category Info & File Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                      isUploaded
                        ? 'bg-red-700 text-white'
                        : 'bg-slate-200 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {isUploaded ? <FileCheck className="w-5 h-5 text-amber-300" /> : <FileText className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {idx + 1}. {cat.kode}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {cat.nama}
                      </span>
                      {cat.wajib && (
                        <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.2 rounded font-semibold">
                          Wajib
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {cat.deskripsi}
                    </p>

                    {/* If uploaded, show file badge */}
                    {isUploaded && doc && (
                      <div className="mt-2.5 p-2 bg-emerald-50/80 border border-emerald-200 rounded-lg flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-950 truncate max-w-md">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-mono text-emerald-900 truncate" title={doc.nama_file}>
                            {doc.nama_file}
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-800 font-semibold">
                          ({doc.ukuran_file || 'PDF'})
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {doc.tgl_upload}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Oleh: {doc.pengunggah}
                        </span>
                      </div>
                    )}

                    {!isUploaded && (
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Belum ada berkas PDF yang diunggah
                        </span>
                        <span className="hidden sm:inline text-slate-400">• Pengunggah: {cat.pengunggahDefault}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions (Upload, Download, Preview) */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                  {isUploaded && doc ? (
                    <>
                      {/* PREVIEW BUTTON */}
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs px-3 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
                        title="Lihat Pratinjau Dokumen PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview PDF</span>
                      </button>

                      {/* DOWNLOAD BUTTON */}
                      <button
                        onClick={() => handleDownload(doc)}
                        className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
                        title="Unduh Berkas PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh PDF</span>
                      </button>

                      {/* RE-UPLOAD / GANTI FILE */}
                      <button
                        onClick={() => triggerUpload(cat.id)}
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-2.5 py-2 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                        title="Unggah Ulang / Ganti Berkas PDF Ini"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Ganti PDF</span>
                      </button>

                      {/* DELETE FILE */}
                      {isInternal && (
                        <button
                          onClick={() => handleDelete(doc.id, doc.nama_file)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                          title="Hapus Berkas Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {/* UPLOAD BUTTON */}
                      <button
                        onClick={() => triggerUpload(cat.id)}
                        className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer"
                        title="Pilih file PDF dari komputer untuk diunggah"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Berkas PDF</span>
                      </button>

                      {/* CONTOH SAMPLE BUTTON */}
                      <button
                        onClick={() => handleGenerateSample(cat.id)}
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                        title="Buat dokumen PDF contoh untuk pengujian pratinjau & unduh"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span className="hidden sm:inline">Contoh PDF</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Notes */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            Seluruh berkas dokumen persidangan dijamin keamanannya dan tersimpan dalam repositori digital terintegrasi LeAD-AP Bawaslu Banten.
          </span>
        </div>
        <span className="font-mono text-slate-500">
          Format Wajib: <strong>.pdf</strong> (Portable Document Format)
        </span>
      </div>

      {/* PDF PREVIEW MODAL */}
      {previewDoc && (
        <PdfPreviewModal
          dokumen={previewDoc}
          nomorRegister={perkara.nomor_register}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};
