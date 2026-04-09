'use client';

import React, { useEffect, useState } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import type { ConnectionState } from 'livekit-client';
import VideoGrid from './VideoGrid';
import CallControls from './CallControls';

interface Props {
  roomName: string;
}

interface TokenResponse {
  participant_token: string;
  server_url: string;
  participant_name: string;
  room_name: string;
}

export default function LiveKitVideoCall({ roomName }: Props) {
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  // Fetch token on mount
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            room_name: roomName,
            participant_identity: `user_${Math.random().toString(36).substring(7)}`,
            participant_name: 'Participant',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get token');
        }

        const data: TokenResponse = await response.json();
        setTokenData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [roomName]);

  const handleConnected = () => {
    console.log('Connected to LiveKit room');
  };

  const handleDisconnected = (reason?: string) => {
    console.log('Disconnected from LiveKit room:', reason);
  };

  const handleError = (err: Error) => {
    console.error('LiveKit connection error:', err);
    setError(err.message);
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Ready';
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'text-green-600';
      case 'connecting':
      case 'reconnecting':
        return 'text-amber-600';
      case 'disconnected':
        return 'text-red-600';
      default:
        return 'text-zinc-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="text-zinc-600">Loading video call...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="text-red-600">Failed to initialize video call</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl">
      {/* Status indicator */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 rounded-lg">
        <span className="text-sm font-medium text-zinc-700">
          Room: <span className="text-zinc-900">{roomName}</span>
        </span>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* LiveKit Room */}
      <LiveKitRoom
        token={tokenData.participant_token}
        serverUrl={tokenData.server_url}
        connect={true}
        audio={true}
        video={true}
        options={{
          adaptiveStream: true,
          dynacast: true,
        }}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        onError={handleError}
        data-lk-theme="default"
        className="flex flex-col gap-4"
      >
        {/* Video grid */}
        <VideoGrid onConnectionStateChange={setConnectionState} />

        {/* Call controls */}
        <CallControls />
      </LiveKitRoom>
    </div>
  );
}
