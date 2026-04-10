/**
 * Types for RIB (Bank Account) Module
 *
 * Defines configuration and result types for RIB document processing.
 */

/**
 * Configuration for RIB document processing
 * Note: RIB extraction is fully automatic - no configuration options needed
 */
export interface RibConfig {
  /** Auto-detect RIB document type */
  autoDetect: true;
}

/**
 * Extracted RIB banking data fields
 */
export interface RibData {
  /** IBAN (International Bank Account Number) */
  iban: string | null;
  /** BIC (Bank Identifier Code) / SWIFT code */
  bic: string | null;
  /** Bank name */
  banque: string | null;
  /** Account holder name */
  titulaire: string | null;
  /** Branch code / code guichet */
  codeGuichet: string | null;
  /** Account number / numéro de compte */
  numeroCompte: string | null;
  /** Bank code / code banque */
  codeBanque: string | null;
  /** RIB key / clé RIB */
  cleRib: string | null;
  /** Confidence score for extraction */
  confidence?: number;
}

/**
 * Mask an IBAN for display security
 * Shows first 4 and last 4 characters only
 * Example: FR76 **** **** **** **** **** 1234
 *
 * @param iban - The full IBAN string
 * @returns Masked IBAN string
 */
export function maskIban(iban: string | null): string {
  if (!iban || iban.length < 8) {
    return iban || '—';
  }

  const first4 = iban.slice(0, 4);
  const last4 = iban.slice(-4);
  const maskedLength = iban.length - 8;

  // Group masked characters in blocks of 4 for readability
  const maskedBlocks = '**** '.repeat(Math.ceil(maskedLength / 4)).trim();

  return `${first4} ${maskedBlocks} ${last4}`;
}
