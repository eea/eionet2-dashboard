import React from 'react';

describe('ObligationList', () => {
  test('loads component module', () => {
    const mod = require('./ObligationList');
    const target = mod['ObligationList'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
