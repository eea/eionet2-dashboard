import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('YearlyProgress', () => {
  test('loads component module', () => {
    const mod = require('./YearlyProgress');
    const target = mod['YearlyProgress'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
