import React from 'react';
import { X, Download, Printer, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { BerkasDokumenPerkara } from '../types/leadAp';

export interface GenericFilePreviewData {
  nama_file: string;
  data_url: string;
  nama_kategori?: string;
  ukuran_file?: string;
  tgl_upload?: string;
  pengunggah?: string;
  perkara_id?: string;
}

interface PdfPreviewModalProps {
  dokumen: BerkasDokumenPerkara | GenericFilePreviewData;
  nomorRegister?: string;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  dokumen,
  nomorRegister,
  onClose
}) => {
  const isImage = 
    dokumen.data_url.startsWith('data:image/') || 
    Boolean(dokumen.nama_file.match(/\.(png|jpe?g|webp|gif|svg)$/i));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = dokumen.data_url;
    link.download = dokumen.nama_file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    // Open data URL in a new window/tab
    const win = window.open();
    if (win) {
      if (isImage) {
        win.document.write(
          `<!DOCTYPE html><html><head><title>${dokumen.nama_file}</title></head><body style="margin:0;background:#1e293b;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${dokumen.data_url}" style="max-width:98%;max-height:98%;object-fit:contain;"/></body></html>`
        );
      } else {
        win.document.write(
          `<!DOCTYPE html><html><head><title>${dokumen.nama_file}</title></head><body style="margin:0;background:#333;display:flex;justify-content:center;align-items:center;height:100vh;"><iframe src="${dokumen.data_url}" frameborder="0" style="width:100%;height:100%;"></iframe></body></html>`
        );
      }
    }
  };

  const handlePrint = () => {
    const iframe = document.getElementById('preview-pdf-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch {
        handleDownload();
      }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden border border-slate-700/30 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-600/90 text-white flex items-center justify-center shadow-xs shrink-0 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  {isImage ? 'FORMAT GAMBAR' : 'FORMAT DOKUMEN / PDF'}
                </span>
                <span className="text-amber-400 font-mono text-xs font-semibold">
                  {nomorRegister || dokumen.perkara_id || 'BERKAS DUKUNG'}
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-slate-300 text-xs truncate font-medium">
                  {dokumen.nama_kategori || 'Alat Bukti & Putusan'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                {dokumen.nama_file}
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Unduh Berkas ke Perangkat"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh Berkas</span>
            </button>

            {!isImage && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                title="Cetak Berkas"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Cetak</span>
              </button>
            )}

            <button
              onClick={handleOpenNewTab}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors border border-slate-700 cursor-pointer"
              title="Buka Dokumen di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tab Baru</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
              title="Tutup Pratinjau (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata info strip */}
        <div className="bg-slate-100 px-4 py-2 text-[11px] text-slate-600 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <span><strong>Ukuran:</strong> {dokumen.ukuran_file || 'Berkas Terlampir'}</span>
            <span><strong>Tanggal:</strong> {dokumen.tgl_upload || new Date().toISOString().split('T')[0]}</span>
            <span><strong>Pengunggah:</strong> {dokumen.pengunggah || 'Sistem Bawaslu'}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terverifikasi Sah Sistem LeAD-AP</span>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 bg-slate-900 relative overflow-auto flex items-center justify-center p-2">
          {isImage ? (
            <img
              src={dokumen.data_url}
              alt={dokumen.nama_file}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          ) : (
            <iframe
              id="preview-pdf-iframe"
              src={dokumen.data_url}
              title={dokumen.nama_file}
              className="w-full h-full border-0 bg-slate-900"
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-4 py-2.5 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 text-[11px]">
            Sistem Penelusuran Perkara Sidang Administratif Pemilu • Bawaslu Provinsi Banten
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
