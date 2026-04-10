/**
 * Tests for Proof of Income ResultComponent
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultComponent } from '@/modules/proof-income/ResultComponent';
import { WizideeResult } from '@/lib/modules/types';

describe('ResultComponent', () => {
  const mockSuccessResult: WizideeResult = {
    success: true,
    data: {
      revenus: '2500.00',
      employeur: 'ACME Corporation',
      periode: 'January 2024',
      netPay: '2000.00',
      grossPay: '2500.00',
      employeeName: 'John Doe',
      dateDocument: '2024-01-31',
      taxYear: null,
      confidence: 0.95,
    },
    raw: {
      fields: {
        revenus: '2500.00',
        employeur: 'ACME Corporation',
      },
    },
  };

  it('should render error state for failed result', () => {
    const errorResult: WizideeResult = {
      success: false,
      error: 'Recognition failed',
    };

    render(<ResultComponent result={errorResult} />);

    expect(screen.getByText(/Extraction Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Recognition failed/i)).toBeInTheDocument();
  });

  it('should render error state with default message when error is undefined', () => {
    const errorResult: WizideeResult = {
      success: false,
    };

    render(<ResultComponent result={errorResult} />);

    expect(screen.getByText(/Extraction Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Unknown error occurred/i)).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    const emptyResult: WizideeResult = {
      success: true,
    };

    render(<ResultComponent result={emptyResult} />);

    expect(screen.getByText(/No income data extracted/i)).toBeInTheDocument();
  });

  it('should render income summary with all fields', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    // Check success header
    expect(screen.getByText(/Income Data Extracted Successfully/i)).toBeInTheDocument();

    // Check confidence
    expect(screen.getByText(/Confidence:/i)).toBeInTheDocument();
    expect(screen.getByText(/95.0%/i)).toBeInTheDocument();

    // Check income summary
    expect(screen.getByText(/Pay Slip Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Income Amount/i)).toBeInTheDocument();

    // Check employer info
    expect(screen.getByText(/Employment Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Employer:/i)).toBeInTheDocument();
    expect(screen.getByText('ACME Corporation')).toBeInTheDocument();

    // Check employee
    expect(screen.getByText(/Employee:/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Check period
    expect(screen.getByText(/Period:/i)).toBeInTheDocument();
    expect(screen.getByText('January 2024')).toBeInTheDocument();

    // Check document date
    expect(screen.getByText(/Document Date:/i)).toBeInTheDocument();
    expect(screen.getByText('2024-01-31')).toBeInTheDocument();
  });

  it('should show em dash for null values', () => {
    const partialResult: WizideeResult = {
      success: true,
      data: {
        revenus: '3000.00',
        employeur: null,
        periode: '2024',
        netPay: null,
        grossPay: null,
        employeeName: null,
        dateDocument: null,
        taxYear: null,
        confidence: 0.85,
      },
    };

    render(<ResultComponent result={partialResult} />);

    const emDashes = screen.getAllByText('—');
    expect(emDashes.length).toBeGreaterThan(0);
    expect(screen.getByText('3000.00')).toBeInTheDocument();
  });

  it('should toggle raw JSON display', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    // Raw JSON should be hidden initially
    expect(screen.queryByText(/"revenus": "2500.00"/i)).not.toBeInTheDocument();

    // Click to show raw JSON
    const toggleButton = screen.getByText(/Show Raw API Response/i);
    fireEvent.click(toggleButton);

    // Raw JSON should now be visible
    expect(screen.getByText(/"revenus": "2500.00"/i)).toBeInTheDocument();

    // Click to hide
    fireEvent.click(screen.getByText(/Hide Raw API Response/i));
    expect(screen.queryByText(/"revenus": "2500.00"/i)).not.toBeInTheDocument();
  });

  it('should render tax notice data correctly', () => {
    const taxNoticeResult: WizideeResult = {
      success: true,
      data: {
        revenus: '45000.00',
        employeur: 'Direction Générale des Finances Publiques',
        periode: '2023',
        netPay: null,
        grossPay: null,
        employeeName: 'Jane Smith',
        dateDocument: '2024-08-15',
        taxYear: '2023',
        confidence: 0.92,
      },
    };

    render(<ResultComponent result={taxNoticeResult} />);

    // Should show "Income Summary" instead of "Pay Slip Summary" (no netPay/grossPay)
    expect(screen.getByText(/Income Summary/i)).toBeInTheDocument();

    // Should show "Document Source" instead of "Employment Details"
    expect(screen.getByText(/Document Source/i)).toBeInTheDocument();

    // Should show "Tax Authority" instead of "Employer"
    expect(screen.getByText(/Tax Authority:/i)).toBeInTheDocument();

    // Should show tax year
    expect(screen.getByText(/Tax Year:/i)).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('should format currency values correctly', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    // Check that currency is formatted (the component uses French locale)
    expect(screen.getByText(/2\s*500[,.]00/)).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    const container = screen.getByText(/Income Data Extracted Successfully/i).closest('.income-result');
    expect(container).toBeInTheDocument();
  });

  it('should render gross and net pay when available', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    expect(screen.getByText(/Gross Pay:/i)).toBeInTheDocument();
    expect(screen.getByText(/Net Pay:/i)).toBeInTheDocument();
  });

  it('should not render gross/net pay section for tax notices', () => {
    const taxNoticeResult: WizideeResult = {
      success: true,
      data: {
        revenus: '45000.00',
        employeur: 'Tax Authority',
        periode: '2023',
        netPay: null,
        grossPay: null,
        employeeName: 'Jane Smith',
        dateDocument: '2024-08-15',
        taxYear: '2023',
        confidence: 0.92,
      },
    };

    render(<ResultComponent result={taxNoticeResult} />);

    expect(screen.queryByText(/Gross Pay:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Net Pay:/i)).not.toBeInTheDocument();
  });

  it('should not show raw JSON section when raw is undefined', () => {
    const resultWithoutRaw: WizideeResult = {
      success: true,
      data: {
        revenus: '2500.00',
        employeur: 'ACME Corp',
        periode: 'January 2024',
        netPay: null,
        grossPay: null,
        employeeName: null,
        dateDocument: null,
        taxYear: null,
      },
    };

    render(<ResultComponent result={resultWithoutRaw} />);

    expect(screen.queryByText(/Show Raw API Response/i)).not.toBeInTheDocument();
  });
});
