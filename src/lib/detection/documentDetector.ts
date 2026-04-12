/**
 * Document detection algorithm
 *
 * Pure TypeScript edge detection running on ImageData.
 * Detects the largest rectangular document in a video frame.
 */

import type { DocumentBoundary, DetectionConfig, OverlayState } from './types';
import { DEFAULT_DETECTION_CONFIG } from './types';

export { type DocumentBoundary, type DetectionConfig, type OverlayState, DEFAULT_DETECTION_CONFIG };

/**
 * Detect document boundary in an image frame.
 *
 * Algorithm:
 * 1. Convert to greyscale
 * 2. Apply Sobel edge magnitude
 * 3. Threshold to binary edge map
 * 4. Find connected components of edges
 * 5. Return bounding box of largest component with document-like aspect ratio
 *
 * @param imageData - RGBA pixel data from canvas
 * @param config - Detection configuration
 * @returns Document boundary or null if no document detected
 */
export function detectDocumentBoundary(
  imageData: ImageData,
  config: DetectionConfig = DEFAULT_DETECTION_CONFIG
): DocumentBoundary | null {
  const { width, height, data } = imageData;

  // Create greyscale buffer
  const greyscale = new Uint8Array(width * height);
  convertToGreyscale(data, greyscale, width, height);

  // Apply Sobel edge detection
  const edges = new Uint8Array(width * height);
  applySobel(greyscale, edges, width, height, config.edgeThreshold);

  // Find connected components and their bounding boxes
  const components = findConnectedComponents(edges, width, height);

  // Filter for document-like aspect ratios and find the best candidate
  const docAspectMin = 1.2;  // ID cards ~1.58, A4 ~1.41
  const docAspectMax = 2.5;

  let bestComponent: { x: number; y: number; w: number; h: number; area: number } | null = null;
  let bestScore = 0;

  for (const comp of components) {
    if (comp.area < 100) continue; // Too small

    const aspectRatio = comp.w / comp.h;
    if (aspectRatio < docAspectMin || aspectRatio > docAspectMax) continue;

    // Score by area and aspect ratio closeness to 1.4 (A4) or 1.58 (ID card)
    const aspectScore = 1 - Math.min(
      Math.abs(aspectRatio - 1.4),
      Math.abs(aspectRatio - 1.58)
    ) / 1.0;

    const score = comp.area * (0.5 + 0.5 * Math.max(0, aspectScore));

    if (score > bestScore) {
      bestScore = score;
      bestComponent = comp;
    }
  }

  if (!bestComponent) return null;

  return {
    x: bestComponent.x,
    y: bestComponent.y,
    width: bestComponent.w,
    height: bestComponent.h,
  };
}

/**
 * Convert RGBA data to greyscale (luminance)
 */
function convertToGreyscale(
  rgba: Uint8ClampedArray,
  grey: Uint8Array,
  width: number,
  height: number
): void {
  for (let i = 0; i < width * height; i++) {
    const r = rgba[i * 4];
    const g = rgba[i * 4 + 1];
    const b = rgba[i * 4 + 2];
    // Luminance formula
    grey[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }
}

/**
 * Apply Sobel edge detection and threshold
 */
function applySobel(
  grey: Uint8Array,
  edges: Uint8Array,
  width: number,
  height: number,
  threshold: number
): void {
  // Sobel kernels
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kidx = (ky + 1) * 3 + (kx + 1);
          sumX += grey[idx] * gx[kidx];
          sumY += grey[idx] * gy[kidx];
        }
      }

      const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
      edges[y * width + x] = magnitude > threshold ? 255 : 0;
    }
  }
}

/**
 * Find connected components using 4-connectivity flood fill
 */
function findConnectedComponents(
  edges: Uint8Array,
  width: number,
  height: number
): Array<{ x: number; y: number; w: number; h: number; area: number }> {
  const visited = new Uint8Array(width * height);
  const components: Array<{ x: number; y: number; w: number; h: number; area: number }> = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (edges[idx] === 255 && visited[idx] === 0) {
        const component = floodFill(edges, visited, width, height, x, y);
        if (component.area > 50) {
          components.push(component);
        }
      }
    }
  }

  return components;
}

/**
 * Flood fill to find bounds of a connected component
 */
function floodFill(
  edges: Uint8Array,
  visited: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number
): { x: number; y: number; w: number; h: number; area: number } {
  const stack: Array<[number, number]> = [[startX, startY]];
  let minX = startX, maxX = startX;
  let minY = startY, maxY = startY;
  let area = 0;

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const idx = y * width + x;

    if (visited[idx] || edges[idx] !== 255) continue;

    visited[idx] = 1;
    area++;

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);

    // 4-connectivity neighbors
    if (x > 0) stack.push([x - 1, y]);
    if (x < width - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < height - 1) stack.push([x, y + 1]);
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    area,
  };
}

/**
 * Check if capture conditions are met for a detected boundary
 */
export function isCaptureReady(
  boundary: DocumentBoundary | null,
  containerWidth: number,
  containerHeight: number,
  config: DetectionConfig = DEFAULT_DETECTION_CONFIG
): boolean {
  if (!boundary) return false;

  // Check area ratio
  const frameArea = containerWidth * containerHeight;
  const docArea = boundary.width * boundary.height;
  const areaRatio = docArea / frameArea;

  if (areaRatio < config.minAreaRatio) return false;

  // Check if fully in frame
  return isDocumentFullyInFrame(boundary, containerWidth, containerHeight);
}

/**
 * Check if document is fully within the camera frame
 */
export function isDocumentFullyInFrame(
  boundary: DocumentBoundary,
  containerWidth: number,
  containerHeight: number
): boolean {
  return (
    boundary.x >= 0 &&
    boundary.y >= 0 &&
    boundary.x + boundary.width <= containerWidth &&
    boundary.y + boundary.height <= containerHeight
  );
}

/**
 * Get the current overlay state based on detection
 */
export function getOverlayState(
  boundary: DocumentBoundary | null,
  containerWidth: number,
  containerHeight: number,
  config: DetectionConfig = DEFAULT_DETECTION_CONFIG
): OverlayState {
  if (!boundary) return 'none';

  if (isCaptureReady(boundary, containerWidth, containerHeight, config)) {
    return 'ready';
  }

  return 'detected';
}
