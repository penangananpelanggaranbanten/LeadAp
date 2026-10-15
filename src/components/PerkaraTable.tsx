import React, { useState, useMemo } from 'react';
import { Search, Eye, Filter, ArrowUpDown, ShieldAlert, Sparkles, ExternalLink, RefreshCw, Edit3, Trash2 } from 'lucide-react';
import { Perkara, UserRole } from '../types/leadAp';
import { STATUS_PERKARA_MAP, getStatusTenggatHK } from '../utils/businessLogic';

interface PerkaraTableProps {
  perkaraList: Perkara[];
  onSelectPerkara: (perkara: Perkara) => void;
  currentRole: UserRole;
  filterPreset?: string | null;
  onEditPerkara?: (perkara: Perkara) => void;
  onDeletePerkara?: (perkaraId: string) => void;
}

export const PerkaraTable: React.FC<PerkaraTableProps> = ({
  perkaraList,
  onSelectPerkara,
  currentRole,
  filterPreset,
  onEditPerkara,
  onDeletePerkara
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJalur, setSelectedJalur] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Perkara>('tgl_registrasi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Masking nama pelapor untuk peran publik (UU PDP 27/2022)
  const formatPelaporName = (p: Perkara) => {
    if (currentRole === 'publik' && p.pelapor.flag_disamarkan) {
      return (
        <span className="italic text-slate-500 font-medium">
          Disamarkan ({p.pelapor.jenis})
        </span>
      );
    }
    return <span className="font-semibold text-slate-800">{p.pelapor.nama}</span>;
  };

  const filteredData = useMemo(() => {
    return perkaraList.filter((item) => {
      // Filter preset from summary cards
      if (filterPreset === 'dalam_sidang') {
        if (!['S04', 'S05', 'S06', 'S07', 'S08'].includes(item.status)) return false;
      } else if (filterPreset === 'diputus') {
        if (!['S09', 'S10', 'S12', 'S13', 'S14'].includes(item.status) && !item.putusan) return false;
      } else if (filterPreset === 'dalam_koreksi') {
        if (item.status !== 'S11' && !item.koreksi) return false;
      } else if (filterPreset === 'mendekati_batas') {
        if (item.status === 'S14' || item.sisa_hk > 5 || item.jalur === 'acara_cepat') return false;
      }

      // Jalur filter
      if (selectedJalur !== 'all' && item.jalur !== selectedJalur) return false;

      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

      // Year filter
      if (selectedYear !== 'all') {
        const itemYear = item.tgl_registrasi.split('-')[0];
        if (itemYear !== selectedYear) return false;
      }

      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesRegister = item.nomor_register.toLowerCase().includes(query);
        const matchesPelapor = item.pelapor.nama.toLowerCase().includes(query);
        const matchesTerlapor = item.terlapor.nama.toLowerCase().includes(query);
        const matchesPokok = item.pokok_laporan.toLowerCase().includes(query);
        const matchesWilayah = item.nama_wilayah.toLowerCase().includes(query);
        return matchesRegister || matchesPelapor || matchesTerlapor || matchesPokok || matchesWilayah;
      }

      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [perkaraList, filterPreset, selectedJalur, selectedStatus, selectedYear, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const toggleSort = (field: keyof Perkara) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      {/* Top Header of Table */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-700">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
            <span>DATA SELURUH PERKARA SIDANG ADMINISTRATIF</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Pembaruan Data: Terkini secara waktu nyata | Total: {filteredData.length} Perkara
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto text-xs text-slate-300">
          <span className="hidden sm:inline">Halaman {currentPage} dari {totalPages}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row items-center gap-2.5">
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor register, pihak, atau kata kunci..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Filter Jalur */}
          <select
            aria-label="Pilih Jalur Perkara"
            value={selectedJalur}
            onChange={(e) => {
              setSelectedJalur(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-amber-500 shadow-sm cursor-pointer"
          >
            <option value="all">Jalur: Semua</option>
            <option value="biasa">Pemeriksaan Biasa</option>
            <option value="acara_cepat">Acara Cepat</option>
            <option value="tsm">Pelanggaran TSM</option>
            <option value="koreksi">Permintaan Koreksi</option>
          </select>

          {/* Filter Status */}
          <select
            aria-label="Pilih Status Perkara"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-amber-500 shadow-sm cursor-pointer"
          >
            <option value="all">Status: Semua (S01-S14)</option>
            {Object.entries(STATUS_PERKARA_MAP).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.kode} - {meta.nama}
              </option>
            ))}
          </select>

          {/* Filter Tahun */}
          <select
            aria-label="Pilih Tahun Perkara"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-amber-500 shadow-sm cursor-pointer"
          >
            <option value="all">Tahun: Semua</option>
            <option value="2028">Tahun 2028</option>
            <option value="2024">Tahun 2024</option>
            <option value="2023">Tahun 2023</option>
          </select>

          {(searchTerm || selectedJalur !== 'all' || selectedStatus !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedJalur('all');
                setSelectedStatus('all');
                setSelectedYear('all');
                setCurrentPage(1);
              }}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table Main Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <th className="py-2.5 px-3 w-12 text-center">No</th>
              <th
                onClick={() => toggleSort('nomor_register')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors w-64"
              >
                <div className="flex items-center gap-1">
                  <span>Nomor Register</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('tgl_registrasi')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors w-28 whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Tgl Register</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 w-56">Jenis / Tahapan Pemilu</th>
              <th className="py-2.5 px-3 min-w-[220px]">Para Pihak</th>
              <th className="py-2.5 px-3 w-36 text-center">Status Perkara</th>
              <th
                onClick={() => toggleSort('lama_proses_hk')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors w-32 text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Lama Proses</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 w-20 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Tidak ditemukan perkara yang sesuai dengan pencarian.
                </td>
              </tr>
            ) : (
              paginatedData.map((perkara, idx) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                const statusInfo = STATUS_PERKARA_MAP[perkara.status] || {
                  kode: perkara.status,
                  nama: perkara.status,
                  badgeColor: 'bg-slate-100 text-slate-800',
                  badgeBorder: 'border-slate-300'
                };
                const tenggatInfo = getStatusTenggatHK(perkara.lama_proses_hk);

                return (
                  <tr
                    key={perkara.id}
                    className="hover:bg-amber-50/50 transition-colors group cursor-pointer"
                    onClick={() => onSelectPerkara(perkara)}
                  >
                    <td className="py-3 px-3 text-center text-slate-500 font-mono">
                      {globalIndex}
                    </td>
                    <td className="py-3 px-3 max-w-[260px]">
                      <div className="font-mono font-bold text-blue-900 group-hover:text-amber-800 break-all [overflow-wrap:anywhere] whitespace-normal leading-snug">
                        <span>{perkara.nomor_register}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {perkara.nama_wilayah}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono">
                      {perkara.tgl_registrasi}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        {perkara.jalur === 'acara_cepat'
                          ? 'Pemeriksaan Acara Cepat'
                          : perkara.jalur === 'tsm'
                          ? 'Pelanggaran Administratif TSM'
                          : 'Pelanggaran Administratif'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        Tahapan: {perkara.tahapan_pemilu}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-start gap-1">
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1 rounded uppercase tracking-wider shrink-0 mt-0.5">
                            {perkara.sumber === 'TM' ? 'Penemu' : 'Pelapor'}:
                          </span>
                          <span className="text-slate-800 truncate">
                            {formatPelaporName(perkara)}
                          </span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1 rounded uppercase tracking-wider shrink-0 mt-0.5">
                            Terlapor:
                          </span>
                          <span className="text-slate-700 font-medium truncate">
                            {perkara.terlapor.nama}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-xs ${statusInfo.badgeColor} ${statusInfo.badgeBorder}`}
                      >
                        <span>{statusInfo.kode}</span>
                        <span>•</span>
                        <span>{statusInfo.nama}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {perkara.jalur === 'acara_cepat' ? (
                        <div className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          0 HK (Hari yang sama)
                        </div>
                      ) : (
                        <div>
                          <div className="font-mono font-bold text-slate-900">
                            {perkara.lama_proses_hk} / 14 HK
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-semibold ${tenggatInfo.badgeClass}`}
                            >
                              {perkara.status === 'S14' ? 'Selesai' : `Sisa ${perkara.sisa_hk} HK`}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectPerkara(perkara)}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 border border-slate-300 rounded px-2 py-1 font-semibold text-xs transition-colors cursor-pointer"
                          title="Lihat Detail Berkas Perkara Lengkap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>[detil]</span>
                        </button>
                        {currentRole === 'admin' && (
                          <>
                            <button
                              onClick={() => onEditPerkara && onEditPerkara(perkara)}
                              className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded transition-colors cursor-pointer"
                              title="Edit Data Perkara (Admin)"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const ok = window.confirm(`Hapus perkara ${perkara.nomor_register}?`);
                                if (ok && onDeletePerkara) onDeletePerkara(perkara.id);
                              }}
                              className="p-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded transition-colors cursor-pointer"
                              title="Hapus Perkara (Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
        <div>
          Menampilkan baris {(currentPage - 1) * itemsPerPage + 1} sampai{' '}
          {Math.min(currentPage * itemsPerPage, filteredData.length)} dari total {filteredData.length} perkara
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
          >
            Sebelumnya
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => setCurrentPage(pg)}
              className={`w-7 h-7 rounded border font-semibold cursor-pointer ${
                currentPage === pg
                  ? 'bg-amber-600 text-slate-950 border-amber-600'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {pg}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
};
