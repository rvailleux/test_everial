/**
 * Tests for SnapshotDisplay component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SnapshotDisplay } from '@/components/SnapshotDisplay';
import { WizideeResult } from '@/lib/modules/types';

describe('SnapshotDisplay', () => {
  const mockSnapshotUrl = 'blob:mock-snapshot-url';

  it('should render snapshot image', () => {
    render(<SnapshotDisplay snapshotUrl={mockSnapshotUrl} />);

    const image = screen.getByTestId('snapshot-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockSnapshotUrl);
  });

  it('should use custom alt text', () => {
    render(
      <SnapshotDisplay
        snapshotUrl={mockSnapshotUrl}
        snapshotAlt="Custom alt text"
      />
    );

    expect(screen.getByAltText('Custom alt text')).toBeInTheDocument();
  });

  it('should render error message when error is provided', () => {
    render(
      <SnapshotDisplay
        snapshotUrl={mockSnapshotUrl}
        error="Processing failed"
      />
    );

    expect(screen.getByTestId('snapshot-error')).toBeInTheDocument();
    expect(screen.getByText('Processing failed')).toBeInTheDocument();
  });

  it('should render successful result', () => {
    const result: WizideeResult = {
      success: true,
      data: { name: 'John Doe' },
    };

    render(
      <SnapshotDisplay
        snapshotUrl={mockSnapshotUrl}
        result={result}
      />
    );

    expect(screen.getByTestId('snapshot-result')).toBeInTheDocument();
    expect(screen.getByText('Processing Results')).toBeInTheDocument();
  });

  it('should render failed result', () => {
    const result: WizideeResult = {
      success: false,
      error: 'Failed to extract data',
    };

    render(
      <SnapshotDisplay
        snapshotUrl={mockSnapshotUrl}
        result={result}
      />
    );

    expect(screen.getByTestId('snapshot-result')).toBeInTheDocument();
    expect(screen.getByText('Processing Failed')).toBeInTheDocument();
  });

  it('should render extracted data as JSON when no ResultComponent provided', () => {
    const result: WizideeResult = {
      success: true,
      data: { name: 'John Doe', age: 30 },
    };

    render(
      <SnapshotDisplay
        snapshotUrl={mockSnapshotUrl}
        result={result}
      />
    );

    expect(screen.getByText(/"name": "John Doe"/)).toBeInTheDocument();
    expect(screen.getByText(/"age": 30/)).toBeInTheDocument();
  });

  it('should render custom ResultComponent when provided', () => {
    const result: WizideeResult = {
      success: true,
      data: { name: 'John Doe' },
    };

    const CustomResultComponent = ({ result }: { result: WizideeResult }) => (
      <div data-testid="custom-result">Custom: {result.data?.name}</div>
    );

    render(
      <SnapshotDisplay
        snapshotUrl={mockSnapshotUrl}
        result={result}
        ResultComponent={CustomResultComponent}
      />
    );

    expect(screen.getByTestId('custom-result')).toBeInTheDocument();
    expect(screen.getByText('Custom: John Doe')).toBeInTheDocument();
  });

  it('should show placeholder when no result or error', () => {
    render(<SnapshotDisplay snapshotUrl={mockSnapshotUrl} />);

    expect(
      screen.getByText(/Select a module and click Process/)
    ).toBeInTheDocument();
  });

  it('should not show placeholder when result exists', () => {
    const result: WizideeResult = { success: true };

    render(
      <SnapshotDisplay
        snapshotUrl={mockSnapshotUrl}
        result={result}
      />
    );

    expect(
      screen.queryByText(/Select a module and click Process/)
    ).not.toBeInTheDocument();
  });

  it('should not show placeholder when error exists', () => {
    render(
      <SnapshotDisplay
        snapshotUrl={mockSnapshotUrl}
        error="Some error"
      />
    );

    expect(
      screen.queryByText(/Select a module and click Process/)
    ).not.toBeInTheDocument();
  });
});
