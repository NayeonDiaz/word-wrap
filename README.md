# word-wrap

Breaks a string into lines no wider than `width` columns, preserving the indentation of the first line of each paragraph on every line it produces.

```js
import { wrap } from 'word-wrap';

wrap('    the quick brown fox jumps over the lazy dog', 20);
// '    the quick brown\n    fox jumps over\n    the lazy dog'
```

## Why

Existing wrappers tend to fall into two camps: ones that wrap but discard indentation, and ones that honour indentation in three subtly different ways (first-line offset, hanging indent, and outdent) and end up disagreeing with themselves. This library does exactly one thing: the indentation measured at the start of an input line is re-applied to every line that input line breaks into, and that indentation counts against the available width. Nothing else.

The deliberate trade-off is that there is no hyphenation and no word breaking. A single word longer than the remaining width is placed on its own line and allowed to overflow; breaking it would require either a dictionary or a language-aware rule set, neither of which belongs in a zero-dependency utility.

## Edges you will hit

- **Tabs count as 8 columns, not 1.** A leading tab advances to the next multiple of 8, matching the convention used by terminals and most editors. If your source mixes tabs and spaces for indentation, measure carefully.
- **`\r\n` input leaves a `\r` in the wrapped line**, because the splitter breaks only on `\n`. Normalise your line endings first if that matters.
- **Blank lines are preserved verbatim**, not re-indented, so paragraph breaks survive the round trip.
