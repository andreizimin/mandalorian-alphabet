import { initialContent } from '../content/reading';
import { initialProgress } from '../progression/progression';
import { buildExport, deliverExport, parseImport } from './exportImport';

const progress = { ...initialProgress, learned: ['e', 't'], peeksByLetter: { e: 2 }, welcomeSeen: true };

describe('buildExport', () => {
  // @spec PERS-002
  it('names the file by date and includes app id, version, export time and progress', () => {
    const now = new Date('2026-10-10T18:00:00Z');

    const file = buildExport({ progress }, now);

    expect(file.fileName).toBe('script-ramp-2026-10-10.json');
    expect(JSON.parse(file.json)).toEqual({
      app: 'script-ramp',
      version: 1,
      exportedAt: '2026-10-10T18:00:00.000Z',
      progress,
    });
  });
});

describe('parseImport', () => {
  const valid = JSON.stringify({ app: 'script-ramp', version: 1, exportedAt: '2026-10-10T18:00:00Z', progress });

  // @spec PERS-003
  it('accepts a valid export', () => {
    expect(parseImport(valid)).toEqual({ ok: true, data: { progress } });
  });

  // @spec PERS-003
  it('round-trips its own export', () => {
    expect(parseImport(buildExport({ progress }, new Date()).json)).toEqual({ ok: true, data: { progress } });
  });

  // @spec PERS-007
  it.each([
    ['not JSON', 'hello'],
    ['JSON that is not an object', '[1,2]'],
    ['another app', JSON.stringify({ app: 'other', version: 1, progress })],
    ['an unknown version', JSON.stringify({ app: 'script-ramp', version: 2, progress })],
    ['no progress', JSON.stringify({ app: 'script-ramp', version: 1 })],
    ['invalid progress', JSON.stringify({ app: 'script-ramp', version: 1, progress: { ...progress, learned: ['e', 'e'] } })],
  ])('rejects %s', (_label, text) => {
    expect(parseImport(text)).toEqual({ ok: false });
  });
});

describe('content in export and import', () => {
  const content = {
    ...initialContent,
    currentId: 'p1',
    positions: { p1: { paragraph: 0, word: 1 } },
    pasted: [{ id: 'p1', title: 'Mine', source: 'pasted' as const, paragraphs: ['hello there'] }],
  };

  // @spec PERS-002
  it('includes current passage, positions and pasted passages in the export', () => {
    const parsed = JSON.parse(buildExport({ progress, content }, new Date('2026-10-10T18:00:00Z')).json);
    expect(parsed.content).toEqual(content);
  });

  // @spec PERS-003
  it('imports valid content alongside progress', () => {
    expect(parseImport(buildExport({ progress, content }, new Date()).json)).toEqual({
      ok: true,
      data: { progress, content },
    });
  });

  // @spec PERS-007
  it('rejects an export whose content is invalid', () => {
    const bad = JSON.stringify({ app: 'script-ramp', version: 1, progress, content: { ...content, currentId: 7 } });
    expect(parseImport(bad)).toEqual({ ok: false });
  });
});

describe('deliverExport', () => {
  const file = { fileName: 'script-ramp-2026-10-10.json', json: '{"app":"script-ramp"}' };

  // @spec PERS-002
  it('uses the share sheet when the device can share files', async () => {
    const share = vi.fn(async () => {});
    const download = vi.fn();

    await deliverExport(file, { canShare: () => true, share, download });

    expect(download).not.toHaveBeenCalled();
    const shared = (share.mock.calls[0] as unknown as [{ files: File[] }])[0].files[0];
    expect(shared.name).toBe(file.fileName);
    expect(shared.type).toBe('application/json');
    expect(await shared.text()).toBe(file.json);
  });

  // @spec PERS-002
  it('falls back to a download when file sharing is not available', async () => {
    const download = vi.fn();

    await deliverExport(file, { download });

    expect(download).toHaveBeenCalledTimes(1);
    const [name, blob] = download.mock.calls[0] as [string, Blob];
    expect(name).toBe(file.fileName);
    expect(await blob.text()).toBe(file.json);
  });

  // @spec PERS-002
  it('does not also download when the learner cancels the share sheet', async () => {
    const share = vi.fn(async () => {
      throw new DOMException('cancelled', 'AbortError');
    });
    const download = vi.fn();

    await deliverExport(file, { canShare: () => true, share, download });

    expect(download).not.toHaveBeenCalled();
  });
});
