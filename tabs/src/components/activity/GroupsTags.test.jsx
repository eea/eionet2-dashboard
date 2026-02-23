import React from 'react';

describe('GroupsTags', () => {
  test('loads component module', () => {
    const mod = require('./GroupsTags');
    const target = mod['GroupsTags'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
