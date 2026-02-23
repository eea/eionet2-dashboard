import React from 'react';

describe('PublicationList', () => {
  test('loads component module', () => {
    const mod = require('./PublicationList');
    const target = mod['PublicatonList'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
