import React, { useState } from 'react';
import { 
  Settings, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Lock, 
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { DEFAULT_HARI_LIBUR, KODE_WILAYAH_BAWASLU } from '../utils/businessLogic';
import { HariLibur } from '../types/leadAp';

interface PengaturanViewProps {
  onOpenDriveManager?: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<'kalender' | 'wilayah' | 'ambang' | 'keamanan'>('kalender');
  const [hariLiburList, setHariLiburList] = useState<HariLibur[]>(DEFAULT_HARI_LIBUR);
  const [newLiburDate, setNewLiburDate] = useState<string>('');
  const [newLiburKet, setNewLiburKet] = useState<string>('');
  const [newLiburTipe, setNewLiburTipe] = useState<'Libur Nasional' | 'Cuti Bersama'>('Libur Nasional');

  const [ambangWaspada, setAmbangWaspada] = useState<number>(5);
  const [ambangKritis, setAmbangKritis] = useState<number>(2);
  const [savedAlert, setSavedAlert] = useState<boolean>(false);

  // Akun Admin
  const [adminUser, setAdminUser] = useState<string>(
    localStorage.getItem('leadap_admin_username') || 'admin_banten'
  );
  const [adminPass, setAdminPass] = useState<string>(
    localStorage.getItem('leadap_admin_password') || 'Bawaslu2028!'
  );
  const [adminSaved, setAdminSaved] = useState<boolean>(false);

  const handleSaveCredentials = () => {
    localStorage.setItem('leadap_admin_username', adminUser.trim());
    localStorage.setItem('leadap_admin_password', adminPass);
    setAdminSaved(true);
    setTimeout(() => setAdminSaved(false), 2500);
  };

  const handleAddLibur = () => {
    if (!newLiburDate || !newLiburKet) return;
    setHariLiburList((prev) => [
      ...prev,
      { tanggal: newLiburDate, keterangan: newLiburKet, tipe: newLiburTipe }
    ]);
    setNewLiburDate('');
    setNewLiburKet('');
  };

  const handleDeleteLibur = (tgl: string) => {
    setHariLiburList((prev) => prev.filter((h) => h.tanggal !== tgl));
  };

  const handleSaveAmbang = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header View */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-xl shadow-md border-b-4 border-amber-500">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">
              PENGATURAN SISTEM & MASTER DATA LeAD-AP
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Kalender hari kerja resmi Bawaslu, kode wilayah peradilan pemilu, ekosistem Google (Sheets, Script, Drive), dan autentikasi administrator.
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b flex flex-wrap gap-2 p-2">
          <button
            onClick={() => setActiveSubTab('kalender')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'kalender'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kalender Hari Kerja & Libur</span>
          </button>
          <button
            onClick={() => setActiveSubTab('wilayah')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'wilayah'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Kode Wilayah Bawaslu</span>
          </button>
          <button
            onClick={() => setActiveSubTab('ambang')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'ambang'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Ambang Batas Peringatan HK</span>
          </button>
          <button
            onClick={() => setActiveSubTab('keamanan')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'keamanan'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Akun & Keamanan Admin</span>
          </button>
        </div>

        {/* Content Tab: Kalender */}
        {activeSubTab === 'kalender' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <span className="font-bold text-slate-800 uppercase tracking-wide text-xs">
                  Daftar Hari Libur Nasional & Cuti Bersama (Bab 4.2):
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hari libur nasional, cuti bersama, dan hari Sabtu/Minggu dikecualikan dari perhitungan 14 Hari Kerja (HK).
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border rounded-xl space-y-3">
              <span className="font-bold text-slate-700 block">Tambah Hari Libur Baru:</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="date"
                  value={newLiburDate}
                  onChange={(e) => setNewLiburDate(e.target.value)}
                  className="p-2 border rounded-lg bg-white text-xs"
                />
                <input
                  type="text"
                  value={newLiburKet}
                  onChange={(e) => setNewLiburKet(e.target.value)}
                  placeholder="Keterangan hari libur..."
                  className="p-2 border rounded-lg bg-white text-xs col-span-2"
                />
                <select
                  value={newLiburTipe}
                  onChange={(e) => setNewLiburTipe(e.target.value as any)}
                  className="p-2 border rounded-lg bg-white text-xs font-semibold"
                >
                  <option value="Libur Nasional">Libur Nasional</option>
                  <option value="Cuti Bersama">Cuti Bersama</option>
                </select>
              </div>
              <button
                onClick={handleAddLibur}
                className="bg-red-700 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambahkan Hari Libur</span>
              </button>
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                    <th className="py-2.5 px-3 w-36">Tanggal</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Keterangan</th>
                    <th className="py-2.5 px-3 w-36">Kategori</th>
                    <th className="py-2.5 px-3 w-20 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {hariLiburList.map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">{h.tanggal}</td>
                      <td className="py-2 px-3 font-sans text-slate-800">{h.keterangan}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.tipe === 'Libur Nasional' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {h.tipe}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleDeleteLibur(h.tanggal)}
                          className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Tab: Wilayah */}
        {activeSubTab === 'wilayah' && (
          <div className="p-5 space-y-4 text-xs">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
              Daftar Kode Satuan Kerja Bawaslu Se-Provinsi Banten (Bab 4.1):
            </span>
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                    <th className="py-2 px-3 w-28">Kode Wilayah</th>
                    <th className="py-2 px-3 w-32">Tingkatan</th>
                    <th className="py-2 px-3 min-w-[280px]">Nama Satuan Kerja Bawaslu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {KODE_WILAYAH_BAWASLU.map((w, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-blue-900">{w.kode}</td>
                      <td className="py-2 px-3 text-slate-600">{w.level}</td>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">{w.nama}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Tab: Ambang Batas */}
        {activeSubTab === 'ambang' && (
          <div className="p-5 space-y-4 text-xs max-w-xl">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
              Konfigurasi Peringatan Visual Timer 14 Hari Kerja (Bab 5.2):
            </span>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Ambang Peringatan Kuning (Waspada):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ambangWaspada}
                    onChange={(e) => setAmbangWaspada(Number(e.target.value))}
                    className="w-24 p-2 border rounded-lg bg-white font-bold"
                  />
                  <span className="text-slate-600">Hari Kerja tersisa (Default: ≤ 5 HK)</span>
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Ambang Peringatan Merah (Kritis):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ambangKritis}
                    onChange={(e) => setAmbangKritis(Number(e.target.value))}
                    className="w-24 p-2 border rounded-lg bg-white font-bold text-red-600"
                  />
                  <span className="text-slate-600">Hari Kerja tersisa (Default: ≤ 2 HK)</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSaveAmbang}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {savedAlert ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedAlert ? 'Pengaturan Disimpan!' : 'Simpan Parameter'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab: Keamanan & Akun Admin */}
        {activeSubTab === 'keamanan' && (
          <div className="p-5 space-y-4 text-xs max-w-2xl">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
              Manajemen Autentikasi & Keamanan Administrator:
            </span>
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Aturan Autentikasi Terintegrasi Google Spreadsheet</span>
              </div>
              <p className="text-[11px] text-amber-900">
                Untuk menjaga independensi dan integritas persidangan administratif pemilu, pendaftaran akun baru publik dinonaktifkan di halaman masuk. 
                Seluruh akun resmi Administrator dikelola secara langsung oleh Admin pada Google Spreadsheet di sheet <strong>Pengguna_Admin</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-slate-800 text-xs uppercase">
                  Format Tabel Akun di Google Spreadsheet (Sheet: Pengguna_Admin):
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border bg-white rounded-lg overflow-hidden">
                  <thead className="bg-red-900 text-white font-bold">
                    <tr>
                      <th className="p-2 border">Username</th>
                      <th className="p-2 border">Password</th>
                      <th className="p-2 border">Nama_Lengkap</th>
                      <th className="p-2 border">Peran</th>
                      <th className="p-2 border">Status_Aktif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-blue-900">admin_banten</td>
                      <td className="p-2 text-slate-600">Bawaslu2028!</td>
                      <td className="p-2 font-sans">Administrator Bawaslu Banten</td>
                      <td className="p-2 font-sans">Super Admin</td>
                      <td className="p-2 text-emerald-700 font-bold">Aktif</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-blue-900">sekretariat_banten</td>
                      <td className="p-2 text-slate-600">BantenAdmAman2026</td>
                      <td className="p-2 font-sans">Sekretariat Majelis Pemeriksa</td>
                      <td className="p-2 font-sans">Panitera Sidang</td>
                      <td className="p-2 text-emerald-700 font-bold">Aktif</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Cukup tambahkan baris baru pada sheet tersebut untuk membuat akun admin tambahan dengan aman.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <span className="font-bold text-slate-800 block text-xs">
                Kredensial Darurat / Cadangan Lokal Administrator:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Username Admin Lokal:
                  </label>
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white font-medium text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kata Sandi (Password):
                  </label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white font-medium text-xs text-slate-800"
                  />
                </div>
              </div>
              <div className="pt-1">
                <button
                  onClick={handleSaveCredentials}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {adminSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{adminSaved ? 'Kredensial Lokal Disimpan!' : 'Simpan Kredensial Cadangan'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
