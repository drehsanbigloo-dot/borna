# Borna Khodro Pars — brand spec (extracted from bornakhodro.co)

## Color tokens (OKLch)

```css
:root {
  --bg:         oklch(94% 0.006 90);    /* #edebe8 — warm light grey, page bg */
  --surface:    oklch(99% 0.002 90);    /* #fafafa — card surface */
  --fg:         oklch(22% 0.02 260);    /* #1e293b — dark text */
  --muted:      oklch(48% 0.02 260);    /* #64748b — secondary text */
  --border:     oklch(88% 0.005 260);   /* muted borders */
  --accent:     oklch(38% 0.16 265);    /* #133e87 — deep navy, primary brand */
  --accent-light: oklch(50% 0.18 265);  /* #1e40af — lighter navy */
  --accent-dark:  oklch(18% 0.08 265);  /* #0d1a30 — darkest navy (footer bg) */
  --signal-pink:  oklch(62% 0.20 350);  /* #ef5da8 — accent pink (sparingly) */
  --success:   oklch(55% 0.15 150);     /* #059669 */
  --warning:   oklch(60% 0.15 75);      /* #d97706 */
  --danger:    oklch(50% 0.18 25);      /* #dc2626 */
}
```

## Typography

- **Display / body:** Peyda (Persian sans-serif, weights 300–900). Custom woff2 font.
- **Fallback stack:** `Peyda, system-ui, -apple-system, sans-serif`
- **Mono:** Not used on the current site.

## Layout posture

- RTL (right-to-left) — Persian language.
- Content max-width: 1200px; container max-width: 1440px.
- Card radius: 15px — generous, product-like.
- Box shadows: `0 4px 15px rgba(0,0,0,0.1)` — noticeable but not heavy.
- Hero: full-width image sliders with dark overlays and light text.
- Footer: very dark navy (`#0d1a30`), with light text and social icons.
- CTAs: solid navy buttons, hover → lighter navy or reverse (navy bg → white bg).
- CSS custom properties pattern: primary, primary-dark, primary-light, secondary, accent.
- Clean, corporate feel — no aggressive gradients or heavy ornamentation.
- Entry animations: fade-in-up on scroll with stagger delays.
