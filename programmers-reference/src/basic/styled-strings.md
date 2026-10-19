# Styled strings

On the Commodore 64, colored text is made with control characters inside
strings: a code that switches the color, another for reverse. Clementina
does it differently. Every character on the screen has its own **attribute
byte**, and every character in a BASIC string remembers its attribute too.
Text is styled once, as it is typed, and keeps that style wherever the string
goes: into a variable, through `LEFT$` and `+`, into a saved program, and back
onto the screen with `PRINT`.

## The attribute byte

The text screen is MIA's **overlay** layer: 40 by 25 cells, each a tile code
(which glyph) and an attribute byte (how it looks).

| Bits | Field | Meaning |
| --- | --- | --- |
| 0-3 | Palette | One of 16 palette banks; for text, the bank's color 1 is the ink. |
| 4 | Flip X | Mirror the glyph left to right. |
| 5 | Flip Y | Mirror the glyph top to bottom. |
| 6 | Priority | Not used by text. |
| 7 | ALT | Draw the glyph from the alternate character bank: reverse video. |

The default palette gives these ink colors:

| Palette | Ink | Palette | Ink |
| ---: | --- | ---: | --- |
| 0 | White (the default) | 8 | Magenta |
| 1 | Red | 9 | Black |
| 2 | Orange | 10 | Gray |
| 3 | Yellow | 11 | Light gray |
| 4 | Green | 12 | Dark red |
| 5 | Cyan | 13 | Dark green |
| 6 | Blue, the backdrop color | 14 | Blue |
| 7 | Violet | 15 | White |

Palette 6 is the color of the default backdrop, so text in it is invisible
until the backdrop changes. The exact colors are in
[Appendix E](../appendix/charset-keys.md). The background of a text cell is
transparent: the backdrop, or the graphics behind the overlay, shows through.

## The editor pen

What you type gets the **editor pen**, an attribute byte the screen editor
keeps. You change it with **Esc commands**: press Esc, then one key.

| Keys | Action |
| --- | --- |
| Esc `0`-`9`, Esc `A`-`F` | Set the color to palette 0-15. |
| Esc `R` | Toggle reverse (ALT). |
| Esc `H` | Toggle flip X. |
| Esc `V` | Toggle flip Y. |
| Esc `M` | Next glyph set: 0, 1, 2, back to 0. |
| Esc `P` | Enter Paint mode (below). |
| Esc Space | Reset: palette 0, no flips, no reverse, glyph set 0. |

The keys are not case-sensitive. The cursor shows the pen: it takes the pen's
color and flips, and changes shape for reverse and for the glyph set. The pen
stays as set until Esc Space or a cold start.

A program can set the editor pen too. It is the byte `TEXT_ATTR` at `$0302`
(770), so `POKE 770,5` makes what the user types next cyan. That is handy
before an `INPUT`.

### Glyph sets

The character set has 256 glyphs. The keyboard types 95 of them directly, the
ASCII characters `$20-$7E`. Esc `M` switches the keyboard to another **glyph
set**, where the same keys type other tiles:

| Glyph set | Keys `$20-$7E` type tiles |
| --- | --- |
| 0 | `$20-$7E`: ASCII. |
| 1 | `$80-$DE`. |
| 2 | `$E0-$FF`, then `$00-$3E`. |

Together the three sets reach 254 of the 256 tiles (all but `$7F` and `$DF`).
The chart of all 256 glyphs is in [Appendix E](../appendix/charset-keys.md).
Tiles typed this way can go inside quotes in a program line like any other
character, so a program can draw with them using nothing but `PRINT`.

### Paint mode

Paint mode restyles text that is already on the screen. Press Esc `P`; the
cursor changes shape. Now the arrows move the cursor without typing, and
Space stamps the whole pen (color, flips and reverse) onto the cell under the
cursor and moves right. Other keys do nothing. Esc leaves Paint mode. Then
press RETURN on a line to hand it to BASIC with its new style, as if it had
been typed that way.

## Strings remember their style

A string typed in quotes keeps the attributes its characters had on the
screen:

- **Typed directly**, `A$="HELLO"` with `HELLO` typed in red stores a red
  `HELLO` in `A$`.
- **In a program line**, the attributes are stored with the line, in a small
  **style sidecar** after it. `LIST` shows the string in its colors, `SAVE`
  and `LOAD` keep them, and editing the listed line and pressing RETURN keeps
  them too.
- **Through `INPUT`**, the text the user types arrives with the editor pen's
  attributes.
- **Slicing and joining** keep them: `LEFT$`, `MID$`, `RIGHT$` and `+` copy
  each character's attribute with it.

Strings made by BASIC rather than typed (`CHR$`, `STR$`, numbers turned into
text, `READ` from `DATA`) get the default attribute, `$00`.

Style never changes a string's meaning. `LEN` counts characters only,
comparisons compare characters only (a red `"YES"` equals a white one), and
`ASC` and `VAL` work on characters as usual. The only
cost is memory: a styled string built while the program runs takes two bytes
a character in the string heap, one for the character and one for its
attribute.

The styles of one program line's literals must fit in 42 bytes: 4, plus 2
and one per character for each literal, so a line with a single literal can
style up to 36 characters. A line with more stores all its literals without
style, and they print with the BASIC pen.

## The BASIC pen

Text that has no stored style is printed with the **BASIC pen**, a second
attribute byte that is separate from the editor pen. It colors `READY.`,
error messages, `INPUT` prompts, numbers, and strings that BASIC made
(`STR$`, `CHR$`, `READ`). Five statements set it:

| Statement | Sets |
| --- | --- |
| `COLOR n` | The pen's palette, 0-15. |
| `FLIPX n` | Flip X off (0) or on (any other value). |
| `FLIPY n` | Flip Y off or on. |
| `ALT n` | Reverse off or on. |
| `STYLE mask` | Which fields styled strings take from the BASIC pen instead of their own (below). |

```basic
10 COLOR 4: PRINT "SCORE:";42
20 COLOR 0
```

prints `SCORE:` in the color it was typed in (white, unless you changed the
editor pen) and `42` in green. A typed literal always has a style of its own,
even when that style is the default white, so `COLOR` alone does not recolor
it; `STYLE`, below, does.

`COLOR` does not change the editor pen, so what you type next keeps its own
color, and the editor pen does not change `PRINT` output. The two pens live in
`$03FD` (1021, BASIC pen) and `$0304` (772, editor pen); see *Mapping
Clementina*, [Page 3](../../../mapping/src/cpu/page-3.md).

### Overriding stored styles

`STYLE mask` makes styled strings take some fields from the BASIC pen:

| Bit | Value | Field taken from the BASIC pen |
| --- | --- | --- |
| 0 | 1 | Color. |
| 1 | 2 | Flip X. |
| 2 | 4 | Flip Y. |
| 3 | 8 | ALT (reverse). |

`STYLE 0`, the default, prints every string in its own style. `STYLE 1` prints
every string in the `COLOR` color but keeps its flips and reverse, `STYLE 15`
ignores stored styles completely, and `STYLE 1 OR 8` overrides color and
reverse. A program can highlight a menu line this way without retyping it:

```basic
10 M$(0)="LOAD": M$(1)="SAVE": M$(2)="QUIT"
20 FOR I=0 TO 2
30 IF I=1 THEN STYLE 9: COLOR 3: ALT 1
40 PRINT M$(I)
50 STYLE 0: COLOR 0: ALT 0
60 NEXT
```

## Graphic characters in strings

`CHR$` makes a one-character string from any code 0-255, and `PRINT` draws it
as that tile, so all 256 glyphs can be printed from a program:

```basic
10 FOR I=128 TO 159: PRINT CHR$(I);: NEXT: PRINT
```

There is one exception: `CHR$(13)` starts a new line. Every other code,
including those the kernel treats as cursor movements (`$11`, `$91`, `$1D`,
`$9D`, `$13`) and the clear-screen code `$0C`, draws its tile when it comes
from `CHR$`. Use `CLS` and `CRSR` to clear the screen and move the cursor.

Tile `$00` cannot be stored inside a program line, because `$00` ends a line;
use `CHR$(0)` for it.

How styled strings are stored, and how `PRINT` decides between the stored
style and the BASIC pen, is documented in `clementina-rom`'s
`docs/styled-strings.md`.
