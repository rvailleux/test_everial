/**
 * Types for Proof of Income Module
 *
 * Defines configuration and result types for income document processing.
 */

/**
 * Document type options for proof of income
 */
export type IncomeDocumentType = 'payslip' | 'tax_notice' | 'auto';

/**
 * Configuration for proof of income document processing
 */
export interface IncomeConfig {
  /** Document type: payslip, tax notice, or auto-detect */
  documentType: IncomeDocumentType;
  /** Whether to include the raw API response in results */
  includeRawResponse: boolean;
}

/**
 * Extracted income data fields
 */
export interface IncomeData {
  /** Income/revenue amount */
  revenus: string | null;
  /** Employer name (for payslip) or tax authority (for tax notice) */
  employeur: string | null;
  /** Period covered by the document (e.g., "January 2024", "2023") */
  periode: string | null;
  /** Net pay amount (for payslip) */
  netPay: string | null;
  /** Gross pay amount (for payslip) */
  grossPay: string | null;
  /** Employee name */
  employeeName: string | null;
  /** Document date */
  dateDocument: string | null;
  /** Tax year (for tax notice) */
  taxYear: string | null;
  /** Confidence score for extraction */
  confidence?: number;
}

/**
 * Document type display names for UI
 */
export const documentTypeLabels: Record<IncomeDocumentType, string> = {
  payslip: 'Pay Slip (Bulletin de salaire)',
  tax_notice: 'Tax Notice (Avis d\'imposition)',
  auto: 'Auto-detect',
};
