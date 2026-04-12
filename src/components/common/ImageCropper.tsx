import { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useT } from '../../i18n';

interface ImageCropperProps {
  imageSrc: string;
  onCropDone: (dataUrl: string) => void;
  onCancel: () => void;
}

function createCroppedImage(imageSrc: string, crop: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

export function ImageCropper({ imageSrc, onCropDone, onCancel }: ImageCropperProps) {
  const t = useT();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const dataUrl = await createCroppedImage(imageSrc, croppedAreaPixels);
      onCropDone(dataUrl);
    } catch {
      onCancel();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm animate-fade-in">
      {/* Crop area — takes all remaining space */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={16 / 10}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          showGrid
        />
      </div>

      {/* Controls — compact and responsive */}
      <div className="shrink-0 bg-black/80 border-t border-white/10 px-3 sm:px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 max-w-xl mx-auto">
          {/* Zoom */}
          <div className="flex items-center gap-2">
            <ZoomOut size={14} className="text-gray-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-20 sm:w-28 accent-primary"
            />
            <ZoomIn size={14} className="text-gray-400 shrink-0" />
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-2">
            <RotateCw size={14} className="text-gray-400 shrink-0" />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-16 sm:w-20 accent-primary"
            />
            <span className="text-[11px] text-gray-500 font-mono w-8 text-right">{rotation}°</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm text-gray-300 hover:text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
            >
              <X size={14} />
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm text-white bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-lg transition-colors"
            >
              <Check size={14} />
              {isSaving ? t('cropper.saving') : t('cropper.apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
