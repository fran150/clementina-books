# O

## OAMLOAD

**Statement** · `OAMLOAD path[,index]`

Loads a whole file of sprite records into the sprite table (OAM), starting at
sprite *index*. Each record is five bytes: the tile, the low 8 bits of X, the
low 8 bits of Y, the attribute byte and the extension byte, in MIA's own
format. A file of 40 bytes sets eight sprites.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. |
| *index* | 0-255 | The first sprite; 0 if left out. |

<!-- example: files=SHIP.OAM:2a64500100 -->
```basic
10 OAMLOAD "SHIP.OAM",3
20 SPRCOUNT 3: SPRON
30 PRINT MPEEK($10850+15);MPEEK($10850+16)
```

```text
 42  100
```

loads one record into sprite 3, a `*` at X 100, Y 80 in palette 1. Sprite
*n*'s record is at MIA address `$10850 + n*5`.

See also: [OAMSAVE](#oamsave), [OAMREAD](#oamread), [SPRITE](s.md#sprite),
[Graphics](../basic/graphics.md).

## OAMREAD

**Statement** · `OAMREAD index,count`

Copies *count* sprite records from `DATA` statements into the sprite table,
starting at sprite *index*. Each record takes five `DATA` values: tile, X low
byte, Y low byte, attribute, extension. It reads from where the last `READ`
left off, as `READ` does.

| Argument | Range | Meaning |
| --- | --- | --- |
| *index* | 0-255 | The first sprite. |
| *count* | 0-255 | The sprites to copy, five values each. Not checked against the 256 sprites. |

The attribute byte holds the palette in bits 0-3, priority in bit 4, flip X
in bit 5 and flip Y in bit 6. The extension byte holds bits 8-9 of X in bits
0-1, bit 8 of Y in bit 2, and in bit 3 a 1 that hides the sprite. Running out
of `DATA` gives `?OUT OF DATA ERROR`. `OAMREAD` uses the variable `Z9` while
it works and puts its value back.

```basic
10 OAMREAD 0,2
20 DATA 42,100,80,1,0
30 DATA 43,108,80,1,0
40 SPRCOUNT 1: SPRON
50 PRINT MPEEK($10855)
```

```text
 43
```

shows a `*` and a `+` side by side in the middle of the screen.

See also: [OAMLOAD](#oamload), [SPRITE](s.md#sprite), [NTREAD](n.md#ntread),
[RESTORE](r.md#restore), [Graphics](../basic/graphics.md).

## OAMSAVE

**Statement** · `OAMSAVE path[,index[,count]]`

Saves *count* sprite records, five bytes each, starting at sprite *index*, to
a file. Without *count* it saves to the last sprite, 255; without *index* it
starts at sprite 0, so `OAMSAVE path` saves all 256 sprites, 1,280 bytes.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file, created or replaced. |
| *index* | 0-255 | The first sprite. |
| *count* | 0-255 | The sprites to save. |

```basic
10 SPRITE 0,42,100,80,1,0
20 OAMSAVE "ONE.OAM",0,1
30 FSTAT "ONE.OAM",S,A,D,T: PRINT S
40 OAMSAVE "LAST.OAM",250
50 FSTAT "LAST.OAM",S,A,D,T: PRINT S
```

```text
 5
 30
```

See also: [OAMLOAD](#oamload), [FSTAT](f.md#fstat).

## ON

**Statement** · `ON index GOTO|GOSUB line[,line...]`

Jumps to one of several lines, chosen by a number. `ON` works out *index*,
drops any fraction, and goes to the line at that position in the list: 1
picks the first line, 2 the second, and so on. With `GOTO` it jumps there;
with `GOSUB` it calls it as a subroutine, and the `RETURN` comes back to the
statement after the `ON`.

When *index* is 0 or larger than the number of lines, `ON` does nothing and
the program goes on with the next statement.

| Argument | Range | Meaning |
| --- | --- | --- |
| *index* | 0-255 | The position in the list. |
| *line* | 0-63999 | The lines to choose from. |

An *index* below 0 or above 255 gives `?ILLEGAL QUANTITY ERROR`.

```basic
10 FOR K=0 TO 4
20 ON K GOTO 50,60,70
30 PRINT K;"NONE": GOTO 80
50 PRINT K;"ONE": GOTO 80
60 PRINT K;"TWO": GOTO 80
70 PRINT K;"THREE"
80 NEXT
```

```text
 0 NONE
 1 ONE
 2 TWO
 3 THREE
 4 NONE
```

See also: [GOTO](g.md#goto), [GOSUB](g.md#gosub), [RETURN](r.md#return).

## OPEN

**Statement** · `OPEN path FOR mode AS #handle`

Opens a file on the SD card as file number *handle*, 1 to 16. The other file
statements and functions then use that number: `BGET#`, `BPUT#`, `SEEK#`,
`EOF`, `FPOS`, `FSIZE`, `FLUSH` and `CLOSE`. Several files can be open at
once, each with its own position.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. |
| *mode* | | `INPUT`, `OUTPUT`, `APPEND` or `UPDATE` (below). |
| *handle* | 1-16 | The file number, written `#n`. |

| Mode | Opens for | The file |
| --- | --- | --- |
| `INPUT` | Reading. | Must exist. |
| `OUTPUT` | Writing. | Created, or emptied if it exists. |
| `APPEND` | Writing at the end. | Created if it does not exist. |
| `UPDATE` | Reading and writing, from the start. | Created if it does not exist; not emptied. |

A missing file opened for `INPUT`, or a file number that is already open,
gives `?FILE I/O ERROR`. `LOAD` and `SAVE` use file number 16 themselves.

```basic
10 OPEN "ABC.TXT" FOR OUTPUT AS #1
20 FOR I=65 TO 67: BPUT#1,I: NEXT
30 CLOSE #1
40 OPEN "ABC.TXT" FOR APPEND AS #1
50 BPUT#1,68: CLOSE #1
60 OPEN "ABC.TXT" FOR INPUT AS #2
70 IF EOF(2) THEN 90
80 BGET#2,C: PRINT CHR$(C);: GOTO 70
90 CLOSE #2: PRINT
```

```text
ABCD
```

See also: [CLOSE](c.md#close), [BGET#](b.md#bget), [BPUT#](b.md#bput),
[EOF](e.md#eof), [SEEK#](s.md#seek), [Files and the SD card](../basic/files.md).

## OVLALT

**Statement** · `OVLALT bank`

Chooses the alternate CHR bank of the overlay, the text screen. A text cell
whose ALT attribute bit is set takes its tile from this bank instead of the
one `OVLBANK` chose. At power-on the alternate bank is 1, which holds the
reversed character set, so ALT text shows in reverse.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-7 | The CHR bank. |

```basic
10 ALT 1: PRINT "REVERSE": ALT 0
20 OVLALT 0: DELAY 1000: OVLALT 1
```

prints a word in reverse, shows it in normal letters for a second, then
reverses it again.

See also: [OVLBANK](#ovlbank), [ALT](a.md#alt), [BGALT](b.md#bgalt),
[Graphics](../basic/graphics.md).

## OVLBANK

**Statement** · `OVLBANK bank`

Chooses the CHR bank the overlay, the text screen, takes its tiles from. At
power-on it is bank 0, the character set. A program can load its own font
into another bank and switch the screen to it. `OVLBANK` only chooses the
bank; it does not load anything or change `CHRMODE` or `CHRPLANE`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-7 | The CHR bank. |

```basic
10 OVLBANK 1: DELAY 1000: OVLBANK 0
```

shows the whole screen in reverse for a second, from the reversed character
set in bank 1. `OVLBANK 0: OVLALT 1` puts back the power-on banks.

See also: [OVLALT](#ovlalt), [BGBANK](b.md#bgbank), [SPRBANK](s.md#sprbank),
[CHRLOAD](c.md#chrload), [Graphics](../basic/graphics.md).

## OVLOFF

**Statement** · `OVLOFF`

Hides the overlay, the layer that shows the text screen, without clearing
it. The prompt and the cursor are hidden too. Printing goes on while it is
hidden, so a program can build a screen of text and show it all at once with
`OVLON`.

Returning to `READY.` does not show the overlay again. If a program stops
with the overlay off, type `OVLON` without seeing it.

```basic
10 OVLOFF
20 CLS: PRINT "BUILT WHILE HIDDEN"
30 DELAY 1000
40 OVLON
```

See also: [OVLON](#ovlon), [BGOFF](b.md#bgoff), [VIDOFF](v.md#vidoff),
[Text and the screen](../basic/text.md).

## OVLON

**Statement** · `OVLON`

Shows the overlay, the layer that shows the text screen, with whatever it
holds. The overlay is on at power-on.

```basic
10 OVLOFF: PRINT "HELLO AGAIN"
20 DELAY 500: OVLON
```

See also: [OVLOFF](#ovloff), [BGON](b.md#bgon), [SPRON](s.md#spron),
[Graphics](../basic/graphics.md).
