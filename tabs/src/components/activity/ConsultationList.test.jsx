import React from 'react';

describe('ConsultationList', () => {
  test('loads component module', () => {
    const mod = require('./ConsultationList');
    const target = mod['ConsultationList'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
