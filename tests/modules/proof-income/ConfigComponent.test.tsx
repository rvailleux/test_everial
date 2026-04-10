/**
 * Tests for Proof of Income ConfigComponent
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigComponent } from '@/modules/proof-income/ConfigComponent';
import { IncomeConfig } from '@/modules/proof-income/types';

describe('ConfigComponent', () => {
  const defaultConfig: IncomeConfig = {
    documentType: 'auto',
    includeRawResponse: false,
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
    expect(documentTypeSelect).toHaveValue('auto');

    // Check options
    expect(screen.getByText(/Pay Slip/i)).toBeInTheDocument();
    expect(screen.getByText(/Bulletin de salaire/i)).toBeInTheDocument();
    expect(screen.getByText(/Tax Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Avis d'imposition/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto-detect/i)).toBeInTheDocument();
  });

  it('should render include raw response checkbox', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const checkbox = screen.getByLabelText(/Include Raw API Response/i);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should call onConfigChange when document type changes', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const documentTypeSelect = screen.getByLabelText(/Document Type/i);
    fireEvent.change(documentTypeSelect, { target: { value: 'payslip' } });

    expect(mockOnConfigChange).toHaveBeenCalledWith({ documentType: 'payslip' });
  });

  it('should call onConfigChange when tax_notice is selected', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const documentTypeSelect = screen.getByLabelText(/Document Type/i);
    fireEvent.change(documentTypeSelect, { target: { value: 'tax_notice' } });

    expect(mockOnConfigChange).toHaveBeenCalledWith({ documentType: 'tax_notice' });
  });

  it('should call onConfigChange when raw response checkbox changes', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const checkbox = screen.getByLabelText(/Include Raw API Response/i);
    fireEvent.click(checkbox);

    expect(mockOnConfigChange).toHaveBeenCalledWith({ includeRawResponse: true });
  });

  it('should display current configuration summary', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Current:/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto-detect/i)).toBeInTheDocument();
  });

  it('should update displayed summary when config changes', () => {
    const { rerender } = render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Auto-detect/i)).toBeInTheDocument();

    rerender(
      <ConfigComponent
        config={{ documentType: 'payslip', includeRawResponse: false }}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Pay Slip/i)).toBeInTheDocument();
  });

  it('should show helper text for document type', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Select the type of income document/i)).toBeInTheDocument();
  });

  it('should handle all document type options', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const documentTypeSelect = screen.getByLabelText(/Document Type/i);

    // Test each option
    fireEvent.change(documentTypeSelect, { target: { value: 'payslip' } });
    expect(mockOnConfigChange).toHaveBeenCalledWith({ documentType: 'payslip' });

    jest.clearAllMocks();
    fireEvent.change(documentTypeSelect, { target: { value: 'tax_notice' } });
    expect(mockOnConfigChange).toHaveBeenCalledWith({ documentType: 'tax_notice' });

    jest.clearAllMocks();
    fireEvent.change(documentTypeSelect, { target: { value: 'auto' } });
    expect(mockOnConfigChange).toHaveBeenCalledWith({ documentType: 'auto' });
  });

  it('should have correct styling classes', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Check for the income-config class
    const container = screen.getByLabelText(/Document Type/i).closest('.income-config');
    expect(container).toBeInTheDocument();
  });
});
