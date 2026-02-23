import React from 'react';

describe('Reporting', () => {
  test('loads component module', () => {
    const mod = require('./Reporting');
    const target = mod['Reporting'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
