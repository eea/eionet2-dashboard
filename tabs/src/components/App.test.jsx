import React from 'react';

describe('App', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('loads component module', () => {
    jest.doMock('./lib/useTeamsAuth', () => ({
      useTeamsAuth: () => ({ theme: null, loading: false, error: null }),
    }));
    jest.doMock('./Privacy', () => () => null);
    jest.doMock('./TermsOfUse', () => () => null);
    jest.doMock('./Tab', () => () => null);
    jest.doMock('./TabConfig', () => () => null);
    jest.doMock('@fluentui/react-components', () => ({
      FluentProvider: ({ children }) => children,
      teamsLightTheme: {},
      Spinner: () => null,
      Text: ({ children }) => children,
    }));
    jest.doMock('react-router-dom', () => ({
      HashRouter: ({ children }) => children,
      Navigate: () => null,
      Route: () => null,
      Routes: ({ children }) => children,
    }));

    const mod = require('./App');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});
