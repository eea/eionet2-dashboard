import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('dompurify', () => ({
  __esModule: true,
  default: {
    isSupported: true,
    addHook: jest.fn(),
    sanitize: jest.fn((html) => html),
  },
}));

import DOMPurify from 'dompurify';
import { HtmlBox } from './HtmlBox';

describe('HtmlBox', () => {
  beforeEach(() => {
    DOMPurify.sanitize.mockClear();
    DOMPurify.sanitize.mockImplementation((html) => html);
  });

  test('registers dompurify hook at module load', () => {
    expect(DOMPurify.addHook).toHaveBeenCalledWith('afterSanitizeAttributes', expect.any(Function));
  });

  test('does not render content when html is missing', () => {
    const html = renderToStaticMarkup(<HtmlBox />);

    expect(html).toBe('<div></div>');
    expect(DOMPurify.sanitize).not.toHaveBeenCalled();
  });

  test('sanitizes and renders html when provided', () => {
    DOMPurify.sanitize.mockReturnValue('<p>Safe</p>');

    const html = renderToStaticMarkup(<HtmlBox html={'<img src=x onerror=1 /><p>Safe</p>'} />);

    expect(DOMPurify.sanitize).toHaveBeenCalledWith('<img src=x onerror=1 /><p>Safe</p>');
    expect(html).toContain('<p>Safe</p>');
  });
});
