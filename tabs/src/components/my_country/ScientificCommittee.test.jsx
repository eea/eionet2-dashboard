import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('ScientificCommittee', () => {
  test('loads component module', () => {
    const mod = require('./ScientificCommittee');
    const target = mod['ScientificCommittee'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
