import React from 'react';

jest.mock('./UserEdit.scss', () => ({}));

describe('UserEdit', () => {
  test('loads component module', () => {
    const mod = require('./UserEdit');
    expect(mod.UserEdit).toBeDefined();
    expect(typeof mod.UserEdit).toBe('function');
  });
});
