import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TabConfig from './TabConfig';
import * as microsoftTeams from '@microsoft/teams-js';

jest.mock('@microsoft/teams-js', () => ({
  app: {
    initialize: jest.fn(() => Promise.resolve()),
  },
  pages: {
    config: {
      registerOnSaveHandler: jest.fn(),
      setConfig: jest.fn(),
      setValidityState: jest.fn(),
    },
  },
}));

describe('TabConfig', () => {
  test('renders configuration content and initializes teams settings', async () => {
    const originalWindow = global.window;
    global.window = { location: { hostname: 'localhost', port: '3000' } };
    const html = renderToStaticMarkup(<TabConfig />);

    await Promise.resolve();

    expect(html).toContain('Tab Configuration');
    expect(microsoftTeams.app.initialize).toHaveBeenCalled();
    expect(microsoftTeams.pages.config.registerOnSaveHandler).toHaveBeenCalled();
    expect(microsoftTeams.pages.config.setValidityState).toHaveBeenCalledWith(true);
    global.window = originalWindow;
  });
});
