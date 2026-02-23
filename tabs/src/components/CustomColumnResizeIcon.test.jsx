import React from 'react';

describe('CustomColumnResizeIcon', () => {
  test('loads component module', () => {
    const mod = require('./CustomColumnResizeIcon');
    const target = mod.default;

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
