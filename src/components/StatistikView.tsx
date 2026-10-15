import React from 'react';
import { BarChart3, PieChart, TrendingUp, Clock, ShieldCheck, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Perkara } from '../types/leadAp';

interface StatistikViewProps {
  perkaraList: Perkara[];
}

export const StatistikView: React.FC<StatistikViewProps> = ({ perkaraList }) => {
  const total = perkaraList.length;

  // Breakdown per Jalur
  const jalurBiasa = perkaraList.filter((p) => p.jalur === 'biasa').length;
  const jalurAcaraCepat = perkaraList.filter((p) => p.jalur === 'acara_cepat').length;
  const jalurTsm = perkaraList.filter((p) => p.jalur === 'tsm').length;
  const jalurKoreksi = perkaraList.filter((p) => p.status === 'S11' || Boolean(p.koreksi)).length;

  // Breakdown Amar Putusan
  const putusanCases = perkaraList.filter((p) => Boolean(p.putusan));
  const amarTerbukti = putusanCases.filter((p) => p.putusan?.amar === 'Terbukti').length;
  const amarTidakTerbukti = putusanCases.filter((p) => p.putusan?.amar === 'Tidak Terbukti').length;

  // Breakdown Rata-rata Lama Proses (HK)
  const totalHK = perkaraList.reduce((acc, curr) => acc + curr.lama_proses_hk, 0);
  const avgHK = total > 0 ? (totalHK / total).toFixed(1) : '0';

  // Breakdown per Tingkatan
  const tingkatanCount: Record<string, number> = {};
  perkaraList.forEach((p) => {
    tingkatanCount[p.tingkatan] = (tingkatanCount[p.tingkatan] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      {/* Header View */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white p-5 rounded-xl shadow-md border-b-4 border-amber-500">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">
              STATISTIK PERKARA PELANGGARAN ADMINISTRATIF PEMILU
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Agregat data perkara, rasio amar putusan, kecepatan penyelesaian perkara (14 HK), dan distribusi wilayah.
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Total Perkara</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">{total}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Di seluruh jenjang Bawaslu</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Perkara Telah Diputus</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">{putusanCases.length}</span>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">
            {total > 0 ? ((putusanCases.length / total) * 100).toFixed(0) : 0}% Tingkat Penyelesaian
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Rata-Rata Lama Proses</span>
          <span className="text-3xl font-black text-blue-600 mt-1 block">{avgHK} <span className="text-base font-bold text-slate-500">HK</span></span>
          <span className="text-[11px] text-blue-700 mt-0.5 block">Dari batas maksimal 14 HK</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Permintaan Koreksi</span>
          <span className="text-3xl font-black text-purple-600 mt-1 block">{jalurKoreksi}</span>
          <span className="text-[11px] text-purple-700 mt-0.5 block">Diperiksa di Bawaslu RI</span>
        </div>
      </div>

      {/* Visual Chart Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribusi Jalur Perkara */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b pb-2">
            <PieChart className="w-4 h-4 text-amber-700" />
            <span>Distribusi Berdasarkan Jalur Perkara (Bab IV)</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1 font-semibold text-slate-700">
                <span>Pemeriksaan Biasa (Ps. 4 – 39)</span>
                <span>{jalurBiasa} Perkara</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${total > 0 ? (jalurBiasa / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold text-slate-700">
                <span>Pemeriksaan Acara Cepat (Ps. 40 – 43)</span>
                <span>{jalurAcaraCepat} Perkara</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-3 rounded-full"
                  style={{ width: `${total > 0 ? (jalurAcaraCepat / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold text-slate-700">
                <span>Pelanggaran Administratif TSM (Ps. 55 – 71)</span>
                <span>{jalurTsm} Perkara</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-600 h-3 rounded-full"
                  style={{ width: `${total > 0 ? (jalurTsm / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 font-semibold text-slate-700">
                <span>Permintaan Koreksi ke Bawaslu RI (Ps. 44 – 54)</span>
                <span>{jalurKoreksi} Perkara</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-purple-600 h-3 rounded-full"
                  style={{ width: `${total > 0 ? (jalurKoreksi / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rasio Amar Putusan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Rasio Amar Putusan</span>
          </h3>
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-red-950 block">Terbukti Melanggar</span>
                <span className="text-slate-600 text-[11px]">Dijatuhi sanksi administratif tata cara</span>
              </div>
              <span className="text-2xl font-black text-red-700">{amarTerbukti}</span>
            </div>

            <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Tidak Terbukti</span>
                <span className="text-slate-600 text-[11px]">Laporan/Temuan ditolak seluruhnya</span>
              </div>
              <span className="text-2xl font-black text-slate-800">{amarTidakTerbukti}</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg text-amber-900 text-[11px] leading-relaxed">
              * Putusan berkekuatan hukum mengikat wajib dilaksanakan oleh KPU selambat-lambatnya 3 hari kerja sejak dibacakan.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
