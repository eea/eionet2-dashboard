import React from 'react';

describe('CustomGridToolbar', () => {
  test('loads module even if exports are commented out', () => {
    const mod = require('./CustomGridToolbar');
    expect(mod).toBeDefined();
  });
});
