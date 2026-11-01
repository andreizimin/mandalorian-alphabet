import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestButton } from '../feedback/SuggestButton';
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
  it('opens the shared feedback form', async () => {
    const onOpen = vi.fn();
    render(<SuggestButton ready onOpen={onOpen} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Suggest a feature' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  // @spec FEED-006
  it('is disabled while the widget is unavailable', () => {
    render(<SuggestButton ready={false} onOpen={() => {}} />);
    expect(screen.getByRole('button', { name: 'Suggest a feature' })).toBeDisabled();
  });

  // @spec ANA-007
  it('reports the tap', async () => {
    const umami = fakeTracker();
    render(<SuggestButton ready onOpen={() => {}} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Suggest a feature' }));
    expect(umami.track.mock.calls.map((c) => c[0])).toEqual(['mando_suggest_feature_click']);
  });
});
