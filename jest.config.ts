// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '.*\\.spec\\.ts$',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  // ignore e2e or integration tests if they live outside /src or have .e2e.spec.ts
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '\\.e2e\\.spec\\.ts$'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/index.ts',
    '!src/**/*.module.ts',
    '!src/**/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 69,
      functions: 69,
      lines: 69,
      statements: 69,
    },
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
