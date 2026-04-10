/**
 * Tests for Proof of Income Module Types
 */

import {
  IncomeConfig,
  IncomeData,
  IncomeDocumentType,
  documentTypeLabels,
} from '@/modules/proof-income/types';

describe('proof-income types', () => {
  describe('IncomeDocumentType', () => {
    it('should have correct document type values', () => {
      const types: IncomeDocumentType[] = ['payslip', 'tax_notice', 'auto'];
      expect(types).toContain('payslip');
      expect(types).toContain('tax_notice');
      expect(types).toContain('auto');
    });
  });

  describe('documentTypeLabels', () => {
    it('should have labels for all document types', () => {
      expect(documentTypeLabels.payslip).toBeDefined();
      expect(documentTypeLabels.tax_notice).toBeDefined();
      expect(documentTypeLabels.auto).toBeDefined();
    });

    it('should have correct labels', () => {
      expect(documentTypeLabels.payslip).toContain('Pay Slip');
      expect(documentTypeLabels.payslip).toContain('Bulletin de salaire');
      expect(documentTypeLabels.tax_notice).toContain('Tax Notice');
      expect(documentTypeLabels.tax_notice).toContain("Avis d'imposition");
      expect(documentTypeLabels.auto).toBe('Auto-detect');
    });
  });

  describe('IncomeConfig', () => {
    it('should accept valid config', () => {
      const config: IncomeConfig = {
        documentType: 'payslip',
        includeRawResponse: true,
      };

      expect(config.documentType).toBe('payslip');
      expect(config.includeRawResponse).toBe(true);
    });

    it('should accept all document type options', () => {
      const payslipConfig: IncomeConfig = {
        documentType: 'payslip',
        includeRawResponse: false,
      };

      const taxNoticeConfig: IncomeConfig = {
        documentType: 'tax_notice',
        includeRawResponse: false,
      };

      const autoConfig: IncomeConfig = {
        documentType: 'auto',
        includeRawResponse: false,
      };

      expect(payslipConfig.documentType).toBe('payslip');
      expect(taxNoticeConfig.documentType).toBe('tax_notice');
      expect(autoConfig.documentType).toBe('auto');
    });
  });

  describe('IncomeData', () => {
    it('should accept complete income data', () => {
      const data: IncomeData = {
        revenus: '2500.00',
        employeur: 'ACME Corp',
        periode: 'January 2024',
        netPay: '2000.00',
        grossPay: '2500.00',
        employeeName: 'John Doe',
        dateDocument: '2024-01-31',
        taxYear: null,
        confidence: 0.95,
      };

      expect(data.revenus).toBe('2500.00');
      expect(data.employeur).toBe('ACME Corp');
      expect(data.confidence).toBe(0.95);
    });

    it('should accept partial income data with nulls', () => {
      const data: IncomeData = {
        revenus: null,
        employeur: null,
        periode: null,
        netPay: null,
        grossPay: null,
        employeeName: null,
        dateDocument: null,
        taxYear: null,
        confidence: undefined,
      };

      expect(data.revenus).toBeNull();
      expect(data.confidence).toBeUndefined();
    });

    it('should accept tax notice data', () => {
      const data: IncomeData = {
        revenus: '45000.00',
        employeur: 'Direction Générale des Finances Publiques',
        periode: '2023',
        netPay: null,
        grossPay: null,
        employeeName: 'Jane Smith',
        dateDocument: '2024-08-15',
        taxYear: '2023',
        confidence: 0.92,
      };

      expect(data.taxYear).toBe('2023');
      expect(data.netPay).toBeNull();
    });
  });
});
