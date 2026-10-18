# MIA memory

MIA has 256 KiB of RAM of its own, separate from the 6502's memory. Everything
MIA does is described by bytes in it: the screen, the sprites, the palettes,
the sound voices, the state of the keyboard and the SD card. Almost every
statement in the previous chapters works by writing these bytes. Four more
statements reach them directly:

| Statement or function | Effect |
| --- | --- |
| `MPEEK(address)` | Read one byte. |
| `MPOKE address,value` | Write one byte. |
| `MCOPY source,destination,length` | Copy a block. The blocks may overlap. |
| `MFILL address,length,value` | Fill a block with one value. |

A MIA address runs from 0 to 262143 (`$3FFFF`), more than a 16-bit number
holds, so hex addresses with five digits are common: `$14000`. MIA addresses
and CPU addresses are different things: `PEEK(1024)` reads the 6502's memory,
`MPEEK(1024)` reads MIA's.

## What is where

| MIA addresses | Holds |
| --- | --- |
| `$00000-$10D4F` | Video: control, palettes, CHR banks, background tables, the text screen, sprites. |
| `$11000-$1107F` | Input: keys, mouse, gamepads, the clock snapshot. |
| `$12000-$1204F` | Sound: the four voices and the sound controls. |
| `$13000-$13BFF` | The SD card's control block and buffers. |
| `$14000-$3FFFF` | Free for programs: 180 KiB. |

The free area is the program's to use: MIA writes there only when a statement
tells it to. The one BASIC statement that picks an address there by itself is
`TRACK`, which stores voice *v*'s music at
`$14000 + v*$1000` unless told otherwise. A program that uses `TRACK` and
also keeps data in MIA memory should start its data at `$18000`, or give
`TRACK` an address of its own.

Writing to the other areas changes what MIA does at once: an `MPOKE` into the
text screen shows a character, an `MPOKE` into a voice changes its sound. That
is what makes them useful, and also what makes a wrong address show up on the
screen or in the speakers. The full map, byte by byte, is in *Mapping
Clementina*, [MIA RAM](../../../mapping/src/mia/free-ram.md) and the chapters
next to it.

## Saving and restoring the screen

`MCOPY` moves bytes inside MIA, so it is far faster than a `FOR` loop of
`MPEEK` and `MPOKE`. This program saves the text screen, both its characters
and their colors, clears it, and brings it back:

```basic
10 PRINT "THIS SCREEN WILL COME BACK"
20 MCOPY $10080,$20000,2000
30 CLS: PRINT "CLEARED"
40 DELAY 1000
50 MCOPY $20000,$10080,2000
60 CRSR 0,2
```

The text screen's 1,000 characters and 1,000 attributes sit next to each
other from `$10080`, so one copy of 2,000 bytes takes both.

## Rectangles

`MCOPY` and `MFILL` have a second form that works on a **rectangle**: several
rows of the same length, a fixed distance apart.

```text
MCOPY source,destination,length,rows,sourcestride,destinationstride
MFILL address,length,value,rows,stride
```

*length* is the bytes in one row, *rows* the number of rows, and each
*stride* the distance from the start of one row to the start of the next. On
the 40-column screen the stride is 40. This draws a box of `#` in yellow:

```basic
10 CLS
20 MFILL $10080+3*40+5,10,35,4,40
30 MFILL $10468+3*40+5,10,3,4,40
```

A game map wider than the screen can be kept in the free area and copied into
a background table one screen at a time. With a map 200 cells wide at
`$20000`, this copies the 40 by 25 cells starting at column *C* into table 0:

```basic
100 MCOPY $20000+C,$C200,40,25,200,40
```

In the rectangle form the source and destination must not overlap.

## Loading part of a file

`MIALOAD` always loads a whole file. To use part of one, load it into the free
area and copy the part:

<!-- example: files=TILES.CHR:01020304 -->
```basic
10 MIALOAD "TILES.CHR",$30000
20 MCOPY $30000+64*8,$3200+64*8,16*8,3,2048,2048
```

copies tiles 64-79 of a whole bank's file into CHR bank 2. A tile's rows are
in three planes 2,048 bytes apart ([Graphics](graphics.md)), so the copy is a
rectangle of three rows of 128 bytes.

## Checks

Every address and length is checked before anything is written. A negative
value, an address past `$3FFFF` or a block that would run past it gives
`?ILLEGAL QUANTITY ERROR`, and nothing changes. A length of 0 does nothing.

`MCOPY`, `MFILL`, `MIALOAD` and the graphics `LOAD` statements cannot be
stopped with Ctrl-C once they have started; they are quick.

How machine code reaches MIA's memory, through MIA's **indexes**, is the
subject of Part III, [The MIA model](../mia/model.md).
