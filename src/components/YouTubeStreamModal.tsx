import React from 'react';
import { X, ExternalLink, Video, Radio, Calendar, MapPin, Eye } from 'lucide-react';
import { JadwalSidang, Perkara } from '../types/leadAp';

interface YouTubeStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  sidang: JadwalSidang | null;
  perkara?: Perkara | null;
}

/**
 * Ekstraksi YouTube Video ID dari berbagai variasi URL:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pola 1: /live/VIDEO_ID
  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
  if (liveMatch && liveMatch[1]) return liveMatch[1];

  // Pola 2: watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // Pola 3: youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // Pola 4: /embed/VIDEO_ID
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  return null;
}

export const YouTubeStreamModal: React.FC<YouTubeStreamModalProps> = ({
  isOpen,
  onClose,
  sidang,
  perkara
}) => {
  if (!isOpen || !sidang) return null;

  const videoId = extractYouTubeId(sidang.tautan_siaran);
  const isEmbeddable = Boolean(videoId);
  const embedUrl = isEmbeddable
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-950 text-white rounded-2xl max-w-4xl w-full max-h-[94vh] shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-sm flex items-center justify-center animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-950/70 border border-red-800/60 px-2 py-0.5 rounded">
                  🔴 Siaran Langsung YouTube
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Sidang ke-{sidang.ke}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {sidang.agenda}
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

        {/* Video Player Section */}
        <div className="relative bg-black aspect-video w-full flex items-center justify-center">
          {isEmbeddable && embedUrl ? (
            <iframe
              src={embedUrl}
              title={`Siaran Langsung Sidang: ${sidang.agenda}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="p-8 text-center max-w-md space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-950/60 text-red-400 border border-red-800 flex items-center justify-center mx-auto">
                <Video className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Tautan Siaran Langsung Terjadwal
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Siaran sidang dapat diakses melalui portal siaran YouTube Bawaslu. Klik tombol di bawah untuk membuka siaran.
                </p>
              </div>
              {sidang.tautan_siaran && (
                <a
                  href={sidang.tautan_siaran}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka di YouTube</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Info Detail Persidangan */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Perkara Terkait
              </span>
              <span className="font-mono font-bold text-amber-400 truncate block mt-0.5">
                {perkara?.nomor_register || sidang.perkara_id}
              </span>
              {perkara && (
                <span className="text-[11px] text-slate-300 truncate block">
                  {perkara.pelapor.nama} vs {perkara.terlapor.nama}
                </span>
              )}
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Jadwal & Waktu
              </span>
              <div className="flex items-center gap-1.5 font-bold text-white mt-0.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{sidang.tanggal}</span>
                <span className="text-slate-400 font-normal">({sidang.jam})</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Mode: {sidang.mode}
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Ruangan / Tempat
              </span>
              <div className="flex items-start gap-1.5 text-slate-200 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="font-medium line-clamp-2">{sidang.lokasi_atau_tautan}</span>
              </div>
            </div>
          </div>

          {sidang.catatan_sidang && (
            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-slate-200">Catatan Sidang: </strong>
              {sidang.catatan_sidang}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="text-[11px] text-slate-400">
              Siaran terbuka untuk publik demi transparansi proses peradilan administratif Pemilu.
            </div>
            {sidang.tautan_siaran && (
              <a
                href={sidang.tautan_siaran}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 underline font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tonton di Aplikasi YouTube</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
