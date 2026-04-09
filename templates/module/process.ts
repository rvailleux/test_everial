/**
 * Processing Logic for [MODULE_NAME]
 *
 * Handles document processing via WIZIDEE APIs.
 */

import { WizideeResult } from '@/lib/modules';
import { MODULE_IDConfig } from './ConfigComponent';

/**
 * Process a document snapshot
 * @param snapshot - The image blob to process
 * @param config - Module configuration options
 * @returns Processing result with extracted data or error
 */
export async function processDocument(
  snapshot: Blob,
  config: MODULE_IDConfig
): Promise<WizideeResult> {
  if (!config.enabled) {
    return {
      success: false,
      error: 'Processing is disabled in configuration',
    };
  }

  try {
    // Step 1: Call WIZIDEE /recognize endpoint
    const recognizeFormData = new FormData();
    recognizeFormData.append('file', snapshot);

    const recognizeResponse = await fetch('/api/wizidee/recognize', {
      method: 'POST',
      body: recognizeFormData,
    });

    if (!recognizeResponse.ok) {
      throw new Error(`Recognition failed: ${recognizeResponse.statusText}`);
    }

    const recognition = await recognizeResponse.json();

    if (!recognition.dbId || !recognition.radId) {
      return {
        success: false,
        error: 'Could not identify document type',
      };
    }

    // Step 2: Call WIZIDEE /analyze endpoint
    const analyzeFormData = new FormData();
    analyzeFormData.append('file', snapshot);
    analyzeFormData.append('dbId', recognition.dbId);
    analyzeFormData.append('radId', recognition.radId);

    const analyzeResponse = await fetch('/api/wizidee/analyze', {
      method: 'POST',
      body: analyzeFormData,
    });

    if (!analyzeResponse.ok) {
      throw new Error(`Analysis failed: ${analyzeResponse.statusText}`);
    }

    const analysis = await analyzeResponse.json();

    // Step 3: Return successful result
    return {
      success: true,
      data: analysis,
      raw: {
        recognition,
        analysis,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export default processDocument;
