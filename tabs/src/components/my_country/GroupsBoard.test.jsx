import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('GroupsBoard', () => {
  test('loads component module', () => {
    const mod = require('./GroupsBoard');
    const target = mod['GroupsBoard'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
