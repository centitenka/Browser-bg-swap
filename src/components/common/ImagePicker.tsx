import { useState, useCallback } from 'react';
import { Image as ImageIcon, X, Upload, FileImage, RefreshCw, Crop, Star } from 'lucide-react';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { ImageCropper } from './ImageCropper';
import { useT } from '../../i18n';
import type { ImageLibraryEntry } from '../../types';

interface ImagePickerProps {
  path: string | null;
  onSelect: () => void;
  onClear: () => void;
  onDropPath?: (path: string) => void | Promise<void>;
  recentPaths?: string[];
  onUseRecent?: (path: string) => void | Promise<void>;
  favoritePaths?: string[];
  libraryEntries?: ImageLibraryEntry[];
  onToggleFavorite?: (path: string) => void | Promise<void>;
}

function toFileUrl(path: string): string {
  return convertFileSrc(path);
}

function getImageInfo(path: string): { name: string; ext: string } {
  const parts = path.split(/[/\\]/);
  const name = parts[parts.length - 1] || path;
  const extMatch = name.match(/\.([^.]+)$/);
  return {
    name,
    ext: extMatch ? extMatch[1].toUpperCase() : 'UNK',
  };
}

export function ImagePicker({
  path,
  onSelect,
  onClear,
  onDropPath,
  recentPaths = [],
  onUseRecent,
  favoritePaths = [],
  libraryEntries = [],
  onToggleFavorite,
}: ImagePickerProps) {
  const t = useT();
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const favoriteSet = new Set(favoritePaths.map((item) => item.toLowerCase()));
  const isFavorite = path ? favoriteSet.has(path.toLowerCase()) : false;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        const file = files[0];
        const filePath = (file as unknown as { path?: string }).path;
        if (filePath && onDropPath) {
          await onDropPath(filePath);
          setFeedback({ type: 'success', message: t('image.readyToApply') });
        } else {
          onSelect();
        }
      }
    },
    [onSelect, onDropPath, t]
  );

  const handleCropDone = async (dataUrl: string) => {
    try {
      const savedPath = await invoke<string>('save_cropped_image', { dataUrl });
      if (onDropPath) {
        onDropPath(savedPath);
        setFeedback({ type: 'success', message: t('image.croppedSaved') });
      }
    } catch (e) {
      setFeedback({
        type: 'error',
        message: e instanceof Error ? e.message : t('image.cropSaveFailed'),
      });
    } finally {
      setIsCropping(false);
    }
  };

  const imageInfo = path ? getImageInfo(path) : null;

  const handleToggleFavorite = async (targetPath: string) => {
    if (!onToggleFavorite) {
      return;
    }

    await onToggleFavorite(targetPath);
  };

  return (
    <div className="w-full">
      {/* Crop modal */}
      {isCropping && path && (
        <ImageCropper
          imageSrc={toFileUrl(path)}
          onCropDone={handleCropDone}
          onCancel={() => setIsCropping(false)}
        />
      )}

      {path ? (
        <div className="space-y-3 animate-fade-in">
          <div className="group relative aspect-video w-full overflow-hidden rounded-lg border border-border-subtle/50 bg-black/40 shadow-sm">
            <img
              src={toFileUrl(path)}
              alt="Background Preview"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                setFeedback({ type: 'error', message: t('image.missingFile') });
              }}
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />

            <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {path && onToggleFavorite && (
                <button
                  onClick={() => void handleToggleFavorite(path)}
                  className={`rounded-full p-2 text-white backdrop-blur-md transition-colors ${
                    isFavorite ? 'bg-amber-500/85 hover:bg-amber-400' : 'bg-black/50 hover:bg-black/70'
                  }`}
                  title={isFavorite ? t('image.unfavorite') : t('image.favorite')}
                >
                  <Star size={16} className={isFavorite ? 'fill-current' : ''} />
                </button>
              )}
              <button
                onClick={() => setIsCropping(true)}
                className="rounded-full bg-black/50 p-2 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
                title={t('image.crop')}
              >
                <Crop size={16} />
              </button>
              <button
                onClick={onSelect}
                className="rounded-full bg-black/50 p-2 text-white backdrop-blur-md hover:bg-black/70 transition-colors"
                title={t('image.change')}
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={onClear}
                className="rounded-full bg-red-500/80 p-2 text-white backdrop-blur-md hover:bg-red-600 transition-colors"
                title={t('image.remove')}
              >
                <X size={16} />
              </button>
            </div>

            {/* File Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex items-center gap-2 text-xs text-white/90">
                <FileImage size={14} className="opacity-70" />
                <span className="truncate font-medium">{imageInfo?.name}</span>
                <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {imageInfo?.ext}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
             <p className="text-xs text-gray-500">{t('image.current')}</p>
             <div className="flex items-center gap-3">
               {path && onToggleFavorite && (
                 <button
                   onClick={() => void handleToggleFavorite(path)}
                   className={`text-xs font-medium transition-colors ${
                     isFavorite ? 'text-amber-300 hover:text-amber-200' : 'text-gray-400 hover:text-amber-200'
                   }`}
                 >
                   {isFavorite ? t('image.unfavorite') : t('image.favorite')}
                 </button>
               )}
               <button
                 onClick={() => setIsCropping(true)}
                 className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
               >
                 {t('image.crop')}
               </button>
               <button
                 onClick={onSelect}
                 className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
               >
                 {t('image.replace')}
               </button>
             </div>
          </div>

          {feedback && (
            <div
              className={`rounded-xl border px-3 py-2 text-xs ${
                feedback.type === 'success'
                  ? 'border-green-500/20 bg-green-500/10 text-green-100'
                  : 'border-red-500/20 bg-red-500/10 text-red-100'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={onSelect}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-card ${
              isDragging
                ? 'border-primary bg-primary/8 shadow-lg shadow-primary/10'
                : 'border-border-subtle/50 bg-white/2 hover:border-gray-500 hover:bg-white/5'
            }`}
          >
            <div className="flex flex-col items-center gap-4 py-12 px-6 text-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                  isDragging
                    ? 'bg-primary text-white scale-110'
                    : 'bg-sidebar text-gray-400 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary'
                }`}
              >
                {isDragging ? (
                  <Upload size={24} strokeWidth={2} />
                ) : (
                  <ImageIcon size={24} strokeWidth={1.5} />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-200">{t('image.upload')}</p>
                <p className="text-xs text-gray-500">
                  {isDragging ? t('image.dropReplace') : t('image.formats')}
                </p>
              </div>
            </div>
          </button>

          {feedback && (
            <div
              className={`rounded-xl border px-3 py-2 text-xs ${
                feedback.type === 'success'
                  ? 'border-green-500/20 bg-green-500/10 text-green-100'
                  : 'border-red-500/20 bg-red-500/10 text-red-100'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
      )}

      {favoritePaths.length > 0 && onUseRecent && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-gray-500">{t('image.favorites')}</p>
          <div className="flex flex-wrap gap-2">
            {favoritePaths.map((favoritePath) => {
              const active = path?.toLowerCase() === favoritePath.toLowerCase();
              return (
                <div
                  key={favoritePath}
                  className={`flex items-center gap-1 rounded-full border px-1.5 py-1 ${
                    active
                      ? 'border-amber-400/50 bg-amber-500/15'
                      : 'border-border-subtle/50 bg-white/5'
                  }`}
                >
                  <button
                    onClick={() => void onUseRecent(favoritePath)}
                    className="max-w-full px-1.5 text-xs text-gray-200 transition-colors hover:text-white"
                    title={favoritePath}
                  >
                    <span className="truncate">{getImageInfo(favoritePath).name}</span>
                  </button>
                  {onToggleFavorite && (
                    <button
                      onClick={() => void handleToggleFavorite(favoritePath)}
                      className="rounded-full p-1 text-amber-300 transition-colors hover:bg-white/10"
                      title={t('image.unfavorite')}
                    >
                      <Star size={12} className="fill-current" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentPaths.length > 0 && onUseRecent && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-gray-500">{t('image.recent')}</p>
          <div className="flex flex-wrap gap-2">
            {recentPaths.map((recentPath) => (
              <button
                key={recentPath}
                onClick={() => void onUseRecent(recentPath)}
                className="max-w-full rounded-full border border-border-subtle/50 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-white/10"
                title={recentPath}
              >
                <span className="truncate">{getImageInfo(recentPath).name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {libraryEntries.length > 0 && onUseRecent && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs text-gray-500">{t('image.library')}</p>
            <p className="text-[11px] text-gray-600">{t('image.libraryHint')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {libraryEntries.map((entry) => {
              const active = path?.toLowerCase() === entry.path.toLowerCase();
              const favorite = favoriteSet.has(entry.path.toLowerCase());
              return (
                <div
                  key={entry.path}
                  className={`group overflow-hidden rounded-xl border transition-colors ${
                    active
                      ? 'border-primary/60 bg-primary/10'
                      : 'border-border-subtle/40 bg-sidebar/30'
                  }`}
                >
                  <button
                    onClick={() => void onUseRecent(entry.path)}
                    className="block w-full text-left"
                    title={entry.path}
                  >
                    <div className="relative aspect-video overflow-hidden bg-black/30">
                      <img
                        src={toFileUrl(entry.path)}
                        alt={entry.label}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white">
                        {entry.source === 'cropped' ? t('image.libraryCropped') : t('image.libraryManaged')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <span className="truncate text-xs text-gray-200">{entry.label}</span>
                      {entry.modified_at && (
                        <span className="shrink-0 text-[10px] text-gray-500">
                          {new Date(entry.modified_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </button>
                  {onToggleFavorite && (
                    <div className="border-t border-border-subtle/30 px-2 py-1.5">
                      <button
                        onClick={() => void handleToggleFavorite(entry.path)}
                        className={`inline-flex items-center gap-1 text-[11px] transition-colors ${
                          favorite ? 'text-amber-300' : 'text-gray-400 hover:text-amber-200'
                        }`}
                        title={favorite ? t('image.unfavorite') : t('image.favorite')}
                      >
                        <Star size={12} className={favorite ? 'fill-current' : ''} />
                        {favorite ? t('image.unfavorite') : t('image.favorite')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
