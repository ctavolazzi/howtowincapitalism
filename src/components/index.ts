/**
 * Component Registry
 * Updated: 2025-12-14
 *
 * ACTIVE (in use on pages):
 *   Atoms:     WikiBox, Breadcrumbs, Collapsible, LoadingSpinner
 *   Molecules: Disclaimer, DecisionMatrix, TopicCard, SeeAlso, FAQ, BlankSlate, CompletenessMeter, Favorites
 *   Utilities: Empty, CardGrid
 *   Organisms: Footer, Hero, HamburgerMenu
 *   Guards:    OwnerGuard
 *   Trade:     TradeWidget
 *
 * AVAILABLE (exported, ready for use):
 *   Atoms:     Button (with variants: primary, secondary, danger)
 *   Molecules: FormGroup (form field wrapper with label, hint, error)
 *
 * RESERVED (exported for future use):
 *   Molecules: InfoBox, NoteBox, NavBox, CallToAction
 *   Organisms: PageHeader, ContentSection
 *
 * ORPHANED (no longer used, consider removal):
 *   Auth:      UserMenu (replaced by HamburgerMenu)
 */

// Atoms
export { default as WikiBox } from './atoms/WikiBox.astro';
export { default as Breadcrumbs } from './atoms/Breadcrumbs.astro';
export { default as Collapsible } from './atoms/Collapsible.astro';
export { default as LoadingSpinner } from './atoms/LoadingSpinner.astro';
export { default as Button } from './atoms/Button.astro';

// Molecules
export { default as Disclaimer } from './molecules/Disclaimer.astro';
export { default as DecisionMatrix } from './molecules/DecisionMatrix.astro';
export { default as TopicCard } from './molecules/TopicCard.astro';
export { default as SeeAlso } from './molecules/SeeAlso.astro';
export { default as FAQ } from './molecules/FAQ.astro';
export { default as BlankSlate } from './molecules/BlankSlate.astro';
export { default as CompletenessMeter } from './molecules/CompletenessMeter.astro';
export { default as Favorites } from './molecules/Favorites.astro';
export { default as FormGroup } from './molecules/FormGroup.astro';

// Utilities
export { default as Empty } from './utilities/Empty.astro';
export { default as CardGrid } from './utilities/CardGrid.astro';

// Organisms
export { default as Footer } from './organisms/Footer.astro';
export { default as Hero } from './organisms/Hero.astro';
export { default as HamburgerMenu } from './organisms/HamburgerMenu.astro';

// Guards (Auth/Permissions)
export { default as OwnerGuard } from './guards/OwnerGuard.astro';
export { default as SitePasswordGate } from './auth/SitePasswordGate.astro';

// Search
export { default as GlobalSearch } from './search/GlobalSearch.astro';

// Trade
export { default as TradeWidget } from './trade/TradeWidget.astro';

// Reserved for future use
export { default as InfoBox } from './molecules/InfoBox.astro';
export { default as NoteBox } from './molecules/NoteBox.astro';
export { default as NavBox } from './molecules/NavBox.astro';
export { default as CallToAction } from './molecules/CallToAction.astro';
export { default as PageHeader } from './organisms/PageHeader.astro';
export { default as ContentSection } from './organisms/ContentSection.astro';
