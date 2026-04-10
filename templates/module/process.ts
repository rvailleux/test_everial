/**
 * Processing Logic for [MODULE_NAME]
 *
 * Handles document processing via WIZIDEE APIs.
 * Implements the standard two-phase workflow:
 *   1. Recognition - identify document type
 *   2. Analysis - extract data fields
 *
 * This function is called by the kernel when the user clicks "Process"
 * with a captured snapshot.
 *
 * @example
 * ```typescript
 * // In your module index.ts:
 * import { processDocument } from './process';
 *
 * export const myModule: WizideeModule<MyConfig> = {
 *   // ... other properties
 *   process: processDocument,
 * };
 * ```
 */

import { WizideeResult } from '@/lib/modules';
import type { MODULE_IDConfig } from './ConfigComponent';

/**
 * Recognition response from WIZIDEE /recognize endpoint
 */
interface RecognizeResponse {
  /** Database ID - identifies the document model */
  dbId: string;
  /** RAD ID - document instance identifier */
  radId: string;
  /** Document type classification */
  dbtype?: string;
  /** Recognition confidence score (0-1) */
  confidence?: number;
}

/**
 * Process a document snapshot
 *
 * Implements the standard WIZIDEE processing pipeline:
 * 1. Convert Blob to File for upload
 * 2. Call /recognize to identify document type
 * 3. Call /analyze to extract data fields
 * 4. Return structured result
 *
 * @param snapshot - The image blob captured from video stream
 * @param config - Module configuration options from ConfigComponent
 * @returns Promise<WizideeResult> - Processing result with extracted data or error
 *
 * @throws Never - All errors are caught and returned as WizideeResult
 */
export async function processDocument(
  snapshot: Blob,
  config: MODULE_IDConfig
): Promise<WizideeResult> {
  // Check if processing is enabled
  if (!config.enabled) {
    return {
      success: false,
      error: 'Processing is disabled in configuration',
    };
  }

  try {
    // Convert Blob to File for upload
    // The filename doesn't matter for processing but helps with debugging
    const file = new File([snapshot], 'snapshot.png', { type: 'image/png' });

    // ============================================================================
    // STEP 1: Document Recognition
    // ============================================================================
    // Call WIZIDEE /recognize endpoint to identify document type
    // This returns dbId and radId needed for analysis

    const recognizeFormData = new FormData();
    recognizeFormData.append('file', file);

    const recognizeResponse = await fetch('/api/wizidee/recognize', {
      method: 'POST',
      body: recognizeFormData,
    });

    if (!recognizeResponse.ok) {
      const errorData = await recognizeResponse.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Recognition failed: ${recognizeResponse.statusText}`);
    }

    const recognition = (await recognizeResponse.json()) as RecognizeResponse;

    // Validate recognition result
    if (!recognition.dbId || !recognition.radId) {
      return {
        success: false,
        error: 'Could not identify document type. Please ensure the document is clearly visible.',
      };
    }

    // Optional: Check confidence threshold from config
    if (config.confidenceThreshold > 0 &&
        recognition.confidence !== undefined &&
        recognition.confidence < config.confidenceThreshold) {
      return {
        success: false,
        error: `Document recognition confidence (${(recognition.confidence * 100).toFixed(1)}%) is below threshold (${(config.confidenceThreshold * 100).toFixed(1)}%)`,
      };
    }

    // ============================================================================
    // STEP 2: Document Analysis
    // ============================================================================
    // Call WIZIDEE /analyze endpoint to extract data fields
    // Requires dbId and radId from recognition step

    const analyzeFormData = new FormData();
    analyzeFormData.append('file', file);
    analyzeFormData.append('dbId', recognition.dbId);
    analyzeFormData.append('radId', recognition.radId);

    const analyzeResponse = await fetch('/api/wizidee/analyze', {
      method: 'POST',
      body: analyzeFormData,
    });

    if (!analyzeResponse.ok) {
      const errorData = await analyzeResponse.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Analysis failed: ${analyzeResponse.statusText}`);
    }

    const analysis = await analyzeResponse.json();

    // ============================================================================
    // STEP 3: Return Successful Result
    // ============================================================================
    return {
      success: true,
      data: analysis,
      // Include raw responses if requested or for debugging
      raw: config.includeRawResponse ? {
        recognition,
        analysis,
      } : undefined,
    };

  } catch (error) {
    // Catch all errors and return as failed result
    // This ensures the UI always receives a valid WizideeResult
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred during processing',
    };
  }
}

/**
 * Default export for convenient imports
 *
 * @example
 * ```typescript
 * import processDocument from './process';
 * ```
 */
export default processDocument;
