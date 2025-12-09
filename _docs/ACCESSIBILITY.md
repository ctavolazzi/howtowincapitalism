# Accessibility Guidelines

> **This document ensures readability issues NEVER happen again.**

## Color Contrast Requirements (WCAG AA)

All text must have a minimum **4.5:1 contrast ratio** against its background.

### ✅ Approved Text Colors (on white `#ffffff`)

| Token | Hex | Contrast | Use Case |
|-------|-----|----------|----------|
| `--color-text` | `#202122` | 16.1:1 | Primary text, headings |
| `--color-text-muted` | `#54595d` | 7.0:1 | Subtitles, secondary text |
| `--color-text-subtle` | `#6b6b6b` | 5.3:1 | Captions, metadata |
| `--color-link` | `#0645ad` | 7.2:1 | Links |
| `--color-link-visited` | `#0b0080` | 9.4:1 | Visited links |
| `--color-warning-text` | `#705000` | 5.7:1 | Warning messages |

### ❌ NEVER Use These for Text

| Hex | Contrast | Why It Fails |
|-----|----------|--------------|
| `#72777d` | 4.48:1 | Below WCAG AA minimum |
| `#a2a9b1` | 3.0:1 | Way below minimum |
| `#c8ccd1` | 2.1:1 | Severely fails |

## How to Use Colors

### ✅ CORRECT

```css
/* Use CSS variables */
.subtitle {
  color: var(--color-text-muted);
}

/* Or utility classes */
<p class="text-muted">Secondary text</p>
```

### ❌ WRONG

```css
/* NEVER hardcode hex values */
.subtitle {
  color: #72777d; /* ❌ FAILS WCAG */
}
```

## Available Utility Classes

```css
.text-primary   /* 16.1:1 - var(--color-text) */
.text-muted     /* 7.0:1  - var(--color-text-muted) */
.text-subtle    /* 5.3:1  - var(--color-text-subtle) */
.text-link      /* 7.2:1  - var(--color-link) */

.bg-surface     /* Safe background + text combo */
.bg-surface-alt /* Safe background + text combo */
.bg-warning     /* Warning background + text combo */
.bg-info        /* Info background + text combo */
```

## Enforcement

### Automated Checks

```bash
# Run CSS linter (catches hardcoded colors)
npm run lint:css

# Quick check for hardcoded colors
npm run a11y:colors
```

### Pre-commit (Recommended)

Add to your workflow:

```bash
npm run lint:css && npm run build
```

## Verification Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Chrome DevTools Accessibility Panel](https://developer.chrome.com/docs/devtools/accessibility/contrast/)
- Run `npm run a11y:colors` locally

## When Adding New Colors

1. **Check contrast** at [WebAIM](https://webaim.org/resources/contrastchecker/)
2. **Minimum 4.5:1** for normal text
3. **Minimum 3:1** for large text (18px+ or 14px bold)
4. **Add as a token** in `custom.css` `:root`
5. **Document** the contrast ratio in a comment
6. **Never hardcode** - always use `var(--color-*)`

## Example: Adding a New Muted Color

```css
:root {
  /* New color - verified at WebAIM */
  --color-text-hint: #666666;  /* 5.7:1 contrast - captions, hints */
}
```

---

*Last updated: December 9, 2025*
*Issue fixed: Hero subtitle had #72777d (4.48:1) - changed to --color-text-muted (7.0:1)*
