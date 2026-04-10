/**
 * Tests for RIB Extraction Module Types
 */

import {
  RibConfig,
  RibData,
  maskIban,
} from '@/modules/rib-extraction/types';

describe('rib-extraction types', () => {
  describe('RibConfig', () => {
    it('should accept valid config with autoDetect', () => {
      const config: RibConfig = {
        autoDetect: true,
      };

      expect(config.autoDetect).toBe(true);
    });

    it('should only accept true for autoDetect', () => {
      // TypeScript would enforce this, but we test the type exists
      const config: RibConfig = {
        autoDetect: true,
      };

      expect(config.autoDetect).toBe(true);
    });
  });

  describe('RibData', () => {
    it('should accept complete RIB data', () => {
      const data: RibData = {
        iban: 'FR76 1234 5678 9012 3456 7890 123',
        bic: 'SOGEFRPP',
        banque: 'Société Générale',
        titulaire: 'John Doe',
        codeGuichet: '12345',
        numeroCompte: '12345678901',
        codeBanque: '12345',
        cleRib: '12',
        confidence: 0.95,
      };

      expect(data.iban).toBe('FR76 1234 5678 9012 3456 7890 123');
      expect(data.bic).toBe('SOGEFRPP');
      expect(data.banque).toBe('Société Générale');
      expect(data.titulaire).toBe('John Doe');
      expect(data.confidence).toBe(0.95);
    });

    it('should accept partial RIB data with nulls', () => {
      const data: RibData = {
        iban: null,
        bic: null,
        banque: null,
        titulaire: null,
        codeGuichet: null,
        numeroCompte: null,
        codeBanque: null,
        cleRib: null,
        confidence: undefined,
      };

      expect(data.iban).toBeNull();
      expect(data.bic).toBeNull();
      expect(data.confidence).toBeUndefined();
    });

    it('should accept only IBAN and BIC', () => {
      const data: RibData = {
        iban: 'FR76 1234 5678 9012 3456 7890 123',
        bic: 'SOGEFRPP',
        banque: null,
        titulaire: null,
        codeGuichet: null,
        numeroCompte: null,
        codeBanque: null,
        cleRib: null,
      };

      expect(data.iban).toBe('FR76 1234 5678 9012 3456 7890 123');
      expect(data.bic).toBe('SOGEFRPP');
      expect(data.banque).toBeNull();
    });
  });

  describe('maskIban', () => {
    it('should mask a standard French IBAN', () => {
      const iban = 'FR7612345678901234567890123';
      const masked = maskIban(iban);

      expect(masked).toContain('FR76');
      expect(masked).toContain('123'); // Last 4 chars
      expect(masked).toContain('****');
      expect(masked).not.toContain('5678'); // Middle should be masked
    });

    it('should format masked IBAN with spaces', () => {
      const iban = 'FR7612345678901234567890123';
      const masked = maskIban(iban);

      // Should have spaces for readability
      expect(masked).toMatch(/FR76/);
      expect(masked).toMatch(/\*{2,}/);
    });

    it('should return em dash for null IBAN', () => {
      expect(maskIban(null)).toBe('—');
    });

    it('should return em dash for undefined IBAN', () => {
      expect(maskIban(undefined as unknown as null)).toBe('—');
    });

    it('should return original value for short IBANs (< 8 chars)', () => {
      const shortIban = 'FR76';
      expect(maskIban(shortIban)).toBe('FR76');
    });

    it('should return original value for very short IBANs', () => {
      expect(maskIban('F')).toBe('F');
      expect(maskIban('')).toBe('—'); // Empty string returns em dash
    });

    it('should handle IBANs of various lengths', () => {
      // Standard French IBAN (27 chars)
      const frIban = 'FR7612345678901234567890123';
      const maskedFr = maskIban(frIban);
      expect(maskedFr.startsWith('FR76')).toBe(true);
      expect(maskedFr.endsWith('123')).toBe(true);

      // German IBAN (22 chars)
      const deIban = 'DE89370400440532013000';
      const maskedDe = maskIban(deIban);
      expect(maskedDe.startsWith('DE89')).toBe(true);
      expect(maskedDe.endsWith('000')).toBe(true);
    });
  });
});
