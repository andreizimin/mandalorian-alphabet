import { initialSettings, validateSettings, type Settings } from '../layout/settings';
import { KEY_PREFIX, type Slice } from './storage';

export const SETTINGS_KEY = `${KEY_PREFIX}settings`;

export const settingsSlice: Slice<Settings> = {
  key: SETTINGS_KEY,
  initial: initialSettings,
  validate: validateSettings,
};
