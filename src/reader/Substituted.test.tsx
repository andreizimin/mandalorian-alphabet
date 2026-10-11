import { render } from '@testing-library/react';
import { Substituted } from './Substituted';

const glyphs = (el: HTMLElement) => Array.from(el.querySelectorAll('.g')).map((g) => g.textContent);
const set = (s: string) => new Set(s.split(''));

describe('Substituted renderer', () => {
  // @spec READ-007
  it('substitutes exactly the letters in the set it is given, learned or not', () => {
    const { container } = render(<Substituted text="quiz" letters={set('qz')} />);
    expect(glyphs(container)).toEqual(['q', 'z']);
  });

  // @spec READ-007
  it('wraps substituted letters in target-font spans and leaves other letters bare', () => {
    const { container } = render(<Substituted text="tea" letters={set('e')} />);

    expect(glyphs(container)).toEqual(['e']);
    const glyph = container.querySelector('.g')!;
    expect(glyph.tagName).toBe('SPAN');
    expect(container.querySelectorAll('span.g')).toHaveLength(1);
    expect(container.textContent).toBe('tea');
  });

  // @spec READ-002
  it('keeps the DOM text Latin so copy and find-in-page return English', () => {
    const text = 'The Mandalorian kept his helmet on.';
    const { container } = render(<Substituted text={text} letters={set('etaoin')} />);
    expect(container.textContent).toBe(text);
  });

  // @spec READ-003
  it('labels each word containing glyphs with its Latin spelling, and only those words', () => {
    const { container } = render(<Substituted text="this is the way" letters={set('t')} />);

    const labeled = Array.from(container.querySelectorAll('[aria-label]'));
    expect(labeled.map((w) => w.getAttribute('aria-label'))).toEqual(['this', 'the']);
  });

  // @spec READ-005
  it('leaves digits, punctuation, whitespace and non-ASCII letters unchanged', () => {
    const text = 'Café 42, été!\tnext  line';
    const { container } = render(<Substituted text={text} letters={set('ec42,!')} />);

    expect(container.textContent).toBe(text);
    expect(glyphs(container)).toEqual(['C', 'e', 'e']); // Café, next, line; é, digits and punctuation stay

  });

  // @spec READ-006
  it('substitutes upper and lower case of a letter alike, keeping the case in the DOM', () => {
    const { container } = render(<Substituted text="Eve" letters={set('e')} />);
    expect(glyphs(container)).toEqual(['E', 'e']);
  });

  // @spec READ-007
  it('renders plain text with no spans when the set is empty', () => {
    const { container } = render(<Substituted text="plain" letters={new Set()} />);
    expect(container.querySelectorAll('span')).toHaveLength(0);
    expect(container.textContent).toBe('plain');
  });
});

describe('Substituted highlight', () => {
  const highlighted = (el: HTMLElement) => Array.from(el.querySelectorAll('.g.g-new')).map((g) => g.textContent);

  // @spec READ-009
  it('marks only the highlight letter, in both cases, and keeps every glyph a plain glyph otherwise', () => {
    const { container } = render(<Substituted text="Eve tea" letters={set('et')} highlight="e" />);

    expect(highlighted(container)).toEqual(['E', 'e', 'e']);
    expect(glyphs(container)).toEqual(['E', 'e', 't', 'e']);
    expect(container.textContent).toBe('Eve tea');
  });

  // @spec READ-009
  it('changes no size, weight or spacing: the highlight is a class with no inline style', () => {
    const { container } = render(<Substituted text="tea" letters={set('et')} highlight="t" />);
    for (const g of Array.from(container.querySelectorAll('.g'))) expect(g.getAttribute('style')).toBeNull();
  });

  // @spec READ-009
  it('marks nothing without a highlight letter, or when that letter is not substituted', () => {
    expect(highlighted(render(<Substituted text="tea" letters={set('et')} />).container)).toEqual([]);
    expect(highlighted(render(<Substituted text="tea" letters={set('t')} highlight="e" />).container)).toEqual([]);
  });
});
