# Text and the screen

The text screen is 40 columns by 25 rows. Column 0, row 0 is the top-left
corner. It is drawn by MIA's **overlay** layer, which sits in front of the
graphics layers (see [Graphics](graphics.md)), so text can float over a game
screen.

## Printing

`PRINT` writes values at the cursor. Separators control the spacing:

| Separator | Effect |
| --- | --- |
| `;` | Nothing: the next value follows directly. |
| `,` | Move to the next 14-column zone (columns 0, 14, 28). |
| End of the statement | New line, unless the statement ends with `;` or `,`. |

```basic
10 PRINT "A";"B","C"
20 PRINT "NO NEW LINE";
30 PRINT " - SAME LINE"
```

```text
AB            C
NO NEW LINE - SAME LINE
```

Numbers print with a leading space (or a minus sign) and a trailing space.
`STR$` gives the same text as a string, and `LEFT$`, `MID$` and `RIGHT$` can
trim it. `?` is short for `PRINT`.

Inside `PRINT`, `TAB(n)` moves to column *n* of the current line (nothing
happens if the output is already past it) and `SPC(n)` prints *n* spaces.
`POS(0)` returns the column BASIC thinks it is printing at.

When printing reaches the bottom row, the screen scrolls up.

## Moving the cursor and clearing

| Statement | Effect |
| --- | --- |
| `CLS` | Clear the screen and home the cursor. |
| `CRSR column,row` | Move the cursor to a column 0-39 and row 0-24. |

```basic
10 CLS
20 FOR R=0 TO 24 STEP 4
30 CRSR R,R: PRINT "ROW";R
40 NEXT
50 CRSR 0,24
```

Unlike the Commodore 64, Clementina has no cursor-control characters inside
strings: `CHR$` codes always print as characters (only `CHR$(13)` starts a
new line). `CLS` and `CRSR` do that job.

## Color

Text has two colors to think about, the ink of each character and the screen
**backdrop** behind everything.

- `COLOR n` sets the ink (palette 0-15) for numbers, messages and unstyled
  text. Text typed in a color keeps that color; [Styled strings](styled-strings.md)
  explains both.
- `BCOLOR n` sets the backdrop to the ink color of palette *n*. `BCOLOR 6`
  restores the default blue.

```basic
10 BCOLOR 9: COLOR 3
20 PRINT 2026
30 BCOLOR 6: COLOR 0
```

draws a yellow number on a black screen, then restores the defaults.

## Reading and writing the screen directly

The overlay lives in MIA's memory: 1,000 tile codes (one per cell, row by row)
from `$10080` (65664), and 1,000 attribute bytes from `$10468` (66664). For
printable characters the tile code is the ASCII code. `MPEEK` and `MPOKE`
reach them (see [MIA memory](mia-memory.md)):

```basic
10 CLS: PRINT "HELLO"
20 PRINT CHR$(MPEEK($10080))
30 MPOKE $10468,1
```

Line 20 reads the `H` back from the screen, and line 30 turns it red by
writing palette 1 into its attribute byte. A cell's address is
`$10080 + row*40 + column`, and its attribute `$10468 + row*40 + column`.
`MFILL` can paint a whole row's attributes at once:

```basic
MFILL $10468+5*40,40,5
```

turns row 5 cyan without retyping it. The layout of both planes is in
*Mapping Clementina*, [Video](../../../mapping/src/mia/video.md).

## Hiding the text

`OVLOFF` hides the whole overlay, prompt and cursor included, and `OVLON`
shows it again. Printing continues while it is hidden, so a program can
prepare a screen of text and reveal it at once. Returning to `READY.` does
not turn the overlay back on: type `OVLON` blind if a program leaves it off.

`OVLBANK` and `OVLALT` choose which character banks the overlay draws from,
so a program can switch to its own font (see [Graphics](graphics.md)).

## Reading keys

`INPUT` and `GET` read the keyboard:

- `INPUT "PROMPT";A$,B` prints the prompt and a question mark, lets the user
  type a line in the screen editor, and assigns the comma-separated values
  to the variables. A number that does not parse is meant to give
  `?REDO FROM START` and ask again; the current ROM has a bug and stops the
  program with `?SYNTAX ERROR` instead.
- `GET K$` waits for one key and puts it in `K$` without printing it.
  `GET N` accepts only a digit key.

Both work only inside a program.

```basic
10 INPUT "YOUR NAME";N$
20 PRINT "PRESS A KEY, ";N$
30 GET K$
40 PRINT "YOU PRESSED ";K$;" (";ASC(K$);")"
```

Unlike the Commodore 64's, Clementina's `GET` **waits** for a key. There is a
second difference: while a program runs, BASIC checks for Ctrl-C after every
statement by taking a key from the keyboard queue, and throws away any other
key it finds. Keys typed while the program is busy are lost; only a key
pressed while `GET` or `INPUT` waits reaches the program. A program that must
react to keys while it keeps running, such as a game, reads the **held** keys
with `KEYDOWN` instead (see [Input](input.md)).
