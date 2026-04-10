/**
 * Tests for ModuleProvider Context
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModuleProvider, useModuleContext } from '@/lib/context/ModuleProvider';
import { registerModule, clearRegistry } from '@lib/modules/registry';
import { WizideeModule } from '@lib/modules/types';

// Test component that uses the context
const TestConsumer: React.FC = () => {
  const {
    modules,
    activeModuleId,
    setActiveModule,
    getModuleConfig,
    setModuleConfig,
    resetModuleConfig,
  } = useModuleContext();

  return (
    <div>
      <div data-testid="module-count">{modules.length}</div>
      <div data-testid="active-module">{activeModuleId || 'none'}</div>
      <button
        data-testid="set-active"
        onClick={() => setActiveModule('test-module')}
      >
        Set Active
      </button>
      <button
        data-testid="set-config"
        onClick={() => setModuleConfig('test-module', { enabled: true })}
      >
        Set Config
      </button>
    </div>
  );
};

const createTestModule = (id: string): WizideeModule => ({
  id,
  name: `Test Module ${id}`,
  description: 'A test module',
  defaultConfig: { enabled: false },
  ConfigComponent: () => null,
  ResultComponent: () => null,
  process: async () => ({ success: true }),
});

describe('ModuleProvider', () => {
  beforeEach(() => {
    clearRegistry();
  });

  it('T008: should provide empty modules array initially', () => {
    render(
      <ModuleProvider>
        <TestConsumer />
      </ModuleProvider>
    );

    expect(screen.getByTestId('module-count').textContent).toBe('0');
  });

  it('T008: should provide registered modules', () => {
    registerModule(createTestModule('mod-1'));
    registerModule(createTestModule('mod-2'));

    render(
      <ModuleProvider>
        <TestConsumer />
      </ModuleProvider>
    );

    expect(screen.getByTestId('module-count').textContent).toBe('2');
  });

  it('T008: should track active module', async () => {
    registerModule(createTestModule('test-module'));

    render(
      <ModuleProvider>
        <TestConsumer />
      </ModuleProvider>
    );

    expect(screen.getByTestId('active-module').textContent).toBe('none');

    await act(async () => {
      await userEvent.click(screen.getByTestId('set-active'));
    });

    expect(screen.getByTestId('active-module').textContent).toBe('test-module');
  });

  it('T009: should throw error when useModuleContext is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const InvalidConsumer: React.FC = () => {
      useModuleContext();
      return null;
    };

    expect(() => render(<InvalidConsumer />)).toThrow(
      'useModuleContext must be used within a ModuleProvider'
    );

    consoleSpy.mockRestore();
  });
});
