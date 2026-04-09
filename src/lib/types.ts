export type DocumentSource = 'upload' | 'camera';

export interface DocumentFile {
  file: File;
  source: DocumentSource;
  capturedAt: Date;
}

export interface RecognizeResponse {
  dbId: string;
  radId: string;
  documentType?: string;
}

export interface ExtractionResult {
  fields: Record<string, string | null>;
  raw: unknown;
}

export type ProcessingState =
  | 'idle'
  | 'recognizing'
  | 'analyzing'
  | 'done'
  | 'error';

export interface ExtractionError {
  error: string;
  step?: 'recognize' | 'analyze' | 'auth';
  statusCode?: number;
}

export interface TokenCache {
  value: string;
  expiresAt: number;
}

// --- Video Call Types (ApiRTC) ---

export type CallStatus =
  | 'idle'        // Not joined — showing the room-name input form
  | 'joining'     // Connecting to ApiRTC (fetching API key, registering UserAgent)
  | 'waiting'     // Joined but no remote peer yet
  | 'connected'   // Remote peer stream received and active
  | 'error'       // Connection or permission failure
  | 'left';       // User clicked Leave; resources released

export interface LocalMediaState {
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export interface CallError {
  message: string;
  cause?: 'permission-denied' | 'connection-failed' | 'session-fetch-failed';
}
