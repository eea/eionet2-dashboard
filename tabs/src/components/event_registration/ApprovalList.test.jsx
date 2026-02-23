import React from 'react';

describe('ApprovalList', () => {
  test('loads component module', () => {
    const mod = require('./ApprovalList');
    const target = mod['ApprovalList'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
