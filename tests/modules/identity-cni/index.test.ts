/**
 * Tests for Identity CNI Module Registration
 */

import { getModule } from '@/lib/modules';
import {
  identityCniModule,
  defaultConfig,
  ConfigComponent,
  ResultComponent,
  process,
} from '@/modules/identity-cni';

describe('identityCniModule', () => {
  it('should have correct module metadata', () => {
    expect(identityCniModule.id).toBe('identity-cni');
    expect(identityCniModule.name).toBe('Identity Document (CNI/Passport)');
    expect(identityCniModule.description).toContain('Extract identity data');
    expect(identityCniModule.icon).toBe('id-card');
  });

  it('should export required components', () => {
    expect(identityCniModule.ConfigComponent).toBeDefined();
    expect(identityCniModule.ResultComponent).toBeDefined();
    expect(identityCniModule.ConfigComponent).toBe(ConfigComponent);
    expect(identityCniModule.ResultComponent).toBe(ResultComponent);
  });

  it('should export process function', () => {
    expect(identityCniModule.process).toBeDefined();
    expect(identityCniModule.process).toBe(process);
    expect(typeof identityCniModule.process).toBe('function');
  });

  it('should have correct default configuration', () => {
    expect(identityCniModule.defaultConfig).toEqual({
      documentType: 'cni',
      region: 'FR',
    });
    expect(identityCniModule.defaultConfig).toBe(defaultConfig);
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
      expect(identityCniModule).toHaveProperty(field);
    });
  });
});

describe('defaultConfig', () => {
  it('should default to CNI document type', () => {
    expect(defaultConfig.documentType).toBe('cni');
  });

  it('should default to FR region', () => {
    expect(defaultConfig.region).toBe('FR');
  });
});

describe('auto-registration', () => {
  it('should auto-register when imported', () => {
    // The module should be auto-registered when the module file is imported
    const registeredModule = getModule('identity-cni');
    expect(registeredModule).toBeDefined();
    expect(registeredModule?.id).toBe('identity-cni');
    expect(registeredModule?.name).toBe('Identity Document (CNI/Passport)');
  });
});
