/**
 * Unit tests for Module Registry
 *
 * User Story 1: Register and Discover Modules
 * Tests for lib/modules/registry.ts
 */

import {
  registerModule,
  getAllModules,
  getModuleById,
  clearRegistry,
} from '../../lib/modules/registry';
import { WizideeModule } from '../../lib/modules/types';

// Mock React components for testing
const MockConfigComponent = () => null;
const MockResultComponent = () => null;

// Helper to create a test module
const createTestModule = (id: string, overrides?: Partial<WizideeModule>): WizideeModule => ({
  id,
  name: `Test Module ${id}`,
  description: 'A test module',
  ConfigComponent: MockConfigComponent,
  ResultComponent: MockResultComponent,
  process: async () => ({ success: true }),
  defaultConfig: { enabled: true },
  ...overrides,
});

describe('Module Registry', () => {
  beforeEach(() => {
    clearRegistry();
  });

  describe('registerModule', () => {
    it('T004: should store module in registry', () => {
      const module = createTestModule('test-module');

      registerModule(module);

      expect(getModuleById('test-module')).toBe(module);
    });

    it('should overwrite existing module with same ID', () => {
      const module1 = createTestModule('same-id', { name: 'First' });
      const module2 = createTestModule('same-id', { name: 'Second' });

      registerModule(module1);
      registerModule(module2);

      const retrieved = getModuleById('same-id');
      expect(retrieved?.name).toBe('Second');
    });

    it('should allow registering multiple modules', () => {
      const module1 = createTestModule('module-1');
      const module2 = createTestModule('module-2');

      registerModule(module1);
      registerModule(module2);

      expect(getAllModules()).toHaveLength(2);
    });
  });

  describe('getAllModules', () => {
    it('T006: should return empty array when no modules registered', () => {
      const modules = getAllModules();
      expect(modules).toEqual([]);
    });

    it('should return array of all registered modules', () => {
      const module1 = createTestModule('module-1');
      const module2 = createTestModule('module-2');

      registerModule(module1);
      registerModule(module2);

      const modules = getAllModules();
      expect(modules).toHaveLength(2);
      expect(modules).toContain(module1);
      expect(modules).toContain(module2);
    });

    it('should return a copy of the modules array', () => {
      registerModule(createTestModule('module-1'));

      const modules = getAllModules();
      modules.pop();

      expect(getAllModules()).toHaveLength(1);
    });
  });

  describe('getModuleById', () => {
    it('T005: should retrieve module by ID', () => {
      const module = createTestModule('test-module');
      registerModule(module);

      const retrieved = getModuleById('test-module');

      expect(retrieved).toBe(module);
    });

    it('should return undefined for non-existent module', () => {
      const result = getModuleById('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('clearRegistry', () => {
    it('should remove all modules from registry', () => {
      registerModule(createTestModule('module-1'));
      registerModule(createTestModule('module-2'));

      clearRegistry();

      expect(getAllModules()).toEqual([]);
      expect(getModuleById('module-1')).toBeUndefined();
    });

    it('should work on empty registry without error', () => {
      expect(() => clearRegistry()).not.toThrow();
      expect(getAllModules()).toEqual([]);
    });
  });
});
