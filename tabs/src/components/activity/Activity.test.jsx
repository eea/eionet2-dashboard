import React from 'react';

jest.mock('./activity.scss', () => ({}));

describe('Activity', () => {
  test('loads component module', () => {
    const mod = require('./Activity');
    expect(mod.Activity).toBeDefined();
    expect(typeof mod.Activity).toBe('function');
  });
});
