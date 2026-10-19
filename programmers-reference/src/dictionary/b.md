# B

## BAND

**Statement** · `BAND enabled | voice,enabled`

Starts or stops the background music that `TRACK` gives the voices. With one
number it acts on all four voices; with two, the first is the voice.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. Left out, all four. |
| *enabled* | 0-255 | 0 stops the track and silences the voice; any other value starts it. |

`BAND 1` starts every voice that has a track. A track starts from its top the
first time; a voice stopped with `BAND 0` or `BAND v,0` resumes where it
stopped. Ending the program with `END`, `STOP`, Ctrl-C or an error also stops
the music.

<!-- example: cycles=8000000 -->
```basic
10 SNDON: WAVE 0,1: ADSR 0,0,8,12,6
20 TRACK 0,"T120 L8 O4 C D E F | G A G F"
30 BAND 1: PRINT PLAYING(0)
40 DELAY 2000
50 BAND 0: PRINT PLAYING(0)
```

```text
 1
 0
```

See also: [TRACK](t.md#track), [PLAYING](p.md#playing), [CUE](c.md#cue),
[VTAKE](v.md#vtake), [Sound](../basic/sound.md).

## BANK

**Statement** · `BANK bank`

Picks which of the 32 banks of extended RAM `PEEK`, `POKE`, `SYS`, `BLOAD`,
`BSAVE` and `BRUN` use at addresses `$8000-$BFFF`. Each of them maps the bank
in only while it works there and then maps bank 0 back, because BASIC keeps
its strings in bank 0.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-31 | The bank. 0 at power-on and after a warm start. |

```basic
10 BANK 3: POKE 32768,42
20 BANK 4: POKE 32768,7
30 BANK 3: PRINT PEEK(32768)
40 BANK 4: PRINT PEEK(32768)
50 BANK 0
```

```text
 42
 7
```

Set `BANK 0` again before using `PEEK` and `POKE` on BASIC's own memory.

See also: [PEEK](p.md#peek), [POKE](p.md#poke), [BLOAD](#bload),
[Extended RAM and banking](../ml/banking.md).

## BCOLOR

**Statement** · `BCOLOR bank`

Sets the screen backdrop, the color behind everything, to the ink color of a
palette bank: the same color `COLOR` gives text.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-15 | The palette bank. 6, the default, is blue. |

```basic
10 BCOLOR 9: COLOR 3
20 PRINT "YELLOW ON BLACK"
30 DELAY 2000
40 BCOLOR 6: COLOR 0
```

See also: [COLOR](c.md#color), [PALETTE](p.md#palette),
[Text and the screen](../basic/text.md).

## BGALT

**Statement** · `BGALT bank`

Selects the CHR bank the background takes its tiles from in cells whose
attribute has the ALT bit (bit 7, value 128) set. Other cells use the bank
`BGBANK` selects.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-7 | The CHR bank. |

```basic
10 BGBANK 0: BGALT 1
20 BGCHAR 10,5,65,0: BGCHAR 11,5,65,128
30 BGON
```

shows an `A` from bank 0 and, next to it, the reversed `A` of bank 1.

See also: [BGBANK](#bgbank), [BGCHAR](#bgchar), [Graphics](../basic/graphics.md).

## BGBANK

**Statement** · `BGBANK bank`

Selects the CHR bank the background layer draws its tiles from. It is bank 0,
the character set, at power-on.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-7 | The CHR bank. |

<!-- example: files=GAME.CHR:ff818181818181ff -->
```basic
10 CHRLOAD "GAME.CHR",2
20 BGBANK 2: BGON
```

See also: [BGALT](#bgalt), [CHRLOAD](c.md#chrload), [SPRBANK](s.md#sprbank),
[Graphics](../basic/graphics.md).

## BGCHAR

**Statement** · `BGCHAR column,row,tile,attribute`

Writes one cell of the background: its tile and its attribute. *column* and
*row* are positions on the whole map of the current `BGMODE`, and `BGCHAR`
finds the table that holds the cell, in the table set `BGSET` selects.

| Argument | Range | Meaning |
| --- | --- | --- |
| *column* | 0-159 | The column; must be less than the map's width: 40 in modes 0, 2 and 4, 80 in modes 1 and 5, 160 in mode 3. |
| *row* | 0-99 | The row; must be less than the map's height: 25 in modes 0, 1 and 3, 50 in modes 2 and 5, 100 in mode 4. |
| *tile* | 0-255 | The tile. |
| *attribute* | 0-255 | Palette (bits 0-3), flip X (16), flip Y (32), priority (64) and ALT (128), added. |

A column or row outside the current map gives `?ILLEGAL QUANTITY ERROR`;
`BGCHAR` does not wrap around.

```basic
10 BGMODE 1
20 BGCHAR 45,0,72,3
30 PRINT MPEEK($C200+1000+5);MPEEK($E140+1000+5)
```

```text
 72  3
```

In mode 1 the map is 80 columns wide, so column 45 is column 5 of table 1.

See also: [BGMODE](#bgmode), [BGSET](#bgset), [SCROLL](s.md#scroll),
[NTREAD](n.md#ntread), [Graphics](../basic/graphics.md).

## BGET#

**Statement** · `BGET# handle,variable`

Reads one byte, 0-255, from an open file into a numeric variable, and moves
the file's position on by one. Write the `#` straight after `BGET`, with no
space: `BGET #1,A` gives `?SYNTAX ERROR`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *handle* | 1-16 | The file number given to `OPEN`. |
| *variable* | | A numeric variable or array element. |

Reading past the end of the file gives 0 and no error, and makes `EOF` return
1. Test `EOF` before each read.

<!-- example: files=ABC.DAT:414243 -->
```basic
10 OPEN "ABC.DAT" FOR INPUT AS #1
20 IF EOF(1) THEN 50
30 BGET#1,C: PRINT C;
40 GOTO 20
50 CLOSE #1
```

```text
 65  66  67
```

See also: [BPUT#](#bput), [EOF](e.md#eof), [OPEN](o.md#open),
[SEEK#](s.md#seek), [Files and the SD card](../basic/files.md).

## BGMODE

**Statement** · `BGMODE mode`

Selects how the eight 40 by 25 background tables join into one map. The
screen is a 320 by 200 pixel window onto the map, which `SCROLL` moves.

| Argument | Range | Meaning |
| --- | --- | --- |
| *mode* | 0-5 | The map's size in cells, below. |

| Mode | Map | Tables, from set 0 |
| ---: | --- | --- |
| 0 | 40×25 | 0 |
| 1 | 80×25 | 0 1 |
| 2 | 40×50 | 0 above 2 |
| 3 | 160×25 | 0 1 2 3 |
| 4 | 40×100 | 0, 1, 2, 3 from top to bottom |
| 5 | 80×50 | 0 1 above 2 3 |

```basic
10 BGMODE 3: BGBANK 0
20 MFILL $C200,4000,46: MFILL $E140,4000,5
30 FOR I=0 TO 3: BGCHAR I*40,12,49+I,3: NEXT
40 BGON: OVLOFF
50 FOR X=0 TO 1272 STEP 8: SCROLL X,0: NEXT
60 OVLON: BGOFF
```

scrolls across a map four screens wide, marked 1 to 4.

See also: [BGSET](#bgset), [BGCHAR](#bgchar), [SCROLL](s.md#scroll),
[Graphics](../basic/graphics.md).

## BGOFF

**Statement** · `BGOFF`

Hides the background layer. Its tables are kept, so `BGON` shows it again as
it was. The background is off at power-on.

```basic
BGOFF
```

See also: [BGON](#bgon), [SPROFF](s.md#sproff), [OVLOFF](o.md#ovloff),
[Graphics](../basic/graphics.md).

## BGON

**Statement** · `BGON`

Shows the background layer, between the backdrop and the sprites.

```basic
10 MFILL $C200,1000,42: MFILL $E140,1000,4
20 BGMODE 0: BGSET 0: BGBANK 0: SCROLL 0,0
30 BGON: DELAY 2000: BGOFF
```

fills table 0 with green `*` tiles and shows them for two seconds.

See also: [BGOFF](#bgoff), [BGMODE](#bgmode), [SPRON](s.md#spron),
[Graphics](../basic/graphics.md).

## BGSET

**Statement** · `BGSET set`

Selects which set of tables the background is drawn from: set 0 is tables
0-3, set 1 tables 4-7, arranged the same way by `BGMODE`. A program can
build the next screen in the hidden set and then switch to it in one step.
`BGCHAR` writes into the set selected here.

| Argument | Range | Meaning |
| --- | --- | --- |
| *set* | 0-1 | 0 for tables 0-3, 1 for tables 4-7. |

<!-- example: cycles=8000000 -->
```basic
10 BGMODE 0: BGBANK 0
20 MFILL $C200,1000,65: MFILL $C200+4000,1000,66
30 BGON
40 FOR I=1 TO 6: BGSET I AND 1: DELAY 500: NEXT
50 BGSET 0: BGOFF
```

switches between a screen of `A` and a screen of `B`.

See also: [BGMODE](#bgmode), [BGCHAR](#bgchar), [Graphics](../basic/graphics.md).

## BLOAD

**Statement** · `BLOAD path[,address]`

Loads a PRG file into the 6502's memory and returns to BASIC. A PRG file
starts with two bytes of load address, low byte first, then the data. Without
*address*, or with 0, the data goes to the address in the file; with it, to
*address* instead.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. |
| *address* | 0-49151 | Where to load; 0 or left out uses the file's own address. |

Bytes from `$8000` up go to the bank `BANK` selects, and a file that runs
past `$BFFF` continues into the next bank. `BLOAD` does not check what it
overwrites: a file loaded over BASIC wrecks the program in memory or BASIC
itself. A file whose own address is `$C000` or above gives
`?FILE I/O ERROR`.

```basic
10 FOR I=0 TO 7: POKE 640+I,I*3: NEXT
20 BSAVE "T.PRG",640,8
30 BLOAD "T.PRG",648
40 PRINT PEEK(648+7)
```

```text
 21
```

loads a copy of the eight bytes right after the original.

See also: [BSAVE](#bsave), [BRUN](#brun), [BANK](#bank), [SYS](s.md#sys),
[Mixing BASIC and machine language](../ml/mixing.md).

## BPUT#

**Statement** · `BPUT# handle,value`

Writes one byte to an open file at its current position. Write the `#`
straight after `BPUT`, with no space.

| Argument | Range | Meaning |
| --- | --- | --- |
| *handle* | 1-16 | The file number given to `OPEN`. |
| *value* | 0-255 | The byte. Outside this range: `?ILLEGAL QUANTITY ERROR`. |

```basic
10 OPEN "SQUARES.DAT" FOR OUTPUT AS #1
20 FOR I=1 TO 10: BPUT#1,I*I: NEXT
30 PRINT FSIZE(1)
40 CLOSE #1
```

```text
 10
```

See also: [BGET#](#bget), [CLOSE](c.md#close), [OPEN](o.md#open),
[Files and the SD card](../basic/files.md).

## BRUN

**Statement** · `BRUN path[,run]`

Loads a PRG file at the address in its header, like `BLOAD`, then jumps to
it. It jumps to *run*, or to the first byte loaded when *run* is 0 or left
out. BASIC does not come back: the machine code may use any memory, even
BASIC's own. To return to the `READY.` prompt it jumps to the kernel's warm
start, `$0403`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. Bytes from `$8000` up go to the bank `BANK` selects. |
| *run* | 0-65535 | The address to jump to. |

The file below holds machine code for `$0280` that prints `HI` with the
kernel's `CHROUT` (`$0406`) and jumps to the warm start:

<!-- example: files=HI.PRG:8002a948200604a9492006044c0304 -->
```basic
BRUN "HI.PRG"
```

```text
HI
READY.
```

See also: [BLOAD](#bload), [SYS](s.md#sys), [BANK](#bank),
[Mixing BASIC and machine language](../ml/mixing.md).

## BSAVE

**Statement** · `BSAVE path,address,length`

Saves *length* bytes of the 6502's memory, from *address* on, to a file in
the PRG format `BLOAD` reads: two bytes of address, low byte first, then the
data. An existing file is replaced.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. |
| *address* | 0-49151 | The first byte. From `$8000` up, it is in the bank `BANK` selects. |
| *length* | 0-65535 | The bytes to save. A save past `$BFFF` continues at `$8000` of the next bank. |

```basic
10 FOR I=0 TO 15: POKE 640+I,I*2: NEXT
20 BSAVE "TABLE.PRG",640,16
30 FSTAT "TABLE.PRG",S,A,D,T
40 PRINT S
```

```text
 18
```

The file is two bytes longer than the data because of its header.

See also: [BLOAD](#bload), [BANK](#bank), [Files and the SD card](../basic/files.md).
