import React from 'react';
import { FilePlus2, Hourglass, CheckCircle2, GitCompare, AlertTriangle } from 'lucide-react';
import { Perkara } from '../types/leadAp';

interface SummaryCardsProps {
  perkaraList: Perkara[];
  activeFilter: string | null;
  onFilterCardClick: (filterKey: string | null) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  perkaraList,
  activeFilter,
  onFilterCardClick
}) => {
  // Hitung jumlah kategori
  const totalDiregistrasi = perkaraList.length;

  // Dalam Sidang: S04, S05, S06, S07, S08
  const dalamSidangCount = perkaraList.filter((p) =>
    ['S04', 'S05', 'S06', 'S07', 'S08'].includes(p.status)
  ).length;

  // Diputus: S09, S10, S12, S13, S14
  const diputusCount = perkaraList.filter((p) =>
    ['S09', 'S10', 'S12', 'S13', 'S14'].includes(p.status) || Boolean(p.putusan)
  ).length;

  // Dalam Koreksi: S11
  const dalamKoreksiCount = perkaraList.filter((p) => p.status === 'S11' || Boolean(p.koreksi)).length;

  // Mendekati Batas Waktu: sisa HK <= 5 dan belum S14 (putusan belum selesai/minutasi)
  const mendekatiBatasCount = perkaraList.filter(
    (p) => p.status !== 'S14' && p.sisa_hk <= 5 && p.jalur !== 'acara_cepat'
  ).length;

  const cards = [
    {
      key: 'diregistrasi',
      title: 'Diregistrasi',
      count: totalDiregistrasi,
      sub: 'Total seluruh perkara teregister',
      icon: <FilePlus2 className="w-5 h-5 text-blue-600" />,
      borderColor: 'border-blue-400',
      activeColor: 'bg-blue-50 border-blue-600 ring-2 ring-blue-400',
      numColor: 'text-blue-900'
    },
    {
      key: 'dalam_sidang',
      title: 'Dalam Sidang',
      count: dalamSidangCount,
      sub: 'Tahap pembacaan s.d. kesimpulan',
      icon: <Hourglass className="w-5 h-5 text-amber-600" />,
      borderColor: 'border-amber-400',
      activeColor: 'bg-amber-50 border-amber-600 ring-2 ring-amber-400',
      numColor: 'text-amber-900'
    },
    {
      key: 'diputus',
      title: 'Diputus',
      count: diputusCount,
      sub: 'Telah dibacakan amar putusan',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      borderColor: 'border-emerald-400',
      activeColor: 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-400',
      numColor: 'text-emerald-900'
    },
    {
      key: 'dalam_koreksi',
      title: 'Dalam Koreksi',
      count: dalamKoreksiCount,
      sub: 'Proses koreksi di Bawaslu RI',
      icon: <GitCompare className="w-5 h-5 text-purple-600" />,
      borderColor: 'border-purple-400',
      activeColor: 'bg-purple-50 border-purple-600 ring-2 ring-purple-400',
      numColor: 'text-purple-900'
    },
    {
      key: 'mendekati_batas',
      title: 'Mendekati Batas Waktu',
      count: mendekatiBatasCount,
      sub: 'Sisa ≤ 5 Hari Kerja',
      icon: <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />,
      borderColor: 'border-red-500',
      activeColor: 'bg-red-50 border-red-600 ring-2 ring-red-500',
      numColor: 'text-red-700 font-extrabold',
      isWarning: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card) => {
        const isSelected = activeFilter === card.key;
        return (
          <div
            key={card.key}
            onClick={() => onFilterCardClick(isSelected ? null : card.key)}
            className={`p-3.5 rounded-xl border bg-white shadow-sm hover:shadow-md cursor-pointer transition-all duration-150 flex flex-col justify-between ${
              isSelected ? card.activeColor : `${card.borderColor} hover:bg-slate-50`
            } ${card.isWarning ? 'bg-gradient-to-br from-red-50/60 to-white' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-1 rounded-md bg-slate-100/80">{card.icon}</div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`text-3xl font-black ${card.numColor}`}>{card.count}</span>
              {isSelected && (
                <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono font-medium">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
};
