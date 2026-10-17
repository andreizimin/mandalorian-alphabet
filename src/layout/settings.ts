export type Appearance = 'system' | 'light' | 'dark';

/** The cycle order of the appearance control: Auto → Light → Dark → Auto. */
export const APPEARANCES: readonly Appearance[] = ['system', 'light', 'dark'];

/** What the control calls each appearance. */
export const APPEARANCE_LABEL: Record<Appearance, string> = { system: 'Auto', light: 'Light', dark: 'Dark' };

export interface Settings {
  textSize: number;
  /** Absent in settings saved before the appearance setting existed; read as 'system' (LAYOUT-018). */
  appearance?: Appearance;
}

export const MIN_TEXT_SIZE = 16;
export const MAX_TEXT_SIZE = 32;
const TEXT_SIZE_STEP = 2;

export const initialSettings: Settings = { textSize: 20, appearance: 'system' };

// @spec LAYOUT-006
export function stepTextSize(settings: Settings, direction: 1 | -1): Settings {
  const next = settings.textSize + direction * TEXT_SIZE_STEP;
  if (next < MIN_TEXT_SIZE || next > MAX_TEXT_SIZE) return settings;
  return { ...settings, textSize: next };
}

// @spec LAYOUT-018
export function appearanceOf(settings: Settings): Appearance {
  return settings.appearance ?? 'system';
}

// @spec LAYOUT-017
export function cycleAppearance(settings: Settings): Settings {
  const current = APPEARANCES.indexOf(appearanceOf(settings));
  return { ...settings, appearance: APPEARANCES[(current + 1) % APPEARANCES.length] };
}

/** Checks a value restored from storage or an import against the settings shape. */
// @spec PERS-003, PERS-006, LAYOUT-018
export function validateSettings(value: unknown): value is Settings {
  if (typeof value !== 'object' || value === null) return false;
  const { textSize, appearance } = value as Record<string, unknown>;
  return (
    typeof textSize === 'number' &&
    Number.isInteger(textSize) &&
    textSize >= MIN_TEXT_SIZE &&
    textSize <= MAX_TEXT_SIZE &&
    textSize % TEXT_SIZE_STEP === 0 &&
    (appearance === undefined || APPEARANCES.includes(appearance as Appearance))
  );
}
