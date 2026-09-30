/**
 * Re-exports the public API of word-wrap.
 *
 * Keeping the entry point separate from the implementation lets consumers import
 * either the whole package or just the function they need, and gives tests a
 * single stable surface to assert against.
 */
export { wrap } from './core.js';
