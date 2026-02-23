import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('AtAGlance', () => {
  test('loads component module', () => {
    const mod = require('./AtAGlance');
    const target = mod['AtAGlance'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
