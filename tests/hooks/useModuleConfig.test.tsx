/**
 * Tests for useModuleConfig hook
 *
 * T017: Returns default config
 * T018: setConfig updates values
 * T019: resetConfig restores defaults
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useModuleConfig } from '@/lib/hooks/useModuleConfig';
import { useActiveModule } from '@/lib/hooks/useActiveModule';
import { ModuleProvider } from '@/lib/context/ModuleProvider';
import { registerModule, WizideeModule } from '@/lib/modules';

const MockConfigComponent = () => null;
const MockResultComponent = () => null;

interface TestConfig {
  enabled: boolean;
  threshold: number;
}

const createTestModule = (id: string, defaultConfig: TestConfig): WizideeModule<TestConfig> => ({
  id,
  name: `Test ${id}`,
  description: 'Test module',
  ConfigComponent: MockConfigComponent,
  ResultComponent: MockResultComponent,
  process: async () => ({ success: true }),
  defaultConfig,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ModuleProvider>{children}</ModuleProvider>
);

describe('useModuleConfig', () => {
  beforeEach(() => {
    // Clear registry before each test
    const { registry } = require('@/lib/modules');
    registry.clear();
  });

  it('T017: should return default config for active module', () => {
    const defaultConfig = { enabled: true, threshold: 0.5 };
    registerModule(createTestModule('test-mod', defaultConfig));

    const { result } = renderHook(() => {
      const { setActiveModule } = useActiveModule();
      const { config } = useModuleConfig<TestConfig>();
      return { setActiveModule, config };
    }, { wrapper });

    act(() => {
      result.current.setActiveModule('test-mod');
    });

    expect(result.current.config).toEqual(defaultConfig);
  });

  it('T018: should update config values with setConfig', () => {
    const defaultConfig = { enabled: true, threshold: 0.5 };
    registerModule(createTestModule('test-mod', defaultConfig));

    const { result } = renderHook(() => {
      const { setActiveModule } = useActiveModule();
      const { config, setConfig } = useModuleConfig<TestConfig>();
      return { setActiveModule, config, setConfig };
    }, { wrapper });

    act(() => {
      result.current.setActiveModule('test-mod');
    });

    act(() => {
      result.current.setConfig({ threshold: 0.8 });
    });

    expect(result.current.config.threshold).toBe(0.8);
    expect(result.current.config.enabled).toBe(true); // unchanged
  });

  it('T019: should reset config to default values', () => {
    const defaultConfig = { enabled: true, threshold: 0.5 };
    registerModule(createTestModule('test-mod', defaultConfig));

    const { result } = renderHook(() => {
      const { setActiveModule } = useActiveModule();
      const { config, setConfig, resetConfig } = useModuleConfig<TestConfig>();
      return { setActiveModule, config, setConfig, resetConfig };
    }, { wrapper });

    act(() => {
      result.current.setActiveModule('test-mod');
    });

    // First change the config
    act(() => {
      result.current.setConfig({ enabled: false, threshold: 0.9 });
    });

    expect(result.current.config).toEqual({ enabled: false, threshold: 0.9 });

    // Then reset
    act(() => {
      result.current.resetConfig();
    });

    expect(result.current.config).toEqual(defaultConfig);
  });
});
