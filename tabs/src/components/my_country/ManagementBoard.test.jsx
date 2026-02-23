import React from 'react';
jest.mock('./my_country.scss', () => ({}));

describe('ManagementBoard', () => {
  test('loads component module', () => {
    const mod = require('./ManagementBoard');
    const target = mod['ManagementBoard'];

    expect(target).toBeDefined();
    expect(typeof target).toBe('function');
  });
});
