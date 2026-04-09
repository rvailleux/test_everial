/**
 * useModuleProcess Hook
 *
 * Handles document processing for the active module.
 */

'use client';

import { useState, useCallback } from 'react';
import { useActiveModule } from './useActiveModule';
import { useModuleConfig } from './useModuleConfig';
import { WizideeResult } from '@/lib/modules/types';

interface UseModuleProcessReturn {
  /** Current processing result */
  result: WizideeResult | null;
  /** Whether processing is in progress */
  isProcessing: boolean;
  /** Error message if processing failed */
  error: string | null;
  /** Execute processing with snapshot */
  process: (snapshot: Blob) => Promise<void>;
  /** Clear the current result */
  clearResult: () => void;
}

/**
 * Hook to execute module processing
 * @returns Processing state and controls
 */
export function useModuleProcess(): UseModuleProcessReturn {
  const { activeModule } = useActiveModule();
  const { config } = useModuleConfig();
  const [result, setResult] = useState<WizideeResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const process = useCallback(
    async (snapshot: Blob) => {
      if (!activeModule) {
        setError('No active module selected');
        return;
      }

      setIsProcessing(true);
      setError(null);
      setResult(null);

      try {
        const processResult = await activeModule.process(snapshot, config);
        setResult(processResult);

        if (!processResult.success) {
          setError(processResult.error || 'Processing failed');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setResult({
          success: false,
          error: errorMessage,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [activeModule, config]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isProcessing,
    error,
    process,
    clearResult,
  };
}
