import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { paginate, type Page } from './paginate';

const ASCII_LETTER = /^[a-z]$/i;

/** Renders a candidate page into the measurer the way the reader renders it: learned letters as glyph spans. */
function fill(measurer: HTMLElement, blocks: string[], learned: ReadonlySet<string>) {
  measurer.replaceChildren(
    ...blocks.map((text) => {
      const p = document.createElement('p');
      for (const ch of text) {
        if (ASCII_LETTER.test(ch) && learned.has(ch.toLowerCase())) {
          const span = document.createElement('span');
          span.className = 'g';
          span.textContent = ch;
          p.append(span);
        } else {
          p.append(ch);
        }
      }
      return p;
    }),
  );
}

/**
 * Paginates a passage to the size of the reading area, measuring candidate
 * pages in a hidden element styled like it. Re-paginates when the area
 * appears (the reader is shown after the intro, the library or the quiz),
 * resizes (rotation, Split View, text size) or when `revision` changes.
 */
// @spec TEXT-003, TEXT-004
export function usePagination(
  paragraphs: readonly string[],
  learned: ReadonlySet<string>,
  areaRef: RefObject<HTMLElement | null>,
  measurerRef: RefObject<HTMLElement | null>,
  revision: string,
): Page[] {
  const [pages, setPages] = useState<Page[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const observed = useRef<HTMLElement | null>(null);
  const stopObserving = useRef<(() => void) | undefined>(undefined);

  // The area element comes and goes with the view, so the observer follows the element, not the ref.
  useLayoutEffect(() => {
    const area = areaRef.current;
    if (area === observed.current) return;
    stopObserving.current?.();
    stopObserving.current = undefined;
    observed.current = area;
    if (!area) return;
    const read = () => setSize({ width: area.clientWidth, height: area.clientHeight });
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(read);
    observer.observe(area);
    stopObserving.current = () => observer.disconnect();
  });
  useEffect(() => () => stopObserving.current?.(), []);

  useLayoutEffect(() => {
    const measurer = measurerRef.current;
    if (!measurer || size.height === 0) return;
    const fits = (blocks: string[]) => {
      fill(measurer, blocks, learned);
      return measurer.scrollHeight <= size.height;
    };
    setPages(paginate(paragraphs, fits));
    measurer.replaceChildren();
    // learned is represented by revision; listing it would re-paginate on every render.
  }, [paragraphs, size, revision, measurerRef]);

  return pages;
}
