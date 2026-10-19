# C. The character set

Clementina's character set has 256 characters. The chart shows each one
by its code: the row gives the first hex digit and the column the second,
so `A` is in row `$4_`, column 1, code `$41` (65). Codes `$20` to `$7E` are
the usual letters, digits and symbols; the rest are graphics characters.

## Typing them

Each key types a character code from `$20` (SPACE) to `$7E` (`~`). The
screen editor's glyph mode (ESC `M`, chapter 4) adds to that code:

| Glyph mode | Adds | A key with code `k` types |
| --- | --- | --- |
| 0 (normal) | 0 | `k`: the key's own character |
| 1 | 96 (`$60`) | `k + 96`: codes `$80` to `$DE` |
| 2 | 192 (`$C0`) | `k + 192`, past 255 wrapping to 0: codes `$E0` to `$FF` and `$00` to `$3E` |

So to find the key for a graphics character, subtract 96 (mode 1) or 192
(mode 2) from its code, and look up the key with that code: character
`$A1` is mode 1, `$A1 - $60 = $41`, the `A` key. Only `$7F` and `$DF`
can't be typed.

Codes `$F8` to `$FF` are the cursor's own shapes. A program prints any
character by its code with `PRINT CHR$(code)`: `PRINT CHR$(161)` draws
character `$A1`. `CHR$(13)` is the one exception: it starts a new line.

{{#include ../../../tables/charset.md}}
