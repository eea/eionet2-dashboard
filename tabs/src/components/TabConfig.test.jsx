import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TabConfig from './TabConfig';
import * as microsoftTeams from '@microsoft/teams-js';

jest.mock('@microsoft/teams-js', () => ({
  initialize: jest.fn(),
  settings: {
    registerOnSaveHandler: jest.fn(),
    setSettings: jest.fn(),
    setValidityState: jest.fn(),
  },
}));

describe('TabConfig', () => {
  test('renders configuration content and initializes teams settings', () => {
    const originalWindow = global.window;
    global.window = { location: { hostname: 'localhost', port: '3000' } };
    const html = renderToStaticMarkup(<TabConfig />);

    expect(html).toContain('Tab Configuration');
    expect(microsoftTeams.initialize).toHaveBeenCalled();
    expect(microsoftTeams.settings.registerOnSaveHandler).toHaveBeenCalled();
    expect(microsoftTeams.settings.setValidityState).toHaveBeenCalledWith(true);
    global.window = originalWindow;
  });
});
