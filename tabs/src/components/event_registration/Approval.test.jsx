import React from 'react';

describe('Approval', () => {
  test('loads component module', () => {
    const mod = require('./Approval');
    const target = mod['Approval'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
