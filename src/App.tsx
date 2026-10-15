/**
 * LeAD-AP (Layanan e-Administrasi Sidang Administratif Pemilu)
 * Sistem Penelusuran Perkara Penyelesaian Pelanggaran Administratif Pemilu model SIPP
 * Badan Pengawas Pemilihan Umum Provinsi Banten (2026)
 * Rujukan: Perbawaslu Nomor 8 Tahun 2022 & Panduan Sidang Administratif Pemilu
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { SummaryCards } from './components/SummaryCards';
import { PerkaraTable } from './components/PerkaraTable';
import { PerkaraDetail } from './components/PerkaraDetail';
import { RuangKerja } from './components/RuangKerja';
import { JadwalSidangView } from './components/JadwalSidangView';
import { StatistikView } from './components/StatistikView';
import { PengaturanView } from './components/PengaturanView';
import { AlurSidangSimulator } from './components/AlurSidangSimulator';
import { FormulirGeneratorModal } from './components/FormulirGeneratorModal';
import { UnduhFormulirView } from './components/UnduhFormulirView';
import { AcaraCepatModal } from './components/AcaraCepatModal';
import { RegistrasiPerkaraModal } from './components/RegistrasiPerkaraModal';
import { EditPerkaraModal } from './components/EditPerkaraModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { KoreksiModal } from './components/KoreksiModal';
import { AiLegalAnalyst } from './components/AiLegalAnalyst';
import { GoogleDriveManagerModal } from './components/GoogleDriveManagerModal';
import { Perkara, TaskItem, UserRole } from './types/leadAp';
import { INITIAL_PERKARA_DATA, INITIAL_TASKS } from './data/mockData';
import { 
  fetchFromGoogleEcosystem, 
  syncAllToGoogleEcosystem, 
  isGoogleSyncEnabled 
} from './services/googleEcosystemService';
import { Scale, ShieldCheck, DownloadCloud, FileText, Gavel, AlertOctagon, Lock } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return localStorage.getItem('leadap_admin_session') === 'true' ? 'admin' : 'publik';
  });
  const [adminUsername, setAdminUsername] = useState<string>(() => {
    return localStorage.getItem('leadap_current_admin') || 'admin_banten';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');

  // Persistence of Perkara and Tasks Data
  const [perkaraList, setPerkaraList] = useState<Perkara[]>(() => {
    const saved = localStorage.getItem('leadap_perkara_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Gagal membaca data perkara dari storage', e);
      }
    }
    return INITIAL_PERKARA_DATA;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('leadap_tasks_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Gagal membaca data tugas dari storage', e);
      }
    }
    return INITIAL_TASKS;
  });

  const [selectedPerkara, setSelectedPerkara] = useState<Perkara | null>(null);
  const [summaryFilter, setSummaryFilter] = useState<string | null>(null);

  // Google Drive connection state
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(Boolean(null));

  // Modals state
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isDriveManagerOpen, setIsDriveManagerOpen] = useState<boolean>(false);
  const [editingPerkara, setEditingPerkara] = useState<Perkara | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState<boolean>(false);
  const [isAcaraCepatModalOpen, setIsAcaraCepatModalOpen] = useState<boolean>(false);
  const [isAiAnalystOpen, setIsAiAnalystOpen] = useState<boolean>(false);
  const [aiTargetPerkara, setAiTargetPerkara] = useState<Perkara | null>(null);
  const [sidangSimulatorPerkara, setSidangSimulatorPerkara] = useState<Perkara | null>(null);
  const [formGeneratorPerkara, setFormGeneratorPerkara] = useState<Perkara | null>(null);
  const [formGeneratorKode, setFormGeneratorKode] = useState<string>('');
  const [koreksiPerkara, setKoreksiPerkara] = useState<Perkara | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('leadap_perkara_data', JSON.stringify(perkaraList));
  }, [perkaraList]);

  useEffect(() => {
    localStorage.setItem('leadap_tasks_data', JSON.stringify(tasks));
  }, [tasks]);

  // Sinkronisasi awal dari Google Spreadsheet via Google Apps Script Resmi
  useEffect(() => {
    async function loadGoogleEcosystemData() {
      try {
        const remote = await fetchFromGoogleEcosystem();
        if (remote) {
          if (remote.adminAccounts && Object.keys(remote.adminAccounts).length > 0) {
            localStorage.setItem('leadap_admin_accounts', JSON.stringify(remote.adminAccounts));
          }
          const validPerkaras = (remote.perkaraList || []).filter((p: any) => p && p.id && p.nomor_register);
          if (validPerkaras.length > 0) {
            setPerkaraList(validPerkaras);
            if (remote.tasks && remote.tasks.length > 0) {
              setTasks(remote.tasks);
            }
          } else {
            // Jika spreadsheet masih kosong/baru, kirim data inisial perkara agar sheet Perkara langsung terisi
            syncAllToGoogleEcosystem(perkaraList, tasks).catch((e) =>
              console.warn('Initial seed to Google Spreadsheet failed:', e)
            );
          }
        }
      } catch (err) {
        console.warn('Initial Google Ecosystem load:', err);
      }
    }
    loadGoogleEcosystemData();
  }, []);

  // Guard: Jika mode publik, tab khusus admin dialihkan ke beranda
  useEffect(() => {
    if (currentRole === 'publik' && (activeTab === 'tsm' || activeTab === 'acara_cepat' || activeTab === 'ruang_kerja' || activeTab === 'pengaturan')) {
      setActiveTab('beranda');
    }
  }, [currentRole, activeTab]);

  // Helper auto-sync database to Google Spreadsheet & Google Drive
  const triggerAutoDriveSync = (updatedPerkaras: Perkara[], updatedTasks: TaskItem[]) => {
    if (isGoogleSyncEnabled()) {
      syncAllToGoogleEcosystem(updatedPerkaras, updatedTasks).catch((e) =>
        console.warn('Auto sync Google Sheets failed:', e)
      );
    }
  };

  const handleLoginSuccess = (username: string) => {
    setCurrentRole('admin');
    setAdminUsername(username);
    showToast(`Berhasil masuk sebagai Administrator (${username})!`);
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('leadap_admin_session');
    setCurrentRole('publik');
    if (activeTab === 'ruang_kerja' || activeTab === 'pengaturan' || activeTab === 'tsm' || activeTab === 'acara_cepat') {
      setActiveTab('beranda');
    }
    showToast('Anda beralih ke Mode Publik (Hanya Lihat & Unduh)');
  };

  // Handlers for Cases (Admin CRUD)
  const handleSaveNewPerkara = (newPerkara: Perkara) => {
    const nextPerkaras = [newPerkara, ...perkaraList];
    setPerkaraList(nextPerkaras);

    // Buat task otomatis untuk Ketua Bawaslu: Tetapkan Majelis
    const newTask: TaskItem = {
      id: 'task-' + Date.now(),
      perkara_id: newPerkara.id,
      nomor_register: newPerkara.nomor_register,
      judul: 'Tetapkan Majelis Pemeriksa',
      deskripsi: `Perkara baru ${newPerkara.nomor_register} telah diregistrasi. Segera tetapkan susunan Majelis dan tim pendukung.`,
      target_role: 'admin',
      tenggat_waktu: newPerkara.tgl_registrasi,
      prioritas: 'Kritis',
      status_tugas: 'Menunggu',
      action_type: 'tetapkan_majelis'
    };

    const nextTasks = [newTask, ...tasks];
    setTasks(nextTasks);
    showToast(`Perkara ${newPerkara.nomor_register} berhasil diregistrasi! Timer 14 HK dimulai.`);
    triggerAutoDriveSync(nextPerkaras, nextTasks);
  };

  const handleSaveAcaraCepat = (acaraCepatCase: Perkara) => {
    const nextPerkaras = [acaraCepatCase, ...perkaraList];
    setPerkaraList(nextPerkaras);
    showToast(`Putusan Acara Cepat ${acaraCepatCase.nomor_register} seketika diterbitkan di hari yang sama!`);
    triggerAutoDriveSync(nextPerkaras, tasks);
  };

  const handleUpdatePerkara = (updated: Perkara) => {
    const nextPerkaras = perkaraList.map((p) => (p.id === updated.id ? updated : p));
    setPerkaraList(nextPerkaras);
    if (selectedPerkara?.id === updated.id) {
      setSelectedPerkara(updated);
    }
    showToast(`Data perkara ${updated.nomor_register} berhasil diperbarui.`);
    triggerAutoDriveSync(nextPerkaras, tasks);
  };

  const handleDeletePerkara = (perkaraId: string) => {
    const target = perkaraList.find((p) => p.id === perkaraId);
    const nextPerkaras = perkaraList.filter((p) => p.id !== perkaraId);
    const nextTasks = tasks.filter((t) => t.perkara_id !== perkaraId);
    setPerkaraList(nextPerkaras);
    setTasks(nextTasks);
    if (selectedPerkara?.id === perkaraId) {
      setSelectedPerkara(null);
    }
    showToast(`Perkara ${target?.nomor_register || ''} berhasil dihapus.`);
    triggerAutoDriveSync(nextPerkaras, nextTasks);
  };

  const handleSidangResult = (updated: Perkara, summaryMsg: string) => {
    handleUpdatePerkara(updated);
    showToast(summaryMsg);
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status_tugas: 'Selesai' } : t))
    );
    showToast('Tugas berhasil ditandai selesai.');
  };

  const openAiForCase = (perkara?: Perkara | null) => {
    setAiTargetPerkara(perkara || null);
    setIsAiAnalystOpen(true);
  };

  const openFormForCase = (perkara?: Perkara | null, kode: string = 'ADM.BA-REG') => {
    setFormGeneratorPerkara(perkara || null);
    setFormGeneratorKode(kode);
  };

  // Filtered case lists based on tab
  const displayedCases = (() => {
    if (activeTab === 'pelanggaran_biasa') {
      return perkaraList.filter((p) => p.jalur === 'biasa');
    }
    if (activeTab === 'tsm') {
      return perkaraList.filter((p) => p.jalur === 'tsm');
    }
    if (activeTab === 'acara_cepat') {
      return perkaraList.filter((p) => p.jalur === 'acara_cepat');
    }
    if (activeTab === 'koreksi') {
      return perkaraList.filter((p) => p.status === 'S11' || Boolean(p.koreksi));
    }
    if (activeTab === 'putusan') {
      return perkaraList.filter((p) => Boolean(p.putusan));
    }
    return perkaraList;
  })();

  const pendingTasksCount = tasks.filter((t) => t.status_tugas === 'Menunggu').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-amber-200 selection:text-slate-900">
      {/* Header */}
      <Header
        currentRole={currentRole}
        onOpenLoginModal={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)}
        onOpenAcaraCepatModal={() => setIsAcaraCepatModalOpen(true)}
        onOpenAiAnalyst={() => openAiForCase(selectedPerkara)}
        onOpenDriveManager={() => setIsDriveManagerOpen(true)}
        adminUsername={adminUsername}
        isDriveConnected={isDriveConnected}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedPerkara(null);
          setActiveTab(tab);
        }}
        currentRole={currentRole}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-5">
        {/* Toast Floating Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-amber-300 border border-amber-500/60 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Condition 1: Detailed Case View */}
        {selectedPerkara ? (
          <PerkaraDetail
            perkara={selectedPerkara}
            onBack={() => setSelectedPerkara(null)}
            currentRole={currentRole}
            onOpenSidangSimulator={(p) => setSidangSimulatorPerkara(p)}
            onOpenFormGenerator={(p, kode) => openFormForCase(p, kode)}
            onOpenAiAnalyst={(p) => openAiForCase(p)}
            onUpdatePerkara={handleUpdatePerkara}
            onOpenKoreksiModal={(p) => setKoreksiPerkara(p)}
            onOpenEditPerkara={(p) => setEditingPerkara(p)}
            onOpenDriveManager={() => setIsDriveManagerOpen(true)}
          />
        ) : (
          /* Condition 2: Tab Views */
          <>
            {/* View: Jadwal Sidang */}
            {activeTab === 'jadwal_sidang' && (
              <JadwalSidangView
                perkaraList={perkaraList}
                onSelectPerkara={(p) => setSelectedPerkara(p)}
                onOpenSidangSimulator={(p) => setSidangSimulatorPerkara(p)}
              />
            )}

            {/* View: Ruang Kerja (Admin Only) */}
            {activeTab === 'ruang_kerja' && (
              <RuangKerja
                tasks={tasks}
                perkaraList={perkaraList}
                currentRole={currentRole}
                onSelectPerkara={(p) => setSelectedPerkara(p)}
                onOpenSidangSimulator={(p) => setSidangSimulatorPerkara(p)}
                onOpenFormGenerator={(p, kode) => openFormForCase(p, kode)}
                onCompleteTask={handleCompleteTask}
              />
            )}

            {/* View: Statistik */}
            {activeTab === 'statistik' && <StatistikView perkaraList={perkaraList} />}

            {/* View: Pengaturan (Admin Only) */}
            {activeTab === 'pengaturan' && (
              <PengaturanView onOpenDriveManager={() => setIsDriveManagerOpen(true)} />
            )}

            {/* View: Unduh Formulir (21 Formulir Master: Publik & Admin) */}
            {activeTab === 'unduh_formulir' && (
              <UnduhFormulirView
                currentRole={currentRole}
                onOpenLoginModal={() => setIsAdminLoginOpen(true)}
                onOpenDriveManager={() => setIsDriveManagerOpen(true)}
              />
            )}

            {/* Default Case Tables (Beranda, Pelanggaran Biasa, TSM, Acara Cepat, Koreksi, Putusan) */}
            {(activeTab === 'beranda' ||
              activeTab === 'pelanggaran_biasa' ||
              activeTab === 'tsm' ||
              activeTab === 'acara_cepat' ||
              activeTab === 'koreksi' ||
              activeTab === 'putusan') && (
              <>
                {/* Specific Announcement Banner per tab */}
                {activeTab === 'tsm' && (
                  <div className="bg-rose-900 text-white p-3.5 rounded-xl shadow-xs flex items-center gap-3 text-xs border border-rose-700">
                    <AlertOctagon className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                      <strong className="block text-amber-200">
                        JALUR PELANGGARAN ADMINISTRATIF TSM
                      </strong>
                      Diperiksa oleh Bawaslu RI dengan Majelis minimal 3 orang. Khusus mengenai dugaan perbuatan Terstruktur, Sistematis, dan Masif dengan sanksi pembatalan Calon / Paslon.
                    </div>
                  </div>
                )}

                {activeTab === 'acara_cepat' && (
                  <div className="bg-amber-600 text-slate-950 p-3.5 rounded-xl shadow-xs flex items-center justify-between gap-3 text-xs font-semibold">
                    <div>
                      <strong className="block text-slate-950 text-sm">
                        JALUR PEMERIKSAAN ACARA CEPAT LAPANGAN
                      </strong>
                      Diputus di hari yang sama di tempat kejadian oleh Pengawas Pemilu.
                    </div>
                    {currentRole === 'admin' ? (
                      <button
                        onClick={() => setIsAcaraCepatModalOpen(true)}
                        className="bg-slate-950 hover:bg-slate-900 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                      >
                        + Isi Formulir Lapangan
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsAdminLoginOpen(true)}
                        className="bg-slate-950/80 hover:bg-slate-900 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Login Admin untuk Input</span>
                      </button>
                    )}
                  </div>
                )}

                {activeTab === 'koreksi' && (
                  <div className="bg-blue-900 text-white p-3.5 rounded-xl shadow-xs flex items-center gap-3 text-xs border border-blue-700">
                    <Gavel className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                      <strong className="block text-amber-200">
                        ALUR PERMINTAAN KOREKSI PUTUSAN KE BAWASLU RI
                      </strong>
                      Hanya atas putusan Bawaslu Provinsi/Kab/Kota (non acara cepat) dengan tenggat pengajuan ≤ 3 HK. Pelaksanaan putusan DITUNDA selama proses koreksi.
                    </div>
                  </div>
                )}

                {/* 5 KPI Metric Summary Cards */}
                <SummaryCards
                  perkaraList={perkaraList}
                  activeFilter={summaryFilter}
                  onFilterCardClick={(f) => setSummaryFilter(f)}
                />

                {/* Main Table */}
                <PerkaraTable
                  perkaraList={displayedCases}
                  onSelectPerkara={(p) => setSelectedPerkara(p)}
                  currentRole={currentRole}
                  filterPreset={summaryFilter}
                  onEditPerkara={(p) => setEditingPerkara(p)}
                  onDeletePerkara={handleDeletePerkara}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-white py-6 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-700 text-white font-serif font-black">
              BAWASLU
            </div>
            <div>
              <p className="font-bold text-slate-200">
                Badan Pengawas Pemilihan Umum Provinsi Banten
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                LeAD-AP Versi 1.0 - 2026
              </p>
            </div>
          </div>
          <div className="text-center md:text-right text-[11px] text-slate-400 space-y-0.5">
            <p className="text-amber-400/90 font-mono">
              Prinsip: Cepat, Tidak Memihak, Tanpa Biaya, dan Terbuka
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* Admin Login & Registration Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUsername={adminUsername}
      />
      
      {/* Edit Perkara Modal (Admin Only) */}
      {editingPerkara && (
        <EditPerkaraModal
          perkara={editingPerkara}
          onClose={() => setEditingPerkara(null)}
          onSave={handleUpdatePerkara}
          onDelete={handleDeletePerkara}
        />
      )}

      {isNewCaseModalOpen && (
        <RegistrasiPerkaraModal
          onClose={() => setIsNewCaseModalOpen(false)}
          onSavePerkara={handleSaveNewPerkara}
        />
      )}

      {isAcaraCepatModalOpen && (
        <AcaraCepatModal
          onClose={() => setIsAcaraCepatModalOpen(false)}
          onSaveAcaraCepat={handleSaveAcaraCepat}
        />
      )}

      {isAiAnalystOpen && (
        <AiLegalAnalyst
          selectedPerkara={aiTargetPerkara || selectedPerkara}
          perkaraList={perkaraList}
          onClose={() => {
            setIsAiAnalystOpen(false);
            setAiTargetPerkara(null);
          }}
        />
      )}

      {sidangSimulatorPerkara && (
        <AlurSidangSimulator
          perkara={sidangSimulatorPerkara}
          onClose={() => setSidangSimulatorPerkara(null)}
          onSaveSidangResult={handleSidangResult}
          onOpenAiAnalyst={(p) => openAiForCase(p)}
        />
      )}

      {formGeneratorPerkara && formGeneratorKode && (
        <FormulirGeneratorModal
          perkara={formGeneratorPerkara}
          initialKode={formGeneratorKode}
          onClose={() => {
            setFormGeneratorPerkara(null);
            setFormGeneratorKode('');
          }}
        />
      )}

      {koreksiPerkara && (
        <KoreksiModal
          perkara={koreksiPerkara}
          onClose={() => setKoreksiPerkara(null)}
          onSaveKoreksi={handleUpdatePerkara}
        />
      )}

      {/* Google Drive Manager Modal */}
      <GoogleDriveManagerModal
        isOpen={isDriveManagerOpen}
        onClose={() => setIsDriveManagerOpen(false)}
        perkaraList={perkaraList}
        tasks={tasks}
        onNotify={(msg) => showToast(msg)}
      />
    </div>
  );
}
