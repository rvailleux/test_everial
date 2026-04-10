/**
 * Tests for ModuleSelector component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleSelector } from '@/components/ModuleSelector';
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

describe('ModuleSelector', () => {
  beforeEach(() => {
    const { registry } = require('@/lib/modules');
    registry.clear();
  });

  it('should render empty state when no modules', () => {
    render(<ModuleSelector />, { wrapper });

    expect(screen.getByText('No modules registered')).toBeInTheDocument();
  });

  it('should render list of registered modules', () => {
    registerModule(createTestModule('module-1', 'First Module'));
    registerModule(createTestModule('module-2', 'Second Module'));

    render(<ModuleSelector />, { wrapper });

    expect(screen.getByText('First Module')).toBeInTheDocument();
    expect(screen.getByText('Second Module')).toBeInTheDocument();
    expect(screen.getByText('Description for First Module')).toBeInTheDocument();
    expect(screen.getByText('Description for Second Module')).toBeInTheDocument();
  });

  it('should highlight active module', () => {
    registerModule(createTestModule('active-mod', 'Active Module'));

    render(<ModuleSelector />, { wrapper });

    const button = screen.getByText('Active Module');
    fireEvent.click(button);

    expect(button.closest('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should set active module on click', () => {
    registerModule(createTestModule('mod-1', 'Module One'));
    registerModule(createTestModule('mod-2', 'Module Two'));

    render(<ModuleSelector />, { wrapper });

    const buttonOne = screen.getByTestId('module-mod-1');
    const buttonTwo = screen.getByTestId('module-mod-2');

    fireEvent.click(buttonOne);
    expect(buttonOne).toHaveAttribute('aria-pressed', 'true');
    expect(buttonTwo).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(buttonTwo);
    expect(buttonOne).toHaveAttribute('aria-pressed', 'false');
    expect(buttonTwo).toHaveAttribute('aria-pressed', 'true');
  });
});
