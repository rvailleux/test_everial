/**
 * Tests for Identity CNI Module Process
 */

import { process } from '@/modules/identity-cni/process';
import { IdentityConfig } from '@/modules/identity-cni/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('identity-cni process', () => {
  const mockConfig: IdentityConfig = {
    documentType: 'cni',
    region: 'FR',
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
            documentType: 'identity',
          }),
        })
        // Mock successful analyze response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fields: {
              nom: 'DUPONT',
              prenom: 'Jean',
              dateNaissance: '1990-05-15',
              dateExpiration: '2030-05-15',
              mrz: 'IDFRADUPONT<<<<<<<<<<<<<<<<<<123456',
            },
          }),
        });

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        nom: 'DUPONT',
        prenom: 'Jean',
        dateNaissance: '1990-05-15',
        dateExpiration: '2030-05-15',
        mrz: 'IDFRADUPONT<<<<<<<<<<<<<<<<<<123456',
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
  });

  describe('field extraction', () => {
    it('should extract nom from various field names', async () => {
      const testCases = [
        { input: { nom: 'DUPONT' }, expected: 'DUPONT' },
        { input: { lastName: 'MARTIN' }, expected: 'MARTIN' },
        { input: { surname: 'BERNARD' }, expected: 'BERNARD' },
        { input: { familyName: 'PETIT' }, expected: 'PETIT' },
        { input: { nomDeFamille: 'ROBERT' }, expected: 'ROBERT' },
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
        expect(result.data?.nom).toBe(testCase.expected);
      }
    });

    it('should extract prenom from various field names', async () => {
      const testCases = [
        { input: { prenom: 'Jean' }, expected: 'Jean' },
        { input: { firstName: 'Pierre' }, expected: 'Pierre' },
        { input: { givenName: 'Marie' }, expected: 'Marie' },
        { input: { prenoms: 'Luc' }, expected: 'Luc' },
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
        expect(result.data?.prenom).toBe(testCase.expected);
      }
    });

    it('should extract dateNaissance from various field names', async () => {
      const testCases = [
        { input: { dateNaissance: '1990-05-15' }, expected: '1990-05-15' },
        { input: { birthDate: '1985-03-20' }, expected: '1985-03-20' },
        { input: { dateOfBirth: '1978-12-10' }, expected: '1978-12-10' },
        { input: { birthdate: '1995-07-01' }, expected: '1995-07-01' },
        { input: { date_de_naissance: '2000-01-15' }, expected: '2000-01-15' },
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
        expect(result.data?.dateNaissance).toBe(testCase.expected);
      }
    });

    it('should extract dateExpiration from various field names', async () => {
      const testCases = [
        { input: { dateExpiration: '2030-05-15' }, expected: '2030-05-15' },
        { input: { expiryDate: '2028-03-20' }, expected: '2028-03-20' },
        { input: { expirationDate: '2025-12-31' }, expected: '2025-12-31' },
        { input: { date_d_expiration: '2027-06-15' }, expected: '2027-06-15' },
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
        expect(result.data?.dateExpiration).toBe(testCase.expected);
      }
    });

    it('should extract single MRZ field', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fields: { mrz: 'IDFRADUPONT<<<<<<<<<<<<<<<<<<123456' },
          }),
        });

      const result = await process(mockBlob, mockConfig);
      expect(result.data?.mrz).toBe('IDFRADUPONT<<<<<<<<<<<<<<<<<<123456');
    });

    it('should extract two-line MRZ', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fields: {
              mrzLine1: 'P<FRA MARTIN<<JEAN<<<<<<<<<<<<<<<<<<<<<<<',
              mrzLine2: '1234567890FRA900515<<<<<<<<<<<<<<20305151',
            },
          }),
        });

      const result = await process(mockBlob, mockConfig);
      expect(result.data?.mrz).toContain('P<FRA MARTIN');
      expect(result.data?.mrz).toContain('1234567890');
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

      expect(result.data?.nom).toBeNull();
      expect(result.data?.prenom).toBeNull();
      expect(result.data?.dateNaissance).toBeNull();
      expect(result.data?.dateExpiration).toBeNull();
      expect(result.data?.mrz).toBeNull();
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
      expect(result.error).toContain('Processing failed');
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
      expect(result.error).toContain('Processing failed');
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
      expect(result.error).toContain('Document recognition failed');
    });

    it('should handle non-Error exceptions', async () => {
      (fetch as jest.Mock).mockRejectedValue('String error');

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Processing failed: String error');
    });
  });

  describe('raw response preservation', () => {
    it('should include raw API response in result', async () => {
      const rawResponse = {
        fields: { nom: 'TEST' },
        metadata: { confidence: 0.95 },
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ dbId: 'db-123', radId: 'rad-456' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => rawResponse,
        });

      const result = await process(mockBlob, mockConfig);

      expect(result.raw).toEqual(rawResponse);
    });
  });
});
