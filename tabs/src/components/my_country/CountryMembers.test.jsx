import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('CountryMembers', () => {
  test('loads component module', () => {
    const mod = require('./CountryMembers');
    const target = mod['CountryMembers'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
