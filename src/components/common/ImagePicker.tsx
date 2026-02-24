import { useState, useCallback } from 'react';
import { Image, X, Upload, FileImage } from 'lucide-react';

interface ImagePickerProps {
  path: string | null;
  onSelect: () => void;
  onClear: () => void;
}

function getImageInfo(path: string): { name: string; ext: string } {
  const parts = path.split(/[/\\]/);
  const name = parts[parts.length - 1] || path;
  const extMatch = name.match(/\.([^.]+)$/);
  return {
    name,
    ext: extMatch ? extMatch[1].toUpperCase() : '未知',
  };
}

export function ImagePicker({ path, onSelect, onClear }: ImagePickerProps) {
  const [isDragging, setIsDragging] = useState(false);

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
        onSelect();
      }
    },
    [onSelect]
  );

  const imageInfo = path ? getImageInfo(path) : null;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        背景图片
      </label>

      {path ? (
        <div className="relative group">
          <div className="aspect-video max-h-48 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            <img
              src={`file://${path}`}
              alt="背景预览"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onClear}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="清除图片"
              title="清除图片"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <FileImage size={16} className="text-gray-400" aria-hidden="true" />
              <span className="text-gray-300 truncate max-w-[200px]" title={imageInfo?.name}>
                {imageInfo?.name}
              </span>
              <span className="text-gray-500 text-xs px-2 py-0.5 bg-gray-700 rounded">
                {imageInfo?.ext}
              </span>
            </div>
            <button
              onClick={onSelect}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              更换图片
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full py-8 px-4 border-2 border-dashed rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDragging
              ? 'border-blue-500 bg-blue-900/20'
              : 'border-gray-600 bg-gray-750 hover:border-gray-500 hover:bg-gray-700'
          }`}
          aria-label="选择图片"
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={`p-3 rounded-full transition-colors ${
                isDragging ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              {isDragging ? (
                <Upload size={24} className="text-white" aria-hidden="true" />
              ) : (
                <Image size={24} className="text-gray-400" aria-hidden="true" />
              )}
            </div>
            <div className="text-center">
              <p className="text-gray-300 font-medium">点击选择图片</p>
              <p className="text-gray-500 text-sm mt-1">或拖拽图片到此处</p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
