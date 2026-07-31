/** Scrapes readable text out of the live page for the stats overlay.
 *
 *  Two scopes:
 *   - "screen" (default) — only the text actually on screen right now. That
 *     means clipping against the window *and* every scrollable ancestor, since
 *     lesson text lives inside its own `overflow-y-auto` column.
 *   - "page" — everything in scope, scrolled off or not.
 *
 *  Opt out of counting by putting `data-text-stats-ignore` on an element (the
 *  overlay itself does this). Narrow what gets counted by putting
 *  `data-text-stats-root` on a container — the lesson column uses it so the
 *  numbers describe the lesson, not the surrounding chrome. */

export type StatsScope = "screen" | "page";

export const IGNORE_ATTR = "data-text-stats-ignore";
export const ROOT_ATTR = "data-text-stats-root";

interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "CANVAS"]);

function intersect(a: Box, b: Box): Box | null {
  const box = {
    top: Math.max(a.top, b.top),
    bottom: Math.min(a.bottom, b.bottom),
    left: Math.max(a.left, b.left),
    right: Math.min(a.right, b.right),
  };
  return box.bottom <= box.top || box.right <= box.left ? null : box;
}

function contains(clip: Box, r: DOMRect): boolean {
  return r.top >= clip.top && r.bottom <= clip.bottom && r.left >= clip.left && r.right <= clip.right;
}

/** "Seen" = at least half the word box is inside the clip, both axes — a sliver
 *  peeking past the edge isn't something you can read. */
function isSeen(clip: Box, r: DOMRect): boolean {
  const vertical = Math.min(clip.bottom, r.bottom) - Math.max(clip.top, r.top);
  const horizontal = Math.min(clip.right, r.right) - Math.max(clip.left, r.left);
  return vertical >= r.height * 0.5 && horizontal >= r.width * 0.5;
}

/** Visible region for an element: the viewport intersected with every
 *  scroll-clipping ancestor. Cached per pass — ancestors are shared. */
function clipBoxFor(el: Element, viewport: Box, cache: Map<Element, Box | null>): Box | null {
  const cached = cache.get(el);
  if (cached !== undefined) return cached;

  const parent = el.parentElement;
  let box: Box | null = parent ? clipBoxFor(parent, viewport, cache) : viewport;

  if (box) {
    const style = getComputedStyle(el);
    const clips =
      style.overflow !== "visible" ||
      style.overflowX !== "visible" ||
      style.overflowY !== "visible";
    if (clips) box = intersect(box, el.getBoundingClientRect());
  }

  cache.set(el, box);
  return box;
}

/** Word-by-word for nodes straddling an edge, so a half-scrolled paragraph
 *  contributes only the lines you can actually see. */
function seenWordsOf(node: Text, range: Range, clip: Box): string {
  const kept: string[] = [];
  for (const match of node.data.matchAll(/\S+/g)) {
    const start = match.index ?? 0;
    range.setStart(node, start);
    range.setEnd(node, start + match[0].length);
    if (isSeen(clip, range.getBoundingClientRect())) kept.push(match[0]);
  }
  return kept.join(" ");
}

/** Every text fragment currently in scope, in document order. */
export function scrapeText(scope: StatsScope): string[] {
  if (typeof document === "undefined") return [];

  const root = document.querySelector(`[${ROOT_ATTR}]`) ?? document.body;
  if (!root) return [];

  const viewport: Box = {
    top: 0,
    left: 0,
    bottom: window.innerHeight || document.documentElement.clientHeight,
    right: window.innerWidth || document.documentElement.clientWidth,
  };

  const clipCache = new Map<Element, Box | null>();
  const range = document.createRange();
  const fragments: string[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest(`[${IGNORE_ATTR}], [aria-hidden="true"]`)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!parent) continue;

    range.selectNodeContents(node);
    const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
    // No boxes at all means display:none (or laid out to nothing) — invisible
    // in both scopes.
    if (!rects.length) continue;

    if (scope === "page") {
      fragments.push(node.data);
      continue;
    }

    const clip = clipBoxFor(parent, viewport, clipCache);
    if (!clip) continue;

    if (rects.every((r) => contains(clip, r))) {
      fragments.push(node.data);
    } else if (rects.some((r) => isSeen(clip, r))) {
      const seen = seenWordsOf(node, range, clip);
      if (seen) fragments.push(seen);
    }
  }

  range.detach();
  return fragments;
}
