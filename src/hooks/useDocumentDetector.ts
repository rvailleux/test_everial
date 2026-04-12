/**
 * Document detector React hook
 *
 * Runs a frame loop to detect documents in the video stream.
 * Triggers auto-capture when conditions are met.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  detectDocumentBoundary,
  isCaptureReady,
  getOverlayState,
  DEFAULT_DETECTION_CONFIG,
  type DocumentBoundary,
  type DetectionConfig,
  type OverlayState,
} from '@/lib/detection/documentDetector';

interface UseDocumentDetectorOptions {
  enabled: boolean;
  videoContainerRef: React.RefObject<HTMLElement | null>;
  onAutoCapture?: () => void;
  config?: Partial<DetectionConfig>;
}

interface UseDocumentDetectorReturn {
  boundary: DocumentBoundary | null;
  overlayState: OverlayState;
  isAutoScanning: boolean;
  setAutoScanEnabled: (enabled: boolean) => void;
}

/**
 * Hook for real-time document detection in video stream
 */
export function useDocumentDetector({
  enabled,
  videoContainerRef,
  onAutoCapture,
  config: userConfig,
}: UseDocumentDetectorOptions): UseDocumentDetectorReturn {
  const config = { ...DEFAULT_DETECTION_CONFIG, ...userConfig };
  const [boundary, setBoundary] = useState<DocumentBoundary | null>(null);
  const [overlayState, setOverlayState] = useState<OverlayState>('none');
  const [isAutoScanning, setIsAutoScanning] = useState(enabled);

  // Refs for frame loop state
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);
  const stabilityStartRef = useRef<number | null>(null);
  const lastCaptureRef = useRef(0);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const frameInterval = 1000 / config.targetFps;

  // Find video element within container
  const findVideoElement = useCallback((): HTMLVideoElement | null => {
    if (!videoContainerRef.current) return null;
    return videoContainerRef.current.querySelector('video');
  }, [videoContainerRef]);

  // Initialize offscreen canvas for processing
  const getOffscreenCanvas = useCallback((): HTMLCanvasElement => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = config.procWidth;
      offscreenCanvasRef.current.height = config.procHeight;
    }
    return offscreenCanvasRef.current;
  }, [config.procWidth, config.procHeight]);

  // Process a single video frame
  const processFrame = useCallback(() => {
    const video = videoElementRef.current;
    const container = videoContainerRef.current;

    if (!video || !container || video.readyState < 2) {
      setBoundary(null);
      setOverlayState('none');
      return;
    }

    const canvas = getOffscreenCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to offscreen canvas (downsampled)
    ctx.drawImage(video, 0, 0, config.procWidth, config.procHeight);

    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, config.procWidth, config.procHeight);

    // Detect document boundary
    const detectedBoundary = detectDocumentBoundary(imageData, config);

    // Scale boundary to match container dimensions
    const containerRect = container.getBoundingClientRect();
    const scaleX = containerRect.width / config.procWidth;
    const scaleY = containerRect.height / config.procHeight;

    const scaledBoundary = detectedBoundary
      ? {
          x: detectedBoundary.x * scaleX,
          y: detectedBoundary.y * scaleY,
          width: detectedBoundary.width * scaleX,
          height: detectedBoundary.height * scaleY,
        }
      : null;

    setBoundary(scaledBoundary);

    // Determine overlay state
    const state = getOverlayState(
      scaledBoundary,
      containerRect.width,
      containerRect.height,
      config
    );
    setOverlayState(state);

    // Check for auto-capture
    const now = performance.now();

    // Check if we're in cooldown period
    if (now - lastCaptureRef.current < config.cooldownMs) {
      stabilityStartRef.current = null;
      return;
    }

    // Check if capture conditions are met
    if (
      state === 'ready' &&
      isCaptureReady(scaledBoundary, containerRect.width, containerRect.height, config)
    ) {
      if (stabilityStartRef.current === null) {
        stabilityStartRef.current = now;
      } else if (now - stabilityStartRef.current >= config.stabilityMs) {
        // Trigger auto-capture
        lastCaptureRef.current = now;
        stabilityStartRef.current = null;
        onAutoCapture?.();
      }
    } else {
      stabilityStartRef.current = null;
    }
  }, [config, getOffscreenCanvas, onAutoCapture, videoContainerRef]);

  // Frame loop
  const frameLoop = useCallback(
    (timestamp: number) => {
      if (!isAutoScanning) return;

      if (timestamp - lastFrameTimeRef.current >= frameInterval) {
        processFrame();
        lastFrameTimeRef.current = timestamp;
      }

      rafRef.current = requestAnimationFrame(frameLoop);
    },
    [frameInterval, isAutoScanning, processFrame]
  );

  // Start/stop frame loop
  useEffect(() => {
    if (!enabled) {
      setIsAutoScanning(false);
      return;
    }

    // Find video element
    videoElementRef.current = findVideoElement();
    if (!videoElementRef.current) {
      // Video not ready yet, retry on next effect
      return;
    }

    setIsAutoScanning(true);
    rafRef.current = requestAnimationFrame(frameLoop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, findVideoElement, frameLoop]);

  // Update isAutoScanning when enabled changes
  useEffect(() => {
    if (!enabled && isAutoScanning) {
      setIsAutoScanning(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    }
  }, [enabled, isAutoScanning]);

  const setAutoScanEnabled = useCallback((enabled: boolean) => {
    if (!enabled) {
      setIsAutoScanning(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    } else {
      setIsAutoScanning(true);
    }
  }, []);

  return {
    boundary,
    overlayState,
    isAutoScanning,
    setAutoScanEnabled,
  };
}
