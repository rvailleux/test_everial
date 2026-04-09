'use client';

import React from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';

export default function CallControls() {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const handleToggleAudio = async () => {
    if (localParticipant) {
      try {
        await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
      } catch (error) {
        console.error('Failed to toggle microphone:', error);
      }
    }
  };

  const handleToggleVideo = async () => {
    if (localParticipant) {
      try {
        await localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
      } catch (error) {
        console.error('Failed to toggle camera:', error);
      }
    }
  };

  const handleLeave = async () => {
    if (room) {
      await room.disconnect();
      // Reload page to return to room entry form
      window.location.reload();
    }
  };

  const audioEnabled = localParticipant?.isMicrophoneEnabled ?? false;
  const videoEnabled = localParticipant?.isCameraEnabled ?? false;

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Audio toggle button */}
      <button
        onClick={handleToggleAudio}
        disabled={!localParticipant}
        className={`px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          audioEnabled
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        }`}
        aria-label={audioEnabled ? 'Mute' : 'Unmute'}
      >
        {audioEnabled ? 'Mute' : 'Unmute'}
      </button>

      {/* Video toggle button */}
      <button
        onClick={handleToggleVideo}
        disabled={!localParticipant}
        className={`px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          videoEnabled
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-red-600 hover:bg-red-700'
        }`}
        aria-label={videoEnabled ? 'Camera Off' : 'Camera On'}
      >
        {videoEnabled ? 'Camera Off' : 'Camera On'}
      </button>

      {/* Leave button */}
      <button
        onClick={handleLeave}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        aria-label="Leave"
      >
        Leave
      </button>
    </div>
  );
}
