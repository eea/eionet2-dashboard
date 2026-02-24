import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

describe('App', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('renders loading state', () => {
    jest.doMock('./lib/useTeamsAuth', () => ({
      useTeamsAuth: () => ({ theme: null, loading: true, error: null }),
    }));
    jest.doMock('./Privacy', () => () => null);
    jest.doMock('./TermsOfUse', () => () => null);
    jest.doMock('./Tab', () => () => null);
    jest.doMock('./TabConfig', () => () => null);
    jest.doMock('@fluentui/react-components', () => ({
      FluentProvider: ({ children }) => children,
      teamsLightTheme: {},
      Spinner: () => <div>loading-spinner</div>,
      Text: ({ children }) => children,
    }));
    jest.doMock('react-router-dom', () => ({
      HashRouter: ({ children }) => children,
      Navigate: () => null,
      Route: () => null,
      Routes: ({ children }) => children,
    }));

    const mod = require('./App');
    const App = mod.default;
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('loading-spinner');
  });

  test('renders fatal error message when auth fails', () => {
    jest.doMock('./lib/useTeamsAuth', () => ({
      useTeamsAuth: () => ({ theme: null, loading: false, error: new Error('Auth failed') }),
    }));
    jest.doMock('./Privacy', () => () => null);
    jest.doMock('./TermsOfUse', () => () => null);
    jest.doMock('./Tab', () => () => null);
    jest.doMock('./TabConfig', () => () => null);
    jest.doMock('@fluentui/react-components', () => ({
      FluentProvider: ({ children }) => children,
      teamsLightTheme: {},
      Spinner: () => <div>loading-spinner</div>,
      Text: ({ children }) => <span>{children}</span>,
    }));
    jest.doMock('react-router-dom', () => ({
      HashRouter: ({ children }) => children,
      Navigate: () => null,
      Route: () => null,
      Routes: ({ children }) => children,
    }));

    const mod = require('./App');
    const App = mod.default;
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain(
      'Something went wrong while initializing Microsoft Teams authentication.',
    );
    expect(html).toContain('Auth failed');
  });
});
