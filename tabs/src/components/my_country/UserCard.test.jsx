import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  test('renders user name, email and organisation', () => {
    const html = renderToStaticMarkup(
      <UserCard
        showAvatar={true}
        userInfo={{
          UserName: 'John Doe',
          PhotoSrc: 'photo',
          Email: 'john@example.org',
          Organisation: 'EEA',
        }}
      />,
    );

    expect(html).toContain('John Doe');
    expect(html).toContain('john@example.org');
    expect(html).toContain('EEA');
    expect(html).toContain('img');
  });
});
