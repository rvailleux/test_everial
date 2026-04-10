/**
 * Tests for useModule hook
 *
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import React from 'react';
import { useModule } from '@/lib/hooks/useModule';
import { ModuleProvider } from '@/lib/context/ModuleProvider';
import { registerModule, clearRegistry } from '@lib/modules/registry';
import { WizideeModule } from '@lib/modules/types';

const createTestModule = (id: string): WizideeModule => ({
  id,
  name: `Test Module ${id}`,
  description: 'A test module',
  defaultConfig: { enabled: true },
  ConfigComponent: () => null,
  ResultComponent: () => null,
  process: async () => ({ success: true }),
});

const createWrapper = (initialModules: WizideeModule[] = []): React.FC<{ children: React.ReactNode }> =>
  ({ children }) => <ModuleProvider initialModules={initialModules}>{children}</ModuleProvider>;

describe('useModule', () => {
  it('T011: should return the correct module by id', () => {
    const testModule = createTestModule('my-module');
    const wrapper = createWrapper([testModule]);

    const { result } = renderHook(() => useModule('my-module'), { wrapper });

    expect(result.current).toBe(testModule);
  });

  it('T012: should return null for invalid module id', () => {
    const wrapper = createWrapper([]);
    const { result } = renderHook(() => useModule('non-existent'), { wrapper });

    expect(result.current).toBeNull();
  });

  it('should return null when id is empty string', () => {
    const wrapper = createWrapper([]);
    const { result } = renderHook(() => useModule(''), { wrapper });

    expect(result.current).toBeNull();
  });
});
