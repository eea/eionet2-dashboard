import React from 'react';

describe('TabConfig', () => {
  test('loads component module', () => {
    const mod = require('./TabConfig');
    const target = mod.default;

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
