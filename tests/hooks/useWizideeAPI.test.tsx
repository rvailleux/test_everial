/**
 * Tests for useWizideeAPI hook
 *
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWizideeAPI } from '@/lib/hooks/useWizideeAPI';

describe('useWizideeAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useWizideeAPI());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call recognize endpoint successfully', async () => {
    const mockResponse = {
      dbId: 'test-db-id',
      radId: 'test-rad-id',
      dbtype: 'identity',
      confidence: 0.95,
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useWizideeAPI());
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    let recognizeResult;
    await act(async () => {
      recognizeResult = await result.current.recognize(file);
    });

    expect(recognizeResult).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    expect(fetch).toHaveBeenCalledWith('/api/wizidee/recognize', {
      method: 'POST',
      body: expect.any(FormData),
    });
  });

  it('should handle recognize error', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid file format' }),
    });

    const { result } = renderHook(() => useWizideeAPI());
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await expect(result.current.recognize(file)).rejects.toThrow('Invalid file format');
    });

    expect(result.current.error).toBe('Invalid file format');
    expect(result.current.isLoading).toBe(false);
  });

  it('should call analyze endpoint successfully', async () => {
    const mockResponse = {
      extracted: { name: 'John Doe' },
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useWizideeAPI());
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    let analyzeResult;
    await act(async () => {
      analyzeResult = await result.current.analyze(file, 'db-123', 'rad-456');
    });

    expect(analyzeResult.success).toBe(true);
    expect(analyzeResult.data).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    expect(fetch).toHaveBeenCalledWith('/api/wizidee/analyze', {
      method: 'POST',
      body: expect.any(FormData),
    });
  });

  it('should handle analyze error gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useWizideeAPI());
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    let analyzeResult;
    await act(async () => {
      analyzeResult = await result.current.analyze(file, 'db-123', 'rad-456');
    });

    expect(analyzeResult.success).toBe(false);
    expect(analyzeResult.error).toBe('Network error');
    expect(result.current.error).toBe('Network error');
  });

  it('should clear error state', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Test error' }),
    });

    const { result } = renderHook(() => useWizideeAPI());
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await expect(result.current.recognize(file)).rejects.toThrow();
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
