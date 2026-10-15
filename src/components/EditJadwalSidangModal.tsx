import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  ExternalLink,
  Info,
  Youtube,
  Users
} from 'lucide-react';
import { JadwalSidang, StatusSidang, Perkara } from '../types/leadAp';
import { extractYouTubeId } from './YouTubeStreamModal';

interface EditJadwalSidangModalProps {
  isOpen: boolean;
  onClose: () => void;
  sidang: JadwalSidang | null;
  perkara: Perkara;
  onSave: (updatedSidang: JadwalSidang) => void;
}

const AGENDA_PRESETS = [
  'Pembacaan Laporan / Temuan',
  'Penyampaian Jawaban Terlapor',
  'Pemeriksaan Bukti Surat / Dokumen',
  'Pemeriksaan Saksi dan Ahli',
  'Pemeriksaan Setempat (Lapangan)',
  'Penyampaian Kesimpulan Para Pihak',
  'Pembacaan Putusan Akhir',
  'Musyawarah Majelis Pemeriksa'
];

const ALASAN_DITUNDA_PRESETS = [
  'Pihak Terlapor belum hadir / pemanggilan ulang',
  'Pihak Pelapor mengajukan penundaan tertulis',
  'Pemeriksaan saksi tambahan dan alat bukti belum lengkap',
  'Majelis Pemeriksa berhalangan hadir karena agenda mendesak',
  'Pihak saksi/ahli berhalangan hadir dengan surat keterangan sah',
  'Musyawarah majelis memerlukan pendalaman materi pembuktian'
];

export const EditJadwalSidangModal: React.FC<EditJadwalSidangModalProps> = ({
  isOpen,
  onClose,
  sidang,
  perkara,
  onSave
}) => {
  if (!isOpen || !sidang) return null;

  // Form State
  const [ke, setKe] = useState<number>(sidang.ke);
  const [tanggal, setTanggal] = useState<string>(sidang.tanggal);
  const [jam, setJam] = useState<string>(sidang.jam);
  const [agenda, setAgenda] = useState<string>(sidang.agenda);
  const [customAgenda, setCustomAgenda] = useState<string>('');
  const [isCustomAgenda, setIsCustomAgenda] = useState<boolean>(false);
  const [mode, setMode] = useState<'Luring' | 'Daring'>(sidang.mode);
  const [lokasi, setLokasi] = useState<string>(sidang.lokasi_atau_tautan);
  const [status, setStatus] = useState<StatusSidang>(sidang.status);
  const [alasanDitunda, setAlasanDitunda] = useState<string>(sidang.alasan_ditunda || '');
  const [catatanSidang, setCatatanSidang] = useState<string>(sidang.catatan_sidang || '');
  const [tautanSiaran, setTautanSiaran] = useState<string>(sidang.tautan_siaran || '');
  const [hadirPelapor, setHadirPelapor] = useState<boolean>(sidang.hadir_pelapor ?? true);
  const [hadirTerlapor, setHadirTerlapor] = useState<boolean>(sidang.hadir_terlapor ?? true);

  // Sync state when sidang changes
  useEffect(() => {
    if (sidang) {
      setKe(sidang.ke);
      setTanggal(sidang.tanggal);
      setJam(sidang.jam);
      setMode(sidang.mode);
      setLokasi(sidang.lokasi_atau_tautan);
      setStatus(sidang.status);
      setAlasanDitunda(sidang.alasan_ditunda || '');
      setCatatanSidang(sidang.catatan_sidang || '');
      setTautanSiaran(sidang.tautan_siaran || '');
      setHadirPelapor(sidang.hadir_pelapor ?? true);
      setHadirTerlapor(sidang.hadir_terlapor ?? true);

      if (AGENDA_PRESETS.includes(sidang.agenda)) {
        setAgenda(sidang.agenda);
        setIsCustomAgenda(false);
        setCustomAgenda('');
      } else {
        setIsCustomAgenda(true);
        setCustomAgenda(sidang.agenda);
      }
    }
  }, [sidang]);

  const youtubeVideoId = extractYouTubeId(tautanSiaran);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAgenda = isCustomAgenda ? customAgenda.trim() || 'Sidang Pemeriksaan' : agenda;

    const updated: JadwalSidang = {
      ...sidang,
      ke,
      tanggal,
      jam,
      agenda: finalAgenda,
      mode,
      lokasi_atau_tautan: lokasi.trim(),
      status,
      alasan_ditunda: status === 'Ditunda' ? alasanDitunda.trim() : undefined,
      catatan_sidang: catatanSidang.trim() || undefined,
      tautan_siaran: tautanSiaran.trim() || undefined,
      hadir_pelapor: hadirPelapor,
      hadir_terlapor: hadirTerlapor
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                  Kelola Jadwal & Siaran Sidang
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {perkara.nomor_register}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Edit Agenda Sidang ke-{ke}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {/* Status Sidang */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">
              Status Pelaksanaan Sidang:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Terjadwal')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'Terjadwal'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>📅 Terjadwal</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Sedang Berlangsung')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'Sedang Berlangsung'
                    ? 'bg-red-600 text-white border-red-700 shadow-xs ring-2 ring-red-400'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="animate-pulse">🔴 Sedang Live</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Ditunda')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'Ditunda'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>⚠️ Ditunda</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Terlaksana')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  status === 'Terlaksana'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>✅ Terlaksana</span>
              </button>
            </div>
          </div>

          {/* Bagian Khusus: Alasan Ditunda jika status adalah 'Ditunda' */}
          {status === 'Ditunda' && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Alasan / Keterangan Sidang Ditunda (Wajib Diisi):</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Alasan penundaan ini akan tampil transparan pada jadwal sidang untuk para pihak dan publik.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ALASAN_DITUNDA_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAlasanDitunda(preset)}
                    className="text-[10px] bg-white border border-amber-300 hover:border-amber-500 text-slate-800 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
              <textarea
                value={alasanDitunda}
                onChange={(e) => setAlasanDitunda(e.target.value)}
                placeholder="Tuliskan alasan penundaan sidang secara rinci..."
                rows={2}
                required
                className="w-full p-2.5 border border-amber-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Agenda Sidang */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Agenda Sidang:
            </label>
            {!isCustomAgenda ? (
              <div className="space-y-2">
                <select
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                >
                  {AGENDA_PRESETS.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustomAgenda(true)}
                  className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  + Tulis agenda kustom manual
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customAgenda}
                  onChange={(e) => setCustomAgenda(e.target.value)}
                  placeholder="Ketik agenda sidang khusus..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomAgenda(false)}
                  className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                >
                  ← Kembali ke pilihan standar
                </button>
              </div>
            )}
          </div>

          {/* Tanggal, Jam, dan Sidang Ke- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Sidang Ke-:
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={ke}
                onChange={(e) => setKe(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Tanggal Sidang:
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-mono font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Jam / Waktu Sidang:
              </label>
              <input
                type="text"
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                placeholder="cth: 09:00 WIB"
                required
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-medium"
              />
            </div>
          </div>

          {/* Mode & Lokasi Sidang */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Mode Persidangan:
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'Luring' | 'Daring')}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-medium cursor-pointer"
              >
                <option value="Luring">Luring (Tatap Muka di Kantor)</option>
                <option value="Daring">Daring (Online / Telekonferensi)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-800 block mb-1">
                Ruang Sidang / Lokasi / Tautan Daring:
              </label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="cth: Ruang Sidang Utama Bawaslu Banten atau Link Zoom"
                required
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs"
              />
            </div>
          </div>

          {/* Tautan Siaran Live Stream YouTube */}
          <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-red-950 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-600" />
                <span>Link Siaran Live Stream YouTube (Untuk Ditonton Masyarakat):</span>
              </label>
              {youtubeVideoId && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Valid YouTube Stream</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-red-900">
              Masukkan tautan siaran langsung YouTube Bawaslu (misal: <code>https://youtube.com/live/...</code> atau <code>https://www.youtube.com/watch?v=...</code>). Masyarakat dapat langsung menonton sidang dari aplikasi.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={tautanSiaran}
                onChange={(e) => setTautanSiaran(e.target.value)}
                placeholder="https://youtube.com/live/..."
                className="flex-1 p-2.5 border border-red-300 rounded-xl bg-white text-xs font-mono focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
              {tautanSiaran && (
                <button
                  type="button"
                  onClick={() => window.open(tautanSiaran, '_blank')}
                  className="px-3 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Uji Buka Tautan Siaran"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Cek</span>
                </button>
              )}
            </div>
          </div>

          {/* Catatan Sidang & Kehadiran */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Catatan Sidang / Keterangan Tambahan:
            </label>
            <textarea
              value={catatanSidang}
              onChange={(e) => setCatatanSidang(e.target.value)}
              placeholder="Catatan hasil verifikasi, kehadiran saksi, atau penyerahan bukti..."
              rows={2}
              className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Kehadiran Para Pihak */}
          <div className="flex flex-wrap items-center gap-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Kehadiran Para Pihak:</span>
            </span>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
              <input
                type="checkbox"
                checked={hadirPelapor}
                onChange={(e) => setHadirPelapor(e.target.checked)}
                className="rounded text-blue-600 cursor-pointer"
              />
              <span>Pelapor / Penemu Hadir</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
              <input
                type="checkbox"
                checked={hadirTerlapor}
                onChange={(e) => setHadirTerlapor(e.target.checked)}
                className="rounded text-blue-600 cursor-pointer"
              />
              <span>Terlapor Hadir</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Jadwal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
