export interface Settings {
  textSize: number;
}

export const MIN_TEXT_SIZE = 16;
export const MAX_TEXT_SIZE = 32;
const TEXT_SIZE_STEP = 2;

export const initialSettings: Settings = { textSize: 20 };

// @spec LAYOUT-006
export function stepTextSize(settings: Settings, direction: 1 | -1): Settings {
  const next = settings.textSize + direction * TEXT_SIZE_STEP;
  if (next < MIN_TEXT_SIZE || next > MAX_TEXT_SIZE) return settings;
  return { ...settings, textSize: next };
}

/** Checks a value restored from storage or an import against the settings shape. */
// @spec PERS-003, PERS-006
export function validateSettings(value: unknown): value is Settings {
  if (typeof value !== 'object' || value === null) return false;
  const { textSize } = value as Record<string, unknown>;
  return (
    typeof textSize === 'number' &&
    Number.isInteger(textSize) &&
    textSize >= MIN_TEXT_SIZE &&
    textSize <= MAX_TEXT_SIZE &&
    textSize % TEXT_SIZE_STEP === 0
  );
}
