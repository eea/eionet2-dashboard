import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('DataReporters', () => {
  test('loads component module', () => {
    const mod = require('./DataReporters');
    const target = mod['DataReporters'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
