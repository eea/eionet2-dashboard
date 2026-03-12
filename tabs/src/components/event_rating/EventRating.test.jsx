import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventRating } from './EventRating';

jest.mock('@mui/material', () => {
  const ReactLocal = require('react');
  const passthrough =
    (Tag = 'div') =>
    ({ children }) =>
      ReactLocal.createElement(Tag, {}, children);

  const Rating = ({ value, getLabelText }) => (
    <div>
      <span>rating-value-{value}</span>
      <span>{getLabelText ? getLabelText(value) : ''}</span>
    </div>
  );

  return {
    Box: passthrough(),
    Button: ({ children }) => <button>{children}</button>,
    CircularProgress: passthrough('span'),
    Backdrop: passthrough(),
    Rating,
    Typography: passthrough('span'),
  };
});

jest.mock('@mui/icons-material/Check', () => () => <span>check-icon</span>);
jest.mock('@mui/icons-material/Save', () => () => <span>save-icon</span>);
jest.mock('@mui/icons-material/Star', () => () => <span>star-icon</span>);

jest.mock('../../data/sharepointProvider', () => ({
  postRating: jest.fn(),
}));

describe('EventRating', () => {
  test('renders modal text, rating caption and confirm button', () => {
    const html = renderToStaticMarkup(
      <EventRating
        configuration={{ EventRatingModalText: 'Please rate this event' }}
        participant={{ id: 1 }}
        event={{ id: 2 }}
        onRate={jest.fn()}
      />,
    );

    expect(html).toContain('Please rate this event');
    expect(html).toContain('rating-value-5');
    expect(html).toContain('5 Stars, Excellent');
    expect(html).toContain('Excellent');
    expect(html).toContain('Confirm rating');
  });

  test('renders without optional modal text', () => {
    const html = renderToStaticMarkup(
      <EventRating configuration={{}} participant={{}} event={{}} onRate={jest.fn()} />,
    );

    expect(html).not.toContain('Please rate this event');
    expect(html).toContain('Confirm rating');
  });
});
