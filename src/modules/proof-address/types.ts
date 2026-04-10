/**
 * Types for Proof of Address Module
 *
 * Defines configuration and result types for address document processing.
 */

/**
 * Document category options for proof of address
 */
export type AddressDocumentCategory = 'utility' | 'tax' | 'telecom' | 'auto';

/**
 * Configuration for proof of address document processing
 */
export interface AddressConfig {
  /** Document category: utility bill, tax notice, telecom bill, or auto-detect */
  documentCategory: AddressDocumentCategory;
  /** Whether to include the raw API response in results */
  includeRawResponse: boolean;
}

/**
 * Extracted address data fields
 */
export interface AddressData {
  /** Complete address (street, city, postal code) */
  adresse: string | null;
  /** Street address line */
  rue: string | null;
  /** Postal code */
  codePostal: string | null;
  /** City */
  ville: string | null;
  /** Country */
  pays: string | null;
  /** Document issuer (EDF, Orange, Impôts, etc.) */
  emetteur: string | null;
  /** Document date */
  dateDocument: string | null;
  /** Document reference/number */
  reference: string | null;
  /** Confidence score for extraction */
  confidence?: number;
}

/**
 * Category display names for UI
 */
export const categoryLabels: Record<AddressDocumentCategory, string> = {
  utility: 'Utility Bill (EDF, Water, Gas)',
  tax: 'Tax Notice (Avis d\'imposition)',
  telecom: 'Telecom Bill (Internet, Phone)',
  auto: 'Auto-detect',
};
