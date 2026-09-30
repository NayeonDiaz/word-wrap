import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { wrap } from '../src/index.js';

describe('wrap', () => {
  it('is a named export of the package', () => {
    assert.equal(typeof wrap, 'function');
  });

  it('returns the input unchanged when it already fits', () => {
    assert.equal(wrap('hello world', 80), 'hello world');
  });

  it('breaks a long single-spaced line at the given width', () => {
    const input = 'the quick brown fox jumps over the lazy dog';
    const expected = 'the quick brown\nfox jumps over\nthe lazy dog';
    assert.equal(wrap(input, 15), expected);
  });

  it('preserves leading indentation on every wrapped line', () => {
    const input = '    the quick brown fox jumps over the lazy dog';
    const expected = [
      '    the quick brown',
      '    fox jumps over',
      '    the lazy dog',
    ].join('\n');
    assert.equal(wrap(input, 19), expected);
  });

  it('counts the indentation against the available width', () => {
    // width 20, indent 4: body gets 16 columns.
    const input = '    word1 word2 word3 word4 word5';
    assert.equal(
      wrap(input, 20),
      '    word1 word2\n    word3 word4\n    word5',
    );
  });

  it('preserves a tab as advancing to the next multiple of 8', () => {
    // Tab at column 0 advances to column 8; with width 12 the body has 4 cols.
    const input = '\tword1 word2 word3';
    assert.equal(wrap(input, 12), '\tword1\n\tword2\n\tword3');
  });

  it('collapses internal runs of spaces and tabs between words', () => {
    const input = 'a  b\tc\nd';
    assert.equal(wrap(input, 3), 'a b\nc\nd');
  });

  it('preserves blank lines in the input verbatim', () => {
    const input = 'first\n\nthird';
    assert.equal(wrap(input, 80), 'first\n\nthird');
  });

  it('does not re-indent a whitespace-only line', () => {
    assert.equal(wrap('  ', 10), '  ');
  });

  it('returns an empty string for empty input', () => {
    assert.equal(wrap('', 10), '');
  });

  it('places a single word longer than the width on its own overflowing line', () => {
    const input = 'supercalifragilisticexpialidocious';
    assert.equal(wrap(input, 10), 'supercalifragilisticexpialidocious');
  });

  it('places an over-long word on its own line, then continues wrapping', () => {
    const input = 'short supersuperlongword tail';
    assert.equal(
      wrap(input, 10),
      'short\nsupersuperlongword\ntail',
    );
  });

  it('wraps each input line independently, keeping per-line indentation', () => {
    const input = ['a b c', '  d e f'].join('\n');
    const expected = ['a b', 'c', '  d', '  e', '  f'].join('\n');
    assert.equal(wrap(input, 3), expected);
  });

  it('throws TypeError when text is not a string', () => {
    assert.throws(() => wrap(42, 10), TypeError);
  });

  it('throws TypeError when width is not an integer', () => {
    assert.throws(() => wrap('x', 10.5), TypeError);
  });

  it('throws RangeError when width is less than 1', () => {
    assert.throws(() => wrap('x', 0), RangeError);
  });
});
