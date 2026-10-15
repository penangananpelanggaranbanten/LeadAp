import React, { useState } from 'react';
import { X, GitPullRequestDraft, AlertTriangle, ShieldCheck, Save, Clock, Scale } from 'lucide-react';
import { Perkara, PermintaanKoreksi } from '../types/leadAp';
import { generateNomorRegister } from '../utils/businessLogic';

interface KoreksiModalProps {
  perkara: Perkara;
  onClose: () => void;
  onSaveKoreksi: (updatedPerkara: Perkara) => void;
}

export const KoreksiModal: React.FC<KoreksiModalProps> = ({
  perkara,
  onClose,
  onSaveKoreksi
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [pemohon, setPemohon] = useState<'Pelapor' | 'Terlapor' | 'Keduanya'>('Pelapor');
  const [namaPemohon, setNamaPemohon] = useState<string>(perkara.pelapor.nama);
  const [alasanKoreksi, setAlasanKoreksi] = useState<string>(
    'Majelis Bawaslu Provinsi dinilai keliru menerapkan ketentuan hukum mengenai pembuktian surat dan kewajiban pengunduran diri pada Pasal 240 UU Nomor 7 Tahun 2017.'
  );

  const previewNomorKS = `00${Math.floor(Math.random() * 80) + 10}/KS/${perkara.kode_jenis}/BWSL/00.00/${today.split('-')[1]}/${today.split('-')[0]}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newKoreksi: PermintaanKoreksi = {
      id: 'ks-' + Date.now(),
      perkara_id: perkara.id,
      nomor_KS: previewNomorKS,
      pemohon,
      nama_pemohon: namaPemohon,
      tgl_diajukan: today,
      tgl_register: today,
      alasan_koreksi: alasanKoreksi,
      status_penundaan_eksekusi: true // Pasal 54: Pelaksanaan putusan ditunda selama koreksi
    };

    const updated: Perkara = {
      ...perkara,
      status: 'S11', // Dalam Koreksi
      koreksi: newKoreksi,
      riwayat: [
        ...perkara.riwayat,
        {
          id: 'rw-ks-' + Date.now(),
          perkara_id: perkara.id,
          waktu: `${today} 11:00 WIB`,
          tahapan: 'Koreksi Bawaslu RI',
          proses: `Permintaan koreksi diajukan oleh ${namaPemohon}; diregistrasi dengan nomor ${previewNomorKS}. Pelaksanaan putusan ditunda sesuai Pasal 54.`,
          pengguna: 'Petugas Register Koreksi Bawaslu RI',
          peran: 'Bawaslu RI',
          dokumen_nama: 'ADM.BA-REG.KOREKSI'
        }
      ]
    };

    onSaveKoreksi(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-800 text-amber-300">
              <GitPullRequestDraft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>PENGAJUAN PERMINTAAN KOREKSI KE BAWASLU RI</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner: Penundaan Putusan */}
        <div className="bg-red-50 p-3.5 border-b border-red-200 text-xs text-red-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Pemberitahuan Akibat Hukum:</span>
            <span>
              Selama proses koreksi berjalan di Bawaslu RI, <strong>pelaksanaan putusan Bawaslu Provinsi/Kabupaten/Kota yang dikoreksi DITUNDA</strong>.
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Perkara yang Dikoreksi:</label>
            <div className="p-2.5 bg-slate-100 rounded-lg font-mono font-bold text-blue-900">
              {perkara.nomor_register} ({perkara.nama_wilayah})
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pihak Pemohon Koreksi:</label>
              <select
                value={pemohon}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setPemohon(val);
                  setNamaPemohon(val === 'Pelapor' ? perkara.pelapor.nama : perkara.terlapor.nama);
                }}
                className="w-full p-2 border rounded-lg bg-white font-semibold cursor-pointer"
              >
                <option value="Pelapor">Pelapor / Penemu</option>
                <option value="Terlapor">Terlapor</option>
                <option value="Keduanya">Keduanya</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Pemohon:</label>
              <input
                type="text"
                value={namaPemohon}
                onChange={(e) => setNamaPemohon(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Alasan Koreksi (Terbatas pada Kesalahan Penerapan Hukum):
            </label>
            <textarea
              value={alasanKoreksi}
              onChange={(e) => setAlasanKoreksi(e.target.value)}
              rows={4}
              placeholder="Jelaskan secara spesifik kekeliruan penerapan norma hukum atau pasal yang dilakukan oleh Majelis Bawaslu Provinsi/Kabupaten/Kota..."
              className="w-full p-3 border rounded-lg bg-white font-sans focus:ring-2 focus:ring-blue-500 leading-relaxed"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1 italic">
              * Koreksi tidak memeriksa ulang pembuktian fakta materiil, melainkan semata-mata menguji ketepatan penerapan hukum.
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 space-y-1">
            <span className="font-bold block text-[11px] uppercase tracking-wide">
              Jadwal Waktu Koreksi Bawaslu RI:
            </span>
            <ul className="list-disc list-inside text-[11px] space-y-0.5">
              <li>Pemberitahuan kepada pihak lawan: ≤ 1 HK setelah registrasi</li>
              <li>Jawaban pihak lawan: ≤ 2 HK setelah menerima pemberitahuan</li>
              <li>Pemeriksaan dokumen & Putusan Koreksi: ≤ 7 HK sejak registrasi</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-100 border-t flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md flex items-center gap-2 text-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Registrasi Permintaan Koreksi (Timer 7 HK)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
