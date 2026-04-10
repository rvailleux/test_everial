/**
 * Tests for Proof of Address Module Types
 */

import {
  AddressConfig,
  AddressData,
  AddressDocumentCategory,
  categoryLabels,
} from '@/modules/proof-address/types';

describe('proof-address types', () => {
  describe('categoryLabels', () => {
    it('should have labels for all document categories', () => {
      const categories: AddressDocumentCategory[] = ['utility', 'tax', 'telecom', 'auto'];
      
      for (const category of categories) {
        expect(categoryLabels[category]).toBeDefined();
        expect(typeof categoryLabels[category]).toBe('string');
        expect(categoryLabels[category].length).toBeGreaterThan(0);
      }
    });

    it('should have correct labels for each category', () => {
      expect(categoryLabels.utility).toContain('Utility');
      expect(categoryLabels.utility).toContain('EDF');
      
      expect(categoryLabels.tax).toContain('Tax');
      expect(categoryLabels.tax).toContain('imposition');
      
      expect(categoryLabels.telecom).toContain('Telecom');
      
      expect(categoryLabels.auto).toContain('Auto');
    });
  });

  describe('AddressConfig interface', () => {
    it('should accept valid configuration objects', () => {
      const validConfigs: AddressConfig[] = [
        { documentCategory: 'utility', includeRawResponse: false },
        { documentCategory: 'tax', includeRawResponse: true },
        { documentCategory: 'telecom', includeRawResponse: false },
        { documentCategory: 'auto', includeRawResponse: true },
      ];

      for (const config of validConfigs) {
        expect(config.documentCategory).toBeDefined();
        expect(config.includeRawResponse).toBeDefined();
        expect(typeof config.includeRawResponse).toBe('boolean');
      }
    });
  });

  describe('AddressData interface', () => {
    it('should accept valid address data objects', () => {
      const validData: AddressData[] = [
        {
          adresse: '123 Rue de Paris, 75001 Paris',
          rue: '123 Rue de Paris',
          codePostal: '75001',
          ville: 'Paris',
          pays: 'France',
          emetteur: 'EDF',
          dateDocument: '2024-01-15',
          reference: 'FAC-123456',
          confidence: 0.95,
        },
        {
          adresse: null,
          rue: null,
          codePostal: null,
          ville: null,
          pays: null,
          emetteur: null,
          dateDocument: null,
          reference: null,
        },
      ];

      for (const data of validData) {
        expect(data).toBeDefined();
      }
    });

    it('should work with partial address data', () => {
      const partialData: AddressData = {
        adresse: '123 Rue de Paris',
        rue: '123 Rue de Paris',
        codePostal: null,
        ville: null,
        pays: null,
        emetteur: 'Orange',
        dateDocument: '2024-03-01',
        reference: null,
      };

      expect(partialData.adresse).toBe('123 Rue de Paris');
      expect(partialData.emetteur).toBe('Orange');
      expect(partialData.codePostal).toBeNull();
    });
  });
});
