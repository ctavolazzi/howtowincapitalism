/**
 * Component Registry
 *
 * Active: WikiBox, Breadcrumbs, Disclaimer, DecisionMatrix, TopicCard, SeeAlso, CardGrid, Footer, Hero
 * Reserved: InfoBox, NoteBox, NavBox, CallToAction, PageHeader, ContentSection
 */

// Atoms
export { default as WikiBox } from './atoms/WikiBox.astro';
export { default as Breadcrumbs } from './atoms/Breadcrumbs.astro';
export { default as Collapsible } from './atoms/Collapsible.astro';

// Molecules
export { default as Disclaimer } from './molecules/Disclaimer.astro';
export { default as DecisionMatrix } from './molecules/DecisionMatrix.astro';
export { default as TopicCard } from './molecules/TopicCard.astro';
export { default as ConceptCard } from './molecules/ConceptCard.astro';
export { default as SeeAlso } from './molecules/SeeAlso.astro';
export { default as FAQ } from './molecules/FAQ.astro';
export { default as BlankSlate } from './molecules/BlankSlate.astro';

// Utilities
export { default as Empty } from './utilities/Empty.astro';
export { default as CardGrid } from './utilities/CardGrid.astro';

// Organisms
export { default as Footer } from './organisms/Footer.astro';
export { default as Hero } from './organisms/Hero.astro';

// Reserved for future use
export { default as InfoBox } from './molecules/InfoBox.astro';
export { default as NoteBox } from './molecules/NoteBox.astro';
export { default as NavBox } from './molecules/NavBox.astro';
export { default as CallToAction } from './molecules/CallToAction.astro';
export { default as PageHeader } from './organisms/PageHeader.astro';
export { default as ContentSection } from './organisms/ContentSection.astro';
