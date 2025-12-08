/**
 * Component Registry
 *
 * Currently used: Disclaimer, WikiBox, Empty
 * Reserved for later: InfoBox, NoteBox, NavBox, CallToAction, PageHeader, ContentSection
 */

// Base
export { default as WikiBox } from './atoms/WikiBox.astro';

// Active
export { default as Disclaimer } from './molecules/Disclaimer.astro';

// Utilities
export { default as Empty } from './utilities/Empty.astro';

// Reserved for future use
export { default as InfoBox } from './molecules/InfoBox.astro';
export { default as NoteBox } from './molecules/NoteBox.astro';
export { default as NavBox } from './molecules/NavBox.astro';
export { default as CallToAction } from './molecules/CallToAction.astro';
export { default as PageHeader } from './organisms/PageHeader.astro';
export { default as ContentSection } from './organisms/ContentSection.astro';
