import React, { useState } from 'react';
import { X, Lock, Key, User, ShieldCheck, AlertCircle, Eye, EyeOff, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { verifyAdminLoginGoogleEcosystem } from '../services/googleEcosystemService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
  currentUsername: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUsername
}) => {
  const [usernameInput, setUsernameInput] = useState<string>(currentUsername || 'admin_banten');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const trimmedUser = usernameInput.trim();
      const authResult = await verifyAdminLoginGoogleEcosystem(trimmedUser, passwordInput);

      if (authResult.success) {
        localStorage.setItem('leadap_admin_session', 'true');
        localStorage.setItem('leadap_current_admin', trimmedUser);
        setSuccessMsg(`Autentikasi berhasil! Selamat datang, ${authResult.fullName || trimmedUser}.`);
        setTimeout(() => {
          onLoginSuccess(trimmedUser);
          onClose();
        }, 800);
      } else {
        setErrorMsg(authResult.message || 'Username atau kata sandi tidak valid. Pastikan username dan kata sandi sesuai!');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat memverifikasi kredensial.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 p-5 text-white flex items-center justify-between border-b border-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                AUTENTIKASI ADMINISTRATOR
              </h3>
              <p className="text-[11px] text-amber-300 font-mono">
                Bawaslu Provinsi Banten • Hak Akses Penuh
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

        {/* Security Info Card */}
        <div className="bg-amber-50/90 border-b border-amber-200 p-3.5 text-amber-950 text-xs leading-relaxed space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Akses Khusus Majelis & Administrator Bawaslu</span>
          </div>
          <p className="text-[11px] text-amber-900 leading-normal">
            Admin memiliki otoritas untuk meregistrasi perkara, menyusun jadwal sidang, mengesahkan alat bukti, dan mengunggah salinan putusan ke Google Drive.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-white/90 p-2 rounded-lg border border-amber-200">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              <strong>Keamanan Akun:</strong> Akun baru hanya dapat ditambahkan langsung oleh Administrator di Google Spreadsheet (Sheet: <code>Pengguna_Admin</code>).
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Username Administrator:</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Masukkan username admin..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 font-medium text-xs text-slate-800"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Kata Sandi (Password):</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-9 pr-10 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 font-medium text-xs text-slate-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg shadow-md hover:shadow-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk Sebagai Administrator'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
