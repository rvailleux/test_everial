/**
 * Tests for useActiveModule hook
 *
 * T020: Tracks active module
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useActiveModule } from '@/lib/hooks/useActiveModule';
import { ModuleProvider } from '@/lib/context/ModuleProvider';
import { registerModule, WizideeModule } from '@/lib/modules';

const MockConfigComponent = () => null;
const MockResultComponent = () => null;

const createTestModule = (id: string, name: string): WizideeModule => ({
  id,
  name,
  description: `Description for ${name}`,
  ConfigComponent: MockConfigComponent,
  ResultComponent: MockResultComponent,
  process: async () => ({ success: true }),
  defaultConfig: {},
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ModuleProvider>{children}</ModuleProvider>
);

describe('useActiveModule', () => {
  beforeEach(() => {
    const { registry } = require('@/lib/modules');
    registry.clear();
  });

  it('T020: should track active module', () => {
    registerModule(createTestModule('module-1', 'First Module'));
    registerModule(createTestModule('module-2', 'Second Module'));

    const { result } = renderHook(() => useActiveModule(), { wrapper });

    // Initially no active module
    expect(result.current.activeModule).toBeNull();

    // Set active module
    act(() => {
      result.current.setActiveModule('module-1');
    });

    expect(result.current.activeModule?.id).toBe('module-1');
    expect(result.current.activeModule?.name).toBe('First Module');

    // Change active module
    act(() => {
      result.current.setActiveModule('module-2');
    });

    expect(result.current.activeModule?.id).toBe('module-2');
    expect(result.current.activeModule?.name).toBe('Second Module');
  });

  it('should clear active module', () => {
    registerModule(createTestModule('module-1', 'First Module'));

    const { result } = renderHook(() => useActiveModule(), { wrapper });

    act(() => {
      result.current.setActiveModule('module-1');
    });

    expect(result.current.activeModule).not.toBeNull();

    act(() => {
      result.current.clearActiveModule();
    });

    expect(result.current.activeModule).toBeNull();
  });
});
