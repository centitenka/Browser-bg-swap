import { describe, expect, it, vi } from 'vitest';
import { createCroppedImage } from './imageCrop';

describe('createCroppedImage', () => {
  it('applies rotation before drawing the cropped image', async () => {
    const rotatedDrawImage = vi.fn();
    const outputDrawImage = vi.fn();
    const translate = vi.fn();
    const rotate = vi.fn();
    const context = {
      drawImage: rotatedDrawImage,
      translate,
      rotate,
    } as unknown as CanvasRenderingContext2D;
    const outputContext = {
      drawImage: outputDrawImage,
    } as unknown as CanvasRenderingContext2D;

    const rotatedCanvas = {
      width: 0,
      height: 0,
      getContext: () => context,
    } as unknown as HTMLCanvasElement;
    const outputCanvas = {
      width: 0,
      height: 0,
      getContext: () => outputContext,
      toDataURL: () => 'data:image/png;base64,ok',
    } as unknown as HTMLCanvasElement;

    vi.spyOn(document, 'createElement')
      .mockReturnValueOnce(rotatedCanvas)
      .mockReturnValueOnce(outputCanvas);

    class MockImage {
      crossOrigin = '';
      width = 100;
      height = 80;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_: string) {
        this.onload?.();
      }
    }

    const previousImage = globalThis.Image;
    globalThis.Image = MockImage as unknown as typeof Image;

    try {
      const result = await createCroppedImage(
        'asset://local/image.png',
        { x: 10, y: 12, width: 30, height: 20 },
        90
      );

      expect(result).toBe('data:image/png;base64,ok');
      expect(rotate).toHaveBeenCalledWith(Math.PI / 2);
      expect(translate).toHaveBeenCalledWith(40, 50);
      expect(rotatedDrawImage).toHaveBeenCalledWith(expect.any(MockImage), -50, -40);
      expect(outputDrawImage).toHaveBeenCalledWith(
        rotatedCanvas,
        10,
        12,
        30,
        20,
        0,
        0,
        30,
        20
      );
    } finally {
      globalThis.Image = previousImage;
      vi.restoreAllMocks();
    }
  });
});
