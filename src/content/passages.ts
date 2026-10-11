import callOfTheWild from './bundled/call-of-the-wild.json';
import treasureIsland from './bundled/treasure-island.json';
import warOfTheWorlds from './bundled/war-of-the-worlds.json';
import type { Passage } from './types';

// @spec TEXT-001
export const BUNDLED_PASSAGES: readonly Passage[] = [callOfTheWild, treasureIsland, warOfTheWorlds].map((p) => ({
  ...p,
  source: 'bundled' as const,
}));
