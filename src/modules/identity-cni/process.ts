/**
 * Processing logic for Identity CNI/Passport Module
 *
 * Implements the WIZIDEE recognize→analyze flow for identity documents.
 * Extracts: nom, prénom, date de naissance, date d'expiration, MRZ
 */

import { WizideeResult } from '@/lib/modules/types';
import { IdentityConfig, IdentityData } from './types';

/**
 * Recognize response from WIZIDEE API
 */
interface RecognizeResponse {
  dbId: string;
  radId: string;
  documentType?: string;
  confidence?: number;
}

/**
 * Analyze response from WIZIDEE API
 */
interface AnalyzeResponse {
  fields?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Process an identity document through WIZIDEE recognize→analyze flow
 *
 * @param snapshot - The document image blob
 * @param config - Module configuration (document type, region)
 * @returns Promise resolving to extraction results
 */
export async function process(
  snapshot: Blob,
  config: IdentityConfig
): Promise<WizideeResult> {
  try {
    // Step 1: Recognize the document
    const recognizeResult = await recognizeDocument(snapshot);

    if (!recognizeResult.dbId || !recognizeResult.radId) {
      return {
        success: false,
        error: 'Document recognition failed: could not identify document',
      };
    }

    // Step 2: Analyze the document for data extraction
    const analyzeResult = await analyzeDocument(
      snapshot,
      recognizeResult.dbId,
      recognizeResult.radId
    );

    // Step 3: Extract identity fields from the analysis result
    const identityData = extractIdentityData(analyzeResult);

    return {
      success: true,
      data: identityData,
      raw: analyzeResult,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Processing failed: ${errorMessage}`,
    };
  }
}

/**
 * Call WIZIDEE recognize endpoint via proxy
 *
 * @param file - Document image blob
 * @returns Recognize response with dbId and radId
 */
async function recognizeDocument(file: Blob): Promise<RecognizeResponse> {
  const formData = new FormData();
  formData.append('file', file, 'document.png');

  const response = await fetch('/api/wizidee/recognize', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Recognize failed: HTTP ${response.status}`);
  }

  return response.json() as Promise<RecognizeResponse>;
}

/**
 * Call WIZIDEE analyze endpoint via proxy
 *
 * @param file - Document image blob
 * @param dbId - Database ID from recognize step
 * @param radId - RAD ID from recognize step
 * @returns Analyze response with extracted fields
 */
async function analyzeDocument(
  file: Blob,
  dbId: string,
  radId: string
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append('file', file, 'document.png');
  formData.append('dbId', dbId);
  formData.append('radId', radId);

  const response = await fetch('/api/wizidee/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Analyze failed: HTTP ${response.status}`);
  }

  return response.json() as Promise<AnalyzeResponse>;
}

/**
 * Extract identity-specific fields from WIZIDEE analyze response
 *
 * Maps various possible field names from WIZIDEE to our standard IdentityData structure.
 *
 * @param analyzeResult - Raw analyze response from WIZIDEE
 * @returns Structured identity data
 */
function extractIdentityData(analyzeResult: AnalyzeResponse): IdentityData {
  const fields = analyzeResult.fields || {};

  return {
    nom: extractField(fields, ['nom', 'lastName', 'surname', 'familyName', 'nomDeFamille']),
    prenom: extractField(fields, ['prenom', 'firstName', 'givenName', 'prenoms']),
    dateNaissance: extractField(fields, ['dateNaissance', 'birthDate', 'dateOfBirth', 'birthdate', 'date_de_naissance']),
    dateExpiration: extractField(fields, ['dateExpiration', 'expiryDate', 'expirationDate', 'date_d_expiration']),
    mrz: extractMrz(fields),
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
      return String(value);
    }
  }
  return null;
}

/**
 * Extract MRZ from fields, handling both single field and line-based formats
 *
 * @param fields - Field dictionary from WIZIDEE
 * @returns MRZ string or null
 */
function extractMrz(fields: Record<string, unknown>): string | null {
  // Try single mrz field (don't include mrzLine1 here - that's for two-line MRZ)
  const mrzKeys = ['mrz', 'MRZ', 'machineReadableZone'];
  const singleMrz = extractField(fields, mrzKeys);
  if (singleMrz) {
    return singleMrz;
  }

  // Try multi-line MRZ (line1 + line2)
  const line1 = extractField(fields, ['mrzLine1', 'mrz1', 'line1']);
  const line2 = extractField(fields, ['mrzLine2', 'mrz2', 'line2']);

  if (line1 && line2) {
    return `${line1}\n${line2}`;
  }

  // Try to find any field that might contain MRZ-like content
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string' && isMrzLike(value)) {
      return value;
    }
  }

  return null;
}

/**
 * Check if a string looks like MRZ (machine readable zone)
 *
 * @param value - String to check
 * @returns True if the string looks like MRZ
 */
function isMrzLike(value: string): boolean {
  // MRZ lines are typically 44 characters with uppercase letters, numbers, and <
  const mrzPattern = /^[A-Z0-9<]{30,44}$/;
  return mrzPattern.test(value.replace(/\s/g, ''));
}
