/**
 * Type definitions for the Snapshot Capture System
 *
 * These types define the core interfaces for capturing frames from video streams
 * and previewing them before processing.
 */

/**
 * Represents a captured snapshot from a video stream
 */
export interface Snapshot {
  /** The image data as a PNG blob */
  blob: Blob;
  /** Object URL for displaying the image in the browser */
  url: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Capture timestamp (milliseconds since epoch) */
  timestamp: number;
}

/**
 * Return type for the useSnapshot hook
 */
export interface UseSnapshotReturn {
  /** The current snapshot or null if none captured */
  snapshot: Snapshot | null;
  /** Whether a capture operation is in progress */
  isCapturing: boolean;
  /** Error from the last capture attempt, if any */
  error: Error | null;
  /**
   * Capture a frame from a video element
   * @param videoElement - The HTML video element to capture from
   * @returns Promise that resolves when capture is complete
   */
  capture: (videoElement: HTMLVideoElement) => Promise<void>;
  /** Clear the current snapshot and revoke the object URL */
  clear: () => void;
}

/**
 * Props for the SnapshotPreview component
 */
export interface SnapshotPreviewProps {
  /** The snapshot to display */
  snapshot: Snapshot;
  /** Callback when user wants to retake the snapshot */
  onRetake: () => void;
  /** Callback when user accepts the snapshot and wants to proceed */
  onProceed: () => void;
}
