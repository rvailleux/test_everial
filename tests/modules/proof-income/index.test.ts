/**
 * Tests for Proof of Income Module Registration
 */

import { getModule } from '@/lib/modules';
import {
  proofIncomeModule,
  defaultConfig,
  ConfigComponent,
  ResultComponent,
  process,
} from '@/modules/proof-income';

describe('proofIncomeModule', () => {
  it('should have correct module metadata', () => {
    expect(proofIncomeModule.id).toBe('proof-income');
    expect(proofIncomeModule.name).toBe('Proof of Income');
    expect(proofIncomeModule.description).toContain('Extract income data');
    expect(proofIncomeModule.icon).toBe('banknote');
  });

  it('should export required components', () => {
    expect(proofIncomeModule.ConfigComponent).toBeDefined();
    expect(proofIncomeModule.ResultComponent).toBeDefined();
    expect(proofIncomeModule.ConfigComponent).toBe(ConfigComponent);
    expect(proofIncomeModule.ResultComponent).toBe(ResultComponent);
  });

  it('should export process function', () => {
    expect(proofIncomeModule.process).toBeDefined();
    expect(proofIncomeModule.process).toBe(process);
    expect(typeof proofIncomeModule.process).toBe('function');
  });

  it('should have correct default configuration', () => {
    expect(proofIncomeModule.defaultConfig).toEqual({
      documentType: 'auto',
      includeRawResponse: false,
    });
    expect(proofIncomeModule.defaultConfig).toBe(defaultConfig);
  });

  it('should implement WizideeModule interface', () => {
    const requiredFields = [
      'id',
      'name',
      'description',
      'ConfigComponent',
      'ResultComponent',
      'process',
      'defaultConfig',
    ];

    requiredFields.forEach((field) => {
      expect(proofIncomeModule).toHaveProperty(field);
    });
  });
});

describe('defaultConfig', () => {
  it('should default to auto document type', () => {
    expect(defaultConfig.documentType).toBe('auto');
  });

  it('should default to not include raw response', () => {
    expect(defaultConfig.includeRawResponse).toBe(false);
  });
});

describe('auto-registration', () => {
  it('should auto-register when imported', () => {
    // The module should be auto-registered when the module file is imported
    const registeredModule = getModule('proof-income');
    expect(registeredModule).toBeDefined();
    expect(registeredModule?.id).toBe('proof-income');
    expect(registeredModule?.name).toBe('Proof of Income');
  });
});

describe('module exports', () => {
  it('should export all types from types.ts', () => {
    // Re-import to check exports
    const moduleExports = require('@/modules/proof-income');

    // Check that the module exports are available
    expect(moduleExports.proofIncomeModule).toBeDefined();
    expect(moduleExports.defaultConfig).toBeDefined();
    expect(moduleExports.ConfigComponent).toBeDefined();
    expect(moduleExports.ResultComponent).toBeDefined();
    expect(moduleExports.process).toBeDefined();
  });
});
