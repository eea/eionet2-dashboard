import React from 'react';

describe('EventRating', () => {
  test('loads component module', () => {
    const mod = require('./EventRating');
    const target = mod['EventRating'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
