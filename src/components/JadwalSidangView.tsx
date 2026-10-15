import React, { useState } from 'react';
import { Calendar, Video, Clock, ExternalLink, MapPin, Eye, Play, Search, Youtube, AlertCircle, Radio } from 'lucide-react';
import { Perkara, JadwalSidang } from '../types/leadAp';
import { YouTubeStreamModal } from './YouTubeStreamModal';

interface JadwalSidangViewProps {
  perkaraList: Perkara[];
  onSelectPerkara: (perkara: Perkara) => void;
  onOpenSidangSimulator: (perkara: Perkara) => void;
}

export const JadwalSidangView: React.FC<JadwalSidangViewProps> = ({
  perkaraList,
  onSelectPerkara,
  onOpenSidangSimulator
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'hari_ini' | 'minggu_ini'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStreamItem, setActiveStreamItem] = useState<{ sidang: JadwalSidang; perkara: Perkara } | null>(null);

  // Kumpulkan seluruh jadwal sidang lintas perkara
  const allSidangItems: { sidang: JadwalSidang; perkara: Perkara }[] = [];
  perkaraList.forEach((p) => {
    (p.jadwal_sidang || []).forEach((js) => {
      allSidangItems.push({ sidang: js, perkara: p });
    });
  });

  const filteredItems = allSidangItems.filter(({ sidang, perkara }) => {
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchReg = perkara.nomor_register.toLowerCase().includes(q);
      const matchAgenda = sidang.agenda.toLowerCase().includes(q);
      const matchPihak = perkara.pelapor.nama.toLowerCase().includes(q) || perkara.terlapor.nama.toLowerCase().includes(q);
      if (!matchReg && !matchAgenda && !matchPihak) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header View */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white p-5 rounded-xl shadow-md border-b-4 border-amber-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold tracking-tight">
                JADWAL PERSIDANGAN TERBUKA LINTAS PERKARA
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Jadwal agenda sidang pemeriksaan administratif Pemilu, transparansi peradilan, dan siaran langsung streaming Bawaslu.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari sidang / perkara..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 w-48 sm:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wide">
            Daftar Agenda Sidang ({filteredItems.length} Sesi Terjadwal)
          </span>
          <span className="text-slate-500">Standar Layanan Publik Terbuka</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                <th className="py-2.5 px-3 w-28">Tanggal</th>
                <th className="py-2.5 px-3 w-24">Waktu</th>
                <th className="py-2.5 px-3 min-w-[200px]">Nomor Register Perkara</th>
                <th className="py-2.5 px-3 min-w-[180px]">Agenda Sidang</th>
                <th className="py-2.5 px-3 min-w-[200px]">Ruang Sidang / Lokasi</th>
                <th className="py-2.5 px-3 w-28 text-center">Status</th>
                <th className="py-2.5 px-3 w-28 text-center">Siaran Langsung</th>
                <th className="py-2.5 px-3 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ditemukan agenda sidang yang terjadwal.
                  </td>
                </tr>
              ) : (
                filteredItems.map(({ sidang, perkara }, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {sidang.tanggal}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                      {sidang.jam}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-blue-900">{perkara.nomor_register}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {perkara.pelapor.nama} vs {perkara.terlapor.nama}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{sidang.agenda} (Sidang ke-{sidang.ke})</div>
                      {sidang.status === 'Ditunda' && sidang.alasan_ditunda && (
                        <div className="mt-1 flex items-start gap-1 text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Ditunda: </span>
                            <span>{sidang.alasan_ditunda}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <span className="block font-medium">{sidang.lokasi_atau_tautan}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Mode: {sidang.mode}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
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
                    <td className="py-3 px-3 text-center">
                      {sidang.tautan_siaran ? (
                        <button
                          onClick={() => setActiveStreamItem({ sidang, perkara })}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 px-2.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                          title="Tonton Siaran Langsung YouTube Sidang Terbuka"
                        >
                          <Youtube className="w-3.5 h-3.5" />
                          <span>Nonton Live</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectPerkara(perkara)}
                          className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-slate-100 rounded cursor-pointer"
                          title="Lihat Detail Perkara"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenSidangSimulator(perkara)}
                          className="p-1.5 text-red-700 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                          title="Masuk Ruang Sidang"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pemutar Siaran Langsung YouTube untuk Masyarakat */}
      <YouTubeStreamModal
        isOpen={Boolean(activeStreamItem)}
        onClose={() => setActiveStreamItem(null)}
        sidang={activeStreamItem?.sidang || null}
        perkara={activeStreamItem?.perkara || null}
      />
    </div>
  );
};
