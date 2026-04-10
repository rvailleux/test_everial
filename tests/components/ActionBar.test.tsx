/**
 * Tests for ActionBar component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionBar } from '@/components/ActionBar';

describe('ActionBar', () => {
  const mockOnCapture = jest.fn();
  const mockOnProcess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Capture and Process buttons', () => {
    render(
      <ActionBar
        onCapture={mockOnCapture}
        onProcess={mockOnProcess}
        canProcess={true}
        isProcessing={false}
      />
    );

    expect(screen.getByTestId('capture-button')).toBeInTheDocument();
    expect(screen.getByTestId('process-button')).toBeInTheDocument();
    expect(screen.getByText('Capture')).toBeInTheDocument();
    expect(screen.getByText('Process')).toBeInTheDocument();
  });

  it('should call onCapture when Capture button clicked', () => {
    render(
      <ActionBar
        onCapture={mockOnCapture}
        onProcess={mockOnProcess}
        canProcess={true}
        isProcessing={false}
      />
    );

    fireEvent.click(screen.getByTestId('capture-button'));
    expect(mockOnCapture).toHaveBeenCalledTimes(1);
  });

  it('should call onProcess when Process button clicked', () => {
    render(
      <ActionBar
        onCapture={mockOnCapture}
        onProcess={mockOnProcess}
        canProcess={true}
        isProcessing={false}
      />
    );

    fireEvent.click(screen.getByTestId('process-button'));
    expect(mockOnProcess).toHaveBeenCalledTimes(1);
  });

  it('should disable Process button when canProcess is false', () => {
    render(
      <ActionBar
        onCapture={mockOnCapture}
        onProcess={mockOnProcess}
        canProcess={false}
        isProcessing={false}
      />
    );

    expect(screen.getByTestId('process-button')).toBeDisabled();
  });

  it('should disable Process button when isProcessing is true', () => {
    render(
      <ActionBar
        onCapture={mockOnCapture}
        onProcess={mockOnProcess}
        canProcess={true}
        isProcessing={true}
      />
    );

    expect(screen.getByTestId('process-button')).toBeDisabled();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('should disable Capture button when canCapture is false', () => {
    render(
      <ActionBar
        onCapture={mockOnCapture}
        onProcess={mockOnProcess}
        canProcess={true}
        isProcessing={false}
        canCapture={false}
      />
    );

    expect(screen.getByTestId('capture-button')).toBeDisabled();
  });

  it('should not call handlers when buttons disabled', () => {
    render(
      <ActionBar
        onCapture={mockOnCapture}
        onProcess={mockOnProcess}
        canProcess={false}
        isProcessing={true}
        canCapture={false}
      />
    );

    fireEvent.click(screen.getByTestId('capture-button'));
    fireEvent.click(screen.getByTestId('process-button'));

    expect(mockOnCapture).not.toHaveBeenCalled();
    expect(mockOnProcess).not.toHaveBeenCalled();
  });
});
