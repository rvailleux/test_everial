/**
 * Tests for Identity CNI ResultComponent
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultComponent } from '@/modules/identity-cni/ResultComponent';
import { WizideeResult } from '@/lib/modules/types';

describe('ResultComponent', () => {
  const mockSuccessResult: WizideeResult = {
    success: true,
    data: {
      nom: 'DUPONT',
      prenom: 'Jean',
      dateNaissance: '1990-05-15',
      dateExpiration: '2030-05-15',
      mrz: 'IDFRADUPONT<<<<<<<<<<<<<<<<<<123456',
    },
    raw: {
      fields: {
        nom: 'DUPONT',
        prenom: 'Jean',
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

    expect(screen.getByText(/No data extracted/i)).toBeInTheDocument();
  });

  it('should render ID card with all identity fields', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    // Check photo placeholder
    expect(screen.getByText(/Photo/i)).toBeInTheDocument();

    // Check identity fields
    expect(screen.getByText(/Nom \/ Last Name/i)).toBeInTheDocument();
    expect(screen.getByText('DUPONT')).toBeInTheDocument();

    expect(screen.getByText(/Prénom \/ First Name/i)).toBeInTheDocument();
    expect(screen.getByText('Jean')).toBeInTheDocument();

    expect(screen.getByText(/Date de Naissance/i)).toBeInTheDocument();
    expect(screen.getByText('1990-05-15')).toBeInTheDocument();

    expect(screen.getByText(/Date d'Expiration/i)).toBeInTheDocument();
    expect(screen.getByText('2030-05-15')).toBeInTheDocument();

    // Check MRZ
    expect(screen.getByText(/MRZ/i)).toBeInTheDocument();
    expect(screen.getByText(/IDFRADUPONT/)).toBeInTheDocument();
  });

  it('should show em dash for null values', () => {
    const partialResult: WizideeResult = {
      success: true,
      data: {
        nom: null,
        prenom: 'Marie',
        dateNaissance: null,
        dateExpiration: '2025-12-31',
        mrz: null,
      },
    };

    render(<ResultComponent result={partialResult} />);

    const emDashes = screen.getAllByText('—');
    expect(emDashes.length).toBeGreaterThan(0);
    expect(screen.getByText('Marie')).toBeInTheDocument();
  });

  it('should toggle raw JSON display', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    // Raw JSON should be hidden initially
    expect(screen.queryByText(/"nom": "DUPONT"/i)).not.toBeInTheDocument();

    // Click to show raw JSON
    const toggleButton = screen.getByText(/Show Raw JSON/i);
    fireEvent.click(toggleButton);

    // Raw JSON should now be visible
    expect(screen.getByText(/"nom": "DUPONT"/i)).toBeInTheDocument();

    // Click to hide
    fireEvent.click(screen.getByText(/Hide Raw JSON/i));
    expect(screen.queryByText(/"nom": "DUPONT"/i)).not.toBeInTheDocument();
  });

  it('should render MRZ with line breaks correctly', () => {
    const mrzResult: WizideeResult = {
      success: true,
      data: {
        nom: 'MARTIN',
        prenom: 'Pierre',
        dateNaissance: '1985-03-20',
        dateExpiration: '2028-03-20',
        mrz: 'P<FRA MARTIN<<PIERRE<<<<<<<<<<<<<<<<<<<<<<\n1234567890FRA850320<<<<<<<<<<<<<<<280320<<<<<<',
      },
    };

    render(<ResultComponent result={mrzResult} />);

    expect(screen.getByText(/P<FRA MARTIN/)).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    render(<ResultComponent result={mockSuccessResult} />);

    const idCard = screen.getByText(/Nom \/ Last Name/i).closest('.id-card');
    expect(idCard).toBeInTheDocument();
  });
});
