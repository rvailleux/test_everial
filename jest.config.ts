import type { Config } from 'jest';
import path from 'path';

const pathAliases = {
  '^@/(.*)$': path.resolve(__dirname, 'src/$1'),
  '^@lib/(.*)$': path.resolve(__dirname, 'lib/$1'),
};

const config: Config = {
  projects: [
    {
      displayName: 'api',
      testEnvironment: 'node',
      testPathIgnorePatterns: ['<rootDir>/.claude/'],
      testMatch: ['**/tests/api/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
      },
      moduleNameMapper: pathAliases,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    {
      displayName: 'modules',
      testEnvironment: 'node',
      testPathIgnorePatterns: ['<rootDir>/.claude/'],
      testMatch: ['**/tests/modules/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
      },
      moduleNameMapper: pathAliases,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    {
      displayName: 'hooks',
      testEnvironment: 'jsdom',
      testPathIgnorePatterns: ['<rootDir>/.claude/'],
      testMatch: ['**/tests/hooks/**/*.test.{ts,tsx}'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
      },
      moduleNameMapper: pathAliases,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    {
      displayName: 'context',
      testEnvironment: 'jsdom',
      testPathIgnorePatterns: ['<rootDir>/.claude/'],
      testMatch: ['**/tests/context/**/*.test.tsx'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
      },
      moduleNameMapper: pathAliases,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    {
      displayName: 'components',
      testEnvironment: 'jsdom',
      testPathIgnorePatterns: ['<rootDir>/.claude/'],
      testMatch: ['**/tests/components/**/*.test.tsx'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }],
      },
      moduleNameMapper: pathAliases,
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
  ],
};

export default config;
