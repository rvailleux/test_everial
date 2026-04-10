/**
 * Tests for RIB Extraction Module Registration
 */

import { getModule } from '@/lib/modules';
import {
  ribExtractionModule,
  defaultConfig,
  ConfigComponent,
  ResultComponent,
  process,
} from '@/modules/rib-extraction';

describe('ribExtractionModule', () => {
  it('should have correct module metadata', () => {
    expect(ribExtractionModule.id).toBe('rib-extraction');
    expect(ribExtractionModule.name).toBe('Bank Account (RIB)');
    expect(ribExtractionModule.description).toContain('Extract banking details');
    expect(ribExtractionModule.icon).toBe('building-2');
  });

  it('should export required components', () => {
    expect(ribExtractionModule.ConfigComponent).toBeDefined();
    expect(ribExtractionModule.ResultComponent).toBeDefined();
    expect(ribExtractionModule.ConfigComponent).toBe(ConfigComponent);
    expect(ribExtractionModule.ResultComponent).toBe(ResultComponent);
  });

  it('should export process function', () => {
    expect(ribExtractionModule.process).toBeDefined();
    expect(ribExtractionModule.process).toBe(process);
    expect(typeof ribExtractionModule.process).toBe('function');
  });

  it('should have correct default configuration', () => {
    expect(ribExtractionModule.defaultConfig).toEqual({
      autoDetect: true,
    });
    expect(ribExtractionModule.defaultConfig).toBe(defaultConfig);
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
      expect(ribExtractionModule).toHaveProperty(field);
    });
  });
});

describe('defaultConfig', () => {
  it('should default to autoDetect enabled', () => {
    expect(defaultConfig.autoDetect).toBe(true);
  });
});

describe('auto-registration', () => {
  it('should auto-register when imported', () => {
    // The module should be auto-registered when the module file is imported
    const registeredModule = getModule('rib-extraction');
    expect(registeredModule).toBeDefined();
    expect(registeredModule?.id).toBe('rib-extraction');
    expect(registeredModule?.name).toBe('Bank Account (RIB)');
  });
});

describe('module exports', () => {
  it('should export all types from types.ts', () => {
    // Re-import to check exports
    const moduleExports = require('@/modules/rib-extraction');

    // Check that the module exports are available
    expect(moduleExports.ribExtractionModule).toBeDefined();
    expect(moduleExports.defaultConfig).toBeDefined();
    expect(moduleExports.ConfigComponent).toBeDefined();
    expect(moduleExports.ResultComponent).toBeDefined();
    expect(moduleExports.process).toBeDefined();
  });
});
