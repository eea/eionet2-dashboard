import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('UserCard', () => {
  test('loads component module', () => {
    const mod = require('./UserCard');
    const target = mod['UserCard'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
