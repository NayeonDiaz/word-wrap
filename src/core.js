/**
 * Breaks a string into lines no wider than `width` columns, preserving the
 * indentation of the first line on every subsequent line.
 *
 * The function is intentionally minimal: it wraps by spaces, never by
 * hyphenating words or breaking inside a word. A single word longer than the
 * available width is placed on its own line and overflows; breaking it would
 * require a dictionary or a language-aware rule set, neither of which belongs
 * in a zero-dependency utility.
 *
 * Whitespace-only input collapses to an empty string, and blank lines in the
 * input are preserved verbatim rather than being re-indented, which keeps the
 * output of wrapping already-formatted text closer to what the author wrote.
 */

/**
 * Computes the width of the leading whitespace of `line`.
 *
 * Tabs are treated as advancing to the next multiple of 8 columns, which is the
 * convention almost every terminal and editor uses. Counting a tab as a single
 * character would under-report the visible width and produce lines that overflow.
 *
 * @param {string} line
 * @returns {number} column width of the indentation, 0 if none.
 */
function indentationWidth(line) {
  let width = 0;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === ' ') {
      width += 1;
    } else if (ch === '\t') {
      // Advance to the next tab stop. Because we want the column AFTER this
      // tab, we round up to the nearest multiple of 8 rather than adding 8.
      width = Math.ceil((width + 1) / 8) * 8;
    } else {
      break;
    }
  }
  return width;
}

/**
 * Extracts the literal leading whitespace of `line` as a string.
 *
 * `indentationWidth` returns a number for comparison; this helper returns the
 * characters themselves so they can be re-attached to wrapped lines without
 * reconstructing them from a count.
 *
 * @param {string} line
 * @returns {string}
 */
function leadingWhitespace(line) {
  const match = /^[ \t]*/.exec(line);
  return match ? match[0] : '';
}

/**
 * Wraps a single logical line to `width` columns.
 *
 * Lines containing only whitespace are returned as-is, because re-indenting an
 * empty line would change a paragraph break into a line of spaces.
 *
 * @param {string} line - The line to wrap, including any leading indentation.
 * @param {number} width - Maximum column width, must be >= 1.
 * @returns {string[]} One or more wrapped lines.
 */
function wrapSingleLine(line, width) {
  if (/^\s*$/.test(line)) {
    return [line];
  }

  const indent = leadingWhitespace(line);
  const indentWidth = indentationWidth(line);
  const body = line.slice(indent.length);

  const words = body.split(/[ \t]+/).filter(Boolean);
  if (words.length === 0) {
    return [line];
  }

  const result = [];
  let current = indent;
  let currentWidth = indentWidth;

  for (const word of words) {
    const wordWidth = [...word].length;

    if (current === indent) {
      // First word on a fresh line. Place it even if it overflows; there is no
      // earlier position to retreat to, and a lone long word has no clean break.
      current += word;
      currentWidth += wordWidth;
    } else if (currentWidth + 1 + wordWidth <= width) {
      current += ` ${word}`;
      currentWidth += 1 + wordWidth;
    } else {
      result.push(current);
      current = indent + word;
      currentWidth = indentWidth + wordWidth;
    }
  }

  result.push(current);
  return result;
}

/**
 * Wraps `text` to `width` columns, preserving the indentation of each input
 * line on every line it breaks into.
 *
 * Input is split on `\n`, so `\r\n` line endings leave a trailing `\r` in the
 * wrapped line. Normalize your input first if that matters to you.
 *
 * @param {string} text - The text to wrap.
 * @param {number} width - Maximum column width. Must be a positive integer.
 * @returns {string} The wrapped text, joined with `\n`.
 * @throws {TypeError} If `text` is not a string or `width` is not an integer.
 * @throws {RangeError} If `width` is less than 1.
 */
export function wrap(text, width) {
  if (typeof text !== 'string') {
    throw new TypeError(`Expected text to be a string, got ${typeof text}`);
  }
  if (!Number.isInteger(width)) {
    throw new TypeError(`Expected width to be an integer, got ${String(width)}`);
  }
  if (width < 1) {
    throw new RangeError(`Expected width >= 1, got ${width}`);
  }

  const lines = text.split('\n');
  const wrapped = lines.flatMap((line) => wrapSingleLine(line, width));
  return wrapped.join('\n');
}
