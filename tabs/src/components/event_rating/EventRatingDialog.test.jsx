import React from 'react';

describe('EventRatingDialog', () => {
  test('loads component module', () => {
    const mod = require('./EventRatingDialog');
    const target = mod['EventRatingDialog'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
