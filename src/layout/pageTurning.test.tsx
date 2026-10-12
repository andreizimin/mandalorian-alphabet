import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageTurnBar, useArrowKeyPageTurns } from './pageTurning';

describe('PageTurnBar', () => {
  // @spec LAYOUT-012
  it('turns forward and back from fixed bar buttons', async () => {
    const onBack = vi.fn();
    const onForward = vi.fn();
    render(<PageTurnBar canBack onBack={onBack} onForward={onForward} />);

    await userEvent.click(screen.getByRole('button', { name: /next page/i }));
    await userEvent.click(screen.getByRole('button', { name: /previous page/i }));

    expect(onForward).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('navigation', { name: /page turning/i })).toHaveClass('page-turn-bar');
  });

  // @spec LAYOUT-012
  it('disables back on the first page', () => {
    render(<PageTurnBar canBack={false} onBack={() => {}} onForward={() => {}} />);
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).toBeEnabled();
  });
});

describe('useArrowKeyPageTurns', () => {
  function setup(enabled = true) {
    const onBack = vi.fn();
    const onForward = vi.fn();
    renderHook(() => useArrowKeyPageTurns({ enabled, onBack, onForward }));
    return { onBack, onForward };
  }

  // @spec LAYOUT-013
  it('turns forward on Right Arrow and back on Left Arrow', () => {
    const { onBack, onForward } = setup();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onForward).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  // @spec LAYOUT-013
  it('ignores arrows while typing in a text field', () => {
    const { onBack, onForward } = setup();
    const box = document.createElement('textarea');
    const field = document.createElement('input');
    document.body.append(box, field);

    fireEvent.keyDown(box, { key: 'ArrowRight' });
    fireEvent.keyDown(field, { key: 'ArrowLeft' });

    expect(onForward).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
    box.remove();
    field.remove();
  });

  // @spec LAYOUT-013
  it('leaves browser shortcuts with Cmd, Ctrl or Alt alone', () => {
    const { onBack, onForward } = setup();
    fireEvent.keyDown(window, { key: 'ArrowLeft', metaKey: true });
    fireEvent.keyDown(window, { key: 'ArrowRight', ctrlKey: true });
    fireEvent.keyDown(window, { key: 'ArrowRight', altKey: true });
    expect(onForward).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
  });

  // @spec LAYOUT-013
  it('does nothing when no passage page is shown', () => {
    const { onBack, onForward } = setup(false);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onForward).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
  });

  // @spec LAYOUT-013
  it('ignores other keys', () => {
    const { onBack, onForward } = setup();
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    fireEvent.keyDown(window, { key: ' ' });
    expect(onForward).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
  });
});

describe('keys from the feedback widget', () => {
  // @spec FEED-004
  it('never turns pages on keys typed inside the feedback widget', () => {
    const onBack = vi.fn();
    const onForward = vi.fn();
    renderHook(() => useArrowKeyPageTurns({ enabled: true, onBack, onForward }));
    const host = document.createElement('div');
    host.id = 'feedback-widget-host';
    document.body.append(host);

    fireEvent.keyDown(host, { key: 'ArrowRight' });
    fireEvent.keyDown(host, { key: 'ArrowLeft' });

    expect(onForward).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
    host.remove();
  });
});
