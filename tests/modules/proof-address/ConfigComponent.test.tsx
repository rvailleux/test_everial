/**
 * Tests for Proof of Address ConfigComponent
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigComponent } from '@/modules/proof-address/ConfigComponent';
import { AddressConfig } from '@/modules/proof-address/types';

describe('ConfigComponent', () => {
  const defaultConfig: AddressConfig = {
    documentCategory: 'auto',
    includeRawResponse: false,
  };

  const mockOnConfigChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render document category select with correct options', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const categorySelect = screen.getByLabelText(/Document Category/i);
    expect(categorySelect).toBeInTheDocument();
    expect(categorySelect).toHaveValue('auto');

    // Check options are present
    expect(screen.getByText(/Utility Bill/i)).toBeInTheDocument();
    expect(screen.getByText(/Tax Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/Telecom Bill/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto-detect/i)).toBeInTheDocument();
  });

  it('should call onConfigChange when document category changes', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const categorySelect = screen.getByLabelText(/Document Category/i);
    fireEvent.change(categorySelect, { target: { value: 'utility' } });

    expect(mockOnConfigChange).toHaveBeenCalledWith({ documentCategory: 'utility' });
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
        config={{ documentCategory: 'tax', includeRawResponse: false }}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Tax Notice/i)).toBeInTheDocument();
  });

  it('should show helper text for document category', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Select the type of address document/i)).toBeInTheDocument();
  });

  it('should handle all document category options', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const categorySelect = screen.getByLabelText(/Document Category/i);

    // Test each option
    const options: Array<'utility' | 'tax' | 'telecom' | 'auto'> = ['utility', 'tax', 'telecom', 'auto'];
    
    for (const option of options) {
      jest.clearAllMocks();
      fireEvent.change(categorySelect, { target: { value: option } });
      expect(mockOnConfigChange).toHaveBeenCalledWith({ documentCategory: option });
    }
  });

  it('should render unchecked checkbox when includeRawResponse is false', () => {
    render(
      <ConfigComponent
        config={{ documentCategory: 'auto', includeRawResponse: false }}
        onConfigChange={mockOnConfigChange}
      />
    );

    const checkbox = screen.getByLabelText(/Include Raw API Response/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('should render checked checkbox when includeRawResponse is true', () => {
    render(
      <ConfigComponent
        config={{ documentCategory: 'auto', includeRawResponse: true }}
        onConfigChange={mockOnConfigChange}
      />
    );

    const checkbox = screen.getByLabelText(/Include Raw API Response/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });
});
