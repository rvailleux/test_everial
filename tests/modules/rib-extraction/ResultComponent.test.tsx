/**
 * Tests for RIB Extraction ResultComponent
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultComponent } from '@/modules/rib-extraction/ResultComponent';
import { WizideeResult } from '@/lib/modules/types';

describe('ResultComponent', () => {
  const mockSuccessResult: WizideeResult = {
    success: true,
    data: {
      iban: 'FR76 1234 5678 9012 3456 7890 123',
      bic: 'SOGEFRPP',
      banque: 'Société Générale',
      titulaire: 'John Doe',
      codeGuichet: '12345',
      numeroCompte: '12345678901',
      codeBanque: '12345',
      cleRib: '12',
      confidence: 0.95,
    },
    raw: {
      fields: {
        iban: 'FR76 1234 5678 9012 3456 7890 123',
        bic: 'SOGEFRPP',
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

    expect(screen.getByText(/No banking data extracted/i)).toBeInTheDocument();
  });

  it('should render success header with banking details', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    // Check success header
    expect(screen.getByText(/Banking Details Extracted/i)).toBeInTheDocument();

    // Check confidence
    expect(screen.getByText(/Confidence:/i)).toBeInTheDocument();
    expect(screen.getByText(/95.0%/i)).toBeInTheDocument();
  });

  it('should display IBAN masked by default', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    expect(screen.getByText(/IBAN/i)).toBeInTheDocument();
    // IBAN should be masked (showing asterisks)
    expect(screen.getByText(/FR76/)).toBeInTheDocument();
    expect(screen.getByText(/IBAN masked for security/i)).toBeInTheDocument();
  });

  it('should toggle IBAN visibility when show/hide button is clicked', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    // Click to show full IBAN
    const showButton = screen.getByText(/Show/i);
    fireEvent.click(showButton);

    // Should now show full IBAN
    expect(screen.getByText(/Full IBAN visible/i)).toBeInTheDocument();

    // Click to hide
    const hideButton = screen.getByText(/Mask/i);
    fireEvent.click(hideButton);

    expect(screen.getByText(/IBAN masked for security/i)).toBeInTheDocument();
  });

  it('should display BIC/SWIFT code', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    expect(screen.getByText(/BIC \/ SWIFT/i)).toBeInTheDocument();
    expect(screen.getByText('SOGEFRPP')).toBeInTheDocument();
  });

  it('should display bank name', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    expect(screen.getByText(/Bank/i)).toBeInTheDocument();
    expect(screen.getByText('Société Générale')).toBeInTheDocument();
  });

  it('should display account holder', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    expect(screen.getByText(/Account Holder/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should show em dash for null values', () => {
    const partialResult: WizideeResult = {
      success: true,
      data: {
        iban: 'FR76 1234 5678 9012 3456 7890 123',
        bic: null,
        banque: null,
        titulaire: null,
        codeGuichet: null,
        numeroCompte: null,
        codeBanque: null,
        cleRib: null,
        confidence: 0.85,
      },
    };

    render(<ResultComponent result={partialResult} />);

    const emDashes = screen.getAllByText('—');
    expect(emDashes.length).toBeGreaterThan(0);
    expect(screen.getByText('FR76')).toBeInTheDocument();
  });

  it('should toggle raw JSON display', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    // Raw JSON should be hidden initially
    expect(screen.queryByText(/"bic": "SOGEFRPP"/i)).not.toBeInTheDocument();

    // Click to show raw JSON
    const toggleButton = screen.getByText(/Show Raw JSON/i);
    fireEvent.click(toggleButton);

    // Raw JSON should now be visible
    expect(screen.getByText(/"bic": "SOGEFRPP"/i)).toBeInTheDocument();

    // Click to hide
    fireEvent.click(screen.getByText(/Hide Raw JSON/i));
    expect(screen.queryByText(/"bic": "SOGEFRPP"/i)).not.toBeInTheDocument();
  });

  it('should render additional RIB details when available', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    expect(screen.getByText(/Additional RIB Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Bank Code/i)).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText(/Branch Code/i)).toBeInTheDocument();
    expect(screen.getByText(/Account Number/i)).toBeInTheDocument();
    expect(screen.getByText(/RIB Key/i)).toBeInTheDocument();
  });

  it('should not show additional RIB details section when all are null', () => {
    const resultWithoutRibDetails: WizideeResult = {
      success: true,
      data: {
        iban: 'FR76 1234 5678 9012 3456 7890 123',
        bic: 'SOGEFRPP',
        banque: 'Société Générale',
        titulaire: 'John Doe',
        codeGuichet: null,
        numeroCompte: null,
        codeBanque: null,
        cleRib: null,
        confidence: 0.95,
      },
    };

    render(<ResultComponent result={resultWithoutRibDetails} />);

    expect(screen.queryByText(/Additional RIB Details/i)).not.toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    const container = screen.getByText(/Banking Details Extracted/i).closest('.rib-result');
    expect(container).toBeInTheDocument();
  });

  it('should not show raw JSON section when raw is undefined', () => {
    const resultWithoutRaw: WizideeResult = {
      success: true,
      data: {
        iban: 'FR76 1234 5678 9012 3456 7890 123',
        bic: 'SOGEFRPP',
        banque: 'Société Générale',
        titulaire: 'John Doe',
        codeGuichet: null,
        numeroCompte: null,
        codeBanque: null,
        cleRib: null,
      },
    };

    render(<ResultComponent result={resultWithoutRaw} />);

    expect(screen.queryByText(/Show Raw JSON/i)).not.toBeInTheDocument();
  });

  it('should not show IBAN toggle when IBAN is null', () => {
    const resultWithoutIban: WizideeResult = {
      success: true,
      data: {
        iban: null,
        bic: 'SOGEFRPP',
        banque: 'Société Générale',
        titulaire: 'John Doe',
        codeGuichet: null,
        numeroCompte: null,
        codeBanque: null,
        cleRib: null,
        confidence: 0.95,
      },
    };

    render(<ResultComponent result={resultWithoutIban} />);

    expect(screen.queryByText(/Show/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mask/i)).not.toBeInTheDocument();
  });
});
