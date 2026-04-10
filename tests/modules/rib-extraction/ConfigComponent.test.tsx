/**
 * Tests for RIB Extraction ConfigComponent
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfigComponent } from '@/modules/rib-extraction/ConfigComponent';
import { RibConfig } from '@/modules/rib-extraction/types';

describe('ConfigComponent', () => {
  const defaultConfig: RibConfig = {
    autoDetect: true,
  };

  const mockOnConfigChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render automatic detection message', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Automatic Detection/i)).toBeInTheDocument();
    expect(screen.getByText(/RIB documents are detected automatically/i)).toBeInTheDocument();
  });

  it('should render config summary with auto-detect status', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto-detect enabled/i)).toBeInTheDocument();
  });

  it('should list extracted data fields', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    expect(screen.getByText(/Extracted data includes:/i)).toBeInTheDocument();
    expect(screen.getByText(/IBAN \(International Bank Account Number\)/i)).toBeInTheDocument();
    expect(screen.getByText(/BIC \/ SWIFT code/i)).toBeInTheDocument();
    expect(screen.getByText(/Bank name/i)).toBeInTheDocument();
    expect(screen.getByText(/Account holder name/i)).toBeInTheDocument();
  });

  it('should display info icon', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // The info icon should be in the document (as SVG)
    const infoIcon = document.querySelector('svg');
    expect(infoIcon).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    // Check for the rib-config class
    const container = screen.getByText(/Automatic Detection/i).closest('.rib-config');
    expect(container).toBeInTheDocument();
  });

  it('should show blue info box styling', () => {
    render(
      <ConfigComponent
        config={defaultConfig}
        onConfigChange={mockOnConfigChange}
      />
    );

    const infoBox = screen.getByText(/Automatic Detection/i).closest('.bg-blue-50');
    expect(infoBox).toBeInTheDocument();
  });
});
