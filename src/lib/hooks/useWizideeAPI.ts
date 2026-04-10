/**
 * useWizideeAPI Hook
 *
 * Frontend hook for calling WIZIDEE proxy routes.
 * Provides type-safe access to document recognition and analysis.
 */

'use client';

import { useState, useCallback } from 'react';

interface WizideeAPIState {
  isLoading: boolean;
  error: string | null;
}

interface RecognizeResult {
  dbId: string;
  radId: string;
  dbtype?: string;
  confidence?: number;
}

interface AnalyzeResult {
  success: boolean;
  data?: Record<string, unknown>;
  raw?: unknown;
}

interface UseWizideeAPIReturn extends WizideeAPIState {
  recognize: (file: File) => Promise<RecognizeResult>;
  analyze: (file: File, dbId: string, radId: string) => Promise<AnalyzeResult>;
  clearError: () => void;
}

/**
 * Hook for interacting with WIZIDEE API proxy routes
 * @returns Object with recognize/analyze functions and loading state
 */
export function useWizideeAPI(): UseWizideeAPIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const recognize = useCallback(async (file: File): Promise<RecognizeResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/wizidee/recognize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result as RecognizeResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyze = useCallback(async (
    file: File,
    dbId: string,
    radId: string
  ): Promise<AnalyzeResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dbId', dbId);
      formData.append('radId', radId);

      const response = await fetch('/api/wizidee/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        raw: result,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return {
        success: false,
        error: message,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    recognize,
    analyze,
    clearError,
  };
}
