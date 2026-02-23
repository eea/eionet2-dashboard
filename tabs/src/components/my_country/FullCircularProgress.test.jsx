import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('FullCircularProgress', () => {
  test('loads component module', () => {
    const mod = require('./FullCircularProgress');
    const target = mod['FullCircularProgress'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
