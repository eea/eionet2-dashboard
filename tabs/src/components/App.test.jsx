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
      FluentProvider: 'div',
      teamsLightTheme: {},
      Spinner: () => <div>loading-spinner</div>,
      Text: 'span',
    }));
    jest.doMock('react-router-dom', () => ({
      HashRouter: React.Fragment,
      Navigate: () => null,
      Route: () => null,
      Routes: React.Fragment,
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
      FluentProvider: 'div',
      teamsLightTheme: {},
      Spinner: () => <div>loading-spinner</div>,
      Text: 'span',
    }));
    jest.doMock('react-router-dom', () => ({
      HashRouter: React.Fragment,
      Navigate: () => null,
      Route: () => null,
      Routes: React.Fragment,
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
