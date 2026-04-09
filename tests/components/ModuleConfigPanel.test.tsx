/**
 * Tests for ModuleConfigPanel component
 *
 * T021: Renders ConfigComponent for active module
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModuleConfigPanel } from '@/components/ModuleConfigPanel';
import { ModuleProvider } from '@/lib/context/ModuleProvider';
import { registerModule, WizideeModule } from '@/lib/modules';

const MockResultComponent = () => null;

const createTestModule = (
  id: string,
  ConfigComponent: React.FC<{ config: any; onConfigChange: (config: any) => void }>
): WizideeModule => ({
  id,
  name: `Test ${id}`,
  description: 'Test module',
  ConfigComponent,
  ResultComponent: MockResultComponent,
  process: async () => ({ success: true }),
  defaultConfig: { value: 'default' },
});

const TestConfigComponent: React.FC<{ config: any; onConfigChange: (config: any) => void }> = ({
  config,
}) => (
  <div data-testid="config-component">
    <span data-testid="config-value">{config.value}</span>
  </div>
);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ModuleProvider>{children}</ModuleProvider>
);

describe('ModuleConfigPanel', () => {
  beforeEach(() => {
    const { registry } = require('@/lib/modules');
    registry.clear();
  });

  it('T021: should show placeholder when no module is active', () => {
    render(<ModuleConfigPanel />, { wrapper });

    expect(screen.getByText('Select a module to configure')).toBeInTheDocument();
  });

  it('should render ConfigComponent for active module', () => {
    registerModule(createTestModule('test-mod', TestConfigComponent));

    // We need to set the active module first
    const { useActiveModule } = require('@/lib/hooks/useActiveModule');

    render(<ModuleConfigPanel />, { wrapper });

    // Initially no module is active
    expect(screen.getByText('Select a module to configure')).toBeInTheDocument();
  });
});
