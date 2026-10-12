import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackButton } from './FeedbackButton';
import { FEEDBACK_ACCENT, FEEDBACK_PROJECT, FEEDBACK_SCRIPT_URL, useFeedbackWidget } from './useFeedbackWidget';

function fakeWidget() {
  return { open: vi.fn(), close: vi.fn(), isOpen: () => false, version: '1.1.0', project: FEEDBACK_PROJECT };
}
const scripts = () => document.querySelectorAll(`script[src="${FEEDBACK_SCRIPT_URL}"]`);
const emit = (name: string) => window.dispatchEvent(new CustomEvent(name, { detail: { project: FEEDBACK_PROJECT } }));

afterEach(() => {
  scripts().forEach((s) => s.remove());
  delete window.FeedbackWidget;
});

describe('loading the widget', () => {
  // @spec FEED-001
  it('adds the shared widget script once, with the app slug, hidden launcher and app accent', () => {
    renderHook(() => useFeedbackWidget());
    renderHook(() => useFeedbackWidget());

    expect(scripts()).toHaveLength(1);
    const script = scripts()[0] as HTMLScriptElement;
    expect(FEEDBACK_SCRIPT_URL).toBe('https://feedback.andreizimin.com/widget.js');
    expect(script.dataset).toMatchObject({ project: 'learn-mandalorian', launcher: 'none', accent: FEEDBACK_ACCENT });
    expect(FEEDBACK_ACCENT).toBe('#8a5a2b');
  });
});

describe('availability', () => {
  // @spec FEED-003
  it('is unavailable until the widget reports ready', () => {
    const { result } = renderHook(() => useFeedbackWidget());
    expect(result.current.ready).toBe(false);

    act(() => {
      window.FeedbackWidget = fakeWidget();
      emit('feedback:ready');
    });

    expect(result.current.ready).toBe(true);
  });

  // @spec FEED-003
  it('is ready at once when the widget loaded before the app mounted', () => {
    window.FeedbackWidget = fakeWidget();
    const { result } = renderHook(() => useFeedbackWidget());
    expect(result.current.ready).toBe(true);
  });

  // @spec FEED-003
  it('shows the button disabled with the reason while the widget is unavailable', () => {
    render(<FeedbackButton ready={false} onOpen={() => {}} />);
    expect(screen.getByRole('button', { name: 'Feedback' })).toBeDisabled();
    expect(screen.getByText('Feedback needs a connection')).toBeInTheDocument();
  });
});

describe('opening the form', () => {
  // @spec FEED-002
  it('opens the shared form when the learner taps Feedback', async () => {
    window.FeedbackWidget = fakeWidget();
    const { result } = renderHook(() => useFeedbackWidget());
    render(<FeedbackButton ready={result.current.ready} onOpen={result.current.open} />);

    await userEvent.click(screen.getByRole('button', { name: 'Feedback' }));

    expect(window.FeedbackWidget!.open).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Feedback needs a connection')).not.toBeInTheDocument();
  });

  // @spec FEED-004
  it('tracks whether the form is open from the widget events', () => {
    window.FeedbackWidget = fakeWidget();
    const { result } = renderHook(() => useFeedbackWidget());
    expect(result.current.isOpen).toBe(false);

    act(() => emit('feedback:open'));
    expect(result.current.isOpen).toBe(true);

    act(() => emit('feedback:close'));
    expect(result.current.isOpen).toBe(false);
  });
});
