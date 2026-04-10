/**
 * Tests for Module Registry
 *
 * @jest-environment node
 */

import {
  createModuleRegistry,
  registerModule,
  getModule,
  getAllModules,
  clearRegistry,
  registry as globalRegistry,
} from '@lib/modules/registry';
import { WizideeModule } from '@lib/modules/types';

// Test module fixtures
const createTestModule = (id: string): WizideeModule => ({
  id,
  name: `Test Module ${id}`,
  description: 'A test module',
  defaultConfig: { enabled: true },
  ConfigComponent: () => null,
  ResultComponent: () => null,
  process: async () => ({ success: true }),
});

describe('Module Registry', () => {
  beforeEach(() => {
    // Clear the global registry before each test
    globalRegistry.clear();
  });

  describe('registerModule', () => {
    it('T003: should register a module successfully', () => {
      const module = createTestModule('test-1');
      registerModule(module);

      expect(getModule('test-1')).toBe(module);
    });

    it('T003: should throw error for missing required fields', () => {
      expect(() => registerModule({} as WizideeModule)).toThrow();
    });

    it('T003: should warn when overwriting existing module', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const module1 = createTestModule('duplicate');
      const module2 = createTestModule('duplicate');

      registerModule(module1);
      registerModule(module2);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('duplicate'));
      consoleSpy.mockRestore();
    });
  });

  describe('getAllModules', () => {
    it('T004: should return empty array when no modules registered', () => {
      expect(getAllModules()).toEqual([]);
    });

    it('T004: should return all registered modules', () => {
      const module1 = createTestModule('mod-1');
      const module2 = createTestModule('mod-2');

      registerModule(module1);
      registerModule(module2);

      const all = getAllModules();
      expect(all).toHaveLength(2);
      expect(all).toContain(module1);
      expect(all).toContain(module2);
    });
  });

  describe('getModule', () => {
    it('T005: should return module by id', () => {
      const module = createTestModule('find-me');
      registerModule(module);

      expect(getModule('find-me')).toBe(module);
    });

    it('T005: should return undefined for non-existent module', () => {
      expect(getModule('does-not-exist')).toBeUndefined();
    });
  });

  describe('clearRegistry', () => {
    it('T006: should remove all modules', () => {
      registerModule(createTestModule('mod-1'));
      registerModule(createTestModule('mod-2'));

      clearRegistry();

      expect(getAllModules()).toEqual([]);
      expect(getModule('mod-1')).toBeUndefined();
    });
  });

  describe('createModuleRegistry', () => {
    it('should create isolated registry instances', () => {
      const registry1 = createModuleRegistry();
      const registry2 = createModuleRegistry();

      const module = createTestModule('isolated');
      registry1.register(module);

      expect(registry1.get('isolated')).toBe(module);
      expect(registry2.get('isolated')).toBeUndefined();
    });
  });
});
