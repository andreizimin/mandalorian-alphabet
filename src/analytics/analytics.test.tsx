import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestLink } from '../feedback/SuggestLink';
import { SUGGESTION_URL } from '../feedback/suggestion';
import { EVENT_PREFIX, track } from './analytics';

const UMAMI_TAG =
  '<script defer src="https://cloud.umami.is/script.js" data-website-id="743c516f-8c6d-4584-9f2a-72a062108294"></script>';

function fakeTracker() {
  const umami = { track: vi.fn() };
  window.umami = umami;
  return umami;
}

afterEach(() => {
  delete window.umami;
});

describe('the tag', () => {
  // @spec ANA-001
  it('is the exact shared Umami tag, deferred, in the head of index.html, with no data-domains', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));
    expect(head).toContain(UMAMI_TAG);
    expect(html).not.toContain('data-domains');
    expect(html.match(/cloud\.umami\.is/g)).toHaveLength(1);
  });
});

describe('track', () => {
  // @spec ANA-002
  it('does nothing when the tracker is absent', () => {
    expect(window.umami).toBeUndefined();
    expect(() => track('intro_done')).not.toThrow();
  });

  // @spec ANA-002
  it('prefixes the event name with mando_ and passes the counts through', () => {
    const umami = fakeTracker();
    track('letter_advance', { learned: 3 });
    track('intro_done');
    expect(EVENT_PREFIX).toBe('mando_');
    expect(umami.track).toHaveBeenNthCalledWith(1, 'mando_letter_advance', { learned: 3 });
    expect(umami.track.mock.calls[1][0]).toBe('mando_intro_done');
  });
});

describe('Suggest a feature', () => {
  // @spec FEED-006
  it('is a link to the suggestion page that opens in a new tab', () => {
    render(<SuggestLink />);
    const link = screen.getByRole('link', { name: /suggest a feature/i });
    expect(link).toHaveAttribute('href', SUGGESTION_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toMatch(/noopener/);
  });

  // @spec ANA-007
  it('reports the click', async () => {
    const umami = fakeTracker();
    const onChoose = vi.fn();
    render(<SuggestLink onChoose={onChoose} />);
    await userEvent.setup().click(screen.getByRole('link', { name: /suggest a feature/i }));
    expect(umami.track.mock.calls.map((c) => c[0])).toEqual(['mando_suggest_feature_click']);
    expect(onChoose).toHaveBeenCalledTimes(1);
  });
});
