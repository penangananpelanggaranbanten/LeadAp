import React, { useState } from 'react';
import { X, Save, Edit3, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Perkara, StatusPerkaraKode } from '../types/leadAp';
import { STATUS_PERKARA_MAP, TAHAPAN_PEMILU_LIST } from '../utils/businessLogic';

interface EditPerkaraModalProps {
  perkara: Perkara;
  onClose: () => void;
  onSave: (updated: Perkara) => void;
  onDelete: (perkaraId: string) => void;
}

export const EditPerkaraModal: React.FC<EditPerkaraModalProps> = ({
  perkara,
  onClose,
  onSave,
  onDelete
}) => {
  const [nomorRegister, setNomorRegister] = useState(perkara.nomor_register);
  const [tahapanPemilu, setTahapanPemilu] = useState(perkara.tahapan_pemilu);
  const [status, setStatus] = useState<StatusPerkaraKode>(perkara.status);
  const [modeSidang, setModeSidang] = useState<'Luring' | 'Daring'>(perkara.mode_sidang);
  const [alasanDaring, setAlasanDaring] = useState(perkara.alasan_daring || '');
  const [lamaProsesHK, setLamaProsesHK] = useState(perkara.lama_proses_hk);

  // Pelapor & Terlapor
  const [namaPelapor, setNamaPelapor] = useState(perkara.pelapor.nama);
  const [jenisPelapor, setJenisPelapor] = useState(perkara.pelapor.jenis);
  const [namaTerlapor, setNamaTerlapor] = useState(perkara.terlapor.nama);
  const [jenisTerlapor, setJenisTerlapor] = useState(perkara.terlapor.jenis);

  // Pokok perkara & petitum
  const [pokokLaporan, setPokokLaporan] = useState(perkara.pokok_laporan);
  const [halDimohonkan, setHalDimohonkan] = useState(perkara.hal_dimohonkan);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Perkara = {
      ...perkara,
      nomor_register: nomorRegister,
      tahapan_pemilu: tahapanPemilu,
      status: status,
      mode_sidang: modeSidang,
      alasan_daring: modeSidang === 'Daring' ? alasanDaring : undefined,
      lama_proses_hk: Number(lamaProsesHK),
      sisa_hk: Math.max(0, 14 - Number(lamaProsesHK)),
      pelapor: {
        ...perkara.pelapor,
        nama: namaPelapor,
        jenis: jenisPelapor as any
      },
      terlapor: {
        ...perkara.terlapor,
        nama: namaTerlapor,
        jenis: jenisTerlapor as any
      },
      pokok_laporan: pokokLaporan,
      hal_dimohonkan: halDimohonkan,
      riwayat: [
        ...perkara.riwayat,
        {
          id: 'rw-edit-' + Date.now(),
          perkara_id: perkara.id,
          waktu: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
          tahapan: 'Pembaruan Data Perkara',
          proses: `Data perkara diperbarui oleh Administrator sistem (Status: ${status}).`,
          pengguna: 'Administrator',
          peran: 'Admin'
        }
      ]
    };
    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    const confirm = window.confirm(
      `Peringatan: Apakah Anda yakin ingin MENGHAPUS perkara "${perkara.nomor_register}" beserta seluruh data jadwal, bukti, dan risalahnya? Tindakan ini tidak dapat dibatalkan.`
    );
    if (confirm) {
      onDelete(perkara.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white flex items-center justify-between border-b border-red-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-800 text-amber-300">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>EDIT DATA PERKARA SIDANG ADMINISTRATIF</span>
                <span className="text-[10px] bg-red-900 border border-red-700 text-amber-300 px-2 py-0.5 rounded font-mono">
                  Mode Admin
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {perkara.nomor_register}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Nomor Register (ADM.NRL):</label>
              <input
                type="text"
                value={nomorRegister}
                onChange={(e) => setNomorRegister(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white font-mono font-bold text-blue-900"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Status Perkara:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusPerkaraKode)}
                className="w-full p-2 border rounded-lg bg-white font-semibold text-slate-800 cursor-pointer"
              >
                {Object.entries(STATUS_PERKARA_MAP).map(([code, meta]) => (
                  <option key={code} value={code}>
                    {meta.kode} - {meta.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Tahapan Pemilu:</label>
              <select
                value={tahapanPemilu}
                onChange={(e) => setTahapanPemilu(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white cursor-pointer"
              >
                {TAHAPAN_PEMILU_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hari Kerja Berjalan (x/14 HK):</label>
              <input
                type="number"
                min="0"
                max="14"
                value={lamaProsesHK}
                onChange={(e) => setLamaProsesHK(Number(e.target.value))}
                className="w-full p-2 border rounded-lg bg-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mode Sidang:</label>
              <select
                value={modeSidang}
                onChange={(e) => setModeSidang(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white font-semibold cursor-pointer"
              >
                <option value="Luring">Sidang Luring (Tatap Muka)</option>
                <option value="Daring">Sidang Daring (Online)</option>
              </select>
            </div>
            {modeSidang === 'Daring' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Sidang Daring:</label>
                <input
                  type="text"
                  value={alasanDaring}
                  onChange={(e) => setAlasanDaring(e.target.value)}
                  placeholder="Geografis / Keamanan / Sarana"
                  className="w-full p-2 border rounded-lg bg-white"
                />
              </div>
            )}
          </div>

          {/* Para Pihak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block uppercase tracking-wider">
                Pelapor / Penemu:
              </span>
              <div>
                <label className="text-slate-600 block mb-1">Nama Pelapor:</label>
                <input
                  type="text"
                  value={namaPelapor}
                  onChange={(e) => setNamaPelapor(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Jenis Pihak:</label>
                <select
                  value={jenisPelapor}
                  onChange={(e) => setJenisPelapor(e.target.value as any)}
                  className="w-full p-2 border rounded-lg bg-white cursor-pointer"
                >
                  <option value="Perorangan">Perorangan (WNI)</option>
                  <option value="Peserta Pemilu">Peserta Pemilu</option>
                  <option value="Pemantau Pemilu">Pemantau Pemilu</option>
                  <option value="Bawaslu Bawahan">Bawaslu Bawahan (Penemu)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block uppercase tracking-wider">
                Terlapor:
              </span>
              <div>
                <label className="text-slate-600 block mb-1">Nama Terlapor:</label>
                <input
                  type="text"
                  value={namaTerlapor}
                  onChange={(e) => setNamaTerlapor(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Jenis Terlapor:</label>
                <select
                  value={jenisTerlapor}
                  onChange={(e) => setJenisTerlapor(e.target.value as any)}
                  className="w-full p-2 border rounded-lg bg-white cursor-pointer"
                >
                  <option value="Penyelenggara Pemilu (KPU)">KPU / PPK / KPPS</option>
                  <option value="Partai Politik">Partai Politik</option>
                  <option value="Calon Anggota DPR/DPD/DPRD">Calon Anggota DPR/DPD/DPRD</option>
                  <option value="Pasangan Calon">Pasangan Calon</option>
                  <option value="Tim Kampanye">Tim Kampanye</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Pokok Laporan / Temuan:</label>
            <textarea
              value={pokokLaporan}
              onChange={(e) => setPokokLaporan(e.target.value)}
              rows={3}
              className="w-full p-2.5 border rounded-lg bg-white font-sans focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Hal yang Dimohonkan (Petitum):</label>
            <textarea
              value={halDimohonkan}
              onChange={(e) => setHalDimohonkan(e.target.value)}
              rows={2}
              className="w-full p-2.5 border rounded-lg bg-white font-sans focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-950 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Penyimpanan Google Drive:</span>
              <strong className="text-blue-900 font-mono">penangananpelanggaranbanten@gmail.com</strong>
            </span>
            <span className="text-slate-500 text-[10px]">Perubahan data perkara otomatis tersinkronisasi</span>
          </div>

          {/* Action Row */}
          <div className="p-4 bg-slate-100 border-t flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm text-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Perkara</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
