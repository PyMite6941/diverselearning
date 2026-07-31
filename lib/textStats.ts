/** Text counting for the reading-stats overlay. Pure + DOM-free so it can be
 *  unit-tested and reused anywhere (the overlay feeds it text it scraped from
 *  the page, either the on-screen part or the whole page). */

export interface CharCount {
  char: string;
  count: number;
}

export interface TextStats {
  words: number;
  /** Characters as rendered (whitespace runs collapsed to one space). */
  characters: number;
  charactersNoSpaces: number;
  letters: number;
  /** How many distinct letters/digits show up more than once. */
  repeatedCharacters: number;
  /** Every repeated letter/digit, most frequent first. */
  repeats: CharCount[];
  /** Doubled-up pairs sitting next to each other, e.g. the "ll" in "hello". */
  doubledPairs: number;
}

export const EMPTY_STATS: TextStats = {
  words: 0,
  characters: 0,
  charactersNoSpaces: 0,
  letters: 0,
  repeatedCharacters: 0,
  repeats: [],
  doubledPairs: 0,
};

/** Text nodes carry the source file's newlines and indentation; the browser
 *  collapses those when it paints, so the counts should too. */
export function normalizeText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/** Joins scraped fragments into one string. Fragments come from separate
 *  elements, so they get a space between them — never glued into one word. */
export function joinFragments(fragments: string[]): string {
  return normalizeText(fragments.join(" "));
}

/** Value equality — lets the overlay skip re-rendering when a scroll or DOM
 *  change didn't actually change the numbers. */
export function statsEqual(a: TextStats, b: TextStats): boolean {
  return (
    a.words === b.words &&
    a.characters === b.characters &&
    a.charactersNoSpaces === b.charactersNoSpaces &&
    a.letters === b.letters &&
    a.repeatedCharacters === b.repeatedCharacters &&
    a.doubledPairs === b.doubledPairs &&
    a.repeats.length === b.repeats.length &&
    a.repeats.every((r, i) => r.char === b.repeats[i].char && r.count === b.repeats[i].count)
  );
}

export function computeTextStats(raw: string): TextStats {
  const text = normalizeText(raw);
  if (!text) return EMPTY_STATS;

  const tally = new Map<string, number>();
  let letters = 0;
  let doubledPairs = 0;
  let previous = "";

  for (const char of text) {
    const isLetter = /\p{L}/u.test(char);
    if (isLetter) letters++;
    if (isLetter || /\p{Nd}/u.test(char)) {
      const key = char.toLowerCase();
      tally.set(key, (tally.get(key) ?? 0) + 1);
      if (key === previous) doubledPairs++;
      previous = key;
    } else {
      previous = "";
    }
  }

  const repeats = [...tally.entries()]
    .filter(([, count]) => count > 1)
    .map(([char, count]) => ({ char, count }))
    .sort((a, b) => b.count - a.count || a.char.localeCompare(b.char));

  return {
    words: text.split(" ").filter(Boolean).length,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    letters,
    repeatedCharacters: repeats.length,
    repeats,
    doubledPairs,
  };
}
