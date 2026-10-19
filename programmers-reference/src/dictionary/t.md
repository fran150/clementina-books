# T

## TAB

**Function** · `TAB(column)`

Prints spaces up to *column* of the current line. Nothing is printed when
the output is already at or past that column. `TAB` can only be used inside
`PRINT`; it returns no value, and anywhere else it gives
`?SYNTAX ERROR`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *column* | 0-255 | The column to move to. The screen's columns are 0-39. |

```basic
10 PRINT "NAME";TAB(12);"SCORE"
20 PRINT "ANA";TAB(12);1200
```

```text
NAME        SCORE
ANA          1200
```

See also: [SPC](s.md#spc), [POS](p.md#pos), [CRSR](c.md#crsr),
[Text](../basic/text.md).

## TAN

**Function** · `TAN(number)`

Returns the tangent of *number*, an angle in radians. It is worked out as
`SIN(number)/COS(number)`.

```basic
10 P=ATN(1)*4
20 PRINT TAN(0);TAN(P/4)
```

```text
 0  1
```

See also: [ATN](a.md#atn), [SIN](s.md#sin), [COS](c.md#cos).

## THEN

**Keyword** · `IF condition THEN line|statement`

Follows the condition of an `IF`. After it comes a line number to jump to,
or statements to run when the condition is true. `GOTO` can take the place
of `THEN` before a line number.

```basic
10 IF 2>1 THEN PRINT "TRUE"
20 IF 2>1 THEN 40
30 PRINT "NOT HERE"
40 PRINT "DONE"
```

```text
TRUE
DONE
```

See also: [IF](i.md#if), [GOTO](g.md#goto).

## TICKS

**Function** · `TICKS(dummy)`

Returns the milliseconds counted since MIA last started, from 0 to
4,294,967,295. Then it starts again from 0, after about 49.7 days.

| Argument | Range | Meaning |
| --- | --- | --- |
| *dummy* | 0 | Must be 0; any other value gives `?ILLEGAL QUANTITY ERROR`. |

```basic
10 A=TICKS(0)
20 DELAY 250
30 PRINT TICKS(0)-A>=250
```

```text
-1
```

The count keeps going through `RUN`, `NEW` and the `READY.` prompt.
For the time of day, the 60 Hz clock `TI` is easier to use.

See also: [DELAY](d.md#delay), [Time](../basic/time.md).

## TO

**Keyword** · `FOR variable=start TO end | GO TO line`

Separates the start value from the end value in a `FOR` statement. It also
follows `GO` in `GO TO`, which is the same as `GOTO`. `TO` is not a
statement by itself.

```basic
10 FOR I=1 TO 3: PRINT I;: NEXT: PRINT
20 GO TO 40
30 PRINT "NOT HERE"
40 PRINT "DONE"
```

```text
 1  2  3
DONE
```

See also: [FOR](f.md#for), [STEP](s.md#step), [GO](g.md#go).

## TRACK

**Statement** · `TRACK voice,music[,address]`

Turns a string of music text into a track for MIA's sequencer and gives it
to *voice*. `BAND 1` then starts it, and MIA plays it while the program
carries on. The music text is MML, the language of MSX BASIC's `PLAY`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |
| *music* | | The music text (below). |
| *address* | 0-16777215 | Where in MIA's memory the track goes. If left out, `$14000 + voice*$1000`. |

| Text | Meaning |
| --- | --- |
| `A`-`G` | A note. `#` or `+` makes it sharp, `-` flat. A length and dots can follow. |
| `R` | A rest, with an optional length and dots. |
| `O n` | Octave 0-7. `O4` holds middle C. |
| `<`, `>` | One octave down or up. |
| `L n` | The default length, 1-64: `L4` is a quarter note. |
| `T n` | Tempo, 1-255 quarter notes a minute. |
| `V n` | Voice volume 0-15. |
| `W n` | Waveform 0-4. |
| `&` | Tie the next note to this one. |
| `\|` | Loop point: what follows repeats forever. |

Every track starts at `O4 T120 L4`. A letter that is not part of MML gives
`?SYNTAX ERROR`, and a number out of range gives
`?ILLEGAL QUANTITY ERROR`. `TRACK` writes only to MIA's memory, so an error
never leaves a note sounding.

```basic
10 SNDON: WAVE 0,1: ADSR 0,0,8,12,7
20 TRACK 0,"T120 L8 O4 C D E F | G4 G4 A A A A G2"
30 BAND 1
```

plays a tune that keeps repeating from the `G` while the program goes on.
`BAND 0`, `END` or `STOP` stops it.

See also: [BAND](b.md#band), [VTAKE](v.md#vtake), [PLAYING](p.md#playing),
[CUE](c.md#cue), [Sound](../basic/sound.md).
