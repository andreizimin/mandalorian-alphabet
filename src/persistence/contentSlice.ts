import { initialContent, validateContent, type ContentState } from '../content/reading';
import { KEY_PREFIX, type Slice } from './storage';

export const CONTENT_KEY = `${KEY_PREFIX}content`;

export const contentSlice: Slice<ContentState> = {
  key: CONTENT_KEY,
  initial: initialContent,
  validate: validateContent,
};
