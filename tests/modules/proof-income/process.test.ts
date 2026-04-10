/**
 * Tests for Proof of Income Module Process
 */

import { process } from '@/modules/proof-income/process';
import { IncomeConfig } from '@/modules/proof-income/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('proof-income process', () => {
  const mockConfig: IncomeConfig = {
    documentType: 'payslip',
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
            documentType: 'income_proof',
          }),
        })
        // Mock successful analyze response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            fields: {
              revenus: '2500.00',
              employeur: 'ACME Corporation',
              periode: 'January 2024',
              netPay: '2000.00',
              grossPay: '2500.00',
              employeeName: 'John Doe',
              dateDocument: '2024-01-31',
            },
            confidence: 0.95,
          }),
        });

      const result = await process(mockBlob, mockConfig);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        revenus: '2500.00',
        employeur: 'ACME Corporation',
        periode: 'January 2024',
        netPay: '2000.00',
        grossPay: '2500.00',
        employeeName: 'John Doe',
        dateDocument: '2024-01-31',
        taxYear: null,
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
        fields: { revenus: '3000.00' },
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
    it('should extract revenus from various field names', async () => {
      const testCases = [
        { input: { revenus: '2500.00' }, expected: '2500.00' },
        { input: { revenue: '3000.00' }, expected: '3000.00' },
        { input: { income: '3500.00' }, expected: '3500.00' },
        { input: { salaire: '4000.00' }, expected: '4000.00' },
        { input: { salary: '4500.00' }, expected: '4500.00' },
        { input: { montant: '5000.00' }, expected: '5000.00' },
        { input: { amount: '5500.00' }, expected: '5500.00' },
        { input: { total: '6000.00' }, expected: '6000.00' },
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
        expect(result.data?.revenus).toBe(testCase.expected);
      }
    });

    it('should extract employeur from various field names', async () => {
      const testCases = [
        { input: { employeur: 'ACME Corp' }, expected: 'ACME Corp' },
        { input: { employer: 'Tech Inc' }, expected: 'Tech Inc' },
        { input: { entreprise: 'Company SA' }, expected: 'Company SA' },
        { input: { company: 'Corp Ltd' }, expected: 'Corp Ltd' },
        { input: { societe: 'Societe SARL' }, expected: 'Societe SARL' },
        { input: { organisme: 'Organisme' }, expected: 'Organisme' },
        { input: { taxAuthority: 'Tax Office' }, expected: 'Tax Office' },
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
        expect(result.data?.employeur).toBe(testCase.expected);
      }
    });

    it('should extract periode from various field names', async () => {
      const testCases = [
        { input: { periode: 'January 2024' }, expected: 'January 2024' },
        { input: { period: 'February 2024' }, expected: 'February 2024' },
        { input: { periodePaie: 'March 2024' }, expected: 'March 2024' },
        { input: { payPeriod: 'April 2024' }, expected: 'April 2024' },
        { input: { mois: 'May' }, expected: 'May' },
        { input: { month: 'June' }, expected: 'June' },
        { input: { annee: '2024' }, expected: '2024' },
        { input: { year: '2023' }, expected: '2023' },
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
        expect(result.data?.periode).toBe(testCase.expected);
      }
    });

    it('should extract netPay from various field names', async () => {
      const testCases = [
        { input: { netPay: '2000.00' }, expected: '2000.00' },
        { input: { net: '2100.00' }, expected: '2100.00' },
        { input: { salaireNet: '2200.00' }, expected: '2200.00' },
        { input: { netSalary: '2300.00' }, expected: '2300.00' },
        { input: { aPayer: '2400.00' }, expected: '2400.00' },
        { input: { toPay: '2500.00' }, expected: '2500.00' },
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
        expect(result.data?.netPay).toBe(testCase.expected);
      }
    });

    it('should extract grossPay from various field names', async () => {
      const testCases = [
        { input: { grossPay: '3000.00' }, expected: '3000.00' },
        { input: { brut: '3100.00' }, expected: '3100.00' },
        { input: { salaireBrut: '3200.00' }, expected: '3200.00' },
        { input: { grossSalary: '3300.00' }, expected: '3300.00' },
        { input: { totalBrut: '3400.00' }, expected: '3400.00' },
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
        expect(result.data?.grossPay).toBe(testCase.expected);
      }
    });

    it('should extract employeeName from various field names', async () => {
      const testCases = [
        { input: { employeeName: 'John Doe' }, expected: 'John Doe' },
        { input: { nomEmploye: 'Jane Smith' }, expected: 'Jane Smith' },
        { input: { employee: 'Bob Wilson' }, expected: 'Bob Wilson' },
        { input: { salarie: 'Alice Brown' }, expected: 'Alice Brown' },
        { input: { contribuable: 'Tax Payer' }, expected: 'Tax Payer' },
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
        expect(result.data?.employeeName).toBe(testCase.expected);
      }
    });

    it('should extract taxYear from various field names', async () => {
      const testCases = [
        { input: { taxYear: '2023' }, expected: '2023' },
        { input: { anneeFiscale: '2022' }, expected: '2022' },
        { input: { fiscalYear: '2021' }, expected: '2021' },
        { input: { anneeImpots: '2020' }, expected: '2020' },
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
        expect(result.data?.taxYear).toBe(testCase.expected);
      }
    });

    it('should extract dateDocument from various field names', async () => {
      const testCases = [
        { input: { dateDocument: '2024-01-31' }, expected: '2024-01-31' },
        { input: { documentDate: '2024-02-28' }, expected: '2024-02-28' },
        { input: { date: '2024-03-15' }, expected: '2024-03-15' },
        { input: { dateEmission: '2024-04-01' }, expected: '2024-04-01' },
        { input: { datePaiement: '2024-05-15' }, expected: '2024-05-15' },
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
              revenus: { value: '3000.00', confidence: 0.95 },
              employeur: { value: 'ACME Corp', confidence: 0.9 },
            },
          }),
        });

      const result = await process(mockBlob, mockConfig);
      expect(result.data?.revenus).toBe('3000.00');
      expect(result.data?.employeur).toBe('ACME Corp');
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

      expect(result.data?.revenus).toBeNull();
      expect(result.data?.employeur).toBeNull();
      expect(result.data?.periode).toBeNull();
      expect(result.data?.netPay).toBeNull();
      expect(result.data?.grossPay).toBeNull();
      expect(result.data?.employeeName).toBeNull();
      expect(result.data?.dateDocument).toBeNull();
      expect(result.data?.taxYear).toBeNull();
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
