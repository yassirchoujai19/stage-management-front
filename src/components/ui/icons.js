/**
 * Icon registry.
 *
 * The SVGs in src/assets/icons/ were exported from the Figma maquettes, so the
 * vector data is the designer's, not ours. They are inlined at build time
 * (eager glob) - a few hundred bytes each, cheaper than a request per glyph.
 */

const files = import.meta.glob('../../assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** { mail: '<svg .../>', lock: '<svg .../>', ... } */
export const iconSources = Object.fromEntries(
  Object.entries(files).map(([path, raw]) => [
    path.split('/').pop().replace('.svg', ''),
    raw,
  ]),
);

/** Sorted list of every available icon - used by the style guide. */
export const iconNames = Object.keys(iconSources).sort();

/**
 * Prepare a Figma export for inline use:
 *
 *  1. Drop the fixed width/height on the ROOT <svg> only, so CSS sizes the
 *     icon. Inner elements keep theirs - Figma's <clipPath> is a <rect> whose
 *     width/height are what make it cover the artwork; strip those and the
 *     icon is clipped to nothing.
 *  2. Namespace the internal ids. Figma numbers them per file (clip0_0_9,
 *     Vector...), so two inlined icons on the same page can collide and one
 *     silently steals the other's clip path.
 *  3. Swap the hard-coded fills for `currentColor` so an icon inherits the
 *     surrounding text colour. `fill="none"` is preserved - it is what keeps
 *     the root <svg> transparent and stroke-only shapes hollow.
 */
export function normalizeIcon(raw, name = 'icon') {
  const prefix = `ui-${name}-`;

  return raw
    .replace(/^\s*<svg\b[^>]*>/, (tag) => tag.replace(/\s(width|height)="[^"]*"/g, ''))
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${id})`)
    .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="(?!none)[^"]*"/g, 'stroke="currentColor"');
}
