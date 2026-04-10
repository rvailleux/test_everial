/**
 * Tests for Proof of Address Module Index
 */

import {
  proofAddressModule,
  defaultConfig,
  ConfigComponent,
  ResultComponent,
  process,
} from '@/modules/proof-address';

describe('proof-address module', () => {
  describe('module descriptor', () => {
    it('should have correct id and name', () => {
      expect(proofAddressModule.id).toBe('proof-address');
      expect(proofAddressModule.name).toBe('Proof of Address');
    });

    it('should have a description', () => {
      expect(proofAddressModule.description).toBeDefined();
      expect(proofAddressModule.description.length).toBeGreaterThan(0);
      expect(proofAddressModule.description).toContain('address');
    });

    it('should have an icon', () => {
      expect(proofAddressModule.icon).toBe('home');
    });

    it('should export all required components', () => {
      expect(proofAddressModule.ConfigComponent).toBeDefined();
      expect(proofAddressModule.ResultComponent).toBeDefined();
      expect(proofAddressModule.process).toBeDefined();
    });

    it('should have valid default configuration', () => {
      expect(defaultConfig).toBeDefined();
      expect(defaultConfig.documentCategory).toBe('auto');
      expect(defaultConfig.includeRawResponse).toBe(false);
      
      expect(proofAddressModule.defaultConfig).toEqual(defaultConfig);
    });
  });

  describe('exports', () => {
    it('should export ConfigComponent', () => {
      expect(ConfigComponent).toBeDefined();
      expect(typeof ConfigComponent).toBe('function');
    });

    it('should export ResultComponent', () => {
      expect(ResultComponent).toBeDefined();
      expect(typeof ResultComponent).toBe('function');
    });

    it('should export process function', () => {
      expect(process).toBeDefined();
      expect(typeof process).toBe('function');
    });

    it('should export defaultConfig', () => {
      expect(defaultConfig).toBeDefined();
      expect(defaultConfig.documentCategory).toBe('auto');
      expect(defaultConfig.includeRawResponse).toBe(false);
    });
  });
});
