'use client';

import React, { useState } from 'react';
import DocumentCapture from '@/components/DocumentCapture';
import ExtractionResult from '@/components/ExtractionResult';
import type { ProcessingState, ExtractionResult as ExtractionResultType } from '@/lib/types';

const ERROR_MESSAGES: Record<string, string> = {
  'Recognition failed': 'Could not identify document — please retake or re-upload.',
  'Extraction failed': 'Could not extract fields — please retake or re-upload.',
  'File too large': 'File too large — maximum 10 MB.',
  'Unsupported format': 'Unsupported format — please use JPEG or PNG.',
  'Service unavailable': 'Service unavailable — please try again.',
};

function friendlyError(msg: string): string {
  for (const [key, friendly] of Object.entries(ERROR_MESSAGES)) {
    if (msg.includes(key)) return friendly;
  }
  return msg;
}

export default function UC1Page() {
  const [state, setState] = useState<ProcessingState>('idle');
  const [result, setResult] = useState<ExtractionResultType | null>(null);
  const [documentType, setDocumentType] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string>('');

  async function handleCapture(file: File) {
    setState('recognizing');
    setResult(null);
    setErrorMessage('');

    try {
      // Step 1: Recognize
      const recognizeForm = new FormData();
      recognizeForm.append('file', file);

      const recognizeRes = await fetch('/api/wizidee/recognize', {
        method: 'POST',
        body: recognizeForm,
      });

      if (!recognizeRes.ok) {
        const err = await recognizeRes.json();
        throw new Error(err.error ?? 'Recognition failed');
      }

      const { dbId, radId, documentType: docType } = await recognizeRes.json();
      setDocumentType(docType);

      // Step 2: Analyze
      setState('analyzing');

      const analyzeForm = new FormData();
      analyzeForm.append('file', file);
      analyzeForm.append('dbId', dbId);
      analyzeForm.append('radId', radId);

      const analyzeRes = await fetch('/api/wizidee/analyze', {
        method: 'POST',
        body: analyzeForm,
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error ?? 'Extraction failed');
      }

      const extraction = await analyzeRes.json();
      setResult(extraction);
      setState('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(friendlyError(msg));
      setState('error');
    }
  }

  function handleRetry() {
    setState('idle');
    setResult(null);
    setErrorMessage('');
    setDocumentType(undefined);
  }

  const isLoading = state === 'recognizing' || state === 'analyzing';

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-sm text-zinc-500 hover:text-zinc-700">← Back</a>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">Identity Verification</h1>
          <p className="mt-1 text-zinc-500 text-sm">Upload or capture a CNI or passport to extract identity fields.</p>
        </div>

        {/* Document capture */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <DocumentCapture onCapture={handleCapture} isLoading={isLoading} />
        </div>

        {/* Loading states */}
        {state === 'recognizing' && (
          <div className="flex items-center gap-3 text-zinc-600 py-4">
            <span className="animate-spin text-blue-500">⟳</span>
            <span>Identifying document…</span>
          </div>
        )}
        {state === 'analyzing' && (
          <div className="flex items-center gap-3 text-zinc-600 py-4">
            <span className="animate-spin text-blue-500">⟳</span>
            <span>Extracting fields…</span>
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700 font-medium">{errorMessage}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-full hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {state === 'done' && result && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <ExtractionResult result={result} documentType={documentType} />
          </div>
        )}
      </div>
    </div>
  );
}
