/**
 * Processing Logic for RIB Extraction Module
 *
 * Handles document processing via WIZIDEE APIs.
 * Implements the standard two-phase workflow:
 *   1. Recognition - identify document type (dbtype: rib)
 *   2. Analysis - extract banking data fields
 */

import { WizideeResult } from '@/lib/modules/types';
import { RibConfig, RibData } from './types';

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
 * Analyze response from WIZIDEE /analyze endpoint
 */
interface AnalyzeResponse {
  fields?: Record<string, unknown>;
  confidence?: number;
  [key: string]: unknown;
}

/**
 * Process a document snapshot for RIB extraction
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
export async function process(
  snapshot: Blob,
  _config: RibConfig
): Promise<WizideeResult> {
  try {
    // Convert Blob to File for upload
    const file = new File([snapshot], 'rib-document.png', { type: 'image/png' });

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
        error: 'Could not identify document type. Please ensure the RIB is clearly visible.',
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

    const analysis = (await analyzeResponse.json()) as AnalyzeResponse;

    // ============================================================================
    // STEP 3: Extract RIB Data
    // ============================================================================
    const ribData = extractRibData(analysis);

    // ============================================================================
    // STEP 4: Return Successful Result
    // ============================================================================
    return {
      success: true,
      data: ribData,
      raw: analysis,
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
 * Extract RIB-specific fields from WIZIDEE analyze response
 *
 * Maps various possible field names from WIZIDEE to our standard RibData structure.
 *
 * @param analyzeResult - Raw analyze response from WIZIDEE
 * @returns Structured RIB data
 */
function extractRibData(analyzeResult: AnalyzeResponse): RibData {
  const fields = analyzeResult.fields || {};
  const confidence = analyzeResult.confidence;

  return {
    iban: extractField(fields, ['iban', 'IBAN', 'accountNumber', 'numeroCompte', 'numero_iban']),
    bic: extractField(fields, ['bic', 'BIC', 'swift', 'SWIFT', 'swiftCode', 'code_bic', 'code_swift']),
    banque: extractField(fields, ['banque', 'bank', 'bankName', 'nomBanque', 'nom_banque', 'etablissement']),
    titulaire: extractField(fields, ['titulaire', 'holder', 'accountHolder', 'nomTitulaire', 'nom_titulaire', 'proprietaire']),
    codeGuichet: extractField(fields, ['codeGuichet', 'branchCode', 'guichet', 'code_guichet', 'agence']),
    numeroCompte: extractField(fields, ['numeroCompte', 'accountNumber', 'compte', 'numero_compte', 'numero']),
    codeBanque: extractField(fields, ['codeBanque', 'bankCode', 'code_banque', 'etablissement']),
    cleRib: extractField(fields, ['cleRib', 'ribKey', 'cle_rib', 'key']),
    confidence: confidence,
  };
}

/**
 * Extract a field value trying multiple possible key names
 *
 * @param fields - Field dictionary from WIZIDEE
 * @param possibleKeys - Array of possible field names to try
 * @returns The first found value or null
 */
function extractField(fields: Record<string, unknown>, possibleKeys: string[]): string | null {
  for (const key of possibleKeys) {
    const value = fields[key];
    if (value !== undefined && value !== null) {
      // Handle nested field objects (some APIs return { value: "...", confidence: 0.9 })
      if (typeof value === 'object' && value !== null && 'value' in value) {
        const fieldObj = value as { value: unknown };
        if (fieldObj.value !== undefined && fieldObj.value !== null) {
          return String(fieldObj.value);
        }
      }
      return String(value);
    }
  }
  return null;
}

export default process;
