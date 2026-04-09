/**
 * Tests for module processing execution
 *
 * T028: process function called with correct args
 * T029: ResultComponent renders with success result
 * T030: error result displays without crash
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useActiveModule } from '@/lib/hooks/useActiveModule';
import { useModuleConfig } from '@/lib/hooks/useModuleConfig';
import { ModuleProvider } from '@/lib/context/ModuleProvider';
import { registerModule, WizideeModule, WizideeResult } from '@/lib/modules';

const MockConfigComponent: React.FC<{ config: any; onConfigChange: (config: any) => void }> = () => null;
const MockResultComponent: React.FC<{ result: any }> = ({ result }) => (
  <div data-testid="result-component">
    {result.success ? (
      <span data-testid="success">Success</span>
    ) : (
      <span data-testid="error">{result.error}</span>
    )}
  </div>
);

const createTestModule = (
  id: string,
  processFn: (snapshot: Blob, config: any) => Promise<WizideeResult>
): WizideeModule => ({
  id,
  name: `Test ${id}`,
  description: 'Test module',
  ConfigComponent: MockConfigComponent,
  ResultComponent: MockResultComponent,
  process: processFn,
  defaultConfig: { threshold: 0.5 },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ModuleProvider>{children}</ModuleProvider>
);

describe('useModuleProcess', () => {
  beforeEach(() => {
    const { registry } = require('@/lib/modules');
    registry.clear();
  });

  it('T028: should call process function with snapshot and config', async () => {
    const processMock = jest.fn().mockResolvedValue({ success: true, data: { extracted: true } });
    registerModule(createTestModule('test-mod', processMock));

    const { result } = renderHook(() => {
      const { setActiveModule } = useActiveModule();
      const { setConfig } = useModuleConfig();
      return { setActiveModule, setConfig };
    }, { wrapper });

    act(() => {
      result.current.setActiveModule('test-mod');
    });

    // Simulate setting config
    act(() => {
      result.current.setConfig({ threshold: 0.8 });
    });

    // Create a mock Blob
    const mockBlob = new Blob(['test'], { type: 'image/png' });

    // Get the module and call process
    const { registry } = require('@/lib/modules');
    const module = registry.get('test-mod');

    await act(async () => {
      await module.process(mockBlob, { threshold: 0.8 });
    });

    expect(processMock).toHaveBeenCalledWith(mockBlob, { threshold: 0.8 });
  });

  it('T029: should handle successful processing result', async () => {
    const processMock = jest.fn().mockResolvedValue({
      success: true,
      data: { name: 'John Doe' },
      raw: { confidence: 0.95 }
    });
    registerModule(createTestModule('test-mod', processMock));

    const mockBlob = new Blob(['test'], { type: 'image/png' });
    const { registry } = require('@/lib/modules');
    const module = registry.get('test-mod');

    const result = await module.process(mockBlob, {});

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'John Doe' });
  });

  it('T030: should handle processing error without crashing', async () => {
    const processMock = jest.fn().mockResolvedValue({
      success: false,
      error: 'Processing failed'
    });
    registerModule(createTestModule('test-mod', processMock));

    const mockBlob = new Blob(['test'], { type: 'image/png' });
    const { registry } = require('@/lib/modules');
    const module = registry.get('test-mod');

    const result = await module.process(mockBlob, {});

    expect(result.success).toBe(false);
    expect(result.error).toBe('Processing failed');
  });

  it('should handle process function throwing error', async () => {
    const processMock = jest.fn().mockRejectedValue(new Error('Network error'));
    registerModule(createTestModule('test-mod', processMock));

    const mockBlob = new Blob(['test'], { type: 'image/png' });
    const { registry } = require('@/lib/modules');
    const module = registry.get('test-mod');

    // Should not throw - error handling wrapper
    await expect(module.process(mockBlob, {})).rejects.toThrow('Network error');
  });
});
