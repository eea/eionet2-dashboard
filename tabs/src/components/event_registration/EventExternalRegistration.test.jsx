import React from 'react';

describe('EventExternalRegistration', () => {
  test('loads component module', () => {
    const mod = require('./EventExternalRegistration');
    const target = mod['EventExternalRegistration'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
