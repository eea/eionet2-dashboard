import React from 'react';

describe('ResizableGrid', () => {
  test('loads component module', () => {
    const mod = require('./ResizableGrid');
    const target = mod.default;

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
