import React, { useState } from 'react';
import { 
  X, 
  Gavel, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  FileText, 
  ShieldAlert, 
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { Perkara, JadwalSidang, AlatBukti, KeteranganSaksiAhli } from '../types/leadAp';

interface AlurSidangSimulatorProps {
  perkara: Perkara;
  onClose: () => void;
  onSaveSidangResult: (updatedPerkara: Perkara, logSummary: string) => void;
  onOpenAiAnalyst: (perkara: Perkara) => void;
}

export const AlurSidangSimulator: React.FC<AlurSidangSimulatorProps> = ({
  perkara,
  onClose,
  onSaveSidangResult,
  onOpenAiAnalyst
}) => {
  // Step persidangan: 1. Presensi -> 2. Pembacaan/Perbaikan -> 3. Jawaban -> 4. Pembuktian & Sumpah -> 5. Kesimpulan -> 6. Putusan Pleno
  const [step, setStep] = useState<number>(1);
  const [soundFeedback, setSoundFeedback] = useState<string | null>(null);

  // Kehadiran Para Pihak (Pasal 20)
  const [hadirPelapor, setHadirPelapor] = useState<boolean>(true);
  const [hadirTerlapor, setHadirTerlapor] = useState<boolean>(true);
  const [jumlahPanggilan, setJumlahPanggilan] = useState<number>(1);

  // Perbaikan materi laporan (Pasal 21: Maks 1x sebelum jawaban)
  const [hasPerbaikanMateri, setHasPerbaikanMateri] = useState<boolean>(false);
  const [perbaikanText, setPerbaikanText] = useState<string>('');

  // Jawaban Terlapor
  const [jawabanTerlaporText, setJawabanTerlaporText] = useState<string>(
    'Menolak seluruh dalil Pelapor karena Terlapor telah bertindak sesuai Juknis KPU No. 12/2028.'
  );

  // Bukti yang disahkan saat sidang
  const [alatBuktiList, setAlatBuktiList] = useState<AlatBukti[]>(perkara.alat_bukti || []);
  const [newBuktiKode, setNewBuktiKode] = useState<string>('P-' + ((perkara.alat_bukti?.length || 0) + 1));
  const [newBuktiUraian, setNewBuktiUraian] = useState<string>('');
  const [newBuktiPengaju, setNewBuktiPengaju] = useState<'Pelapor' | 'Terlapor'>('Pelapor');
  const [newBuktiBentuk, setNewBuktiBentuk] = useState<'Surat' | 'Dokumen Elektronik' | 'Media Simpan / Flashdisk'>('Surat');
  const [newBuktiKeaslian, setNewBuktiKeaslian] = useState<'Asli' | 'Salinan Legalisir'>('Asli');

  // Saksi/Ahli
  const [saksiList, setSaksiList] = useState<KeteranganSaksiAhli[]>(perkara.keterangan || []);
  const [newSaksiNama, setNewSaksiNama] = useState<string>('');
  const [newSaksiJenis, setNewSaksiJenis] = useState<'Saksi' | 'Ahli'>('Saksi');
  const [newSaksiPengaju, setNewSaksiPengaju] = useState<'Pelapor' | 'Terlapor'>('Pelapor');
  const [newSaksiSumpah, setNewSaksiSumpah] = useState<boolean>(true);
  const [newSaksiKeterangan, setNewSaksiKeterangan] = useState<string>('');

  // Putusan
  const [amarPutusan, setAmarPutusan] = useState<'Terbukti' | 'Tidak Terbukti'>('Terbukti');
  const [amarPertimbangan, setAmarPertimbangan] = useState<string>(
    'Menimbang bahwa berdasarkan bukti surat P-1 dan P-2 serta saksi di bawah sumpah, terbukti secara sah Terlapor melanggar tata cara administrasi.'
  );
  const [sanksiTerpilih, setSanksiTerpilih] = useState<string[]>([
    'Teguran Tertulis',
    'Perbaikan Tata Cara Administrasi'
  ]);

  // Audio Playback or Visual Hammer Strike Feedback
  const triggerKetukPalu = (times: number, reason: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      for (let i = 0; i < times; i++) {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
          gain.gain.setValueAtTime(1, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.2);
        }, i * 280);
      }
    } catch (e) {
      // Audio fallback
    }
    setSoundFeedback(`Ketuk Palu ${times}x: ${reason}`);
    setTimeout(() => setSoundFeedback(null), 3500);
  };

  const handleSahkanBukti = (id: string) => {
    triggerKetukPalu(1, 'Bukti Resmi Disahkan oleh Majelis');
    const today = new Date().toISOString().split('T')[0];
    setAlatBuktiList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, tgl_disahkan: today, disahkan_oleh: 'Ketua Majelis' } : b))
    );
  };

  const handleTambahBukti = () => {
    if (!newBuktiUraian) return;
    const today = new Date().toISOString().split('T')[0];
    const newB: AlatBukti = {
      id: 'ab-new-' + Date.now(),
      perkara_id: perkara.id,
      kode: newBuktiKode,
      pengaju: newBuktiPengaju,
      bentuk: newBuktiBentuk,
      asli_salinan: newBuktiKeaslian,
      uraian: newBuktiUraian,
      tgl_disahkan: today,
      disahkan_oleh: 'Ketua Majelis'
    };
    triggerKetukPalu(1, `Pengesahan Alat Bukti ${newBuktiKode}`);
    setAlatBuktiList((prev) => [...prev, newB]);
    setNewBuktiUraian('');
    setNewBuktiKode(newBuktiPengaju === 'Pelapor' ? 'P-' + (alatBuktiList.length + 2) : 'T-' + (alatBuktiList.length + 2));
  };

  const handleTambahSaksi = () => {
    if (!newSaksiNama) return;
    const newS: KeteranganSaksiAhli = {
      id: 'sak-new-' + Date.now(),
      perkara_id: perkara.id,
      jenis: newSaksiJenis,
      nama: newSaksiNama,
      pengaju: newSaksiPengaju,
      sumpah: newSaksiSumpah,
      ringkasan: newSaksiKeterangan || 'Memberikan keterangan atas fakta kejadian.'
    };
    setSaksiList((prev) => [...prev, newS]);
    setNewSaksiNama('');
    setNewSaksiKeterangan('');
  };

  const handleSelesaikanSidang = () => {
    triggerKetukPalu(3, 'Sidang Pembacaan Putusan Selesai dan Ditutup');
    const today = new Date().toISOString().split('T')[0];
    const updated: Perkara = {
      ...perkara,
      alat_bukti: alatBuktiList,
      keterangan: saksiList,
      status: 'S09', // Putusan Dibacakan
      putusan: {
        perkara_id: perkara.id,
        nomor_putusan: perkara.nomor_register,
        tgl_pleno: today,
        tgl_dibacakan: today,
        amar: amarPutusan,
        amar_ringkas: `Menyatakan Terlapor ${amarPutusan.toLowerCase()} melakukan pelanggaran administratif Pemilu.`,
        amar_lengkap: `1. Menyatakan Terlapor ${amarPutusan.toUpperCase()} melakukan pelanggaran administratif Pemilu.\n2. Memberikan sanksi berupa: ${sanksiTerpilih.join(', ')}.\n3. Memerintahkan KPU / pihak terkait melaksanakan putusan paling lambat 3 HK sejak dibacakan.`,
        sanksi: sanksiTerpilih,
        tgl_salinan: today,
        tgl_publikasi: today
      },
      riwayat: [
        ...perkara.riwayat,
        {
          id: 'rw-' + Date.now(),
          perkara_id: perkara.id,
          waktu: `${today} 15:00 WIB`,
          tahapan: 'Sidang Putusan',
          proses: `Sidang pemeriksaan lengkap selesai. Pembacaan putusan terbuka dengan amar ${amarPutusan.toUpperCase()}.`,
          pengguna: 'Drs. H. Didih M. Sudi, M.Si',
          peran: 'Ketua Majelis',
          dokumen_nama: 'ADM.PUTUSAN & ADM.BA-SP'
        }
      ]
    };
    onSaveSidangResult(updated, `Persidangan perkara ${perkara.nomor_register} selesai. Putusan ${amarPutusan} dibacakan.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal Ruang Sidang */}
        <div className="p-4 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white flex items-center justify-between border-b border-red-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-800/80 text-amber-300">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>RUANG SIDANG PEMERIKSAAN ADMINISTRATIF</span>
                <span className="text-xs font-normal text-amber-400 bg-red-900/60 px-2 py-0.5 rounded border border-red-700">
                  Perbawaslu 8/2022
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Perkara: {perkara.nomor_register} | {perkara.nama_wilayah}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerKetukPalu(1, 'Ketuk Palu Pembuka / Skorsing')}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
              title="Ketuk Palu 1x (Pembukaan agenda, skorsing, pengesahan bukti)"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Ketuk Palu 1x</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hammer Audio Notification Banner */}
        {soundFeedback && (
          <div className="bg-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2 flex items-center justify-between animate-pulse shadow-inner">
            <div className="flex items-center gap-2">
              <Gavel className="w-4 h-4" />
              <span>{soundFeedback}</span>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider">RESMI TERCATAT</span>
          </div>
        )}

        {/* Progress Step Bar */}
        <div className="bg-slate-100 p-2.5 border-b border-slate-200 flex items-center justify-between text-xs overflow-x-auto no-scrollbar gap-2">
          {[
            { s: 1, label: '1. Presensi & Panggilan (Ps. 20)' },
            { s: 2, label: '2. Pembacaan & Perbaikan (Ps. 21)' },
            { s: 3, label: '3. Jawaban Terlapor (Ps. 22)' },
            { s: 4, label: '4. Pembuktian & Sumpah (Ps. 23-33)' },
            { s: 5, label: '5. Musyawarah & Putusan Pleno' }
          ].map((item) => (
            <button
              key={item.s}
              onClick={() => setStep(item.s)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                step === item.s
                  ? 'bg-red-800 text-white shadow-xs'
                  : step > item.s
                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* STEP 1: Presensi & Konsekuensi Kehadiran (Pasal 20) */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-950 block text-sm">
                  Pemeriksaan Kehadiran Para Pihak
                </span>
                <p className="text-amber-900 leading-relaxed">
                  Ketua Majelis membuka sidang (ketuk palu 3x), memeriksa identitas para pihak, dan surat kuasa khusus.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Kehadiran Pelapor / Penemu</span>
                    <input
                      type="checkbox"
                      checked={hadirPelapor}
                      onChange={(e) => setHadirPelapor(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-slate-600">
                    Nama: <span className="font-semibold text-slate-800">{perkara.pelapor.nama}</span>
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                    hadirPelapor ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {hadirPelapor ? 'Hadir di Ruang Sidang' : 'Tidak Hadir (Absen)'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Kehadiran Terlapor</span>
                    <input
                      type="checkbox"
                      checked={hadirTerlapor}
                      onChange={(e) => setHadirTerlapor(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-amber-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-slate-600">
                    Nama: <span className="font-semibold text-slate-800">{perkara.terlapor.nama}</span>
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                    hadirTerlapor ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {hadirTerlapor ? 'Hadir di Ruang Sidang' : 'Tidak Hadir (Absen)'}
                  </span>
                </div>
              </div>

              {/* Konsekuensi Pasal 20 */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 border-l-4 border-amber-500">
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wide block">
                  Konsekuensi Hukum Kehadiran Para Pihak:
                </span>
                {!hadirPelapor && hadirTerlapor && (
                  <p className="text-slate-200">
                    * Pelapor tidak hadir: Sidang tetap dilanjutkan dengan agenda pembacaan Jawaban Terlapor.
                  </p>
                )}
                {hadirPelapor && !hadirTerlapor && (
                  <p className="text-slate-200">
                    * Terlapor tidak hadir (Panggilan ke-{jumlahPanggilan}): Jika Terlapor tetap tidak hadir setelah 2x panggilan yang sah, sidang dilanjutkan tanpa kehadiran Terlapor.
                  </p>
                )}
                {!hadirPelapor && !hadirTerlapor && (
                  <p className="text-red-300 font-bold">
                    * Kedua pihak tidak hadir setelah 2x panggilan sah: Majelis langsung mengagendakan Pembacaan Putusan.
                  </p>
                )}
                {hadirPelapor && hadirTerlapor && (
                  <p className="text-emerald-300 font-semibold">
                    * Kedua pihak hadir lengkap: Sidang dibuka dan berlanjut ke Agenda 1 (Pembacaan Laporan/Temuan).
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Pembacaan & Perbaikan Materi (Pasal 21) */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-950 block text-sm">
                  Agenda 1: Pembacaan Laporan/Temuan & Perbaikan Materi
                </span>
                <p className="text-blue-900 leading-relaxed">
                  Pelapor/Penemu membacakan materi laporan. Perbaikan materi pokok hanya diperbolehkan paling banyak 1 (satu) kali sebelum jawaban Terlapor.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block">Materi Laporan Awal:</span>
                <p className="p-3 bg-slate-50 rounded border text-slate-800 font-sans leading-relaxed">
                  {perkara.pokok_laporan}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkPerbaikan"
                    checked={hasPerbaikanMateri}
                    onChange={(e) => setHasPerbaikanMateri(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                  <label htmlFor="chkPerbaikan" className="font-bold text-slate-800 cursor-pointer">
                    Pelapor mengajukan perbaikan materi laporan (Maks. 1 kali)
                  </label>
                </div>

                {hasPerbaikanMateri && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-slate-600 font-medium">Uraian Tambahan / Perbaikan Materi:</span>
                    <textarea
                      value={perbaikanText}
                      onChange={(e) => setPerbaikanText(e.target.value)}
                      placeholder="Masukkan perbaikan materi atau rincian tambahan..."
                      rows={3}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-sans focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Jawaban Terlapor (Pasal 22) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                <span className="font-bold text-teal-950 block text-sm">
                  Agenda 2: Jawaban Terlapor (Formulir ADM.JAWABAN)
                </span>
                <p className="text-teal-900 leading-relaxed">
                  Terlapor membacakan dan menyerahkan jawaban tertulis dalam 3 (tiga) rangkap fisik beserta softcopy.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700">Teks Pokok Jawaban Terlapor:</span>
                <textarea
                  value={jawabanTerlaporText}
                  onChange={(e) => setJawabanTerlaporText(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs font-sans focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-700">
                <span className="font-medium">
                  Salinan Fisik 3 Rangkap: <span className="font-bold text-emerald-700">Lengkap Terverifikasi</span>
                </span>
                <button
                  onClick={() => triggerKetukPalu(1, 'Penerimaan Jawaban Terlapor (ADM.JAWABAN)')}
                  className="bg-teal-700 hover:bg-teal-600 text-white font-bold px-3 py-1 rounded shadow-sm cursor-pointer"
                >
                  Ketuk Palu Terima Jawaban
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Pembuktian & Sumpah (Pasal 23-33) */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-950 block text-sm">
                  Agenda 3: Pemeriksaan Alat Bukti & Saksi/Ahli
                </span>
                <p className="text-amber-900 leading-relaxed">
                  Pengesahan alat bukti (P-n dan T-n) diverifikasi terhadap aslinya dan disahkan dengan ketuk palu 1x.
                  Saksi dan Ahli wajib diambil sumpah/janji (ADM.BA-SUMPAH) sebelum memberikan keterangan.
                </p>
              </div>

              {/* Box Tambah / Sahkan Bukti */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs block uppercase tracking-wide">
                  Pengesahan Alat Bukti di Persidangan:
                </span>
                <div className="space-y-2">
                  {alatBuktiList.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-mono font-bold text-blue-900 mr-2">[{b.kode}]</span>
                        <span className="font-semibold text-slate-800 mr-1">{b.pengaju}:</span>
                        <span className="text-slate-700">{b.uraian}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Bentuk: {b.bentuk} | Status: {b.asli_salinan}
                        </span>
                      </div>
                      <div>
                        {b.tgl_disahkan ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                            Disahkan
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSahkanBukti(b.id)}
                            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded text-xs shadow-xs cursor-pointer"
                          >
                            Sahkan (Ketuk Palu)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form Input Tambah Bukti Cepat */}
                <div className="pt-2 border-t flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={newBuktiKode}
                    onChange={(e) => setNewBuktiKode(e.target.value)}
                    placeholder="Kode (P-n/T-n)"
                    className="w-20 p-1.5 border rounded text-xs bg-white font-mono"
                  />
                  <select
                    value={newBuktiPengaju}
                    onChange={(e) => setNewBuktiPengaju(e.target.value as any)}
                    className="p-1.5 border rounded text-xs bg-white cursor-pointer"
                  >
                    <option value="Pelapor">Pelapor</option>
                    <option value="Terlapor">Terlapor</option>
                  </select>
                  <input
                    type="text"
                    value={newBuktiUraian}
                    onChange={(e) => setNewBuktiUraian(e.target.value)}
                    placeholder="Uraian nama / dokumen bukti..."
                    className="flex-1 min-w-[200px] p-1.5 border rounded text-xs bg-white"
                  />
                  <button
                    onClick={handleTambahBukti}
                    className="bg-blue-700 hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded text-xs cursor-pointer"
                  >
                    + Tambah & Sahkan
                  </button>
                </div>
              </div>

              {/* Box Saksi & Sumpah */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs block uppercase tracking-wide">
                  Pemeriksaan Saksi / Ahli di Bawah Sumpah:
                </span>
                <div className="space-y-2">
                  {saksiList.map((s) => (
                    <div key={s.id} className="p-2.5 bg-white rounded-lg border flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 mr-2">[{s.jenis}] {s.nama}</span>
                        <span className="text-slate-500 text-[11px]">(Pengaju: {s.pengaju})</span>
                        <p className="text-slate-700 mt-0.5">{s.ringkasan}</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        ADM.BA-SUMPAH
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t flex flex-wrap items-center gap-2">
                  <select
                    value={newSaksiJenis}
                    onChange={(e) => setNewSaksiJenis(e.target.value as any)}
                    className="p-1.5 border rounded text-xs bg-white font-semibold cursor-pointer"
                  >
                    <option value="Saksi">Saksi</option>
                    <option value="Ahli">Ahli</option>
                  </select>
                  <input
                    type="text"
                    value={newSaksiNama}
                    onChange={(e) => setNewSaksiNama(e.target.value)}
                    placeholder="Nama saksi / ahli..."
                    className="w-44 p-1.5 border rounded text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={newSaksiKeterangan}
                    onChange={(e) => setNewSaksiKeterangan(e.target.value)}
                    placeholder="Ringkasan fakta yang diterangkan..."
                    className="flex-1 min-w-[200px] p-1.5 border rounded text-xs bg-white"
                  />
                  <button
                    onClick={handleTambahSaksi}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded text-xs cursor-pointer"
                  >
                    + Sumpah & Periksa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Musyawarah & Putusan Pleno */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                <span className="font-bold text-purple-950 block text-sm">
                  Rapat Pleno Majelis & Pembacaan Putusan Terbuka
                </span>
                <p className="text-purple-900 leading-relaxed">
                  Majelis Pemeriksa bermusyawarah secara tertutup untuk mengambil putusan berdasarkan sekurang-kurangnya 2 (dua) alat bukti yang sah.
                </p>
              </div>

              {/* Status Validasi Bukti Sah */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  Total Alat Bukti Disahkan: <span className="font-bold text-slate-900">{alatBuktiList.filter(b => b.tgl_disahkan).length} Bukti</span>
                </span>
                {alatBuktiList.filter(b => b.tgl_disahkan).length >= 2 ? (
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Syarat Minimal 2 Alat Bukti Sah Terpenuhi</span>
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Kurang dari 2 alat bukti yang disahkan!</span>
                  </span>
                )}
              </div>

              {/* Pilihan Amar */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">Pilihan Amar Putusan:</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAmarPutusan('Terbukti')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                      amarPutusan === 'Terbukti'
                        ? 'bg-red-700 text-white border-red-800 shadow-md ring-2 ring-red-400'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Gavel className="w-4 h-4" />
                    <span>TERBUKTI MELANGGAR</span>
                  </button>
                  <button
                    onClick={() => setAmarPutusan('Tidak Terbukti')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                      amarPutusan === 'Tidak Terbukti'
                        ? 'bg-slate-800 text-white border-slate-900 shadow-md ring-2 ring-slate-400'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>TIDAK TERBUKTI</span>
                  </button>
                </div>
              </div>

              {/* Pertimbangan Hukum */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700">Pertimbangan Hukum (Ratio Decidendi):</span>
                <textarea
                  value={amarPertimbangan}
                  onChange={(e) => setAmarPertimbangan(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border rounded-lg text-xs font-sans bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Pilihan Sanksi */}
              {amarPutusan === 'Terbukti' && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Sanksi Administratif yang Dijatuhkan:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      'Teguran Tertulis',
                      'Perbaikan Tata Cara Administrasi',
                      'Tidak Diikutkan dalam Tahapan Pemilu',
                      'Pembatalan Calon / Paslon (Khusus TSM)'
                    ].map((sanksi) => {
                      const selected = sanksiTerpilih.includes(sanksi);
                      return (
                        <div
                          key={sanksi}
                          onClick={() => {
                            setSanksiTerpilih((prev) =>
                              selected ? prev.filter((s) => s !== sanksi) : [...prev, sanksi]
                            );
                          }}
                          className={`p-2 rounded-lg border cursor-pointer font-medium flex items-center justify-between ${
                            selected
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{sanksi}</span>
                          <input type="checkbox" checked={selected} readOnly className="rounded text-amber-600" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Kembali
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAiAnalyst(perkara)}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Minta rekomendasi pertimbangan putusan dari Asisten Yuridis AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Analisis Yuridis AI</span>
            </button>
            {step < 5 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <span>Agenda Berikutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSelesaikanSidang}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md border border-red-800 animate-pulse cursor-pointer"
              >
                <Gavel className="w-4 h-4" />
                <span>Bacakan Putusan & Ketuk Palu 3x</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
