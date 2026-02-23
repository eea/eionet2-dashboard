import React from 'react';

jest.mock('./Tab.scss', () => ({}));
jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));
jest.mock('../data/provider', () => ({
  getMe: jest.fn(),
}));
jest.mock('../data/hooks/useConfiguration', () => ({
  useConfiguration: () => ({}),
}));
jest.mock('../data/sharepointProvider', () => ({
  getCountries: jest.fn(),
  getCurrentParticipant: jest.fn(),
  getParticipants: jest.fn(),
}));
jest.mock('@microsoft/applicationinsights-react-js', () => ({
  AppInsightsContext: {
    Provider: ({ children }) => children,
  },
}));
jest.mock('../data/appInsights', () => ({
  reactPlugin: {},
}));
jest.mock('./UserMenu', () => ({ UserMenu: () => null }));
jest.mock('./BottomMenu', () => ({ BottomMenu: () => null }));
jest.mock('./activity/Activity', () => ({ Activity: () => null }));
jest.mock('./my_country/MyCountry', () => ({ MyCountry: () => null }));
jest.mock('./self_service/UserEdit', () => ({ UserEdit: () => null }));
jest.mock('./event_registration/ApprovalDialog', () => ({ ApprovalDialog: () => null }));
jest.mock('./event_rating/EventRatingDialog', () => ({ EventRatingDialog: () => null }));
jest.mock('./HtmlBox', () => ({ HtmlBox: () => null }));

describe('Tab', () => {
  test('loads component module', () => {
    const mod = require('./Tab');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});
