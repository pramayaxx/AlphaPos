import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { compressImage, formatBytes, type CompressionResult } from '../lib/imageCompressor';

interface LogoUploaderProps {
  logoUrl?: string;
  onLogoChange: (compressedDataUrl: string | undefined) => void;
  className?: string;
  label?: string;
  description?: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  logoUrl,
  onLogoChange,
  className = '',
  label = 'Store Logo',
  description = 'Upload your store logo for thermal and digital receipts. Supports PNG, JPG, WebP, SVG.',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setErrorMessage(null);
    setIsCompressing(true);

    try {
      // Auto compress to max 400x400 with high quality downsampling
      const result = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
      });

      setCompressionStats(result);
      onLogoChange(result.dataUrl);
    } catch (err: any) {
      console.error('Image compression failed:', err);
      setErrorMessage(err?.message || 'Failed to process and compress image.');
    } finally {
      setIsCompressing(false);
    }
  }, [onLogoChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset if leaving the outer container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  }, [processFile]);

  const handleRemove = useCallback(() => {
    setCompressionStats(null);
    setErrorMessage(null);
    onLogoChange(undefined);
  }, [onLogoChange]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          await processFile(file);
          break;
        }
      }
    }
  }, [processFile]);

  return (
    <div className={`space-y-3 ${className}`} onPaste={handlePaste}>
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            {label}
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        </div>
        {logoUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 size={13} />
            Remove
          </button>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer transition-all duration-200 rounded-2xl border-2 border-dashed p-4 flex flex-col sm:flex-row items-center gap-4 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 ring-4 ring-blue-500/20 scale-[1.01]'
            : logoUrl
            ? 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Thumbnail Preview Area */}
        <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-xs">
          {isCompressing ? (
            <div className="flex flex-col items-center justify-center p-2 text-center text-blue-600 dark:text-blue-400">
              <RefreshCw size={24} className="animate-spin mb-1" />
              <span className="text-[10px] font-bold">Compressing...</span>
            </div>
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt="Store Logo"
              className="w-full h-full object-contain p-2"
              referrerPolicy="no-referrer"
              loading="eager"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <ImageIcon size={32} strokeWidth={1.5} />
              <span className="text-[10px] font-medium mt-1">No Logo</span>
            </div>
          )}

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl text-white">
            <UploadCloud size={22} className="drop-shadow-sm" />
          </div>
        </div>

        {/* Text & Guidance Area */}
        <div className="flex-1 text-center sm:text-left min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <UploadCloud size={16} className="text-blue-500" />
              {logoUrl ? 'Change Store Logo' : 'Drag & Drop Logo Here'}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              Auto-Compressed
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            or <span className="text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-2">browse file</span> from computer (or paste image)
          </p>

          {/* Real-time Compression Feedback Badge */}
          {compressionStats && logoUrl && (
            <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 size={13} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                Optimized to <strong>{formatBytes(compressionStats.compressedSize)}</strong>
                {compressionStats.savedPercentage > 0 && (
                  <span className="text-emerald-600/80 dark:text-emerald-400/80 ml-1">
                    ({compressionStats.savedPercentage}% saved)
                  </span>
                )}
                {' • '}Fast receipt loading
              </span>
            </div>
          )}

          {!compressionStats && logoUrl && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 justify-center sm:justify-start">
              <Sparkles size={11} className="text-amber-500" /> Ready for thermal printing and instant receipt rendering
            </p>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
