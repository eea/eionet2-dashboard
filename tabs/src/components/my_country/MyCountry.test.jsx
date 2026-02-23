import React from 'react';

jest.mock('./my_country.scss', () => ({}));

describe('MyCountry', () => {
  test('loads component module', () => {
    const mod = require('./MyCountry');
    expect(mod.MyCountry).toBeDefined();
    expect(typeof mod.MyCountry).toBe('function');
  });
});
