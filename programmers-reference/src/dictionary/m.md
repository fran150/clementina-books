# M

## MCOPY

**Statement** · `MCOPY source,destination,length[,rows,sourceStride,destinationStride]`

Copies bytes inside MIA's memory. With three arguments it copies one block of
*length* bytes; the two blocks may overlap. With six it copies a
**rectangle**: *rows* rows of *length* bytes each, where each stride is the
distance from the start of one row to the start of the next.

| Argument | Range | Meaning |
| --- | --- | --- |
| *source* | 0-262143 | The MIA address to copy from. |
| *destination* | 0-262143 | The MIA address to copy to. |
| *length* | 0-262144 | Block form: the bytes to copy. Rectangle form: the bytes in each row. |
| *rows* | 0-65535 | The number of rows. Both strides must follow, or `?SYNTAX ERROR`. |
| *sourceStride* | 0-65535 | Bytes between source row starts. |
| *destinationStride* | 0-65535 | Bytes between destination row starts. |

```basic
10 PRINT "THIS SCREEN WILL COME BACK"
20 MCOPY $10080,$20000,2000
30 CLS: PRINT "CLEARED": DELAY 1000
40 MCOPY $20000,$10080,2000
```

saves the text screen, characters and colors, clears it and brings it back.

A block that would run past the end of MIA's memory, at `$3FFFF`, gives
`?ILLEGAL QUANTITY ERROR` and copies nothing. In the rectangle form the
source and destination must not overlap. A copy cannot be stopped with
Ctrl-C once it has started.

See also: [MFILL](#mfill), [MPEEK](#mpeek), [MPOKE](#mpoke),
[MIA memory](../basic/mia-memory.md).

## MFILL

**Statement** · `MFILL address,length,value[,rows,stride]`

Fills MIA's memory with one byte value. With three arguments it fills one
block of *length* bytes. With five it fills a **rectangle**: *rows* rows of
*length* bytes, *stride* bytes apart.

| Argument | Range | Meaning |
| --- | --- | --- |
| *address* | 0-262143 | The first MIA address. |
| *length* | 0-262144 | Block form: the bytes to fill. Rectangle form: the bytes in each row. |
| *value* | 0-255 | The byte to write. |
| *rows* | 0-65535 | The number of rows. *stride* must follow. |
| *stride* | 0-65535 | Bytes between row starts. |

```basic
10 CLS
20 MFILL $10080+3*40+5,10,35,4,40
30 MFILL $10468+3*40+5,10,3,4,40
```

draws a yellow box of `#` characters, 10 wide and 4 high, on the text screen.

A block that would run past `$3FFFF` gives `?ILLEGAL QUANTITY ERROR` and
writes nothing.

See also: [MCOPY](#mcopy), [MPOKE](#mpoke),
[MIA memory](../basic/mia-memory.md).

## MIALOAD

**Statement** · `MIALOAD path,address`

Loads a whole file straight into MIA's memory, from *address* on. It stops at
the end of the file, or at the end of MIA's memory. The file is raw bytes,
with no header.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. |
| *address* | 0-16777215 | The MIA address of the first byte. |

<!-- example: files=DATA.BIN:010203040506 -->
```basic
10 MIALOAD "DATA.BIN",$30000
20 PRINT MPEEK($30000);MPEEK($30005)
```

```text
 1  6
```

A file that does not exist gives `?FILE I/O ERROR`.

See also: [MIASAVE](#miasave), [CHRLOAD](c.md#chrload),
[MIA memory](../basic/mia-memory.md), [Files and the SD card](../basic/files.md).

## MIASAVE

**Statement** · `MIASAVE path,address,length`

Saves *length* bytes of MIA's memory, from *address* on, to a file. The file
is created, or replaced if it exists.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. |
| *address* | 0-16777215 | The MIA address of the first byte. |
| *length* | 0-16777215 | The bytes to save. |

```basic
10 MFILL $20000,4,65: MPOKE $20001,66
20 MIASAVE "M.BIN",$20000,4
30 MIALOAD "M.BIN",$21000
40 FOR I=0 TO 3: PRINT MPEEK($21000+I);: NEXT
```

```text
 65  66  65  65
```

See also: [MIALOAD](#miaload), [CHRSAVE](c.md#chrsave),
[Files and the SD card](../basic/files.md).

## MID$

**Function** · `MID$(string, start[, length])`

Returns *length* characters of *string*, starting at character *start*; the
first character is 1. Without *length* it returns the rest of the string. The
characters keep their colors and styles.

| Argument | Range | Meaning |
| --- | --- | --- |
| *string* | | The string. |
| *start* | 1-255 | The first character. Past the end gives an empty string; 0 gives `?ILLEGAL QUANTITY ERROR`. |
| *length* | 0-255 | How many characters. If left out, the rest of the string. |

```basic
PRINT MID$("HELLO",2,3);"|";MID$("HELLO",3)
```

```text
ELL|LLO
```

`MID$(STR$(N),2)` drops the space `STR$` puts before a positive number.

See also: [LEFT$](l.md#left), [RIGHT$](r.md#right), [LEN](l.md#len).

## MKDIR

**Statement** · `MKDIR path`

Makes a directory on the SD card. Its parent directory must already exist:
`MKDIR` makes one level at a time. A directory or file that already has the
name, or a missing parent, gives `?FILE I/O ERROR`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The new directory. |

```basic
MKDIR "GAMES"
MKDIR "GAMES/LEVELS"
DIR "GAMES"
```

```text
LEVELS/
```

See also: [CD](c.md#cd), [RMDIR](r.md#rmdir), [DIR](d.md#dir),
[Files and the SD card](../basic/files.md).

## MON

**Statement** · `MON`

Enters **WozMon**, the machine code monitor, which shows its `\` prompt.
There, memory can be looked at and changed and machine code run. Typing `Q`
and RETURN goes back to BASIC's `READY.`, with the program and its variables
kept.

```basic
POKE 640,65: POKE 641,66
MON
280.281
Q
```

```text
0280: 41 42
```

WozMon reads and writes hex: `280.281` shows the bytes at `$0280-$0281`.

See also: [SYS](s.md#sys), [WozMon](../ml/wozmon.md).

## MOUSE

**Statement** · `MOUSE deltaX,deltaY,buttons,wheel,pan`

Reads the mouse into five numeric variables. The mouse reports movement, not
a position: each `MOUSE` gives the movement since the previous one. The first
`MOUSE` always reads no movement.

| Argument | Range | Meaning |
| --- | --- | --- |
| *deltaX* | -128-127 | Gets the movement to the right; negative is left. |
| *deltaY* | -128-127 | Gets the movement down; negative is up. |
| *buttons* | 0-31 | Gets the buttons held, added: left 1, right 2, middle 4, back 8, forward 16. |
| *wheel* | -128-127 | Gets the wheel movement. |
| *pan* | -128-127 | Gets the sideways pan. |

```basic
10 MOUSE X,Y,B,W,P
20 PRINT X;Y;B;W;P
```

```text
 0  0  0  0  0
```

Read the mouse often: a movement of more than 127 between two reads cannot
be told from a smaller one.

See also: [INPUTDEV](i.md#inputdev), [KEYDOWN](k.md#keydown),
[Input](../basic/input.md).

## MPEEK

**Function** · `MPEEK(address)`

Returns the byte, 0-255, at an address in MIA's memory. MIA addresses are not
CPU addresses: `PEEK` reads the 6502's memory.

| Argument | Range | Meaning |
| --- | --- | --- |
| *address* | 0-262143 | The MIA address. Outside the range gives `?ILLEGAL QUANTITY ERROR`. |

```basic
10 CLS: PRINT "HELLO"
20 PRINT CHR$(MPEEK($10080))
```

```text
HELLO
H
```

Line 20 reads the first character of the text screen.

See also: [MPOKE](#mpoke), [PEEK](p.md#peek),
[MIA memory](../basic/mia-memory.md).

## MPOKE

**Statement** · `MPOKE address,value`

Writes one byte to an address in MIA's memory. Writing outside the free area
changes what MIA does at once: a character on the screen, a color, a sound.

| Argument | Range | Meaning |
| --- | --- | --- |
| *address* | 0-262143 | The MIA address. |
| *value* | 0-255 | The byte. |

```basic
10 CLS: PRINT "HELLO"
20 MPOKE $10468,1
```

turns the `H` red, by writing palette 1 into its attribute byte.

See also: [MPEEK](#mpeek), [MFILL](#mfill), [POKE](p.md#poke),
[MIA memory](../basic/mia-memory.md).
