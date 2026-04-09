/**
 * Tests for DocumentCapture component
 * Upload flow, loading state, onCapture callback
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../../src/components/DocumentCapture', () => {
  const actual = jest.requireActual('../../src/components/DocumentCapture');
  return actual;
}, { virtual: false });

import DocumentCapture from '../../src/components/DocumentCapture';

describe('DocumentCapture', () => {
  it('renders an upload button', () => {
    render(<DocumentCapture onCapture={jest.fn()} />);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('shows file name after file is selected', async () => {
    const user = userEvent.setup();
    render(<DocumentCapture onCapture={jest.fn()} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'cni.jpg', { type: 'image/jpeg' });

    await user.upload(input, file);

    expect(screen.getByText(/cni\.jpg/i)).toBeInTheDocument();
  });

  it('calls onCapture with the File object when Analyze is clicked', async () => {
    const user = userEvent.setup();
    const onCapture = jest.fn();
    render(<DocumentCapture onCapture={onCapture} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['img'], 'cni.jpg', { type: 'image/jpeg' });
    await user.upload(input, file);

    await user.click(screen.getByRole('button', { name: /analyze/i }));

    expect(onCapture).toHaveBeenCalledWith(file);
  });

  it('Analyze button is disabled when no file is selected', () => {
    render(<DocumentCapture onCapture={jest.fn()} />);
    expect(screen.getByRole('button', { name: /analyze/i })).toBeDisabled();
  });

  it('shows loading state when isLoading prop is true', () => {
    render(<DocumentCapture onCapture={jest.fn()} isLoading />);
    // Button should be disabled or show a spinner
    const button = screen.getByRole('button', { name: /analyze|loading/i });
    expect(button).toBeDisabled();
  });
});
