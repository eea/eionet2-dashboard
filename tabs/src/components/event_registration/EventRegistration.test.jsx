import React from 'react';

describe('EventRegistration', () => {
  test('loads component module', () => {
    const mod = require('./EventRegistration');
    const target = mod['EventRegistration'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
