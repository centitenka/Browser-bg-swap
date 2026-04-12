import { useState, useCallback } from 'react';
import { Image as ImageIcon, X, Upload, FileImage, RefreshCw, Crop } from 'lucide-react';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { ImageCropper } from './ImageCropper';
import { useT } from '../../i18n';

interface ImagePickerProps {
  path: string | null;
  onSelect: () => void;
  onClear: () => void;
  onDropPath?: (path: string) => void;
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

export function ImagePicker({ path, onSelect, onClear, onDropPath }: ImagePickerProps) {
  const t = useT();
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        const file = files[0];
        const filePath = (file as unknown as { path?: string }).path;
        if (filePath && onDropPath) {
          onDropPath(filePath);
          setFeedback({ type: 'success', message: 'Image ready. Review the preview, then apply it.' });
        } else {
          onSelect();
        }
      }
    },
    [onSelect, onDropPath]
  );

  const handleCropDone = async (dataUrl: string) => {
    try {
      const savedPath = await invoke<string>('save_cropped_image', { dataUrl });
      if (onDropPath) {
        onDropPath(savedPath);
        setFeedback({ type: 'success', message: 'Cropped image saved and selected.' });
      }
    } catch (e) {
      setFeedback({
        type: 'error',
        message: e instanceof Error ? e.message : 'Failed to save the cropped image.',
      });
    } finally {
      setIsCropping(false);
    }
  };

  const imageInfo = path ? getImageInfo(path) : null;

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
              }}
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />

            <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
                  {isDragging ? 'Drop the image to replace the current background.' : t('image.formats')}
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
    </div>
  );
}
