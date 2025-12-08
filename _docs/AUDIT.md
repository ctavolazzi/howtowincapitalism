# Site Audit - December 8, 2025

## Executive Summary

The site is functional but has UX issues that make it confusing for first-time visitors. The core problem: **navigation is hidden** behind a hamburger menu, and the page structure doesn't immediately communicate what the site is about.

---

## Critical Issues

### 1. Navigation Invisible on Load ❌

**Problem:** Users land on the page and see only:
- Site title
- Search icon
- Hamburger menu
- Content

The 4 main pages (Home, Introduction, Latest Updates, Reports) are hidden until you click the hamburger.

**Impact:** Users don't know what content exists or where to go.

**Fix Options:**
- A) CSS: Force nav links visible as horizontal bar below header
- B) Custom component: Build header with inline nav
- C) Add explicit "Start Here" links in content

**Recommendation:** Option A (CSS) is fastest. Long-term, consider Option B.

---

### 2. Search/Menu Separation ⚠️

**Problem:** Search button and hamburger menu are in different DOM containers (header vs nav). They appear adjacent visually but are structurally separate.

**Impact:**
- CSS positioning hacks needed to align them
- Inconsistent behavior on different screen sizes
- Maintenance burden

**Fix:** CSS positioning can solve this visually. Full fix requires component override.

**Priority:** Medium (visual issue, not functional)

---

### 3. Two Horizontal Lines Below Header ⚠️

**Problem:** There are two faint horizontal lines between header and content with nothing between them.

**Impact:** Looks like a bug/unfinished design.

**Fix:** Remove one line, or use the space for visible navigation.

---

### 4. Empty Space Above Disclaimer ⚠️

**Problem:** Large gap between header area and disclaimer box.

**Impact:** Wastes valuable above-the-fold real estate.

**Fix:** Reduce spacing or use it for navigation.

---

## Moderate Issues

### 5. `!important` Overuse ⚠️

**Problem:** CSS has many `!important` declarations, making it brittle.

**Impact:**
- Hard to override styles later
- Will break if Starlight updates
- Code smell

**Fix:** Refactor to use proper specificity. Only use `!important` for:
- `border-radius: 0` (fighting frameworks)
- `color-scheme: light only` (forcing light mode)

---

### 6. Theme Mismatch ⚠️

**Problem:** Starlight initializes with `data-theme="dark"`, but we force light mode via CSS. Can cause a flash of dark colors on load.

**Fix:** Either:
- Configure Starlight to default to light
- Or add inline script to set `data-theme="light"` immediately

---

### 7. No Visible Current Page Indicator (Desktop)

**Problem:** On desktop, sidebar shows nav links but current page isn't obviously highlighted.

**Impact:** Users don't know where they are.

**Fix:** Stronger visual indicator for `aria-current="page"` links.

---

## Minor Issues

### 8. Search Disabled Until Pagefind Loads

**Problem:** Search button appears disabled until WASM loads. Can confuse users.

**Fix:** Hide search button until ready, or show loading state.

---

### 9. OG Image Requires Manual Regeneration

**Problem:** Editing `og-image.svg` doesn't update `og-image.png` automatically.

**Fix:** Add to build script or document the process.

---

### 10. Missing Favicon Variants

**Problem:** Only SVG favicon, no ICO fallback for older browsers.

**Impact:** Minor - most browsers support SVG now.

---

## Recommendations (Priority Order)

| # | Issue | Effort | Impact | Action |
|---|-------|--------|--------|--------|
| 1 | Hidden navigation | Medium | High | Add CSS for visible nav bar |
| 2 | Empty space/double lines | Low | Medium | Clean up header spacing |
| 3 | !important overuse | Medium | Medium | Refactor CSS |
| 4 | Theme flash | Low | Low | Add inline script |
| 5 | Search loading state | Low | Low | Hide until ready |

---

## What's Working Well ✅

- **Performance:** Static site, fast loads
- **Security:** Good CSP headers, no vulnerabilities
- **Mobile:** Responsive layout works
- **Content:** Disclaimer, structure, components all functional
- **Deployment:** Ship script is solid
- **SEO:** OG tags, sitemap, robots.txt all present

---

## Next Steps

1. Fix navigation visibility (CSS)
2. Clean up header spacing
3. Test on multiple devices
4. Deploy and verify

