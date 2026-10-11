import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EndCard, Library } from './components';
import type { Passage } from './types';

const bundled: Passage[] = [
  { id: 'wild', title: 'The Call of the Wild', source: 'bundled', paragraphs: ['a'] },
  { id: 'island', title: 'Treasure Island', source: 'bundled', paragraphs: ['b'] },
];
const pasted: Passage[] = [
  { id: 'p2', title: 'Newer paste…', source: 'pasted', paragraphs: ['c'] },
  { id: 'p1', title: 'Older paste…', source: 'pasted', paragraphs: ['d'] },
];

function renderLibrary() {
  const props = { bundled, pasted, onOpen: vi.fn(), onDelete: vi.fn(), onPaste: vi.fn() };
  render(<Library {...props} />);
  return props;
}

describe('Library', () => {
  // @spec TEXT-006
  it('lists bundled passages, then pasted passages in the order given (newest first)', () => {
    renderLibrary();
    const titles = within(screen.getByRole('list', { name: /passages/i }))
      .getAllByRole('button', { name: /^open /i })
      .map((b) => b.textContent);
    expect(titles).toEqual(['The Call of the Wild', 'Treasure Island', 'Newer paste…', 'Older paste…']);
  });

  // @spec TEXT-006
  it('opens a passage when chosen', async () => {
    const props = renderLibrary();
    await userEvent.click(screen.getByRole('button', { name: 'Open Treasure Island' }));
    expect(props.onOpen).toHaveBeenCalledWith('island');
  });

  // @spec TEXT-009
  it('offers delete only on pasted passages, and deletes after confirmation', async () => {
    const props = renderLibrary();
    expect(screen.queryByRole('button', { name: /delete the call of the wild/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete Older paste…' }));
    expect(props.onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /yes, delete/i }));

    expect(props.onDelete).toHaveBeenCalledWith('p1');
  });

  // @spec TEXT-009
  it('keeps the passage when deletion is cancelled', async () => {
    const props = renderLibrary();
    await userEvent.click(screen.getByRole('button', { name: 'Delete Newer paste…' }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(props.onDelete).not.toHaveBeenCalled();
  });

  // @spec TEXT-002, TEXT-007
  it('saves pasted text as a parsed passage', async () => {
    const props = renderLibrary();

    await userEvent.type(screen.getByLabelText(/paste text/i), 'This is the way.{enter}{enter}I have spoken.');
    await userEvent.click(screen.getByRole('button', { name: /save and read/i }));

    expect(props.onPaste).toHaveBeenCalledWith({
      title: 'This is the way.',
      paragraphs: ['This is the way.', 'I have spoken.'],
    });
  });

  // @spec TEXT-008
  it('says why text with no English letters cannot be saved', async () => {
    const props = renderLibrary();

    await userEvent.type(screen.getByLabelText(/paste text/i), '42 !!');
    await userEvent.click(screen.getByRole('button', { name: /save and read/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/no english letters/i);
    expect(props.onPaste).not.toHaveBeenCalled();
  });

  // @spec TEXT-008
  it('says why text over the limit cannot be saved', async () => {
    const props = renderLibrary();
    const box = screen.getByLabelText(/paste text/i);

    await userEvent.click(box);
    await userEvent.paste('a'.repeat(100_001));
    await userEvent.click(screen.getByRole('button', { name: /save and read/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/100,000 characters/);
    expect(props.onPaste).not.toHaveBeenCalled();
  });
});

describe('EndCard', () => {
  // @spec TEXT-012
  it('names the finished passage and offers the next passage and the library', async () => {
    const onNext = vi.fn();
    const onLibrary = vi.fn();
    render(<EndCard title="Treasure Island" onNext={onNext} onLibrary={onLibrary} />);

    expect(screen.getByRole('dialog')).toHaveTextContent('Treasure Island');
    await userEvent.click(screen.getByRole('button', { name: /next passage/i }));
    await userEvent.click(screen.getByRole('button', { name: /library/i }));

    expect(onNext).toHaveBeenCalled();
    expect(onLibrary).toHaveBeenCalled();
  });
});
