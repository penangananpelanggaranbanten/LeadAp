import React, { useState } from 'react';
import { X, Zap, ShieldAlert, CheckCircle2, Smartphone, Save, FileText, MapPin } from 'lucide-react';
import { Perkara } from '../types/leadAp';
import { generateNomorRegister } from '../utils/businessLogic';

interface AcaraCepatModalProps {
  onClose: () => void;
  onSaveAcaraCepat: (newPerkara: Perkara) => void;
}

export const AcaraCepatModal: React.FC<AcaraCepatModalProps> = ({
  onClose,
  onSaveAcaraCepat
}) => {
  const today = new Date().toISOString().split('T')[0];
  const [sumber, setSumber] = useState<'TM.AC' | 'LP.AC'>('TM.AC');
  const [namaPengawas, setNamaPengawas] = useState<string>('Iqbal Pratama, S.H. (Pengawas Lapangan)');
  const [lokasiKejadian, setLokasiKejadian] = useState<string>('Arena Kampanye Rapat Umum Alun-Alun / TPS 04');
  const [namaTerlapor, setNamaTerlapor] = useState<string>('Tim Kampanye Pasangan Calon A');
  const [uraianPeristiwa, setUraianPeristiwa] = useState<string>(
    'Ditemukan pembagian uang saku / bahan kampanye di luar ketentuan pada saat kampanye rapat umum berlangsung.'
  );
  const [keteranganTerlapor, setKeteranganTerlapor] = useState<string>(
    'Terlapor mengaku hal tersebut merupakan uang transportasi resmi saksi yang terdata.'
  );
  const [analisaHukum, setAnalisaHukum] = useState<string>(
    'Tindakan tersebut melanggar ketentuan tata cara pelaksanaan kampanye rapat umum sesuai Pasal 280 UU 7/2017 dan PKPU terkait.'
  );
  const [amarPutusan, setAmarPutusan] = useState<'Terbukti' | 'Tidak Terbukti'>('Terbukti');
  const [sanksiPutusan, setSanksiPutusan] = useState<string>(
    '1. Hentikan pembagian bahan yang dilarang saat itu juga.\n2. Memberikan teguran tertulis di tempat kejadian.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedRegister = generateNomorRegister({
      nomorUrut: Math.floor(Math.random() * 80) + 10,
      sumber: sumber,
      kodeJenis: 'ADM.PL',
      tingkatan: 'BWSL.KAB',
      kodeWilayah: '11.08',
      tanggal: new Date()
    });

    const newCase: Perkara = {
      id: 'perkara-ac-' + Date.now(),
      nomor_register: generatedRegister,
      jalur: 'acara_cepat',
      sumber: sumber === 'TM.AC' ? 'TM' : 'LP',
      kode_jenis: 'ADM.PL',
      tingkatan: 'BWSL.KAB',
      kode_wilayah: '11.08',
      nama_wilayah: 'Bawaslu Kabupaten Tangerang',
      tahapan_pemilu: 'Masa Kampanye Pemilu',
      tgl_peristiwa: today,
      tgl_registrasi: today,
      batas_putusan: today, // Putus di hari yang sama (Pasal 42 ayat 1)
      lama_proses_hk: 0,
      sisa_hk: 0,
      status: 'S14', // Langsung selesai/minutasi karena final di hari yang sama
      mode_sidang: 'Luring',
      pokok_laporan: uraianPeristiwa,
      hal_dimohonkan: 'Penertiban seketika acara cepat lapangan.',
      pelapor: {
        id: 'p-ac-' + Date.now(),
        perkara_id: 'perkara-ac-' + Date.now(),
        peran: sumber === 'TM.AC' ? 'Penemu' : 'Pelapor',
        jenis: 'Bawaslu Bawahan',
        nama: namaPengawas
      },
      terlapor: {
        id: 't-ac-' + Date.now(),
        perkara_id: 'perkara-ac-' + Date.now(),
        peran: 'Terlapor',
        jenis: 'Tim Kampanye',
        nama: namaTerlapor
      },
      alat_bukti: [
        {
          id: 'ab-ac-' + Date.now(),
          perkara_id: 'perkara-ac-' + Date.now(),
          kode: 'P-1',
          pengaju: 'Pelapor',
          bentuk: 'Surat',
          asli_salinan: 'Asli',
          uraian: 'Foto dokumentasi kejadian di lokasi dan catatan pengawasan langsung.',
          tgl_disahkan: today,
          disahkan_oleh: namaPengawas
        }
      ],
      keterangan: [],
      dokumen: [
        {
          id: 'dok-ac-' + Date.now(),
          perkara_id: 'perkara-ac-' + Date.now(),
          kode_formulir: 'ADM.ACARA CEPAT',
          nama_formulir: 'Putusan Pemeriksaan Acara Cepat',
          nomor: generatedRegister,
          tanggal: today,
          penanda_tangan: namaPengawas,
          status_publikasi: 'Publik'
        }
      ],
      putusan: {
        perkara_id: 'perkara-ac-' + Date.now(),
        nomor_putusan: generatedRegister,
        tgl_pleno: today,
        tgl_dibacakan: today,
        amar: amarPutusan,
        amar_ringkas: `Pemeriksaan Acara Cepat: ${amarPutusan.toUpperCase()}`,
        amar_lengkap: sanksiPutusan,
        sanksi: ['Teguran Tertulis di Tempat', 'Tindakan Seketika Lapangan'],
        tgl_salinan: today,
        tgl_publikasi: today
      },
      jadwal_sidang: [],
      riwayat: [
        {
          id: 'rw-ac-1',
          perkara_id: 'perkara-ac-' + Date.now(),
          waktu: `${today} 14:00 WIB`,
          tahapan: 'Acara Cepat',
          proses: `Peristiwa dilaporkan/ditemukan langsung di lokasi. Formulir ADM.ACARA CEPAT diisi dan diputus di hari yang sama (Pasal 40-43).`,
          pengguna: namaPengawas,
          peran: 'Pengawas Lapangan',
          dokumen_nama: 'ADM.ACARA CEPAT'
        }
      ]
    };

    onSaveAcaraCepat(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-slate-950 flex items-center justify-between border-b border-amber-900">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-950 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span>FORMULIR SATU LAYAR ACARA CEPAT (ADM.ACARA CEPAT)</span>
              </h2>
              <p className="text-xs font-semibold text-slate-900">
                Pemeriksaan & Putusan Seketika di Tempat Kejadian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-900 hover:text-white hover:bg-slate-950/20 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 px-4 py-2 text-xs text-amber-950 border-b border-amber-200 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Dirancang responsif untuk pengisian seluler oleh Pengawas di tempat kejadian (Kampanye, Rekapitulasi, TPS LN). Putus di hari yang sama!
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sumber Acara Cepat:</label>
              <select
                value={sumber}
                onChange={(e) => setSumber(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white font-semibold"
              >
                <option value="TM.AC">Temuan Pengawas Lapangan (TM.AC)</option>
                <option value="LP.AC">Laporan Masyarakat Seketika (LP.AC)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tanggal & Waktu:</label>
              <input
                type="text"
                value={`${today} (Hari yang sama)`}
                disabled
                className="w-full p-2 border rounded-lg bg-slate-100 font-mono font-bold text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Petugas Pengawas di Lokasi:</label>
            <input
              type="text"
              value={namaPengawas}
              onChange={(e) => setNamaPengawas(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Lokasi Tempat Kejadian:</label>
              <input
                type="text"
                value={lokasiKejadian}
                onChange={(e) => setLokasiKejadian(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Terlapor / Pihak Bersangkutan:</label>
              <input
                type="text"
                value={namaTerlapor}
                onChange={(e) => setNamaTerlapor(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Uraian Peristiwa & Fakta di Lapangan:</label>
            <textarea
              value={uraianPeristiwa}
              onChange={(e) => setUraianPeristiwa(e.target.value)}
              rows={3}
              className="w-full p-2.5 border rounded-lg font-sans bg-white focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Keterangan Pihak Terlapor di Tempat:</label>
            <textarea
              value={keteranganTerlapor}
              onChange={(e) => setKeteranganTerlapor(e.target.value)}
              rows={2}
              className="w-full p-2.5 border rounded-lg font-sans bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Analisa Hukum Cepat Pengawas:</label>
            <textarea
              value={analisaHukum}
              onChange={(e) => setAnalisaHukum(e.target.value)}
              rows={2}
              className="w-full p-2.5 border rounded-lg font-sans bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Amar Putusan Acara Cepat */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
              Amar Putusan Acara Cepat:
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                <input
                  type="radio"
                  name="amarAcaraCepat"
                  checked={amarPutusan === 'Terbukti'}
                  onChange={() => setAmarPutusan('Terbukti')}
                  className="w-4 h-4 text-red-600"
                />
                <span>TERBUKTI MELANGGAR</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                <input
                  type="radio"
                  name="amarAcaraCepat"
                  checked={amarPutusan === 'Tidak Terbukti'}
                  onChange={() => setAmarPutusan('Tidak Terbukti')}
                  className="w-4 h-4 text-slate-600"
                />
                <span>TIDAK TERBUKTI</span>
              </label>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tindakan / Sanksi Putusan Seketika:</label>
              <textarea
                value={sanksiPutusan}
                onChange={(e) => setSanksiPutusan(e.target.value)}
                rows={2}
                className="w-full p-2 border rounded-lg bg-white"
              />
            </div>
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold rounded-lg shadow-md flex items-center gap-2 text-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Kunci & Terbitkan Putusan Acara Cepat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
