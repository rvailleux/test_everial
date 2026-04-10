/**
 * Tests for Proof of Address Module Process
 */

import { process } from '@/modules/proof-address/process';
import { AddressConfig } from '@/modules/proof-address/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('proof-address process', () => {
  const mockConfig: AddressConfig = {
    documentCategory: 'utility',
    includeRawResponse: false,
  };

  const mockBlob = new Blob(['test image'], { type: 'image/png' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful processing', () => {
    it('should complete recognize→analyze flow successfully', async () => {
      // Mock successful recognize response
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            dbId: 'db-123',
            radId: 'rad-456',
            documentType: 'address_proof',
          }),
        })
        // Mock successful analyze response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fields: {
              adresse: '123 Rue de Paris, 75001 Paris',
              rue: '123 Rue de Paris',
              codePostal: '75001',
              ville: 'Paris',
              pays: 'France',
              emetteur: 'EDF',
              dateDocument: '2024-01-15',
              reference: 'FAC-123456',
            },
            confidence: 0.95,
          }),
        });

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        adresse: '123 Rue de Paris, 75001 Paris',
        rue: '123 Rue de Paris',
        codePostal: '75001',
        ville: 'Paris',
        pays: 'France',
        emetteur: 'EDF',
        dateDocument: '2024-01-15',
        reference: 'FAC-123456',
        confidence: 0.95,
      });
    });

    it('should call recognize endpoint with correct parameters', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ fields: {} }),
        });

      await process(mockBlob, mockConfig);

      expect(fetch).toHaveBeenCalledWith(
        '/api/wizidee/recognize',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('should call analyze endpoint with correct parameters', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ fields: {} }),
        });

      await process(mockBlob, mockConfig);

      const analyzeCall = (fetch as jest.Mock).mock.calls[1];
      expect(analyzeCall[0]).toBe('/api/wizidee/analyze');
      expect(analyzeCall[1].method).toBe('POST');
      expect(analyzeCall[1].body).toBeInstanceOf(FormData);
    });

    it('should include raw response when includeRawResponse is true', async () => {
      const rawAnalysis = {
        fields: { adresse: 'Test Address' },
        metadata: { confidence: 0.9 },
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => rawAnalysis,
        });

      const result = await process(mockBlob, {
        ...mockConfig,
        includeRawResponse: true,
      });

      expect(result.raw).toEqual(rawAnalysis);
    });

    it('should not include raw response when includeRawResponse is false', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ fields: {} }),
        });

      const result = await process(mockBlob, {
        ...mockConfig,
        includeRawResponse: false,
      });

      expect(result.raw).toBeUndefined();
    });
  });

  describe('field extraction', () => {
    it('should extract adresse from various field names', async () => {
      const testCases = [
        { input: { adresse: '123 Rue Test' }, expected: '123 Rue Test' },
        { input: { address: '456 Main St' }, expected: '456 Main St' },
        { input: { fullAddress: '789 Full Address' }, expected: '789 Full Address' },
        { input: { adresseComplete: 'Complete Address' }, expected: 'Complete Address' },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        (fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ fields: testCase.input }),
          });

        const result = await process(mockBlob, mockConfig);
        expect(result.data?.adresse).toBe(testCase.expected);
      }
    });

    it('should extract rue from various field names', async () => {
      const testCases = [
        { input: { rue: '123 Rue Test' }, expected: '123 Rue Test' },
        { input: { street: '456 Main St' }, expected: '456 Main St' },
        { input: { streetAddress: '789 Street Addr' }, expected: '789 Street Addr' },
        { input: { voie: 'Voie Test' }, expected: 'Voie Test' },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        (fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ fields: testCase.input }),
          });

        const result = await process(mockBlob, mockConfig);
        expect(result.data?.rue).toBe(testCase.expected);
      }
    });

    it('should extract codePostal from various field names', async () => {
      const testCases = [
        { input: { codePostal: '75001' }, expected: '75001' },
        { input: { postalCode: '10001' }, expected: '10001' },
        { input: { zipCode: '90210' }, expected: '90210' },
        { input: { zip: '12345' }, expected: '12345' },
        { input: { code_postal: '69001' }, expected: '69001' },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        (fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ fields: testCase.input }),
          });

        const result = await process(mockBlob, mockConfig);
        expect(result.data?.codePostal).toBe(testCase.expected);
      }
    });

    it('should extract ville from various field names', async () => {
      const testCases = [
        { input: { ville: 'Paris' }, expected: 'Paris' },
        { input: { city: 'London' }, expected: 'London' },
        { input: { commune: 'Commune Name' }, expected: 'Commune Name' },
        { input: { localite: 'Localite Name' }, expected: 'Localite Name' },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        (fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ fields: testCase.input }),
          });

        const result = await process(mockBlob, mockConfig);
        expect(result.data?.ville).toBe(testCase.expected);
      }
    });

    it('should extract emetteur from various field names', async () => {
      const testCases = [
        { input: { emetteur: 'EDF' }, expected: 'EDF' },
        { input: { issuer: 'Orange' }, expected: 'Orange' },
        { input: { provider: 'SFR' }, expected: 'SFR' },
        { input: { fournisseur: 'Free' }, expected: 'Free' },
        { input: { company: 'Engie' }, expected: 'Engie' },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        (fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ fields: testCase.input }),
          });

        const result = await process(mockBlob, mockConfig);
        expect(result.data?.emetteur).toBe(testCase.expected);
      }
    });

    it('should extract dateDocument from various field names', async () => {
      const testCases = [
        { input: { dateDocument: '2024-01-15' }, expected: '2024-01-15' },
        { input: { documentDate: '2024-03-20' }, expected: '2024-03-20' },
        { input: { date: '2024-06-01' }, expected: '2024-06-01' },
        { input: { dateEmission: '2024-12-31' }, expected: '2024-12-31' },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        (fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ fields: testCase.input }),
          });

        const result = await process(mockBlob, mockConfig);
        expect(result.data?.dateDocument).toBe(testCase.expected);
      }
    });

    it('should handle nested field objects with value property', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fields: {
              adresse: { value: 'Nested Address', confidence: 0.95 },
              rue: { value: 'Nested Street', confidence: 0.9 },
            },
          }),
        });

      const result = await process(mockBlob, mockConfig);
      expect(result.data?.adresse).toBe('Nested Address');
      expect(result.data?.rue).toBe('Nested Street');
    });

    it('should return null for missing fields', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ fields: {} }),
        });

      const result = await process(mockBlob, mockConfig);

      expect(result.data?.adresse).toBeNull();
      expect(result.data?.rue).toBeNull();
      expect(result.data?.codePostal).toBeNull();
      expect(result.data?.ville).toBeNull();
      expect(result.data?.pays).toBeNull();
      expect(result.data?.emetteur).toBeNull();
      expect(result.data?.dateDocument).toBeNull();
      expect(result.data?.reference).toBeNull();
    });

    it('should extract confidence from analyze response', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fields: {},
            confidence: 0.87,
          }),
        });

      const result = await process(mockBlob, mockConfig);
      expect(result.data?.confidence).toBe(0.87);
    });
  });

  describe('error handling', () => {
    it('should handle recognize API failure', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Recognition service error' }),
      });

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Recognition service error');
    });

    it('should handle analyze API failure', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 502,
          json: async () => ({ error: 'Analysis service error' }),
        });

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Analysis service error');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle missing dbId/radId in recognize response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ documentType: 'unknown' }),
      });

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not identify document type');
    });

    it('should handle non-Error exceptions', async () => {
      (fetch as jest.Mock).mockRejectedValue('String error');

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unknown error occurred during processing');
    });

    it('should handle JSON parse errors in error response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('JSON parse error');
        },
      });

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown error');
    });
  });
});
