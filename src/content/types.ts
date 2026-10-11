export interface Passage {
  id: string;
  title: string;
  source: 'bundled' | 'pasted';
  paragraphs: readonly string[];
}

/** A word in a passage: its paragraph index and its word index within that paragraph. */
export interface Position {
  paragraph: number;
  word: number;
}
