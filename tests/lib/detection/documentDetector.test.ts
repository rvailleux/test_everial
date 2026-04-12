/**
 * Document detection algorithm unit tests
 *
 * Tests for detectDocumentBoundary, isCaptureReady, getOverlayState
 */

import {
  detectDocumentBoundary,
  isCaptureReady,
  isDocumentFullyInFrame,
  getOverlayState,
  DEFAULT_DETECTION_CONFIG,
  type DocumentBoundary,
} from '@/lib/detection/documentDetector';

describe('detectDocumentBoundary', () => {
  const config = {
    ...DEFAULT_DETECTION_CONFIG,
    procWidth: 100,
    procHeight: 100,
  };

  function createImageData(width: number, height: number): ImageData {
    return new ImageData(width, height);
  }

  function drawRectangle(
    data: Uint8ClampedArray,
    width: number,
    x: number,
    y: number,
    w: number,
    h: number,
    color: [number, number, number]
  ): void {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const idx = ((y + dy) * width + (x + dx)) * 4;
        data[idx] = color[0];
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = 255;
      }
    }
  }

  it('returns null for blank/edgeless image', () => {
    const imageData = createImageData(100, 100);
    // Fill with solid grey (no edges)
    imageData.data.fill(128);

    const result = detectDocumentBoundary(imageData, config);
    expect(result).toBeNull();
  });

  it('returns boundary for synthetic rectangle with distinct edges', () => {
    const width = 100;
    const height = 100;
    const imageData = createImageData(width, height);

    // Fill background with white
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
      imageData.data[i + 3] = 255;
    }

    // Draw a dark grey rectangle (document-like, ~1.5 aspect ratio)
    drawRectangle(imageData.data, width, 20, 25, 45, 30, [50, 50, 50]);

    const result = detectDocumentBoundary(imageData, config);

    expect(result).not.toBeNull();
    if (result) {
      // The detected boundary should be roughly where we drew the rectangle
      expect(result.x).toBeGreaterThanOrEqual(15);
      expect(result.y).toBeGreaterThanOrEqual(20);
      expect(result.width).toBeGreaterThan(30);
      expect(result.height).toBeGreaterThan(20);
      // Aspect ratio should be document-like (between 1.2 and 2.5)
      const aspectRatio = result.width / result.height;
      expect(aspectRatio).toBeGreaterThan(1.0);
      expect(aspectRatio).toBeLessThan(3.0);
    }
  });

  it('returns null for image with edges but wrong aspect ratio', () => {
    const width = 100;
    const height = 100;
    const imageData = createImageData(width, height);

    // Fill background
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
      imageData.data[i + 3] = 255;
    }

    // Draw a tall thin rectangle (wrong aspect ratio for document)
    drawRectangle(imageData.data, width, 40, 10, 20, 80, [50, 50, 50]);

    const result = detectDocumentBoundary(imageData, config);

    // Should not detect this as a document (aspect ratio ~0.25)
    expect(result).toBeNull();
  });
});

describe('isCaptureReady', () => {
  const config = {
    ...DEFAULT_DETECTION_CONFIG,
    minAreaRatio: 0.3,
  };

  it('returns false when boundary is null', () => {
    expect(isCaptureReady(null, 640, 480, config)).toBe(false);
  });

  it('returns false when area is less than 30%', () => {
    const boundary: DocumentBoundary = {
      x: 100,
      y: 100,
      width: 100,  // 100*100 = 10000, frame is 640*480 = 307200, ratio ~3%
      height: 100,
    };
    expect(isCaptureReady(boundary, 640, 480, config)).toBe(false);
  });

  it('returns true when area >= 30% and fully in frame', () => {
    const boundary: DocumentBoundary = {
      x: 50,
      y: 50,
      width: 400,  // 400*300 = 120000, frame 640*480 = 307200, ratio ~39%
      height: 300,
    };
    expect(isCaptureReady(boundary, 640, 480, config)).toBe(true);
  });

  it('returns false when document is partially outside frame', () => {
    const boundary: DocumentBoundary = {
      x: 500,
      y: 50,
      width: 200,  // Would extend to x=700 > 640
      height: 300,
    };
    expect(isCaptureReady(boundary, 640, 480, config)).toBe(false);
  });
});

describe('isDocumentFullyInFrame', () => {
  it('returns true when document is fully inside frame', () => {
    const boundary: DocumentBoundary = {
      x: 10,
      y: 10,
      width: 100,
      height: 100,
    };
    expect(isDocumentFullyInFrame(boundary, 640, 480)).toBe(true);
  });

  it('returns false when document extends beyond right edge', () => {
    const boundary: DocumentBoundary = {
      x: 600,
      y: 10,
      width: 100,  // Would extend to 700
      height: 100,
    };
    expect(isDocumentFullyInFrame(boundary, 640, 480)).toBe(false);
  });

  it('returns false when document extends beyond bottom edge', () => {
    const boundary: DocumentBoundary = {
      x: 10,
      y: 450,
      width: 100,
      height: 100,  // Would extend to 550
    };
    expect(isDocumentFullyInFrame(boundary, 640, 480)).toBe(false);
  });

  it('returns true when document touches edges exactly', () => {
    const boundary: DocumentBoundary = {
      x: 0,
      y: 0,
      width: 640,
      height: 480,
    };
    expect(isDocumentFullyInFrame(boundary, 640, 480)).toBe(true);
  });
});

describe('getOverlayState', () => {
  const config = {
    ...DEFAULT_DETECTION_CONFIG,
    minAreaRatio: 0.3,
  };

  it('returns "none" when boundary is null', () => {
    expect(getOverlayState(null, 640, 480, config)).toBe('none');
  });

  it('returns "detected" when boundary exists but not ready', () => {
    const boundary: DocumentBoundary = {
      x: 10,
      y: 10,
      width: 50,  // Too small
      height: 50,
    };
    expect(getOverlayState(boundary, 640, 480, config)).toBe('detected');
  });

  it('returns "ready" when capture conditions are met', () => {
    const boundary: DocumentBoundary = {
      x: 50,
      y: 50,
      width: 400,
      height: 300,
    };
    expect(getOverlayState(boundary, 640, 480, config)).toBe('ready');
  });
});
