# P

## PADAXIS

**Function** · `PADAXIS(pad, axis)`

Returns the position of one analog stick axis of a gamepad, from -128 to 127,
as it was at the last `PADREAD` of that gamepad. 0 is the middle. Negative
values are left or up, positive values right or down.

| Argument | Range | Meaning |
| --- | --- | --- |
| *pad* | 0-3 | The gamepad, as sampled by the last `PADREAD`. |
| *axis* | 0-3 | 0 left stick X, 1 left stick Y, 2 right stick X, 3 right stick Y. |

```basic
PADREAD 0
PRINT PADAXIS(0,0);PADAXIS(0,1)
```

```text
 0  0
```

shows the middle position, which is also what a gamepad that is not connected
reads. With a gamepad, this moves a sprite with the left stick:

<!-- example: skip -->
```basic
10 SPRITE 0,42,156,96,0,0: SPRON: SPRCOUNT 0
20 X=156: Y=96
30 PADREAD 0
40 X=X+PADAXIS(0,0)/32: Y=Y+PADAXIS(0,1)/32
50 SPRX 0,X: SPRY 0,Y: GOTO 30
```

See also: [PADREAD](#padread), [PADSTICK](#padstick), [PADTRIG](#padtrig),
[Input](../basic/input.md).

## PADBTN

**Function** · `PADBTN(pad, button)`

Returns 1 if a button of a gamepad was pressed at the last `PADREAD` of that
gamepad, else 0.

| Argument | Range | Meaning |
| --- | --- | --- |
| *pad* | 0-3 | The gamepad, as sampled by the last `PADREAD`. |
| *button* | 0-15 | The button (below). |

| Number | Button | Number | Button |
| ---: | --- | ---: | --- |
| 0 | A / Cross | 8 | L2 |
| 1 | B / Circle | 9 | R2 |
| 2 | C / right paddle | 10 | Select / Back |
| 3 | X / Square | 11 | Start / Menu |
| 4 | Y / Triangle | 12 | Home |
| 5 | Z / left paddle | 13 | L3 (left stick press) |
| 6 | L1 | 14 | R3 (right stick press) |
| 7 | R1 | 15 | Not used. |

```basic
PADREAD 0: PRINT PADBTN(0,0)
```

```text
 0
```

A gamepad that is not connected reads no buttons pressed. With a gamepad,
this waits for Start:

<!-- example: skip -->
```basic
10 PRINT "PRESS START"
20 PADREAD 0: IF PADBTN(0,11)=0 THEN 20
30 PRINT "GO!"
```

See also: [PADREAD](#padread), [PADDIR](#paddir), [Input](../basic/input.md).

## PADDIR

**Function** · `PADDIR(pad)`

Returns the directions pressed on a gamepad's D-pad at the last `PADREAD` of
that gamepad, as a sum: up 1, down 2, left 4, right 8. Up and right together
give 9. Test one direction with `AND`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *pad* | 0-3 | The gamepad, as sampled by the last `PADREAD`. |

```basic
PADREAD 0: PRINT PADDIR(0)
```

```text
 0
```

With a gamepad, this prints the directions held:

<!-- example: skip -->
```basic
10 PADREAD 0: D=PADDIR(0)
20 IF D AND 1 THEN PRINT "UP"
30 IF D AND 2 THEN PRINT "DOWN"
40 IF D AND 4 THEN PRINT "LEFT"
50 IF D AND 8 THEN PRINT "RIGHT"
60 GOTO 10
```

See also: [PADREAD](#padread), [PADSTICK](#padstick), [AND](operators.md#and),
[Input](../basic/input.md).

## PADON

**Function** · `PADON(pad)`

Returns 1 if the gamepad was connected at the last `PADREAD` of it, else 0.
The other `PAD` functions read 0 for a gamepad that is not connected.

| Argument | Range | Meaning |
| --- | --- | --- |
| *pad* | 0-3 | The gamepad, as sampled by the last `PADREAD`. |

```basic
10 PADREAD 0
20 IF PADON(0)=0 THEN PRINT "NO GAMEPAD"
```

```text
NO GAMEPAD
```

See also: [PADREAD](#padread), [INPUTDEV](i.md#inputdev),
[Input](../basic/input.md).

## PADREAD

**Statement** · `PADREAD pad`

Takes a snapshot of a gamepad. The functions `PADON`, `PADDIR`, `PADSTICK`,
`PADBTN`, `PADAXIS` and `PADTRIG` read this snapshot, not the gamepad
itself, so all the values a program reads after one `PADREAD` come from the
same moment. Use `PADREAD` once each time round a game loop, before the `PAD`
functions.

| Argument | Range | Meaning |
| --- | --- | --- |
| *pad* | 0-3 | The gamepad. |

```basic
PADREAD 0: PRINT PADON(0)
```

```text
 0
```

See also: [PADON](#padon), [PADDIR](#paddir), [PADBTN](#padbtn),
[Input](../basic/input.md).

## PADSTICK

**Function** · `PADSTICK(pad)`

Returns the two analog sticks of a gamepad, at its last `PADREAD`, as
directions, the way `PADDIR` returns the D-pad. The left stick is in bits
0-3: up 1, down 2, left 4, right 8. The right stick is in bits 4-7: up 16,
down 32, left 64, right 128.

| Argument | Range | Meaning |
| --- | --- | --- |
| *pad* | 0-3 | The gamepad, as sampled by the last `PADREAD`. |

```basic
PADREAD 0: PRINT PADSTICK(0)
```

```text
 0
```

`PADSTICK(0) AND 15` gives the left stick alone, and `INT(PADSTICK(0)/16)`
the right stick.

See also: [PADAXIS](#padaxis), [PADDIR](#paddir), [PADREAD](#padread),
[Input](../basic/input.md).

## PADTRIG

**Function** · `PADTRIG(pad, trigger)`

Returns how far an analog trigger of a gamepad was pressed at its last
`PADREAD`, from 0 (released) to 255 (fully pressed).

| Argument | Range | Meaning |
| --- | --- | --- |
| *pad* | 0-3 | The gamepad, as sampled by the last `PADREAD`. |
| *trigger* | 0-1 | 0 left, 1 right. |

```basic
PADREAD 0
PRINT PADTRIG(0,0);PADTRIG(0,1)
```

```text
 0  0
```

See also: [PADAXIS](#padaxis), [PADBTN](#padbtn), [PADREAD](#padread),
[Input](../basic/input.md).

## PALETTE

**Statement** · `PALETTE bank,index,red,green,blue`

Sets one color of a palette bank. There are 16 banks of eight colors. A color
is given as red, green and blue in MIA's 16-bit RGB565 format: red and blue
0-31, green 0-63.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-15 | The palette bank. |
| *index* | 0-7 | The color within the bank. |
| *red* | 0-31 | Red. |
| *green* | 0-63 | Green. |
| *blue* | 0-31 | Blue. |

The text screen uses color 1 of each bank as its ink, so changing color 1 of
bank *n* changes what `COLOR n` looks like, also for text already on the
screen. Color *c* of bank *p* is stored at MIA address `$100 + p*16 + c*2`,
low byte first.

```basic
PALETTE 1,1,31,63,0
PRINT MPEEK($112);MPEEK($113)
```

```text
 224  255
```

makes the ink of palette 1 yellow. The power-on colors are listed in
[Appendix E](../appendix/charset-keys.md).

See also: [PALREAD](#palread), [PALLOAD](#palload), [COLOR](c.md#color),
[Graphics](../basic/graphics.md).

## PALLOAD

**Statement** · `PALLOAD path,bank[,offset]`

Loads a whole file of colors into palette memory, starting *offset* bytes into
palette bank *bank*. Each color is two bytes, RGB565 with the low byte first,
so a bank is 16 bytes. A file longer than the rest of the bank continues into
the next banks: a 256-byte file starting at bank 0 sets all 16 banks.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. |
| *bank* | 0-15 | The palette bank. |
| *offset* | 0-15 | The first byte within the bank; 0 if left out. Color *c* starts at byte *c*\*2. |

<!-- example: files=SKY.PAL:1f00e007 -->
```basic
10 PALLOAD "SKY.PAL",2,2
20 PRINT MPEEK($122);MPEEK($124)
```

```text
 31  224
```

sets color 1 of bank 2 to blue and color 2 to green.

See also: [PALSAVE](#palsave), [PALREAD](#palread), [PALETTE](#palette),
[Graphics](../basic/graphics.md).

## PALREAD

**Statement** · `PALREAD bank,offset,count`

Copies *count* bytes from `DATA` statements into palette memory, starting
*offset* bytes into palette bank *bank*. Each color takes two values, the low
byte of its RGB565 value first. It reads from where the last `READ` left off,
as `READ` does.

| Argument | Range | Meaning |
| --- | --- | --- |
| *bank* | 0-15 | The palette bank. |
| *offset* | 0-15 | The first byte within the bank. |
| *count* | 0-255 | The bytes to copy. Not checked against the bank's end. |

Running out of `DATA` gives `?OUT OF DATA ERROR`. `PALREAD` uses the variable
`Z9` while it works and puts its value back.

```basic
10 PALREAD 2,2,2
20 DATA 0,248
30 COLOR 2: PRINT "RED": COLOR 0
40 PRINT MPEEK($122);MPEEK($123)
```

```text
RED
 0  248
```

makes the ink of palette 2 pure red: red 31 is `$F800`, bytes 0 and 248.

See also: [PALETTE](#palette), [PALLOAD](#palload), [NTREAD](n.md#ntread),
[RESTORE](r.md#restore).

## PALSAVE

**Statement** · `PALSAVE path,bank[,offset[,count]]`

Saves *count* bytes of palette memory, starting *offset* bytes into palette
bank *bank*, to a file. Without *count* it saves to the end of the bank;
without *offset* it starts at the bank's first byte. A *count* past the end
of the bank goes on into the next banks.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file, created or replaced. |
| *bank* | 0-15 | The palette bank. |
| *offset* | 0-15 | The first byte within the bank. |
| *count* | 0-65535 | The bytes to save. |

```basic
10 PALSAVE "ONE.PAL",3
20 FSTAT "ONE.PAL",S,A,D,T: PRINT S
30 PALSAVE "ALL.PAL",0,0,256
40 FSTAT "ALL.PAL",S,A,D,T: PRINT S
```

```text
 16
 256
```

saves palette bank 3, then all 16 banks. `PALLOAD "ALL.PAL",0` brings them all
back.

See also: [PALLOAD](#palload), [FSTAT](f.md#fstat).

## PAN

**Statement** · `PAN voice,position`

Places a sound voice in the stereo picture, from -64 (hard left) through 0
(center) to 63 (hard right). At power-on, and after `SNDCLR`, every voice is
centered. The change applies at once, also to a note that is sounding.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |
| *position* | -64 to 63 | -64 hard left, 0 center, 63 hard right. |

```basic
10 SNDON: WAVE 0,2: ADSR 0,0,8,12,6
20 FOR P=-64 TO 63 STEP 8
30 PAN 0,P: NOTE 0,48: DELAY 100
40 NEXT: GATE 0,0
```

plays a note that walks from the left speaker to the right.

See also: [VOL](v.md#vol), [NOTE](n.md#note), [Sound](../basic/sound.md).

## PEEK

**Function** · `PEEK(address)`

Returns the byte, 0-255, at an address in the 6502's memory. Addresses
`$8000-$BFFF` read the extended RAM bank chosen by `BANK`. To read MIA's
memory, use `MPEEK`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *address* | 0-65535 | The CPU address. |

```basic
10 POKE 640,200: PRINT PEEK(640)
20 PRINT "ABC";PEEK(768)
```

```text
 200
ABC 3
```

Address 768 (`$0300`) holds the column of the text cursor, 3 after `ABC`.

See also: [POKE](#poke), [BANK](b.md#bank), [MPEEK](m.md#mpeek),
[Mixing BASIC and machine language](../ml/mixing.md).

## PLAYING

**Function** · `PLAYING(voice)`

Returns 1 while a voice's background music track, set with `TRACK` and
started with `BAND`, is running, else 0. A track without a loop point stops
by itself after its last note, and `PLAYING` then returns 0.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |

<!-- example: norun -->
```basic
10 SNDON: WAVE 0,1: ADSR 0,0,8,12,6
20 TRACK 0,"T200 L8 C D E F G"
30 BAND 1
40 IF PLAYING(0) THEN 40
50 PRINT "THE TUNE HAS ENDED"
```

plays a short tune and waits for it to end before going on.

See also: [TRACK](t.md#track), [BAND](b.md#band), [CUE](c.md#cue),
[Sound](../basic/sound.md).

## POKE

**Statement** · `POKE address,value`

Writes a byte into the 6502's memory. Addresses `$8000-$BFFF` write the
extended RAM bank chosen by `BANK`. Addresses from `$C000` up reach the VIA
and MIA's registers. To write MIA's memory, use `MPOKE`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *address* | 0-65535 | The CPU address. |
| *value* | 0-255 | The byte. |

`POKE` does not check what it writes over. A wrong address can wreck the
program in memory or BASIC itself. The bytes `$0280-$02F7` (640-759) are
free for programs; the rules for the rest are in
[Mixing BASIC and machine language](../ml/mixing.md).

```basic
10 BANK 5: POKE 32768,77
20 BANK 0: PRINT PEEK(32768)<>77
30 BANK 5: PRINT PEEK(32768): BANK 0
```

```text
-1
 77
```

stores a byte in bank 5. With bank 0 chosen, the same address holds
something else.

See also: [PEEK](#peek), [BANK](b.md#bank), [MPOKE](m.md#mpoke),
[SYS](s.md#sys).

## POS

**Function** · `POS(value)`

Returns the column BASIC is printing at, 0-255: the number of characters
printed since the last new line. A new line, `CLS` and `CRSR` set it to 0.
The value in the parentheses is not used; `POS(0)` is usual.

| Argument | Range | Meaning |
| --- | --- | --- |
| *value* | | Any number or string; ignored. |

```basic
PRINT "ABC";POS(0)
```

```text
ABC 3
```

See also: [TAB](t.md#tab), [SPC](s.md#spc), [CRSR](c.md#crsr),
[Text and the screen](../basic/text.md).

## PRINT

**Statement** · `PRINT [expression][,|;expression...]`

Prints numbers and strings on the screen at the cursor. Between the values,
a semicolon prints nothing and a comma moves on to the next print zone. The
zones are 14 columns wide and start at columns 0, 14 and 28. After the last
value, `PRINT` starts a new line, unless the statement ends with `;` or `,`.
`PRINT` alone prints an empty line. `?` is short for `PRINT`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *expression* | | A number or string to print. |

Numbers are printed with a space or a minus sign before them and a space
after them. Numbers and plain text use the BASIC pen set by `COLOR`; strings
typed in color keep their own colors (see
[Styled strings](../basic/styled-strings.md)). `TAB(n)` and `SPC(n)` can be
used inside `PRINT` to move along the line.

```basic
10 PRINT "A";"B","C"
20 PRINT 1;-2;3
30 PRINT "NO NEW LINE";
40 ? " - SAME LINE"
```

```text
AB            C
 1 -2  3
NO NEW LINE - SAME LINE
```

See also: [TAB](t.md#tab), [SPC](s.md#spc), [POS](#pos), [STR$](s.md#str),
[COLOR](c.md#color), [Text and the screen](../basic/text.md).

## PULSE

**Statement** · `PULSE voice,width`

Sets the pulse width of a sound voice: how much of each wave cycle is high.
128 gives a square wave; values toward 0 or 255 give a thinner, more nasal
sound. Only the pulse waveform, `WAVE voice,1`, uses it. At power-on, and
after `SNDCLR`, every voice has width 128.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |
| *width* | 0-255 | The width; 128 is square. |

```basic
10 SNDON: WAVE 0,1: ADSR 0,0,8,12,6
20 NOTE 0,36
30 FOR W=128 TO 8 STEP -8: PULSE 0,W: DELAY 50: NEXT
40 GATE 0,0
```

plays one low note whose sound thins out as the width shrinks.

See also: [WAVE](w.md#wave), [NOTE](n.md#note), [Sound](../basic/sound.md).
