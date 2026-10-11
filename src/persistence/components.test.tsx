import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initialProgress } from '../progression/progression';
import { DataPanel, StorageNotice } from './components';

const progress = { ...initialProgress, learned: ['e', 't'], welcomeSeen: true };
const exportText = JSON.stringify({ app: 'script-ramp', version: 1, exportedAt: '2026-10-10T18:00:00Z', progress });
const jsonFile = (text: string, name = 'script-ramp-2026-10-10.json') =>
  new File([text], name, { type: 'application/json' });

describe('DataPanel', () => {
  function renderPanel() {
    const props = { onExport: vi.fn(), onImport: vi.fn() };
    render(<DataPanel {...props} />);
    return props;
  }

  // @spec PERS-002
  it('exports on tap', async () => {
    const props = renderPanel();
    await userEvent.click(screen.getByRole('button', { name: /export/i }));
    expect(props.onExport).toHaveBeenCalledTimes(1);
  });

  // @spec PERS-003
  it('imports a valid export only after confirmation', async () => {
    const props = renderPanel();

    await userEvent.upload(screen.getByLabelText(/import/i), jsonFile(exportText));
    expect(props.onImport).not.toHaveBeenCalled();
    expect(screen.getByText(/replace your progress/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /yes, replace/i }));
    expect(props.onImport).toHaveBeenCalledWith({ progress });
  });

  // @spec PERS-003
  it('does nothing when the learner cancels the import', async () => {
    const props = renderPanel();

    await userEvent.upload(screen.getByLabelText(/import/i), jsonFile(exportText));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(props.onImport).not.toHaveBeenCalled();
    expect(screen.queryByText(/replace your progress/i)).not.toBeInTheDocument();
  });

  // @spec PERS-007
  it('shows an error and imports nothing when the file is not an export', async () => {
    const props = renderPanel();

    await userEvent.upload(screen.getByLabelText(/import/i), jsonFile('{"hello":1}', 'notes.json'));

    expect(screen.getByRole('alert')).toHaveTextContent(/not a script ramp export/i);
    expect(screen.queryByText(/replace your progress/i)).not.toBeInTheDocument();
    expect(props.onImport).not.toHaveBeenCalled();
  });
});

describe('StorageNotice', () => {
  // @spec PERS-004
  it('warns that progress will not be saved when storage is unavailable', () => {
    render(<StorageNotice notice="unavailable" onDismiss={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent(/won't be saved/i);
  });

  // @spec PERS-006
  it('explains unreadable saved progress and can be dismissed', async () => {
    const onDismiss = vi.fn();
    render(<StorageNotice notice="unreadable" onDismiss={onDismiss} />);

    expect(screen.getByRole('status')).toHaveTextContent(/couldn't be read/i);
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalled();
  });

  // @spec PERS-004
  it('renders nothing without a notice', () => {
    const { container } = render(<StorageNotice notice={null} onDismiss={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
