import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FontPrompt } from './FontPrompt';
import type { Alphabet, FontStatus } from './alphabet';

function fakeAlphabet(status: FontStatus) {
  const listeners = new Set<() => void>();
  const alphabet = {
    fontFamily: 'Mandalorian',
    status: () => status,
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    loadFromFile: vi.fn(async () => {}),
    restore: vi.fn(async () => {}),
    isSubstitutionEnabled: () => status.state === 'loaded',
    order: () => [],
    setOrder: () => {},
  } satisfies Alphabet;
  return alphabet;
}

describe('FontPrompt', () => {
  // @spec ALPHA-004
  it('prompts to add a font while none is loaded', () => {
    render(<FontPrompt alphabet={fakeAlphabet({ state: 'none' })} />);

    expect(screen.getByText(/add .*font/i)).toBeInTheDocument();
    const input = screen.getByLabelText(/font file/i) as HTMLInputElement;
    expect(input.type).toBe('file');
    expect(input.accept.split(',').map((s) => s.trim())).toEqual(
      expect.arrayContaining(['.ttf', '.otf', '.woff2']),
    );
  });

  // @spec ALPHA-001
  it('hands a chosen file to the alphabet', async () => {
    const alphabet = fakeAlphabet({ state: 'none' });
    render(<FontPrompt alphabet={alphabet} />);
    const file = new File([new Uint8Array(4)], 'mando.ttf', { type: 'font/ttf' });

    await userEvent.upload(screen.getByLabelText(/font file/i), file);

    expect(alphabet.loadFromFile).toHaveBeenCalledWith(file);
  });

  // @spec ALPHA-003
  it('shows an error naming the file when loading failed', () => {
    render(
      <FontPrompt
        alphabet={fakeAlphabet({ state: 'error', fileName: 'broken.ttf', message: 'bad font data' })}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('broken.ttf');
    expect(screen.getByLabelText(/font file/i)).toBeInTheDocument();
  });

  // @spec ALPHA-004
  it('renders nothing once a font is loaded', () => {
    const { container } = render(
      <FontPrompt alphabet={fakeAlphabet({ state: 'loaded', fileName: 'mando.ttf' })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
