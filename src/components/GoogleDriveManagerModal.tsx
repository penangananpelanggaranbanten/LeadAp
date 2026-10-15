import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  HardDrive, 
  UploadCloud, 
  FolderPlus, 
  ExternalLink, 
  Trash2, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Database,
  Lock,
  Layers,
  CloudUpload,
  Mail,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  googleSignIn, 
  googleSignOut, 
  getCachedUser,
  listBawasluDriveFiles, 
  syncDatabaseToGoogleDrive,
  uploadBinaryFileToGoogleDrive,
  deleteFileFromGoogleDrive,
  TARGET_DRIVE_EMAIL,
  getOrCreateBawasluFolder,
  getOrCreateSubfolder
} from '../services/googleDriveService';
import { GoogleDriveFile, Perkara, TaskItem } from '../types/leadAp';

interface GoogleDriveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  perkaraList: Perkara[];
  tasks?: TaskItem[];
  onNotify: (msg: string) => void;
}

export const GoogleDriveManagerModal: React.FC<GoogleDriveManagerModalProps> = ({
  isOpen,
  onClose,
  perkaraList,
  tasks = [],
  onNotify
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(() => getCachedUser()?.email || null);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingBackup, setUploadingBackup] = useState<boolean>(false);
  const [uploadingManual, setUploadingManual] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileFilter, setFileFilter] = useState<'all' | 'database' | 'dokumen' | 'bukti'>('all');
  const [autoSync, setAutoSync] = useState<boolean>(() => {
    return localStorage.getItem('leadap_auto_drive_sync') !== 'false';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const current = null;
      const currentUser = getCachedUser();
      setToken(current);
      if (currentUser?.email) {
        setUserEmail(currentUser.email);
      }
      if (current) {
        fetchFiles(current);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignInGoogle = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setToken(res.accessToken);
        setUserEmail(res.user.email);
        onNotify(`Berhasil terhubung ke Google Drive (${res.user.email})!`);
        await fetchFiles(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal masuk dengan Google. Pastikan popup tidak diblokir.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutGoogle = async () => {
    await googleSignOut();
    setToken(null);
    setUserEmail(null);
    setFiles([]);
    onNotify('Terputus dari Google Drive.');
  };

  const fetchFiles = async (activeToken: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const driveFiles = await listBawasluDriveFiles(activeToken);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal memuat file dari Google Drive. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  // Cadangkan basis data seluruh perkara ke Google Drive
  const handleBackupDatabaseToDrive = async () => {
    if (!token) return;
    setUploadingBackup(true);
    setErrorMsg(null);
    try {
      const uploaded = await syncDatabaseToGoogleDrive(token, perkaraList, tasks);
      onNotify(`Basis data (${perkaraList.length} perkara) berhasil dicadangkan ke Google Drive: ${uploaded.name}`);
      await fetchFiles(token);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal mencadangkan data ke Google Drive.');
    } finally {
      setUploadingBackup(false);
    }
  };

  // Upload file manual langsung ke Google Drive
  const handleManualFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !token) return;

    setUploadingManual(true);
    setErrorMsg(null);
    try {
      const rootId = await getOrCreateBawasluFolder(token);
      const subFolderId = await getOrCreateSubfolder(token, '03_Berkas_Alat_Bukti', rootId);
      const uploaded = await uploadBinaryFileToGoogleDrive(token, selectedFile, subFolderId);
      onNotify(`Berkas "${selectedFile.name}" berhasil diunggah ke Google Drive (${TARGET_DRIVE_EMAIL})!`);
      await fetchFiles(token);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal mengunggah berkas ke Google Drive.');
    } finally {
      setUploadingManual(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!token) return;
    try {
      const success = await deleteFileFromGoogleDrive(token, fileId, fileName);
      if (success) {
        onNotify(`Berkas "${fileName}" berhasil dihapus dari Google Drive.`);
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal menghapus file.');
    }
  };

  const handleToggleAutoSync = () => {
    const next = !autoSync;
    setAutoSync(next);
    localStorage.setItem('leadap_auto_drive_sync', String(next));
    onNotify(next ? 'Sinkronisasi otomatis ke Google Drive diaktifkan.' : 'Sinkronisasi otomatis dinonaktifkan.');
  };

  const filteredFiles = files.filter((f) => {
    if (fileFilter === 'database') return f.name.includes('Database_') || f.mimeType.includes('json');
    if (fileFilter === 'dokumen') return f.name.includes('ADM.') || f.name.includes('BA-');
    if (fileFilter === 'bukti') return f.name.includes('Bukti_') || !f.name.includes('Database_');
    return true;
  });

  const isOfficialAccount = userEmail?.toLowerCase() === TARGET_DRIVE_EMAIL.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-blue-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                  PENYIMPANAN DATABASE & BERKAS GOOGLE DRIVE
                </h3>
                <span className="text-[10px] bg-blue-800 text-blue-200 px-2 py-0.5 rounded font-mono font-bold">
                  Bawaslu Provinsi Banten
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-amber-400" />
                <span>Akun Tujuan:</span>
                <strong className="text-amber-400">{TARGET_DRIVE_EMAIL}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar Google Connection */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-3.5 h-3.5 rounded-full ${token ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  {token ? 'Terhubung dengan Google Drive' : 'Belum Terhubung ke Google Drive'}
                </span>
                {token && isOfficialAccount && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Akun Resmi Terverifikasi</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-600">
                {token
                  ? `Akun Aktif: ${userEmail || TARGET_DRIVE_EMAIL} • Folder: LeAD-AP Bawaslu Banten`
                  : `Disiapkan untuk akun: ${TARGET_DRIVE_EMAIL}`}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!token ? (
              <button
                onClick={handleSignInGoogle}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#ffffff"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.02h3.87c2.27-2.09 3.67-5.18 3.67-9.12z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.02c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.12C3.29 21.36 7.37 24 12 24z"
                  />
                  <path
                    fill="#ffffff"
                    d="M5.27 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.61H1.26C.46 8.21 0 10.05 0 12s.46 3.79 1.26 5.39l4.01-3.12z"
                  />
                  <path
                    fill="#ffffff"
                    d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.94 1.19 15.23 0 12 0 7.37 0 3.29 2.64 1.26 6.61l4.01 3.12c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                <span>{loading ? 'Menghubungkan...' : `Sambungkan (${TARGET_DRIVE_EMAIL})`}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleBackupDatabaseToDrive}
                  disabled={uploadingBackup}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Cadangkan seluruh tabel perkara ke Google Drive"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{uploadingBackup ? 'Mencadangkan...' : 'Sinkronkan Database'}</span>
                </button>

                {/* Upload Manual File */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleManualFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingManual}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Unggah berkas atau dokumen langsung ke Google Drive"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>{uploadingManual ? 'Mengunggah...' : 'Unggah File'}</span>
                </button>

                <button
                  onClick={() => token && fetchFiles(token)}
                  disabled={loading}
                  className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg cursor-pointer"
                  title="Segarkan berkas"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleSignOutGoogle}
                  className="text-red-600 hover:text-red-700 font-semibold px-2 py-1 text-xs cursor-pointer"
                >
                  Putus
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Box: Folder structure & Auto Sync */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-950">
          <div className="flex items-center gap-3">
            <span className="font-semibold">Struktur Penyimpanan Drive:</span>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200">
              📁 01_Database_dan_Cadangan
            </span>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200">
              📁 02_Dokumen_Sidang_Resmi
            </span>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200">
              📁 03_Berkas_Alat_Bukti
            </span>
          </div>

          <label className="flex items-center gap-1.5 font-semibold text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={handleToggleAutoSync}
              className="rounded text-blue-600 cursor-pointer"
            />
            <span>Auto-Sync Database saat Tambah/Ubah Perkara</span>
          </label>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body: File list in Google Drive */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {!token ? (
            <div className="p-10 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed space-y-3">
              <HardDrive className="w-12 h-12 mx-auto text-blue-500/40" />
              <h4 className="font-bold text-slate-800 text-sm">
                Google Drive Siap Digunakan Sebagai Basis Data Penyimpanan
              </h4>
              <p className="max-w-md mx-auto text-xs text-slate-600 leading-relaxed">
                Sambungkan akun Google Drive dengan email <strong>{TARGET_DRIVE_EMAIL}</strong> untuk menyimpan seluruh file inputan perkara, berkas bukti (P-n/T-n), salinan putusan sidang, berita acara registrasi, dan basis data JSON secara tersinkronisasi.
              </p>
              <button
                onClick={handleSignInGoogle}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Sambungkan dengan {TARGET_DRIVE_EMAIL}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Filter tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <span className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <span>Berkas Tersimpan di Google Drive ({filteredFiles.length} Berkas)</span>
                </span>
                <div className="flex items-center gap-1">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'database', label: 'Database & Cadangan' },
                    { id: 'dokumen', label: 'Dokumen Persidangan' },
                    { id: 'bukti', label: 'Berkas Bukti / File Input' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFileFilter(tab.id as any)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        fileFilter === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading && files.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-blue-600" />
                  <span>Memuat daftar berkas dari Google Drive ({TARGET_DRIVE_EMAIL})...</span>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Belum ada berkas pada kategori ini di Google Drive.</p>
                  <p className="text-[11px] text-slate-500">
                    Gunakan tombol "Sinkronkan Database" atau "Unggah File" di bagian atas.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden bg-white">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                          {file.mimeType.includes('json') ? (
                            <Database className="w-4 h-4 text-emerald-600" />
                          ) : file.mimeType.includes('folder') ? (
                            <FolderPlus className="w-4 h-4 text-amber-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{file.name}</span>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-mono">
                            <span>{file.createdTime ? new Date(file.createdTime).toLocaleString('id-ID') : '-'}</span>
                            {file.size && <span>{(Number(file.size) / 1024).toFixed(1)} KB</span>}
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-sans">
                              {file.mimeType.includes('json')
                                ? 'Database JSON'
                                : file.mimeType.includes('folder')
                                ? 'Folder'
                                : 'Dokumen Berkas'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Buka di Google Drive"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          title="Hapus dari Google Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <span>
            * Berkas disimpan aman di Google Drive akun <strong>{TARGET_DRIVE_EMAIL}</strong> dengan autentikasi OAuth resmi.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
