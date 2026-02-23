import React from 'react';

describe('EventList', () => {
  test('loads component module', () => {
    const mod = require('./EventList');
    const target = mod['EventList'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
