# Graphics

Clementina's picture is 320 by 200 pixels, built from 8 by 8 pixel **tiles**.
MIA keeps the whole picture description in its memory, and the video client
on the host computer draws it. A program never draws pixels; it chooses which
tiles go where and which colors they use.

## The layers

The picture is made of four layers, from back to front:

1. The **backdrop**, one color filling the whole screen.
2. The **background**, a grid of tiles that can be larger than the screen
   and scroll in any direction.
3. **Sprites**, up to 256 tiles that move independently.
4. The **overlay**, the 40 by 25 text screen BASIC prints on.

Background tiles marked with the **priority** bit are drawn in front of the
sprites, so a sprite can walk behind a tree. Each layer can be switched on
and off:

| Statement | Effect |
| --- | --- |
| `BGON` / `BGOFF` | Background on or off. Off at power-on. |
| `SPRON` / `SPROFF` | Sprites on or off. Off at power-on. |
| `OVLON` / `OVLOFF` | Text overlay on or off. On at power-on. |
| `VIDON` / `VIDOFF` | The whole picture on or off. |
| `BCOLOR n` | The backdrop color: the ink color of palette *n*. |

## Tiles and character banks

Tile graphics live in eight **CHR banks** of 6,144 bytes, numbered 0-7. A
bank holds 256 tiles in one of two formats:

- **3bpp**: each pixel has three bits, so a tile can use eight colors. A tile
  is 24 bytes, eight rows in each of three **planes**.
- **1bpp**: each pixel has one bit, two colors. The bank's three planes are
  then three separate sets of 256 tiles.

`CHRMODE bank,1` marks a bank as 1bpp and `CHRMODE bank,0` as 3bpp.
`CHRPLANE bg,spr,ovl` chooses which plane of a 1bpp bank each layer reads.
Each layer has its own current bank: `BGBANK` for the background, `SPRBANK`
for sprites and `OVLBANK` for the overlay. The background and overlay also
have an **alternate** bank, chosen per cell by the attribute's ALT bit
(`BGALT`, `OVLALT`).

At power-on banks 0 and 1 hold the character set in 1bpp, plane 0: bank 0
normal, bank 1 reversed. The overlay uses bank 0, with bank 1 as its
alternate for reverse text. The background and sprites start on bank 0 too,
so they can show letters until a program loads its own tiles.

### The tile format

A bank's three planes follow each other, 2,048 bytes each:

| Bytes of the bank | Holds |
| --- | --- |
| 0-2047 | Plane 0: the low bit of every pixel. |
| 2048-4095 | Plane 1: the middle bit. |
| 4096-6143 | Plane 2: the high bit. |

Within a plane, tile *t* is the eight bytes from `t*8`, one byte a row, top
row first. **Bit 0 of a row is its leftmost pixel**, bit 7 its rightmost: the
reverse of what you might expect, and of the Commodore 64. A pixel's color
index is its plane 0 bit plus twice its plane 1 bit plus four times its plane
2 bit.

Color index 0 is transparent in sprites and in the overlay, and drawn in the
background.

## Palettes

Colors come from 16 **palette banks** of eight colors each. Every tile on the
screen names a palette bank, and its pixel color indexes 0-7 pick colors in
that bank. A color is 16-bit RGB565: red 0-31, green 0-63, blue 0-31.

```basic
PALETTE 1,1,31,63,0
```

makes color 1 of palette bank 1 yellow. The text screen uses color 1 of each
bank as its ink, so this also changes what `COLOR 1` looks like. The default
colors are listed in [Appendix E](../appendix/charset-keys.md).

## Sprites

A sprite is one 8 by 8 tile from the sprite bank, placed anywhere on the
screen. There are 256 sprites, numbered 0-255, and a higher-numbered sprite
is drawn in front of a lower one. Larger objects are made of several sprites
moved together.

`SPRITE n,tile,x,y,palette,flags` sets everything about sprite *n* at once.
*x* runs from -512 to 511 and *y* from -256 to 255, so a sprite can sit
partly or wholly off the screen. *flags* adds up:

| Value | Flag |
| ---: | --- |
| 1 | Hidden. |
| 2 | Priority: behind background pixels that are not color 0. |
| 4 | Flip X. |
| 8 | Flip Y. |

Then `SPRX`, `SPRY`, `SPRTILE`, `SPRCOLOR`, `SPRFLIP` and `SPRPRI` change one
thing each, which is cheaper than repeating `SPRITE` for every frame.
`SPRCOUNT n` tells the renderer to look at sprites 0 to *n* only, so a program
that uses few sprites should set it low.

This program draws a ball in CHR bank 2 and bounces it across the screen:

```basic
10 MFILL $3200,6144,0: REM CLEAR CHR BANK 2
20 CHRREAD 2,8,8: REM TILE 1, PLANE 0
30 DATA 60,126,255,255,255,255,126,60
40 PALETTE 1,1,31,63,0
50 SPRBANK 2: SPRCOUNT 0
60 SPRITE 0,1,0,96,1,0: SPRON
70 X=0: D=4
80 X=X+D: IF X<0 OR X>312 THEN D=-D: GOTO 80
90 SPRX 0,X: GOTO 80
```

Line 10 clears bank 2, whose first byte is at MIA address
`$00200 + 2*6144` = `$3200`. Line 20 writes the eight rows of tile 1 into
plane 0, so every lit pixel has color index 1, which line 40 makes yellow.
Press Ctrl-C to stop it, and `SPROFF` to hide the ball.

## The background

The background is built from eight **tables** of 40 by 25 cells, each cell a
tile number and an attribute byte. The attribute byte is the same as for text:

| Bits | Field |
| --- | --- |
| 0-3 | Palette bank. |
| 4 | Flip X. |
| 5 | Flip Y. |
| 6 | Priority: drawn in front of sprites. |
| 7 | ALT: take the tile from the alternate bank (`BGALT`). |

`BGMODE` decides how the tables join into one map, which the screen is a
320 by 200 window onto:

| `BGMODE` | Map in cells | Tables used |
| ---: | --- | --- |
| 0 | 40×25 | 0 |
| 1 | 80×25 | 0 1 |
| 2 | 40×50 | 0 above 2 |
| 3 | 160×25 | 0 1 2 3 |
| 4 | 40×100 | 0, 1, 2, 3 from top to bottom |
| 5 | 80×50 | 0 1 above 2 3 |

`SCROLL x,y` moves the window to pixel *x*,*y* of the map, wrapping around at
its edges, so a map can scroll forever. The tables above are **set 0**.
`BGSET 1` switches to tables 4-7, arranged the same way: a program can build
the next screen in the hidden set and switch to it in one step.

`BGCHAR column,row,tile,attribute` writes one cell, using the map's own
coordinates in the current mode. For bigger changes, the tables can be
written directly in MIA memory: table *t*'s tiles start at
`$0C200 + t*1000` and its attributes at `$0E140 + t*1000`, one byte a cell, row
by row.

```basic
10 BGMODE 1: BGBANK 0
20 MFILL $C200,2000,46: REM TABLES 0-1: DOTS
30 MFILL $E140,2000,4: REM PALETTE 4
40 FOR I=0 TO 9: BGCHAR I*8,12,65+I,3: NEXT
50 BGON: OVLOFF
60 FOR X=0 TO 636 STEP 4: SCROLL X,0: NEXT
70 OVLON: BGOFF
```

This fills tables 0 and 1 with dots, writes the letters `A` to `J` across the
80-column map, and scrolls the whole width by. It uses the character set in
bank 0 as tiles, so it needs no graphics of its own. `BGMODE` comes first
because `BGCHAR` checks its column against the current map: in mode 0 a column
past 39 gives `?ILLEGAL QUANTITY ERROR`.

`MFILL` also has a rectangle form, `MFILL address,length,value,rows,stride`,
which fills *rows* runs of *length* bytes, *stride* bytes apart. With a
stride of 40 it fills a rectangle of one table:

```basic
MFILL $C200+5*40+10,20,42,10,40
```

puts a 20 by 10 block of `*` tiles at column 10, row 5 of table 0.

## Loading graphics

Typing tiles in `DATA` lines gets tedious. There are two faster ways.

**From `DATA`**, five statements copy a run of `DATA` values straight into
MIA memory, much faster than a `READ` and `MPOKE` loop:

| Statement | Copies into |
| --- | --- |
| `CHRREAD bank,offset,count` | A CHR bank. |
| `PALREAD bank,offset,count` | Palette memory, two bytes a color, low byte first. |
| `NTREAD table,cell,count` | A background table's tile numbers. |
| `ATRREAD table,cell,count` | A background table's attributes. |
| `OAMREAD sprite,count` | Sprite records, five bytes each. |

They read from where the last `READ` stopped, like `READ` does, and use the
variable `Z9` as scratch (its value is restored).

**From files**, the `LOAD` and `SAVE` forms move whole tables between MIA and
the SD card in one step:

| Load | Save | Data |
| --- | --- | --- |
| `CHRLOAD path,bank[,offset]` | `CHRSAVE path,bank[,offset[,count]]` | CHR banks. |
| `PALLOAD path,bank[,offset]` | `PALSAVE path,bank[,offset[,count]]` | Palettes. |
| `NTLOAD path,table[,cell]` | `NTSAVE path,table[,cell[,count]]` | Background tiles. |
| `ATRLOAD path,table[,cell]` | `ATRSAVE path,table[,cell[,count]]` | Background attributes. |
| `OAMLOAD path[,sprite]` | `OAMSAVE path[,sprite[,count]]` | Sprite records. |

A load takes the whole file and runs on into the next bank or table if the
file is longer. A save without a count writes from the starting point to the
end of the bank, table or sprite list. The files are raw bytes in MIA's own
format, which is what Clementina Studio's editors export (see the *SDK &
Studio Guide*).

<!-- example: files=GAME.CHR:ff00ff00,GAME.PAL:1f00,LEVEL1.NT:4142,LEVEL1.AT:0102 -->
```basic
10 CHRLOAD "GAME.CHR",2
20 PALLOAD "GAME.PAL",0
30 NTLOAD "LEVEL1.NT",0: ATRLOAD "LEVEL1.AT",0
40 BGBANK 2: BGON
```

## When changes appear

MIA sends changes to the video client in updates the client asks for, many
times a second. Everything a program writes between two updates appears
together. A BASIC program is slow enough that this rarely matters; Part III's
[Graphics](../mia/graphics.md) chapter explains how machine code can wait for
a clean moment to change the screen.

The exact layout of every video structure is in *Mapping Clementina*,
[Video](../../../mapping/src/mia/video.md).
