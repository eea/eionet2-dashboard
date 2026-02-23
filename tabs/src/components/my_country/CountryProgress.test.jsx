import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('CountryProgress', () => {
  test('loads component module', () => {
    const mod = require('./CountryProgress');
    const target = mod['CountryProgress'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
