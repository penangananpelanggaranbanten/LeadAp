import React from 'react';
import { 
  Home, 
  FileSpreadsheet, 
  AlertOctagon, 
  Zap, 
  GitPullRequestDraft, 
  Calendar, 
  Gavel, 
  BarChart3, 
  DownloadCloud, 
  Briefcase, 
  Settings 
} from 'lucide-react';
import { UserRole } from '../types/leadAp';

export type ActiveTab =
  | 'beranda'
  | 'pelanggaran_biasa'
  | 'tsm'
  | 'acara_cepat'
  | 'koreksi'
  | 'jadwal_sidang'
  | 'putusan'
  | 'statistik'
  | 'unduh_formulir'
  | 'ruang_kerja'
  | 'pengaturan';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentRole: UserRole;
  pendingTasksCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  pendingTasksCount = 0
}) => {
  const isInternal = currentRole !== 'publik';

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; internalOnly?: boolean }[] = [
    { id: 'beranda', label: 'Beranda', icon: <Home className="w-4 h-4" /> },
    { id: 'pelanggaran_biasa', label: 'Pelanggaran Administratif', icon: <FileSpreadsheet className="w-4 h-4" /> },
    ...(isInternal
      ? [
          { id: 'tsm' as ActiveTab, label: 'Adm. TSM', icon: <AlertOctagon className="w-4 h-4" /> },
          { id: 'acara_cepat' as ActiveTab, label: 'Acara Cepat', icon: <Zap className="w-4 h-4" /> }
        ]
      : []),
    { id: 'koreksi', label: 'Koreksi', icon: <GitPullRequestDraft className="w-4 h-4" /> },
    { id: 'jadwal_sidang', label: 'Jadwal Sidang', icon: <Calendar className="w-4 h-4" /> },
    { id: 'putusan', label: 'Putusan', icon: <Gavel className="w-4 h-4" /> },
    { id: 'statistik', label: 'Statistik', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'unduh_formulir', label: 'Unduh Formulir', icon: <DownloadCloud className="w-4 h-4" /> },
    ...(isInternal
      ? [
          {
            id: 'ruang_kerja' as ActiveTab,
            label: 'Ruang Kerja',
            icon: <Briefcase className="w-4 h-4" />,
            badge: pendingTasksCount,
            internalOnly: true
          },
          {
            id: 'pengaturan' as ActiveTab,
            label: 'Pengaturan',
            icon: <Settings className="w-4 h-4" />,
            internalOnly: true
          }
        ]
      : [])
  ];

  return (
    <nav className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-800/40 text-white shadow-md overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-2 flex items-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 relative cursor-pointer ${
                isActive
                  ? 'border-amber-400 text-amber-300 bg-red-900/40 font-semibold'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {Boolean(item.badge && item.badge > 0) && (
                <span className="ml-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
