import type { Area } from 'react-easy-crop';

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function rotatedSize(width: number, height: number, rotation: number): { width: number; height: number } {
  const radians = degreesToRadians(rotation);

  return {
    width: Math.abs(Math.cos(radians) * width) + Math.abs(Math.sin(radians) * height),
    height: Math.abs(Math.sin(radians) * width) + Math.abs(Math.cos(radians) * height),
  };
}

export function createCroppedImage(imageSrc: string, crop: Area, rotation = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const radians = degreesToRadians(rotation);
      const bounds = rotatedSize(img.width, img.height, rotation);
      const rotatedCanvas = document.createElement('canvas');
      rotatedCanvas.width = bounds.width;
      rotatedCanvas.height = bounds.height;

      const rotatedCtx = rotatedCanvas.getContext('2d');
      if (!rotatedCtx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      rotatedCtx.translate(bounds.width / 2, bounds.height / 2);
      rotatedCtx.rotate(radians);
      rotatedCtx.drawImage(img, -img.width / 2, -img.height / 2);

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = crop.width;
      outputCanvas.height = crop.height;

      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      outputCtx.drawImage(
        rotatedCanvas,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      resolve(outputCanvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}
