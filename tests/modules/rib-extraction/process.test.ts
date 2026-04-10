/**
 * Tests for RIB Extraction Module Process
 */

import { process } from '@/modules/rib-extraction/process';
import { RibConfig } from '@/modules/rib-extraction/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('rib-extraction process', () => {
  const mockConfig: RibConfig = {
    autoDetect: true,
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
            dbtype: 'rib',
          }),
        })
        // Mock successful analyze response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fields: {
              iban: 'FR76 1234 5678 9012 3456 7890 123',
              bic: 'SOGEFRPP',
              banque: 'Société Générale',
              titulaire: 'John Doe',
            },
            confidence: 0.95,
          }),
        });

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        iban: 'FR76 1234 5678 9012 3456 7890 123',
        bic: 'SOGEFRPP',
        banque: 'Société Générale',
        titulaire: 'John Doe',
        codeGuichet: null,
        numeroCompte: null,
        codeBanque: null,
        cleRib: null,
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

    it('should include raw response in result', async () => {
      const rawAnalysis = {
        fields: { iban: 'FR76 1234 5678 9012 3456 7890 123' },
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

      const result = await process(mockBlob, mockConfig);

      expect(result.raw).toEqual(rawAnalysis);
    });
  });

  describe('field extraction', () => {
    it('should extract iban from various field names', async () => {
      const testCases = [
        { input: { iban: 'FR76 1234 5678 9012 3456 7890 123' }, expected: 'FR76 1234 5678 9012 3456 7890 123' },
        { input: { IBAN: 'FR76 1234 5678 9012 3456 7890 124' }, expected: 'FR76 1234 5678 9012 3456 7890 124' },
        { input: { accountNumber: 'FR76 1234 5678 9012 3456 7890 125' }, expected: 'FR76 1234 5678 9012 3456 7890 125' },
        { input: { numeroCompte: 'FR76 1234 5678 9012 3456 7890 126' }, expected: 'FR76 1234 5678 9012 3456 7890 126' },
        { input: { numero_iban: 'FR76 1234 5678 9012 3456 7890 127' }, expected: 'FR76 1234 5678 9012 3456 7890 127' },
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
        expect(result.data?.iban).toBe(testCase.expected);
      }
    });

    it('should extract bic from various field names', async () => {
      const testCases = [
        { input: { bic: 'SOGEFRPP' }, expected: 'SOGEFRPP' },
        { input: { BIC: 'BNPAFRPP' }, expected: 'BNPAFRPP' },
        { input: { swift: 'AGRIFRPP' }, expected: 'AGRIFRPP' },
        { input: { SWIFT: 'CRLYFRPP' }, expected: 'CRLYFRPP' },
        { input: { swiftCode: 'CMCIFR2A' }, expected: 'CMCIFR2A' },
        { input: { code_bic: 'CEPAFRPP' }, expected: 'CEPAFRPP' },
        { input: { code_swift: 'CCFRFRPP' }, expected: 'CCFRFRPP' },
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
        expect(result.data?.bic).toBe(testCase.expected);
      }
    });

    it('should extract banque from various field names', async () => {
      const testCases = [
        { input: { banque: 'Société Générale' }, expected: 'Société Générale' },
        { input: { bank: 'BNP Paribas' }, expected: 'BNP Paribas' },
        { input: { bankName: 'Crédit Agricole' }, expected: 'Crédit Agricole' },
        { input: { nomBanque: 'LCL' }, expected: 'LCL' },
        { input: { nom_banque: 'CIC' }, expected: 'CIC' },
        { input: { etablissement: 'Banque Postale' }, expected: 'Banque Postale' },
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
        expect(result.data?.banque).toBe(testCase.expected);
      }
    });

    it('should extract titulaire from various field names', async () => {
      const testCases = [
        { input: { titulaire: 'John Doe' }, expected: 'John Doe' },
        { input: { holder: 'Jane Smith' }, expected: 'Jane Smith' },
        { input: { accountHolder: 'Bob Wilson' }, expected: 'Bob Wilson' },
        { input: { nomTitulaire: 'Alice Brown' }, expected: 'Alice Brown' },
        { input: { nom_titulaire: 'Charlie Davis' }, expected: 'Charlie Davis' },
        { input: { proprietaire: 'Eve Miller' }, expected: 'Eve Miller' },
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
        expect(result.data?.titulaire).toBe(testCase.expected);
      }
    });

    it('should extract codeGuichet from various field names', async () => {
      const testCases = [
        { input: { codeGuichet: '12345' }, expected: '12345' },
        { input: { branchCode: '54321' }, expected: '54321' },
        { input: { guichet: '01234' }, expected: '01234' },
        { input: { code_guichet: '98765' }, expected: '98765' },
        { input: { agence: '11111' }, expected: '11111' },
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
        expect(result.data?.codeGuichet).toBe(testCase.expected);
      }
    });

    it('should extract numeroCompte from various field names', async () => {
      const testCases = [
        { input: { numeroCompte: '12345678901' }, expected: '12345678901' },
        { input: { accountNumber: '10987654321' }, expected: '10987654321' },
        { input: { compte: '00012345678' }, expected: '00012345678' },
        { input: { numero_compte: '11122233344' }, expected: '11122233344' },
        { input: { numero: '99988877766' }, expected: '99988877766' },
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
        expect(result.data?.numeroCompte).toBe(testCase.expected);
      }
    });

    it('should extract codeBanque from various field names', async () => {
      const testCases = [
        { input: { codeBanque: '12345' }, expected: '12345' },
        { input: { bankCode: '54321' }, expected: '54321' },
        { input: { code_banque: '01234' }, expected: '01234' },
        { input: { etablissement: '98765' }, expected: '98765' },
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
        expect(result.data?.codeBanque).toBe(testCase.expected);
      }
    });

    it('should extract cleRib from various field names', async () => {
      const testCases = [
        { input: { cleRib: '12' }, expected: '12' },
        { input: { ribKey: '34' }, expected: '34' },
        { input: { cle_rib: '56' }, expected: '56' },
        { input: { key: '78' }, expected: '78' },
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
        expect(result.data?.cleRib).toBe(testCase.expected);
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
              iban: { value: 'FR76 1234 5678 9012 3456 7890 123', confidence: 0.95 },
              bic: { value: 'SOGEFRPP', confidence: 0.9 },
            },
          }),
        });

      const result = await process(mockBlob, mockConfig);
      expect(result.data?.iban).toBe('FR76 1234 5678 9012 3456 7890 123');
      expect(result.data?.bic).toBe('SOGEFRPP');
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

      expect(result.data?.iban).toBeNull();
      expect(result.data?.bic).toBeNull();
      expect(result.data?.banque).toBeNull();
      expect(result.data?.titulaire).toBeNull();
      expect(result.data?.codeGuichet).toBeNull();
      expect(result.data?.numeroCompte).toBeNull();
      expect(result.data?.codeBanque).toBeNull();
      expect(result.data?.cleRib).toBeNull();
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
