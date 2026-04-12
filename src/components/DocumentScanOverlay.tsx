/**
 * Document scan overlay component
 *
 * Renders a canvas overlay on top of the video feed showing the detected
 * document boundary with colour-coded feedback (blue = detected, green = ready).
 */

import React, { useEffect, useRef, useCallback } from 'react';
import type { DocumentBoundary, OverlayState } from '@/lib/detection/documentDetector';

interface DocumentScanOverlayProps {
  boundary: DocumentBoundary | null;
  overlayState: OverlayState;
  containerRef: React.RefObject<HTMLElement | null>;
}

/**
 * Overlay canvas that draws the document detection rectangle
 */
export function DocumentScanOverlay({
  boundary,
  overlayState,
  containerRef,
}: DocumentScanOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerSizeRef = useRef({ width: 0, height: 0 });

  // Update canvas size to match container
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();

    // Only update if size changed
    if (
      rect.width !== containerSizeRef.current.width ||
      rect.height !== containerSizeRef.current.height
    ) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      containerSizeRef.current = { width: rect.width, height: rect.height };
    }
  }, [containerRef]);

  // Draw the overlay
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Don't draw if no boundary or no detection
    if (!boundary || overlayState === 'none') return;

    // Set stroke style based on state
    const strokeColor = overlayState === 'ready' ? '#22C55E' : '#3B82F6'; // green : blue
    const glowColor = overlayState === 'ready' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)';

    // Draw glow effect
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw rectangle
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';

    // Draw rounded rectangle
    const radius = 8;
    const x = boundary.x;
    const y = boundary.y;
    const w = boundary.width;
    const h = boundary.height;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw corner markers for "ready" state
    if (overlayState === 'ready') {
      const cornerLength = Math.min(20, w * 0.1, h * 0.1);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 4;

      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(x, y + cornerLength);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerLength, y);
      ctx.stroke();

      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLength, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerLength);
      ctx.stroke();

      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(x + w, y + h - cornerLength);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w - cornerLength, y + h);
      ctx.stroke();

      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(x + cornerLength, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + h - cornerLength);
      ctx.stroke();
    }
  }, [boundary, overlayState]);

  // Update canvas size when container resizes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial size update
    updateCanvasSize();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, updateCanvasSize]);

  // Redraw when boundary or state changes
  useEffect(() => {
    updateCanvasSize();
    drawOverlay();
  }, [boundary, overlayState, updateCanvasSize, drawOverlay]);

  // Don't render if no detection
  if (overlayState === 'none') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      data-testid="document-scan-overlay"
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
