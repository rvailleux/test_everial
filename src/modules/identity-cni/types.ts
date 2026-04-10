/**
 * Types for Identity CNI/Passport Module
 *
 * Defines configuration and result types for identity document processing.
 */

/**
 * Document type options for identity verification
 */
export type DocumentType = 'cni' | 'passport';

/**
 * Region options for identity documents
 */
export type Region = 'FR' | 'EU' | 'OTHER';

/**
 * Configuration for identity document processing
 */
export interface IdentityConfig {
  /** Document type: CNI or Passport */
  documentType: DocumentType;
  /** Region of the document */
  region: Region;
}

/**
 * Extracted identity data fields
 */
export interface IdentityData {
  /** Last name */
  nom: string | null;
  /** First name */
  prenom: string | null;
  /** Birth date */
  dateNaissance: string | null;
  /** Expiration date */
  dateExpiration: string | null;
  /** MRZ (Machine Readable Zone) */
  mrz: string | null;
}
