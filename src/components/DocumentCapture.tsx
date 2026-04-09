'use client';

import React, { useRef, useState, useEffect } from 'react';

interface Props {
  onCapture: (file: File) => void;
  isLoading?: boolean;
}

export default function DocumentCapture({ onCapture, isLoading = false }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    // Client-side validation
    if (file.size > 10 * 1024 * 1024) {
      setClientError('File too large — maximum 10 MB');
      setSelectedFile(null);
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setClientError('Unsupported format — please use JPEG or PNG');
      setSelectedFile(null);
      return;
    }

    setClientError(null);
    setSelectedFile(file);
  }

  async function handleUseCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCameraActive(true);
      // Attach stream to video element after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 0);
    } catch {
      setCameraError(true);
    }
  }

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setCameraActive(false);
      setSelectedFile(file);
      onCapture(file);
    }, 'image/jpeg');
  }

  function handleAnalyze() {
    if (selectedFile) onCapture(selectedFile);
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* File upload area */}
      {!cameraActive && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700">
            Upload document image
          </label>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            disabled={isLoading}
            className="block w-full text-sm text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="text-sm text-zinc-500">{selectedFile.name}</p>
          )}
          {clientError && (
            <p className="text-sm text-red-600">{clientError}</p>
          )}
        </div>
      )}

      {/* Camera toggle (hidden if camera permission was denied) */}
      {!cameraActive && !cameraError && (
        <button
          type="button"
          onClick={handleUseCamera}
          disabled={isLoading}
          className="text-sm text-blue-600 underline self-start disabled:opacity-50"
        >
          Use Camera
        </button>
      )}

      {/* Live camera preview */}
      {cameraActive && (
        <div className="flex flex-col gap-2">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full max-w-sm rounded-lg border border-zinc-200"
          />
          <canvas ref={canvasRef} className="hidden" />
          <button
            type="button"
            onClick={handleCapture}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            Capture
          </button>
        </div>
      )}

      {/* Analyze button (upload flow) */}
      {!cameraActive && (
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!selectedFile || isLoading}
          className="px-6 py-2 bg-zinc-900 text-white rounded-full text-sm font-semibold hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading…' : 'Analyze'}
        </button>
      )}
    </div>
  );
}
