/**
 * Tests for Identity CNI ConfigComponent
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigComponent } from '@/modules/identity-cni/ConfigComponent';
import { IdentityConfig } from '@/modules/identity-cni/types';

describe('ConfigComponent', () => {
  const defaultConfig: IdentityConfig = {
    documentType: 'cni',
    region: 'FR',
  };

  const mockOnConfigChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render document type select with correct options', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const documentTypeSelect = screen.getByLabelText(/Document Type/i);
    expect(documentTypeSelect).toBeInTheDocument();
    expect(documentTypeSelect).toHaveValue('cni');

    // Check options
    expect(screen.getByText(/Carte Nationale d'Identité/i)).toBeInTheDocument();
    expect(screen.getByText(/Passport/i)).toBeInTheDocument();
  });

  it('should render region select with correct options', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const regionSelect = screen.getByLabelText(/Region/i);
    expect(regionSelect).toBeInTheDocument();
    expect(regionSelect).toHaveValue('FR');

    // Check options
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('European Union')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('should call onConfigChange when document type changes', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const documentTypeSelect = screen.getByLabelText(/Document Type/i);
    fireEvent.change(documentTypeSelect, { target: { value: 'passport' } });

    expect(mockOnConfigChange).toHaveBeenCalledWith({ documentType: 'passport' });
  });

  it('should call onConfigChange when region changes', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const regionSelect = screen.getByLabelText(/Region/i);
    fireEvent.change(regionSelect, { target: { value: 'EU' } });

    expect(mockOnConfigChange).toHaveBeenCalledWith({ region: 'EU' });
  });

  it('should display current configuration summary', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Current:/i)).toBeInTheDocument();
    expect(screen.getByText(/CNI \(FR\)/i)).toBeInTheDocument();
  });

  it('should update displayed summary when config changes', () => {
    const { rerender } = render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/CNI \(FR\)/i)).toBeInTheDocument();

    rerender(
      <ConfigComponent
        config={{ documentType: 'passport', region: 'EU' }}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Passport \(EU\)/i)).toBeInTheDocument();
  });

  it('should show helper text for document type', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Select the type of identity document/i)).toBeInTheDocument();
  });

  it('should show helper text for region', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Select the region of issuance/i)).toBeInTheDocument();
  });

  it('should handle all region options', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const regionSelect = screen.getByLabelText(/Region/i);

    // Test each option
    fireEvent.change(regionSelect, { target: { value: 'FR' } });
    expect(mockOnConfigChange).toHaveBeenCalledWith({ region: 'FR' });

    jest.clearAllMocks();
    fireEvent.change(regionSelect, { target: { value: 'EU' } });
    expect(mockOnConfigChange).toHaveBeenCalledWith({ region: 'EU' });

    jest.clearAllMocks();
    fireEvent.change(regionSelect, { target: { value: 'OTHER' } });
    expect(mockOnConfigChange).toHaveBeenCalledWith({ region: 'OTHER' });
  });
});
