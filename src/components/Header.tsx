import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  PlusCircle, 
  Zap, 
  Scale, 
  Lock, 
  LogOut, 
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../types/leadAp';

interface HeaderProps {
  currentRole: UserRole;
  onOpenLoginModal: () => void;
  onLogoutAdmin: () => void;
  onOpenNewCaseModal: () => void;
  onOpenAcaraCepatModal: () => void;
  onOpenAiAnalyst: () => void;
  onOpenDriveManager: () => void;
  adminUsername?: string;
  isDriveConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onOpenLoginModal,
  onLogoutAdmin,
  onOpenNewCaseModal,
  onOpenAcaraCepatModal,
  onOpenAiAnalyst,
  onOpenDriveManager,
  adminUsername = 'admin_banten',
  isDriveConnected = false
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };
      setCurrentTime(now.toLocaleDateString('id-ID', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = currentRole === 'admin';

  return (
    <header className="bg-slate-900 border-b-4 border-amber-600 text-white shadow-xl sticky top-0 z-40">
      {/* Top Bar with Live Info & Access State */}
      <div className="bg-slate-950/90 px-4 py-1.5 text-xs border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 text-slate-300">
          <span className="flex items-center gap-1 font-mono text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            {currentTime || 'Memuat waktu...'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* User Role Status Indicator */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-700 text-white shadow-xs">
                <ShieldCheck className="w-3 h-3" />
                <span>ADMINISTRATOR: {adminUsername}</span>
              </span>
              <button
                onClick={onLogoutAdmin}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 border border-slate-700 transition-colors cursor-pointer"
                title="Keluar dari akun Admin"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600/90 text-white">
                PORTAL PUBLIK
              </span>
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-red-700 flex items-center justify-center shadow-lg border border-amber-400/40 shrink-0">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span className="text-amber-400 font-serif">LeAD-AP</span>
              </h1>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-300">
              Layanan e-Administrasi (Sidang) Administratif Pemilu
            </p>
            <p className="text-[11px] text-amber-300/90 font-mono hidden sm:block">
              Sistem Penelusuran Perkara Penyelesaian Pelanggaran Administratif Pemilu • Bawaslu Provinsi Banten
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Exclusively for Admin) */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            {/* Acara Cepat button (instant 1-screen mobile form) */}
            <button
              onClick={onOpenAcaraCepatModal}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
              title="Formulir satu layar pemeriksaan acara cepat di lapangan"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>+ Acara Cepat</span>
            </button>
            {/* Registrasi Perkara Baru */}
            <button
              onClick={onOpenNewCaseModal}
              className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white font-semibold text-xs px-3 py-2 rounded-lg shadow-md hover:shadow-red-600/20 transition-all border border-red-500/40 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Registrasi Perkara Baru</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
