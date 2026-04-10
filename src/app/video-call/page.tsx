'use client';

import React, { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ModuleProvider } from '@/lib/context/ModuleProvider';
import { ModuleSelector } from '@/components/ModuleSelector';
import { ModuleConfigPanel } from '@/components/ModuleConfigPanel';
import { ActionBar } from '@/components/ActionBar';
import { SnapshotCapture } from '@/components/SnapshotCapture';
import { SnapshotDisplay } from '@/components/SnapshotDisplay';
import { useActiveModule } from '@/lib/hooks/useActiveModule';
import { useModuleProcess } from '@/lib/hooks/useModuleProcess';

// Dynamically import LiveKitVideoCall with SSR disabled
const LiveKitVideoCall = dynamic(() => import('@/components/LiveKitVideoCall'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-zinc-200 shadow-sm min-h-[400px]">
      <div className="text-zinc-600">Loading video call...</div>
    </div>
  ),
});

/**
 * Inner content of the kernel page.
 * Separated to use hooks within ModuleProvider context.
 */
function VideoCallKernel() {
  const [roomName, setRoomName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [snapshot, setSnapshot] = useState<Blob | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const { activeModule } = useActiveModule();
  const { result, isProcessing, error, process, clearResult } = useModuleProcess();

  /**
   * Capture a snapshot from the local video stream
   */
  const handleCapture = useCallback(() => {
    if (!videoContainerRef.current) return;

    // Find the local video element within the LiveKit component
    const videoElement = videoContainerRef.current.querySelector('video');
    if (!videoElement) {
      console.error('Video element not found');
      return;
    }

    // Check if video is ready
    if (videoElement.readyState < 2) {
      console.error('Video not ready');
      return;
    }

    setIsCapturing(true);

    try {
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not create canvas context');
        setIsCapturing(false);
        return;
      }

      // Draw video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to blob and update state
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Clean up previous snapshot URL
            if (snapshotUrl) {
              URL.revokeObjectURL(snapshotUrl);
            }
            setSnapshot(blob);
            setSnapshotUrl(URL.createObjectURL(blob));
            clearResult();
          }
          setIsCapturing(false);
        },
        'image/png',
        0.95
      );
    } catch (err) {
      console.error('Failed to capture snapshot:', err);
      setIsCapturing(false);
    }
  }, [snapshotUrl, clearResult]);

  /**
   * Process the captured snapshot with the active module
   */
  const handleProcess = useCallback(async () => {
    if (!snapshot || !activeModule) return;
    await process(snapshot);
  }, [snapshot, activeModule, process]);

  /**
   * Handle room join
   */
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      setHasJoined(true);
    }
  };

  // Pre-join state
  if (!hasJoined) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-zinc-900">Video Call</h1>
            <p className="text-zinc-600 mt-2">
              Connect with others and process documents with WIZIDEE
            </p>
          </header>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              Enter a Room
            </h2>
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="room" className="text-sm font-medium text-zinc-700">
                  Room Name
                </label>
                <input
                  id="room"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., team-meeting-123"
                  className="px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-zinc-500">
                  Share this room name with the person you want to call.
                </p>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Main kernel UI
  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">WIZIDEE Video Call</h1>
              <p className="text-zinc-600 mt-1">
                Room: <span className="font-medium text-zinc-900">{roomName}</span>
              </p>
            </div>
            <button
              onClick={() => {
                setHasJoined(false);
                setRoomName('');
                if (snapshotUrl) {
                  URL.revokeObjectURL(snapshotUrl);
                }
                setSnapshot(null);
                setSnapshotUrl(null);
                clearResult();
              }}
              className="px-4 py-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Leave Room
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Video and snapshot */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video container */}
            <div ref={videoContainerRef} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <LiveKitVideoCall roomName={roomName} />
            </div>

            {/* Action bar */}
            <ActionBar
              onCapture={handleCapture}
              onProcess={handleProcess}
              canProcess={!!snapshot && !!activeModule && !isProcessing}
              isProcessing={isProcessing}
              canCapture={hasJoined}
            />

            {/* Snapshot and Results Display */}
            {snapshotUrl && (
              <SnapshotDisplay
                snapshotUrl={snapshotUrl}
                result={result}
                error={error}
                ResultComponent={activeModule?.ResultComponent}
              />
            )}
          </div>

          {/* Right column: Module selector and config */}
          <div className="space-y-4">
            <ModuleSelector />
            <ModuleConfigPanel />
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Main video call page - the KERNEL
 * Wraps the kernel content in ModuleProvider for module registry access
 */
export default function VideoCallPage() {
  return (
    <ModuleProvider>
      <VideoCallKernel />
    </ModuleProvider>
  );
}
