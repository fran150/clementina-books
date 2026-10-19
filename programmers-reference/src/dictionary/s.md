# S

## SAVE

**Statement** · `SAVE path`

Saves the program in memory to a file on the SD card. A file with that name
is replaced. The file holds the program as BASIC stores it, colors of typed
strings included, and `LOAD` reads it back.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file, created or replaced. Any string expression. |

```basic
10 PRINT "HELLO"
SAVE "HELLO.BAS"
NEW
LOAD "HELLO.BAS"
LIST
```

```text
 10 PRINT "HELLO"
```

`SAVE` uses file number 16 while it works, so a program that saves should
leave that number closed.

See also: [LOAD](l.md#load), [BSAVE](b.md#bsave), [DIR](d.md#dir),
[Files](../basic/files.md).

## SCROLL

**Statement** · `SCROLL x,y`

Moves the 320 by 200 pixel screen window to pixel *x*,*y* of the background
map. The map wraps around at its edges, so the window can keep moving in any
direction.

| Argument | Range | Meaning |
| --- | --- | --- |
| *x* | 0-65535 | Pixels from the left of the map; wraps at the map's width. |
| *y* | 0-65535 | Pixels from the top of the map; wraps at the map's height. |

The size of the map depends on `BGMODE`. In mode 0 the map is the same size
as the screen, so scrolling wraps the picture around.

```basic
10 BGMODE 1: MFILL $C200,2000,46
20 FOR I=0 TO 9: BGCHAR I*8,12,65+I,3: NEXT
30 BGON: OVLOFF
40 FOR X=0 TO 636 STEP 4: SCROLL X,0: NEXT
50 SCROLL 0,0: OVLON: BGOFF
```

scrolls an 80-column background across the screen.

See also: [BGMODE](b.md#bgmode), [BGSET](b.md#bgset), [BGCHAR](b.md#bgchar),
[Graphics](../basic/graphics.md).

## SEEK#

**Statement** · `SEEK# handle,position`

Moves the read and write position of an open file to byte *position*. The
first byte of the file is 0. The next `BGET#` or `BPUT#` works from there.

| Argument | Range | Meaning |
| --- | --- | --- |
| *handle* | 1-16 | The file number. It follows `SEEK#` with no space. |
| *position* | 0-4294967295 | The byte offset from the start of the file. |

```basic
10 OPEN "SEEK.DAT" FOR OUTPUT AS #1
20 FOR I=65 TO 70: BPUT#1,I: NEXT
30 CLOSE #1
40 OPEN "SEEK.DAT" FOR INPUT AS #1
50 SEEK#1,3: BGET#1,B: PRINT CHR$(B)
60 SEEK#1,0: BGET#1,B: PRINT CHR$(B)
70 CLOSE #1
```

```text
D
A
```

See also: [FPOS](f.md#fpos), [FSIZE](f.md#fsize), [BGET#](b.md#bget),
[OPEN](o.md#open), [Files](../basic/files.md).

## SGN

**Function** · `SGN(number)`

Returns -1 if *number* is negative, 0 if it is zero and 1 if it is
positive.

```basic
PRINT SGN(-4.5);SGN(0);SGN(9)
```

```text
-1  0  1
```

See also: [ABS](a.md#abs), [INT](i.md#int).

## SIN

**Function** · `SIN(number)`

Returns the sine of *number*, an angle in radians. The result is between -1
and 1. To use degrees, multiply them by π/180.

```basic
10 P=ATN(1)*4
20 PRINT SIN(0);SIN(P/2);SIN(30*P/180)
```

```text
 0  1  .5
```

See also: [COS](c.md#cos), [TAN](t.md#tan), [ATN](a.md#atn).

## SNDCLR

**Statement** · `SNDCLR`

Stops the sound generator and puts every voice back to its defaults: pulse
wave with width 128, centered, voice volume 255. The master volume goes back
to 15.

```basic
SNDCLR
```

See also: [SNDON](#sndon), [SNDOFF](#sndoff), [Sound](../basic/sound.md).

## SNDOFF

**Statement** · `SNDOFF`

Stops the sound generator. The voices keep their settings, so `SNDON`
starts them again as they were.

```basic
10 SNDON: WAVE 0,2: ADSR 0,0,8,12,6
20 NOTE 0,48: DELAY 500
30 SNDOFF: DELAY 500
40 SNDON: DELAY 500: GATE 0,0
```

plays a note, stops all sound for half a second, then lets the note finish.

See also: [SNDON](#sndon), [SNDCLR](#sndclr), [Sound](../basic/sound.md).

## SNDON

**Statement** · `SNDON`

Starts the sound generator. Sound is stopped at power-on. Set the voices up
with `WAVE`, `ADSR` and the rest, then use `SNDON` once.

```basic
10 SNDON: WAVE 0,1: ADSR 0,0,8,12,6
20 NOTE 0,57: DELAY 250: GATE 0,0
```

plays an A, 440 Hz, for a quarter of a second.

See also: [SNDOFF](#sndoff), [SNDCLR](#sndclr), [NOTE](n.md#note),
[Sound](../basic/sound.md).

## SPC

**Function** · `SPC(count)`

Prints *count* spaces. `SPC` can only be used inside `PRINT`; it returns no
value, and anywhere else it gives `?SYNTAX ERROR`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *count* | 0-255 | The number of spaces. |

```basic
PRINT "A";SPC(5);"B"
```

```text
A     B
```

See also: [TAB](t.md#tab), [PRINT](p.md#print), [Text](../basic/text.md).

## SPRBANK

**Statement** · `SPRBANK bank`

Chooses the CHR bank that all sprites take their tiles from. Bank 0, the
character set, is used at power-on.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-7 | The CHR bank. |

```basic
10 MFILL $3200,6144,0: CHRREAD 2,8,8
20 DATA 60,126,255,255,255,255,126,60
30 SPRBANK 2: SPRITE 0,1,156,96,1,0: SPRON
```

draws a ball in tile 1 of bank 2 and shows it as sprite 0.

See also: [SPRITE](#sprite), [BGBANK](b.md#bgbank), [CHRMODE](c.md#chrmode),
[Graphics](../basic/graphics.md).

## SPRCOLOR

**Statement** · `SPRCOLOR index,palette`

Changes the palette bank of one sprite. Its other settings stay as they
are.

| Argument | Range | Meaning |
| --- | --- | --- |
| *index* | 0-255 | The sprite. |
| *palette* | 0-15 | The palette bank. |

```basic
10 SPRITE 0,65,156,96,1,0: SPRON
20 FOR C=0 TO 15: SPRCOLOR 0,C: DELAY 200: NEXT
```

shows a letter `A` in each of the 16 palettes.

See also: [SPRITE](#sprite), [PALETTE](p.md#palette).

## SPRCOUNT

**Statement** · `SPRCOUNT lastIndex`

Tells the video hardware to draw sprites 0 to *lastIndex* only. A program
that uses a few sprites should keep their numbers low and set `SPRCOUNT` to
the highest one.

| Argument | Range | Meaning |
| --- | --- | --- |
| *lastIndex* | 0-255 | The highest sprite drawn. |

```basic
10 FOR I=0 TO 3: SPRITE I,49+I,100+I*16,96,1,0: NEXT
20 SPRCOUNT 3: SPRON
```

shows the digits 1 to 4 as sprites 0 to 3.

See also: [SPRITE](#sprite), [SPRON](#spron).

## SPRFLIP

**Statement** · `SPRFLIP index,flipX,flipY`

Mirrors one sprite. *flipX* other than 0 mirrors it left to right, *flipY*
other than 0 mirrors it top to bottom, and 0 shows it the normal way. Its
other settings stay as they are.

| Argument | Range | Meaning |
| --- | --- | --- |
| *index* | 0-255 | The sprite. |
| *flipX* | 0-255 | 0 normal, other values mirrored left to right. |
| *flipY* | 0-255 | 0 normal, other values mirrored top to bottom. |

```basic
10 SPRITE 0,82,148,96,1,0: SPRITE 1,82,164,96,1,0: SPRON
20 SPRFLIP 1,1,0
```

shows an `R` and its mirror image.

See also: [SPRITE](#sprite), [SPRPRI](#sprpri).

## SPRITE

**Statement** · `SPRITE index,tile,x,y,palette,flags`

Sets up one sprite completely: the tile it shows, its position, its palette
bank and its flags. A sprite is one 8 by 8 tile from the sprite bank, and
higher-numbered sprites are drawn in front of lower ones.

| Argument | Range | Meaning |
| --- | --- | --- |
| *index* | 0-255 | The sprite. |
| *tile* | 0-255 | The tile in the bank chosen by `SPRBANK`. |
| *x* | -512 to 511 | The left edge, in pixels. 0-319 is on the screen. |
| *y* | -256 to 255 | The top edge, in pixels. 0-199 is on the screen. |
| *palette* | 0-15 | The palette bank. |
| *flags* | 0-255 | The sum of the flags below. |

| Flag | Meaning |
| ---: | --- |
| 1 | Hidden. |
| 2 | Priority: behind background pixels that are not color 0. |
| 4 | Flip X. |
| 8 | Flip Y. |

Bits 4-7 of *flags* are ignored. The sprite layer must be turned on with
`SPRON` before any sprite shows.

```basic
10 SPRITE 0,42,0,96,2,0: SPRCOUNT 0: SPRON
20 FOR X=0 TO 312 STEP 2: SPRX 0,X: DELAY 10: NEXT
30 SPROFF
```

moves a red `*` across the middle of the screen.

See also: [SPRX](#sprx), [SPRY](#spry), [SPRTILE](#sprtile),
[SPRBANK](#sprbank), [OAMREAD](o.md#oamread), [Graphics](../basic/graphics.md).

## SPROFF

**Statement** · `SPROFF`

Turns the whole sprite layer off. The sprites keep their settings and come
back with `SPRON`.

```basic
SPROFF
```

See also: [SPRON](#spron), [BGOFF](b.md#bgoff), [VIDOFF](v.md#vidoff).

## SPRON

**Statement** · `SPRON`

Turns the whole sprite layer on. It is off at power-on. A single sprite is
hidden with flag 1 of `SPRITE`.

```basic
10 SPRITE 0,1,156,96,1,0: SPRCOUNT 0
20 SPRON
```

See also: [SPROFF](#sproff), [SPRITE](#sprite), [BGON](b.md#bgon).

## SPRPRI

**Statement** · `SPRPRI index,priority`

Sets or clears the priority flag of one sprite. With priority set, the
sprite goes behind the background pixels that are not color 0. Its palette
and flips stay as they are.

| Argument | Range | Meaning |
| --- | --- | --- |
| *index* | 0-255 | The sprite. |
| *priority* | 0-255 | 0 in front of the background, other values behind it. |

```basic
10 MFILL $C200,1000,160: BGON
20 SPRITE 0,42,156,96,2,0: SPRON
30 SPRPRI 0,1
```

puts a sprite behind a background of solid tiles.

See also: [SPRITE](#sprite), [SPRFLIP](#sprflip), [Graphics](../basic/graphics.md).

## SPRTILE

**Statement** · `SPRTILE index,tile`

Changes the tile one sprite shows. Changing it in turn is how a sprite is
animated.

| Argument | Range | Meaning |
| --- | --- | --- |
| *index* | 0-255 | The sprite. |
| *tile* | 0-255 | The tile in the sprite bank. |

```basic
10 SPRITE 0,48,156,96,1,0: SPRON
20 FOR T=48 TO 57: SPRTILE 0,T: DELAY 300: NEXT
```

counts from 0 to 9 with one sprite.

See also: [SPRITE](#sprite), [SPRBANK](#sprbank).

## SPRX

**Statement** · `SPRX index,x`

Changes the X position of one sprite.

| Argument | Range | Meaning |
| --- | --- | --- |
| *index* | 0-255 | The sprite. |
| *x* | -512 to 511 | The left edge, in pixels. 0-319 is on the screen. |

```basic
10 SPRITE 0,62,-8,96,1,0: SPRON
20 FOR X=-8 TO 320 STEP 4: SPRX 0,X: NEXT
```

See also: [SPRY](#spry), [SPRITE](#sprite).

## SPRY

**Statement** · `SPRY index,y`

Changes the Y position of one sprite.

| Argument | Range | Meaning |
| --- | --- | --- |
| *index* | 0-255 | The sprite. |
| *y* | -256 to 255 | The top edge, in pixels. 0-199 is on the screen. |

```basic
10 SPRITE 0,86,156,-8,1,0: SPRON
20 FOR Y=-8 TO 200 STEP 2: SPRY 0,Y: NEXT
```

See also: [SPRX](#sprx), [SPRITE](#sprite).

## SQR

**Function** · `SQR(number)`

Returns the square root of *number*. It is worked out as `number^0.5`, so
it is not always exact in the last digit.

| Argument | Range | Meaning |
| --- | --- | --- |
| *number* | 0 and up | A negative number gives `?ILLEGAL QUANTITY ERROR`. |

```basic
PRINT SQR(16);SQR(2)
```

```text
 4  1.41421356
```

See also: [^](operators.md#-power), [ABS](a.md#abs).

## STEP

**Keyword** · `FOR variable=start TO end STEP step`

Gives the amount `NEXT` adds to the loop variable of a `FOR` loop. Without
`STEP` it is 1. A negative step counts down.

```basic
FOR I=10 TO 1 STEP -3: PRINT I;: NEXT
```

```text
 10  7  4  1
```

See also: [FOR](f.md#for), [NEXT](n.md#next), [TO](t.md#to).

## STOP

**Statement** · `STOP`

Stops the program with `BREAK IN` and the line number, as Ctrl-C does, and
stops background music. `CONT` carries on from the next statement.

```basic
10 PRINT "ONE"
20 STOP
30 PRINT "TWO"
```

```text
ONE

BREAK IN  20
READY.
```

Typing `CONT` then prints `TWO`.

See also: [CONT](c.md#cont), [END](e.md#end), [Rules](../basic/rules.md).

## STR$

**Function** · `STR$(number)`

Returns *number* as text, the same text `PRINT` shows: a leading space for
a positive number or zero, or a minus sign, but no trailing space. Up to nine
digits are kept, and very large or very small numbers use E notation.

```basic
PRINT "["STR$(42)"]["STR$(-1.5)"]["STR$(1E10)"]"
```

```text
[ 42][-1.5][ 1E+10]
```

`MID$(STR$(N),2)` drops the leading space of a positive number.

See also: [VAL](v.md#val), [MID$](m.md#mid), [CHR$](c.md#chr).

## STYLE

**Statement** · `STYLE mask`

Chooses which parts of their own style styled strings give up when they are
printed. A set bit makes them take that part from the BASIC pen, set by
`COLOR` and `ALT`, instead.

| Argument | Range | Meaning |
| --- | --- | --- |
| *mask* | 0-15 | The sum of the bits below. 0 keeps every string's own style. 16 and up give `?ILLEGAL QUANTITY ERROR`. |

| Bit | Value | Taken from the BASIC pen |
| --- | ---: | --- |
| 0 | 1 | Color. |
| 1 | 2 | Flip X. |
| 2 | 4 | Flip Y. |
| 3 | 8 | ALT (reverse). |

```basic
10 STYLE 1: COLOR 3
20 PRINT "THIS LINE IS YELLOW"
30 STYLE 0: COLOR 0
```

prints the string in yellow whatever color it was typed in.

See also: [COLOR](c.md#color), [ALT](a.md#alt),
[Styled strings](../basic/styled-strings.md).

## SYS

**Statement** · `SYS address`

Calls a machine-code routine at *address* with `JSR`. When the routine ends
with `RTS`, the program goes on with the next statement.

| Argument | Range | Meaning |
| --- | --- | --- |
| *address* | 0-65535 | The routine's first byte, in the 6502's memory. |

A routine at `$8000-$BFFF` runs with the bank chosen by `BANK`, and bank 0
is mapped again when it returns.

```basic
10 FOR I=0 TO 5: READ B: POKE 640+I,B: NEXT
20 DATA 169,65,32,6,4,96
30 SYS 640: SYS 640: PRINT
40 PRINT "BACK IN BASIC"
```

```text
AA
BACK IN BASIC
```

The six bytes are `LDA #65`, `JSR $0406` (the kernel's routine that prints
a character) and `RTS`, put at 640 (`$0280`), where nothing else in the
system writes.

See also: [USR](u.md#usr), [BANK](b.md#bank), [BLOAD](b.md#bload),
[Mixing BASIC and machine code](../ml/mixing.md).
