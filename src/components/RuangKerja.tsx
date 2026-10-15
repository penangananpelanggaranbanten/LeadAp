import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Calendar, 
  Scale, 
  Send, 
  Filter, 
  PlusCircle, 
  Layers,
  Sparkles
} from 'lucide-react';
import { TaskItem, UserRole, Perkara } from '../types/leadAp';

interface RuangKerjaProps {
  tasks: TaskItem[];
  perkaraList: Perkara[];
  currentRole: UserRole;
  onSelectPerkara: (perkara: Perkara) => void;
  onOpenSidangSimulator: (perkara: Perkara) => void;
  onOpenFormGenerator: (perkara: Perkara, formKode?: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export const RuangKerja: React.FC<RuangKerjaProps> = ({
  tasks,
  perkaraList,
  currentRole,
  onSelectPerkara,
  onOpenSidangSimulator,
  onOpenFormGenerator,
  onCompleteTask
}) => {
  const [filterRole, setFilterRole] = useState<string>(currentRole);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Menunggu' | 'Selesai'>('Menunggu');

  const filteredTasks = tasks.filter((t) => {
    if (filterRole !== 'all' && t.target_role !== filterRole) return false;
    if (filterStatus !== 'all' && t.status_tugas !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Ruang Kerja */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-xl shadow-md border-b-4 border-amber-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold tracking-tight">
                RUANG KERJA INTERNAL BERBASIS TUGAS
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Manajemen antrian disposisi tugas per peran, pengingat tenggat waktu, dan pembuatan formulir resmi otomatis.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">Filter Peran:</span>
            <select
              aria-label="Filter Peran Ruang Kerja"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">Semua Peran Petugas</option>
              <option value="petugas_registrasi">Petugas Registrasi</option>
              <option value="sekretaris">Sekretaris Pemeriksa</option>
              <option value="asisten">Asisten Pemeriksa</option>
              <option value="perisalah">Perisalah Sidang</option>
              <option value="majelis">Majelis / Ketua Bawaslu</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Task Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Tugas Menunggu
            </span>
            <span className="text-2xl font-black text-amber-600">
              {tasks.filter((t) => t.status_tugas === 'Menunggu').length}
            </span>
          </div>
          <Clock className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Prioritas Kritis
            </span>
            <span className="text-2xl font-black text-red-600">
              {tasks.filter((t) => t.prioritas === 'Kritis' && t.status_tugas === 'Menunggu').length}
            </span>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-500/30" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Tugas Selesai
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {tasks.filter((t) => t.status_tugas === 'Selesai').length}
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-700" />
            <span>Daftar Antrian Tindakan Hukum & Administrasi</span>
          </h3>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                filterStatus === 'all' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus('Menunggu')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                filterStatus === 'Menunggu' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Menunggu
            </button>
            <button
              onClick={() => setFilterStatus('Selesai')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                filterStatus === 'Selesai' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada tugas yang menunggu untuk filter ini.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const matchedCase = perkaraList.find((p) => p.nomor_register === task.nomor_register);

              return (
                <div
                  key={task.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{task.judul}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.prioritas === 'Kritis'
                            ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        Prioritas: {task.prioritas}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                        Peran: {task.target_role}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed max-w-2xl">{task.deskripsi}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 font-mono">
                      <span>Perkara: <strong className="text-blue-900">{task.nomor_register}</strong></span>
                      <span>Tenggat: <strong className="text-red-700">{task.tenggat_waktu}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    {matchedCase && (
                      <button
                        onClick={() => onSelectPerkara(matchedCase)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-semibold text-xs border border-slate-300 cursor-pointer"
                      >
                        Buka Berkas
                      </button>
                    )}
                    {task.action_type === 'buka_sidang' && matchedCase && (
                      <button
                        onClick={() => onOpenSidangSimulator(matchedCase)}
                        className="bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Buka Sidang
                      </button>
                    )}
                    {task.action_type === 'siapkan_sps' && matchedCase && (
                      <button
                        onClick={() => onOpenFormGenerator(matchedCase, 'ADM.SPS')}
                        className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Generate ADM.SPS
                      </button>
                    )}
                    {task.action_type === 'draf_putusan' && matchedCase && (
                      <button
                        onClick={() => onOpenFormGenerator(matchedCase, 'ADM.PUTUSAN')}
                        className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Draf Putusan
                      </button>
                    )}
                    {task.status_tugas === 'Menunggu' ? (
                      <button
                        onClick={() => onCompleteTask(task.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandai Selesai</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesai</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
