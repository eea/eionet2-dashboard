import React from 'react';

describe('ApprovalDialog', () => {
  test('loads component module', () => {
    const mod = require('./ApprovalDialog');
    const target = mod['ApprovalDialog'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
