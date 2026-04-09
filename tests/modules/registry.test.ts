/**
 * Unit tests for Module Registry
 *
 * Tests: T003-T007
 * - T003: validation rejects incomplete modules
 * - T004: registerModule stores module in Map
 * - T005: getModule retrieves by ID
 * - T006: getAllModules returns array
 * - T007: duplicate ID warns and overwrites
 */

import { createModuleRegistry } from '@/lib/modules/registry';
import { WizideeModule } from '@/lib/modules/types';

// Mock React components for testing
const MockConfigComponent = () => null;
const MockResultComponent = () => null;

// Helper to create a valid test module
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
  let registry: ReturnType<typeof createModuleRegistry>;

  beforeEach(() => {
    registry = createModuleRegistry();
  });

  describe('T003: Module Validation', () => {
    it('should reject module without id', () => {
      const invalidModule = createTestModule('test');
      delete (invalidModule as any).id;

      expect(() => registry.register(invalidModule)).toThrow('Module id is required');
    });

    it('should reject module without name', () => {
      const invalidModule = createTestModule('test');
      delete (invalidModule as any).name;

      expect(() => registry.register(invalidModule)).toThrow('Module name is required');
    });

    it('should reject module without description', () => {
      const invalidModule = createTestModule('test');
      delete (invalidModule as any).description;

      expect(() => registry.register(invalidModule)).toThrow('Module description is required');
    });

    it('should reject module without ConfigComponent', () => {
      const invalidModule = createTestModule('test');
      delete (invalidModule as any).ConfigComponent;

      expect(() => registry.register(invalidModule)).toThrow('Module ConfigComponent is required');
    });

    it('should reject module without ResultComponent', () => {
      const invalidModule = createTestModule('test');
      delete (invalidModule as any).ResultComponent;

      expect(() => registry.register(invalidModule)).toThrow('Module ResultComponent is required');
    });

    it('should reject module without process function', () => {
      const invalidModule = createTestModule('test');
      delete (invalidModule as any).process;

      expect(() => registry.register(invalidModule)).toThrow('Module process is required');
    });

    it('should reject module without defaultConfig', () => {
      const invalidModule = createTestModule('test');
      delete (invalidModule as any).defaultConfig;

      expect(() => registry.register(invalidModule)).toThrow('Module defaultConfig is required');
    });
  });

  describe('T004: registerModule', () => {
    it('should store module in registry', () => {
      const module = createTestModule('test-module');

      registry.register(module);

      expect(registry.has('test-module')).toBe(true);
    });

    it('should store complete module descriptor', () => {
      const module = createTestModule('test-module', {
        name: 'Custom Name',
        description: 'Custom Description',
      });

      registry.register(module);
      const retrieved = registry.get('test-module');

      expect(retrieved).toEqual(module);
    });
  });

  describe('T005: getModule', () => {
    it('should retrieve module by ID', () => {
      const module = createTestModule('test-module');
      registry.register(module);

      const retrieved = registry.get('test-module');

      expect(retrieved).toBe(module);
    });

    it('should return undefined for non-existent module', () => {
      const retrieved = registry.get('non-existent');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('T006: getAllModules', () => {
    it('should return empty array when no modules registered', () => {
      const modules = registry.getAll();

      expect(modules).toEqual([]);
    });

    it('should return array of all registered modules', () => {
      const module1 = createTestModule('module-1');
      const module2 = createTestModule('module-2');

      registry.register(module1);
      registry.register(module2);

      const modules = registry.getAll();

      expect(modules).toHaveLength(2);
      expect(modules).toContain(module1);
      expect(modules).toContain(module2);
    });

    it('should return array (not Map)', () => {
      registry.register(createTestModule('test'));

      const modules = registry.getAll();

      expect(Array.isArray(modules)).toBe(true);
    });
  });

  describe('T007: Duplicate ID Handling', () => {
    it('should warn when registering module with duplicate ID', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const module1 = createTestModule('duplicate-id', { name: 'First' });
      const module2 = createTestModule('duplicate-id', { name: 'Second' });

      registry.register(module1);
      registry.register(module2);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('duplicate-id')
      );

      consoleSpy.mockRestore();
    });

    it('should overwrite existing module with same ID', () => {
      const module1 = createTestModule('duplicate-id', { name: 'First' });
      const module2 = createTestModule('duplicate-id', { name: 'Second' });

      registry.register(module1);
      registry.register(module2);

      const retrieved = registry.get('duplicate-id');

      expect(retrieved?.name).toBe('Second');
    });
  });

  describe('Additional Registry Methods', () => {
    it('should return correct count', () => {
      expect(registry.count()).toBe(0);

      registry.register(createTestModule('module-1'));
      expect(registry.count()).toBe(1);

      registry.register(createTestModule('module-2'));
      expect(registry.count()).toBe(2);
    });

    it('should unregister module by ID', () => {
      registry.register(createTestModule('to-remove'));

      const removed = registry.unregister('to-remove');

      expect(removed).toBe(true);
      expect(registry.has('to-remove')).toBe(false);
    });

    it('should return false when unregistering non-existent module', () => {
      const removed = registry.unregister('non-existent');

      expect(removed).toBe(false);
    });

    it('should clear all modules', () => {
      registry.register(createTestModule('module-1'));
      registry.register(createTestModule('module-2'));

      registry.clear();

      expect(registry.count()).toBe(0);
      expect(registry.getAll()).toEqual([]);
    });
  });
});
