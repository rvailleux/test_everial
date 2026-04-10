/**
 * Tests for useAllModules hook
 *
 * T013: Returns all registered modules
 */

import React from 'react';
import { renderHook } from '@testing-library/react';
import { useAllModules } from '@/lib/hooks/useAllModules';
import { ModuleProvider } from '@/lib/context/ModuleProvider';
import { registerModule, WizideeModule } from '@/lib/modules';

const MockConfigComponent = () => null;
const MockResultComponent = () => null;

const createTestModule = (id: string): WizideeModule => ({
  id,
  name: `Test ${id}`,
  description: 'Test module',
  ConfigComponent: MockConfigComponent,
  ResultComponent: MockResultComponent,
  process: async () => ({ success: true }),
  defaultConfig: {},
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ModuleProvider>{children}</ModuleProvider>
);

describe('useAllModules', () => {
  it('should return auto-registered modules by default', () => {
    const { result } = renderHook(() => useAllModules(), { wrapper });

    // 4 modules are auto-registered: identity-cni, proof-address, proof-income, rib-extraction
    expect(result.current.length).toBeGreaterThanOrEqual(4);
    expect(result.current.map(m => m.id)).toContain('identity-cni');
    expect(result.current.map(m => m.id)).toContain('proof-address');
    expect(result.current.map(m => m.id)).toContain('proof-income');
    expect(result.current.map(m => m.id)).toContain('rib-extraction');
  });

  it('should include dynamically registered modules', () => {
    registerModule(createTestModule('module-1'));
    registerModule(createTestModule('module-2'));

    const { result } = renderHook(() => useAllModules(), { wrapper });

    expect(result.current.map(m => m.id)).toContain('module-1');
    expect(result.current.map(m => m.id)).toContain('module-2');
  });
});
