import { initialProgress, validateProgress, type ProgressState } from '../progression/progression';
import { KEY_PREFIX, type Slice } from './storage';

export const PROGRESS_KEY = `${KEY_PREFIX}progress`;

export const progressSlice: Slice<ProgressState> = {
  key: PROGRESS_KEY,
  initial: initialProgress,
  validate: validateProgress,
};
