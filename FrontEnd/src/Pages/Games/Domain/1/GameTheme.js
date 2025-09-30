// Shared game theming utilities
// Global default opacity for dimming background images behind game content.
// To change the default dim strength across all games, adjust this value.
export const GAME_BG_DIM = 0.4;

// Returns CSS-in-JS style that dims the element's background image itself.
// This uses background-blend-mode so the darkening reaches the exact edges
// (no pseudo-element, no subpixel gaps) and removes bright borders that
// can appear as "white edges".
export function getDimOverlayStyle(opacity = GAME_BG_DIM) {
  const clamped = Math.max(0, Math.min(1, opacity));
  return {
    // Dim the background image itself
    backgroundColor: `rgba(0, 0, 0, ${clamped})`,
    backgroundBlendMode: 'multiply',
    backgroundClip: 'padding-box',

    // Ensure rounded corners are respected and remove bright border
    borderRadius: 'inherit',
    border: 'none !important',

    // Prevent filters from sampling outside and causing light seams
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  };
}
