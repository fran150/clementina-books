# V

## VAL

**Function** · `VAL(string)`

Returns the number written at the start of *string*. Spaces are skipped,
and reading stops at the first character that cannot be part of a number. A
string that does not start with a number gives 0. `VAL` reads decimal only:
`VAL("$FF")` is 0.

```basic
PRINT VAL("12AB");VAL(" 3.5E2");VAL("-7");VAL("X")
```

```text
 12  350 -7  0
```

See also: [STR$](s.md#str), [ASC](a.md#asc), [Variables](../basic/variables.md).

## VGIVE

**Statement** · `VGIVE voice`

Gives a voice taken with `VTAKE` back to its background track. The track
does not go on from where it was paused: it catches up to where it would be
had it kept playing, so the voice stays in time with the others.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |

```basic
10 SNDON: WAVE 1,3: ADSR 1,0,6,10,6
20 TRACK 1,"T120 L4 O2 C G | C G C G": BAND 1
30 DELAY 1000: VTAKE 1
40 WAVE 1,4: ADSR 1,0,2,0,3: NOTE 1,24: DELAY 300
50 VGIVE 1: WAVE 1,3: ADSR 1,0,6,10,6
60 DELAY 2000
```

plays a bass line, takes its voice for a noise burst, and gives it back.

See also: [VTAKE](#vtake), [TRACK](t.md#track), [BAND](b.md#band),
[Sound](../basic/sound.md).

## VIDOFF

**Statement** · `VIDOFF`

Turns the whole picture off: the backdrop, background, sprites and text
all disappear. Everything keeps its settings, and `VIDON` shows it again.
A program can build a screen while the picture is off and show it at once.

```basic
10 VIDOFF
20 CLS: PRINT "READY WHEN YOU ARE"
30 VIDON
```

See also: [VIDON](#vidon), [OVLOFF](o.md#ovloff), [Graphics](../basic/graphics.md).

## VIDON

**Statement** · `VIDON`

Turns the whole picture on again after `VIDOFF`. Each layer still shows only
when its own switch is on (`BGON`, `SPRON`, `OVLON`).

```basic
VIDON
```

See also: [VIDOFF](#vidoff), [BGON](b.md#bgon), [SPRON](s.md#spron).

## VOL

**Statement** · `VOL level | voice,level`

With one number, sets the master volume of all four voices. With two, sets
the volume trim of one voice, which scales that voice before it is mixed
with the others.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. Left out, *level* is the master volume. |
| *level* | 0-15 or 0-255 | The master volume, 0 (silent) to 15 (full), or a voice's trim, 0 to 255 (full). |

A master volume of 16 or more gives `?ILLEGAL QUANTITY ERROR`.

```basic
10 SNDON: WAVE 0,3: ADSR 0,0,0,15,8: NOTE 0,48
20 FOR V=15 TO 0 STEP -1: VOL V: DELAY 100: NEXT
30 GATE 0,0: VOL 15
```

fades a held note out with the master volume.

See also: [WAVE](w.md#wave), [ADSR](a.md#adsr), [PAN](p.md#pan),
[Sound](../basic/sound.md).

## VTAKE

**Statement** · `VTAKE voice`

Pauses the background track of *voice* so the program can play on that
voice itself. The note it was playing keeps sounding until the program
changes it. `VGIVE` gives the voice back to its track.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |

```basic
10 SNDON: WAVE 0,1: ADSR 0,0,8,12,7
20 TRACK 0,"T120 L8 O4 | C D E F G A B > C <": BAND 1
30 DELAY 1000: VTAKE 0
40 NOTE 0,72: DELAY 200: GATE 0,0: DELAY 200
50 VGIVE 0: DELAY 1000: BAND 0
```

plays a scale, cuts in with a high note, and lets the scale carry on.

See also: [VGIVE](#vgive), [TRACK](t.md#track), [PLAYING](p.md#playing),
[Sound](../basic/sound.md).
