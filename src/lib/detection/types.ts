/**
 * Document detection types
 *
 * Types for document boundary detection and overlay state.
 */

/**
 * Four corners of the detected document in video-element pixels
 */
export interface DocumentBoundary {
  x: number; // left edge
  y: number; // top edge
  width: number; // bounding box width
  height: number; // bounding box height
}

/**
 * Evaluated readiness for auto-capture
 */
export type OverlayState = 'none' | 'detected' | 'ready';

/**
 * Configuration for document detection
 */
export interface DetectionConfig {
  minAreaRatio: number; // document must fill >= this % of frame (0-1)
  stabilityMs: number; // ms of continuous readiness before capture
  cooldownMs: number; // ms pause after auto-capture
  targetFps: number; // detection frame rate
  procWidth: number; // offscreen canvas processing width
  procHeight: number; // offscreen canvas processing height
  edgeThreshold: number; // Sobel magnitude threshold (0-255)
}

/**
 * Default detection configuration
 */
export const DEFAULT_DETECTION_CONFIG: DetectionConfig = {
  minAreaRatio: 0.3,
  stabilityMs: 500,
  cooldownMs: 2000,
  targetFps: 15,
  procWidth: 320,
  procHeight: 240,
  edgeThreshold: 50,
};
