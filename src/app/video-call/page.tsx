'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import LiveKitVideoCall with SSR disabled to prevent
// LiveKit SDK from accessing window during server-side rendering
const LiveKitVideoCall = dynamic(() => import('@/components/LiveKitVideoCall'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-zinc-200 shadow-sm">
      <div className="text-zinc-600">Loading video call...</div>
    </div>
  ),
});

export default function VideoCallPage() {
  const [roomName, setRoomName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      setHasJoined(true);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Video Call</h1>
          <p className="text-zinc-600 mt-2">
            Connect with others using LiveKit powered video calls.
          </p>
        </header>

        {!hasJoined ? (
          <div className="max-w-md mx-auto bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
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
        ) : (
          <LiveKitVideoCall roomName={roomName} />
        )}
      </div>
    </main>
  );
}
