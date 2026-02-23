import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('IndicatorCard', () => {
  test('loads component module', () => {
    const mod = require('./IndicatorCard');
    const target = mod['IndicatorCard'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
