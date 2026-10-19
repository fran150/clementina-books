# C

## CD

**Statement** · `CD path`

Changes the current directory on the SD card. Every path that does not start
with `/` starts there. `CD "/"` goes back to the root and `CD ".."` up one
level. The current directory stays until the next `CD`, also after the
program ends.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | An existing directory. |

A directory that does not exist gives `?FILE I/O ERROR` and leaves the
current directory as it was.

```basic
MKDIR "LEVELS"
CD "LEVELS"
BSAVE "ONE.PRG",640,4
CD "/"
DIR "LEVELS"
```

```text
ONE.PRG
```

See also: [DIR](d.md#dir), [MKDIR](m.md#mkdir), [RMDIR](r.md#rmdir),
[Files and the SD card](../basic/files.md).

## CHR$

**Function** · `CHR$(code)`

Returns a string of one character with the given code. The character has the
default style, so it prints with the BASIC pen.

| Argument | Range | Meaning |
| --- | --- | --- |
| *code* | 0-255 | The character code. |

`PRINT` draws every code as its tile, including codes that are cursor
movements on other computers. The one exception is `CHR$(13)`, which starts a
new line. `CHR$(34)` is the only way to put a double quote in a string.

```basic
Q$=CHR$(34)
PRINT CHR$(72);CHR$(73);CHR$(13);Q$;"QUOTED";Q$
```

```text
HI
"QUOTED"
```

See also: [ASC](a.md#asc), [STR$](s.md#str),
[Styled strings](../basic/styled-strings.md),
[Appendix E](../appendix/charset-keys.md).

## CHRLOAD

**Statement** · `CHRLOAD path,bank[,offset]`

Loads a whole file of tile graphics into a CHR bank, starting *offset* bytes
into it. A file longer than the rest of the bank continues into the next
banks. The file holds raw bytes in MIA's own format (see
[Graphics](../basic/graphics.md)).

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. |
| *bank* | 0-7 | The CHR bank. |
| *offset* | 0-6143 | The first byte; 0 if left out. Tile *t* of plane 0 starts at `t*8`. |

<!-- example: files=BOX.CHR:ff818181818181ff -->
```basic
10 CHRLOAD "BOX.CHR",2,8
20 PRINT MPEEK($3200+8);MPEEK($3200+9)
```

```text
 255  129
```

loads one tile into tile 1 of bank 2, whose first byte is at MIA address
`$3200`.

See also: [CHRSAVE](#chrsave), [CHRREAD](#chrread), [MIALOAD](m.md#miaload),
[Graphics](../basic/graphics.md).

## CHRMODE

**Statement** · `CHRMODE bank,is1bpp`

Sets how a CHR bank's 6,144 bytes are read. In **3bpp** mode the bank's three
planes together give each pixel three bits, so its 256 tiles have eight
colors each. In **1bpp** mode each plane is a separate set of 256 two-color
tiles, and `CHRPLANE` chooses the plane each layer uses. Banks 0 and 1, the
character set, are 1bpp at power-on.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-7 | The CHR bank. |
| *is1bpp* | 0-255 | 0 for 3bpp, any other value for 1bpp. |

The mode affects every layer that draws from the bank.

```basic
10 CHRMODE 2,0: MFILL $3200,6144,0
20 CHRREAD 2,8,8: CHRREAD 2,2048+8,8
30 DATA 255,255,255,255,0,0,0,0
40 DATA 255,255,0,0,255,255,0,0
50 SPRBANK 2: SPRCOUNT 0: SPRITE 0,1,150,90,0,0: SPRON
```

draws a tile whose rows use color indexes 3, 3, 1, 1, 2, 2 and 0, three
colors from palette 0.

See also: [CHRPLANE](#chrplane), [CHRREAD](#chrread), [Graphics](../basic/graphics.md).

## CHRPLANE

**Statement** · `CHRPLANE background,sprites,overlay`

Chooses which plane of a 1bpp CHR bank each layer reads its tiles from. A
1bpp bank holds three sets of 256 tiles, one in each plane, and this picks
the set. It has no effect on banks in 3bpp mode. At power-on all three layers
read plane 0.

| Argument | Range | Meaning |
| --- | --- | --- |
| *background* | 0-2 | The plane the background reads. |
| *sprites* | 0-2 | The plane sprites read. |
| *overlay* | 0-2 | The plane the text overlay reads. |

```basic
10 CHRMODE 2,1: MFILL $3200,6144,0
20 MFILL $3200+65*8,8,255: MFILL $3200+2048+65*8,8,24
30 SPRBANK 2: SPRCOUNT 0: SPRITE 0,65,150,90,0,0: SPRON
40 DELAY 1000: CHRPLANE 0,1,0
50 DELAY 1000: CHRPLANE 0,0,0
```

shows tile 65 of bank 2 as a solid block from plane 0, then as a thin bar
from plane 1, then as a block again.

See also: [CHRMODE](#chrmode), [Graphics](../basic/graphics.md).

## CHRREAD

**Statement** · `CHRREAD bank,offset,count`

Copies *count* values from `DATA` statements into a CHR bank, from byte
*offset* on. It reads from where the last `READ` left off, as `READ` does, and
is much faster than a `READ` and `MPOKE` loop.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-7 | The CHR bank. |
| *offset* | 0-6143 | The first byte. Tile *t* of plane 0 starts at `t*8`. |
| *count* | 0-65535 | The values to copy. Not checked against the bank's end. |

`CHRREAD` uses the variable `Z9` while it works and puts its value back.
Running out of `DATA` gives `?OUT OF DATA ERROR`.

```basic
10 CHRREAD 2,8,8
20 DATA 60,126,255,255,255,255,126,60
30 PRINT MPEEK($3200+8);MPEEK($3200+15)
```

```text
 60  60
```

See also: [CHRLOAD](#chrload), [DATA](d.md#data), [NTREAD](n.md#ntread),
[RESTORE](r.md#restore), [Graphics](../basic/graphics.md).

## CHRSAVE

**Statement** · `CHRSAVE path,bank[,offset[,count]]`

Saves *count* bytes of a CHR bank, from byte *offset* on, to a file. Without
*count* it saves to the end of the bank; without *offset* it starts at byte
0. The file can be loaded back with `CHRLOAD`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file, created or replaced. |
| *bank* | 0-7 | The CHR bank. |
| *offset* | 0-6143 | The first byte. |
| *count* | 0-65535 | The bytes to save. |

```basic
10 CHRSAVE "FONT.CHR",0
20 CHRSAVE "LETTERS.CHR",0,65*8,26*8
30 FSTAT "FONT.CHR",S,A,D,T: PRINT S
40 FSTAT "LETTERS.CHR",S,A,D,T: PRINT S
```

```text
 6144
 208
```

saves the whole character set, then only the plane 0 rows of `A` to `Z`.

See also: [CHRLOAD](#chrload), [MIASAVE](m.md#miasave),
[Graphics](../basic/graphics.md).

## CLEAR

**Statement** · `CLEAR`

Erases all variables, arrays and strings, forgets `FOR` loops and `GOSUB`
returns, and makes the next `READ` start at the first `DATA` value. The
program itself is kept. Clementina spells it `CLEAR`, not the Commodore 64's
`CLR`, and it takes no argument.

```basic
A=5: B$="HI": CLEAR: PRINT A;LEN(B$)
```

```text
 0  0
```

After `CLEAR`, `CONT` gives `?CAN'T CONTINUE ERROR`. `CLEAR` is also how a
program makes BASIC use a new top of memory (see
[Numbers, strings and variables](../basic/variables.md)).

See also: [NEW](n.md#new), [RUN](r.md#run), [RESTORE](r.md#restore).

## CLOSE

**Statement** · `CLOSE #handle`

Closes an open file, first writing anything still waiting to the card. The
file number can then be used again. Closing a number that is not open does
nothing.

| Argument | Range | Meaning |
| --- | --- | --- |
| *handle* | 1-16 | The file number, written with a `#`. One per statement. |

```basic
10 OPEN "LOG.TXT" FOR OUTPUT AS #1
20 BPUT#1,65
30 CLOSE #1
40 FSTAT "LOG.TXT",S,A,D,T: PRINT S
```

```text
 1
```

A file written and never closed can lose its last bytes.

See also: [OPEN](o.md#open), [FLUSH](f.md#flush),
[Files and the SD card](../basic/files.md).

## CLS

**Statement** · `CLS`

Clears the text screen, moves the cursor to the top-left corner and sets
the column `POS` reports to 0. It clears only the overlay; the background
and sprites are not touched.

```basic
10 CLS: PRINT "TOP LINE"
```

Clementina has no clear-screen character: `CHR$(12)` prints a tile. Use
`CLS`.

See also: [CRSR](#crsr), [Text and the screen](../basic/text.md).

## COLOR

**Statement** · `COLOR bank`

Sets the color of the **BASIC pen**, the style BASIC uses for `READY.`, error
messages, `INPUT` prompts, numbers and strings without a style of their own,
such as those `CHR$` and `STR$` make. Text typed in quotes keeps its own
color; `STYLE` can override it. `COLOR` keeps the pen's flips and reverse,
and does not change the color of what you type.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-15 | The palette bank. Its color 1 is the ink. 0 is white, the default. |

| Bank | Ink | Bank | Ink |
| ---: | --- | ---: | --- |
| 0 | White | 8 | Magenta |
| 1 | Red | 9 | Black |
| 2 | Orange | 10 | Gray |
| 3 | Yellow | 11 | Light gray |
| 4 | Green | 12 | Dark red |
| 5 | Cyan | 13 | Dark green |
| 6 | Blue (the backdrop) | 14 | Blue |
| 7 | Violet | 15 | White |

```basic
10 FOR I=0 TO 15: COLOR I: PRINT I;: NEXT
20 COLOR 0: PRINT
```

prints the numbers 0 to 15, each in its own color. Number 6 is invisible on
the default backdrop.

See also: [BCOLOR](b.md#bcolor), [STYLE](s.md#style), [ALT](a.md#alt),
[PALETTE](p.md#palette), [Styled strings](../basic/styled-strings.md).

## CONSDOWN

**Function** · `CONSDOWN(code)`

Returns 1 while a **consumer** key is held down, else 0. Consumer keys are
the media keys some keyboards have, such as volume and play. *code* is the
key's USB HID usage code on the consumer page: for example 205 play/pause,
226 mute, 233 volume up and 234 volume down.

| Argument | Range | Meaning |
| --- | --- | --- |
| *code* | 0-255 | The consumer-page HID usage code. |

```basic
PRINT CONSDOWN(233)
```

```text
 0
```

See also: [KEYDOWN](k.md#keydown), [INPUTDEV](i.md#inputdev),
[Input](../basic/input.md).

## CONT

**Statement** · `CONT`

Continues a program from where it stopped: after `STOP`, Ctrl-C, or an empty
line typed at an `INPUT`. In between, variables can be printed and changed
with direct commands.

A program that stopped with an error, or one that was edited, cleared with
`CLEAR`, `NEW` or `RUN`, or replaced with `LOAD`, cannot continue: `CONT` then
gives `?CAN'T CONTINUE ERROR`.

<!-- example: after="PRINT A|A=99|CONT" -->
```basic
10 A=1
20 STOP
30 PRINT "A IS";A
```

```text
CONT
A IS 99
```

The program stops at line 20 with `BREAK IN  20`. The direct commands typed
after it print `A` (1), change it to 99, and continue the program at line 30.

See also: [STOP](s.md#stop), [END](e.md#end),
[Programming rules](../basic/rules.md).

## COS

**Function** · `COS(number)`

Returns the cosine of an angle given in radians. The result is between -1
and 1. To convert degrees to radians, multiply by π/180, about 0.0174533.

```basic
PRINT COS(0);COS(3.14159265)
```

```text
 1 -.999999999
```

The second result is not exactly -1, because 3.14159265 is not exactly π and
the function itself is computed to about nine digits.

See also: [SIN](s.md#sin), [TAN](t.md#tan), [ATN](a.md#atn).

## CRSR

**Statement** · `CRSR column,row`

Moves the text cursor to a column and row of the screen, so the next `PRINT`
starts there. Column 0, row 0 is the top-left corner. It also sets the column
that `POS` and `TAB` use.

| Argument | Range | Meaning |
| --- | --- | --- |
| *column* | 0-39 | The column. |
| *row* | 0-24 | The row. |

```basic
10 CLS
20 CRSR 5,2: PRINT "AT 5,2"
30 CRSR 10,4: PRINT POS(0)
```

```text
     AT 5,2

           10
```

See also: [CLS](#cls), [POS](p.md#pos), [TAB](t.md#tab),
[Text and the screen](../basic/text.md).

## CUE

**Function** · `CUE(voice)`

Returns how many notes, ties and rests a voice's background track has started
since the track was loaded with `TRACK`. It is 0 before the track starts, 1
during its first note, and so on. It keeps counting through the loop part of
a track, and goes back to 0 after 65535.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |

A program can use it to act at a point in the music:

```basic
10 SNDON: WAVE 0,1: ADSR 0,0,8,12,6
20 TRACK 0,"T120 L8 O4 C D E F G A B > C"
30 BAND 1
40 IF CUE(0)<5 THEN 40
50 PRINT "FIFTH NOTE: G"
60 BAND 0
```

```text
FIFTH NOTE: G
```

See also: [TRACK](t.md#track), [BAND](b.md#band), [PLAYING](p.md#playing),
[Sound](../basic/sound.md).
