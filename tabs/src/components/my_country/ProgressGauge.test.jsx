import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('ProgressGauge', () => {
  test('loads component module', () => {
    const mod = require('./ProgressGauge');
    const target = mod['ProgressGauge'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
