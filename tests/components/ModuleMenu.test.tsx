/**
 * Tests for ModuleMenu component
 *
 * T012: Renders list of registered modules
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleMenu } from '@/components/ModuleMenu';
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

describe('ModuleMenu', () => {
  it('should render auto-registered modules', () => {
    render(<ModuleMenu />, { wrapper });

    // Should show the 4 auto-registered modules
    expect(screen.getByText('Identity Document (CNI/Passport)')).toBeInTheDocument();
    expect(screen.getByText('Proof of Address')).toBeInTheDocument();
    expect(screen.getByText('Proof of Income')).toBeInTheDocument();
    expect(screen.getByText('Bank Account (RIB)')).toBeInTheDocument();
  });

  it('should include dynamically registered modules', () => {
    registerModule(createTestModule('module-1', 'First Module'));
    registerModule(createTestModule('module-2', 'Second Module'));

    render(<ModuleMenu />, { wrapper });

    expect(screen.getByText('First Module')).toBeInTheDocument();
    expect(screen.getByText('Second Module')).toBeInTheDocument();
  });

  it('should highlight active module', () => {
    registerModule(createTestModule('active-mod', 'Active Module'));

    render(<ModuleMenu />, { wrapper });

    const button = screen.getByText('Active Module');
    fireEvent.click(button);

    expect(button.closest('button')).toHaveAttribute('aria-pressed', 'true');
  });
});
