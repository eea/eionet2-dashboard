import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('GroupView', () => {
  test('loads component module', () => {
    const mod = require('./GroupView');
    const target = mod['GroupView'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
