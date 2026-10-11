import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FontStatus } from './FontStatus';
import type { Alphabet, FontState } from './alphabet';

function fakeAlphabet(state: FontState) {
  return {
    fontFamily: 'Mando AF',
    status: () => state,
    subscribe: () => () => {},
    start: vi.fn(async () => {}),
    retry: vi.fn(async () => {}),
    isSubstitutionEnabled: () => state === 'loaded',
    order: () => [],
    setOrder: () => {},
  } satisfies Alphabet;
}

describe('FontStatus', () => {
  // @spec ALPHA-003
  it('shows a non-blocking message with a retry action when the font failed to load', async () => {
    const alphabet = fakeAlphabet('failed');
    render(<FontStatus alphabet={alphabet} />);

    expect(screen.getByRole('status')).toHaveTextContent(/glyphs/i);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(alphabet.retry).toHaveBeenCalledTimes(1);
  });

  // @spec ALPHA-003
  it('renders nothing while loading or once loaded', () => {
    const loading = render(<FontStatus alphabet={fakeAlphabet('loading')} />);
    expect(loading.container).toBeEmptyDOMElement();
    loading.unmount();

    const loaded = render(<FontStatus alphabet={fakeAlphabet('loaded')} />);
    expect(loaded.container).toBeEmptyDOMElement();
  });
});
