'use client';

import React, { useEffect } from 'react';
import {
  useTracks,
  useConnectionState,
  VideoTrack,
  useLocalParticipant,
  useRemoteParticipants,
} from '@livekit/components-react';
import { Track, type ConnectionState } from 'livekit-client';

interface Props {
  onConnectionStateChange?: (state: ConnectionState) => void;
}

export default function VideoGrid({ onConnectionStateChange }: Props) {
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  // Get camera tracks with placeholders for participants without camera
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  // Notify parent of connection state changes
  useEffect(() => {
    onConnectionStateChange?.(connectionState);
  }, [connectionState, onConnectionStateChange]);

  // Filter tracks for local and remote participants (only those with actual publications)
  const localTrack = cameraTracks.find(
    (track) => track.participant.identity === localParticipant?.identity && track.publication
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Local video */}
      <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden">
        {localTrack ? (
          <VideoTrack
            trackRef={localTrack}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-zinc-500">
            <p>Camera not available</p>
          </div>
        )}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
          You ({localParticipant?.identity?.substring(0, 8) || '...'})
        </div>
        {localParticipant && !localParticipant.isCameraEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/80">
            <p className="text-zinc-400">Camera off</p>
          </div>
        )}
      </div>

      {/* Remote video */}
      <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden">
        {remoteParticipants.length > 0 ? (
          <>
            {remoteParticipants.map((participant) => {
              const trackRef = cameraTracks.find(
                (t) => t.participant.identity === participant.identity && t.publication
              );
              return trackRef ? (
                <VideoTrack
                  key={participant.identity}
                  trackRef={trackRef}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div key={participant.identity} className="flex items-center justify-center w-full h-full">
                  <p className="text-zinc-500">Participant joined, no video</p>
                </div>
              );
            })}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
              Remote ({remoteParticipants[0].identity.substring(0, 8)}...)
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-zinc-500">
            <div className="text-center">
              <p className="text-lg font-medium">Waiting for peer...</p>
              <p className="text-sm">Share the room name to invite someone</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
