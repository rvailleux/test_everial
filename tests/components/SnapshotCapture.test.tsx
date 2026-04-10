/**
 * Tests for SnapshotCapture component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SnapshotCapture } from '@/components/SnapshotCapture';

describe('SnapshotCapture', () => {
  const mockOnCapture = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render capture button', () => {
    render(<SnapshotCapture onCapture={mockOnCapture} />);

    expect(screen.getByTestId('snapshot-capture-button')).toBeInTheDocument();
    expect(screen.getByText('Capture')).toBeInTheDocument();
  });

  it('should call onCapture when clicked', () => {
    render(<SnapshotCapture onCapture={mockOnCapture} />);

    fireEvent.click(screen.getByTestId('snapshot-capture-button'));
    expect(mockOnCapture).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when canCapture is false', () => {
    render(<SnapshotCapture onCapture={mockOnCapture} canCapture={false} />);

    expect(screen.getByTestId('snapshot-capture-button')).toBeDisabled();
  });

  it('should be disabled when isCapturing is true', () => {
    render(<SnapshotCapture onCapture={mockOnCapture} isCapturing={true} />);

    expect(screen.getByTestId('snapshot-capture-button')).toBeDisabled();
    expect(screen.getByText('Capturing...')).toBeInTheDocument();
  });

  it('should not call onCapture when disabled', () => {
    render(<SnapshotCapture onCapture={mockOnCapture} canCapture={false} />);

    fireEvent.click(screen.getByTestId('snapshot-capture-button'));
    expect(mockOnCapture).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<SnapshotCapture onCapture={mockOnCapture} className="custom-class" />);

    expect(screen.getByTestId('snapshot-capture-button')).toHaveClass('custom-class');
  });
});
