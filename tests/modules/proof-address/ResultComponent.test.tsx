/**
 * Tests for Proof of Address ResultComponent
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultComponent } from '@/modules/proof-address/ResultComponent';
import { WizideeResult } from '@/lib/modules/types';
import { AddressData } from '@/modules/proof-address/types';

describe('ResultComponent', () => {
  const mockAddressData: AddressData = {
    adresse: '123 Rue de Paris, 75001 Paris, France',
    rue: '123 Rue de Paris',
    codePostal: '75001',
    ville: 'Paris',
    pays: 'France',
    emetteur: 'EDF',
    dateDocument: '2024-01-15',
    reference: 'FAC-123456',
    confidence: 0.95,
  };

  const mockSuccessResult: WizideeResult = {
    success: true,
    data: mockAddressData,
    raw: { fields: mockAddressData },
  };

  const mockErrorResult: WizideeResult = {
    success: false,
    error: 'Document processing failed',
  };

  const mockEmptyResult: WizideeResult = {
    success: true,
    data: undefined,
  };

  describe('error state', () => {
    it('should display error message when result.success is false', () => {
      render(<ResultComponent result={mockErrorResult} />);

      expect(screen.getByText(/Extraction Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Document processing failed/i)).toBeInTheDocument();
    });

    it('should display default error message when error is undefined', () => {
      render(<ResultComponent result={{ success: false }} />);

      expect(screen.getByText(/Extraction Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Unknown error occurred/i)).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should display empty state when data is undefined', () => {
      render(<ResultComponent result={mockEmptyResult} />);

      expect(screen.getByText(/No address data extracted/i)).toBeInTheDocument();
    });
  });

  describe('success state', () => {
    it('should display success message', () => {
      render(<ResultComponent result={mockSuccessResult} />);

      expect(screen.getByText(/Address Extracted Successfully/i)).toBeInTheDocument();
    });

    it('should display confidence score', () => {
      render(<ResultComponent result={mockSuccessResult} />);

      expect(screen.getByText(/Confidence:/i)).toBeInTheDocument();
      expect(screen.getByText(/95.0%/i)).toBeInTheDocument();
    });

    it('should display address block with street', () => {
      render(<ResultComponent result={mockSuccessResult} />);

      expect(screen.getByText(/Extracted Address/i)).toBeInTheDocument();
      expect(screen.getByText(/123 Rue de Paris/i)).toBeInTheDocument();
    });

    it('should display postal code and city', () => {
      render(<ResultComponent result={mockSuccessResult} />);

      expect(screen.getByText(/75001 Paris/i)).toBeInTheDocument();
    });

    it('should display country', () => {
      render(<ResultComponent result={mockSuccessResult} />);

      expect(screen.getByText(/France/i)).toBeInTheDocument();
    });

    it('should display document details section', () => {
      render(<ResultComponent result={mockSuccessResult} />);

      expect(screen.getByText(/Document Details/i)).toBeInTheDocument();
      expect(screen.getByText(/Issuer/i)).toBeInTheDocument();
      expect(screen.getByText(/EDF/i)).toBeInTheDocument();
      expect(screen.getByText(/Document Date/i)).toBeInTheDocument();
      expect(screen.getByText(/2024-01-15/i)).toBeInTheDocument();
      expect(screen.getByText(/Reference/i)).toBeInTheDocument();
      expect(screen.getByText(/FAC-123456/i)).toBeInTheDocument();
    });

    it('should display map link when address is available', () => {
      render(<ResultComponent result={mockSuccessResult} />);

      const mapLink = screen.getByText(/View on Map/i);
      expect(mapLink).toBeInTheDocument();
      expect(mapLink.closest('a')).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
      expect(mapLink.closest('a')).toHaveAttribute('target', '_blank');
      expect(mapLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should toggle raw JSON display', () => {
      render(<ResultComponent result={mockSuccessResult} />);

      const toggleButton = screen.getByText(/Show Raw API Response/i);
      expect(toggleButton).toBeInTheDocument();

      // Click to show
      fireEvent.click(toggleButton);
      expect(screen.getByText(/Hide Raw API Response/i)).toBeInTheDocument();

      // Click to hide
      fireEvent.click(screen.getByText(/Hide Raw API Response/i));
      expect(screen.getByText(/Show Raw API Response/i)).toBeInTheDocument();
    });

    it('should display raw JSON when toggled', () => {
      render(<ResultComponent result={mockSuccessResult} />);

      fireEvent.click(screen.getByText(/Show Raw API Response/i));

      const jsonContent = screen.getByText((content) => content.includes('FAC-123456'));
      expect(jsonContent).toBeInTheDocument();
    });
  });

  describe('partial data handling', () => {
    it('should handle partial address data gracefully', () => {
      const partialData: AddressData = {
        adresse: null,
        rue: '45 Avenue des Champs',
        codePostal: null,
        ville: 'Lyon',
        pays: null,
        emetteur: 'Orange',
        dateDocument: null,
        reference: null,
      };

      render(
        <ResultComponent
          result={{
            success: true,
            data: partialData,
            raw: {},
          }}
        />
      );

      expect(screen.getByText(/45 Avenue des Champs/i)).toBeInTheDocument();
      expect(screen.getByText(/Lyon/i)).toBeInTheDocument();
      expect(screen.getByText(/Orange/i)).toBeInTheDocument();
    });

    it('should display em dash for missing fields', () => {
      const emptyData: AddressData = {
        adresse: null,
        rue: null,
        codePostal: null,
        ville: null,
        pays: null,
        emetteur: null,
        dateDocument: null,
        reference: null,
      };

      render(
        <ResultComponent
          result={{
            success: true,
            data: emptyData,
          }}
        />
      );

      // Check for em dash in the document details
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });
  });

  describe('confidence display', () => {
    it('should display high confidence in green', () => {
      const highConfidenceData = { ...mockAddressData, confidence: 0.9 };
      render(
        <ResultComponent
          result={{
            success: true,
            data: highConfidenceData,
          }}
        />
      );

      expect(screen.getByText(/90.0%/i)).toHaveClass('text-green-600');
    });

    it('should display medium confidence in yellow', () => {
      const mediumConfidenceData = { ...mockAddressData, confidence: 0.6 };
      render(
        <ResultComponent
          result={{
            success: true,
            data: mediumConfidenceData,
          }}
        />
      );

      expect(screen.getByText(/60.0%/i)).toHaveClass('text-yellow-600');
    });

    it('should display low confidence in red', () => {
      const lowConfidenceData = { ...mockAddressData, confidence: 0.3 };
      render(
        <ResultComponent
          result={{
            success: true,
            data: lowConfidenceData,
          }}
        />
      );

      expect(screen.getByText(/30.0%/i)).toHaveClass('text-red-600');
    });

    it('should not display confidence when undefined', () => {
      const noConfidenceData = { ...mockAddressData, confidence: undefined };
      const { container } = render(
        <ResultComponent
          result={{
            success: true,
            data: noConfidenceData,
          }}
        />
      );

      expect(container.textContent).not.toContain('Confidence:');
    });
  });

  describe('map link', () => {
    it('should not display map link when no address is available', () => {
      const noAddressData: AddressData = {
        adresse: null,
        rue: null,
        codePostal: null,
        ville: null,
        pays: null,
        emetteur: 'EDF',
        dateDocument: '2024-01-15',
        reference: 'FAC-123',
      };

      render(
        <ResultComponent
          result={{
            success: true,
            data: noAddressData,
          }}
        />
      );

      expect(screen.queryByText(/View on Map/i)).not.toBeInTheDocument();
    });

    it('should use adresse field when rue is not available', () => {
      const addressOnlyData: AddressData = {
        adresse: '99 Boulevard Haussmann, Paris',
        rue: null,
        codePostal: null,
        ville: null,
        pays: null,
        emetteur: null,
        dateDocument: null,
        reference: null,
      };

      render(
        <ResultComponent
          result={{
            success: true,
            data: addressOnlyData,
          }}
        />
      );

      const mapLink = screen.getByText(/View on Map/i);
      expect(mapLink).toBeInTheDocument();
    });
  });
});
