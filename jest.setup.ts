import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for LiveKit client
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Polyfill ImageData for canvas-based detection tests
if (typeof ImageData === 'undefined') {
  class ImageDataPolyfill {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(widthOrData: number | Uint8ClampedArray, widthOrHeight: number, height?: number) {
      if (typeof widthOrData === 'number') {
        this.width = widthOrData;
        this.height = widthOrHeight;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      } else {
        this.data = widthOrData;
        this.width = widthOrHeight;
        this.height = height!;
      }
    }
  }
  (global as any).ImageData = ImageDataPolyfill;
}
