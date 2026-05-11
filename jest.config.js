module.exports = {
  testEnvironment: 'node',
  testTimeout: 20000,
  roots: ['<rootDir>/tests'],
  globalTeardown: '<rootDir>/tests/helpers/globalTeardown.js',
  maxWorkers: 1,
};
