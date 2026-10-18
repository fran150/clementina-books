# Sound

MIA has a four-voice sound generator in the style of the Commodore 64's SID.
BASIC can play it note by note, or hand MIA a whole tune that plays in the
background while the program carries on.

## The voices

There are four **voices**, numbered 0-3. Each one has:

- a **waveform**: `WAVE v,w` with 0 sine, 1 pulse, 2 sawtooth, 3 triangle or
  4 noise;
- a **pitch**: `NOTE v,n` as a semitone number, or `FREQ v,hz` in hertz
  (0-4095);
- an **envelope**: `ADSR v,a,d,s,r`, each 0-15;
- a **volume trim**: `VOL v,n`, 0-255, where 255 is full volume;
- a **stereo position**: `PAN v,p`, from -64 (left) through 0 to 63 (right);
- a **pulse width** for the pulse waveform: `PULSE v,w`, where 128 is a square
  wave.

`VOL n` with a single number, 0-15, sets the **master volume** for all four.
The sound path is:

```text
waveform -> envelope -> VOL v,n -> PAN -> mix -> VOL n -> output
```

Sound starts **stopped**. Set the voices up, then `SNDON` once. `SNDOFF` stops
the sound and keeps the settings; `SNDCLR` stops it and puts every voice back
to its defaults (pulse wave, width 128, centered, full volume).

## Notes and the envelope

`NOTE v,n` plays semitone *n*, from 0 to 95: *n* is the octave times 12 plus
the step in the octave (C=0, C#=1 ... B=11). So 48 is middle C, C4, and 57 is
A4, 440 Hz. [Appendix F](../appendix/notes.md) lists all 96 notes with their
frequencies.

Each note follows its envelope. When a note starts, its volume rises during
the **attack**, falls during the **decay** to the **sustain** level, and stays
there while the note is held. When the note is released, it fades during the
**release**. In `ADSR v,a,d,s,r`, *a*, *d* and *r* are **rates**, where a
lower number is faster, and *s* is a **level**, 0 for silent to 15 for full.

| Statement | Effect |
| --- | --- |
| `NOTE v,n` | Start a new note: the envelope restarts from its attack. |
| `GATE v,0` | Release the note: it fades over its release time. |
| `GATE v,1` | Hold the note on again, without a new attack. |
| `FREQ v,hz` | Change the pitch without a new attack, for slides. |

A beep, middle C for a quarter of a second:

```basic
10 SNDON
20 WAVE 0,1: ADSR 0,0,8,12,6
30 NOTE 0,48
40 DELAY 250
50 GATE 0,0
```

`DELAY n` waits *n* milliseconds, measured by MIA's clock, so the beep lasts
the same however fast the 6502 runs. Use it, not empty `FOR` loops, to time
sound.

A noise drum, and a chord on three voices panned apart:

```basic
10 SNDON
20 WAVE 3,4: FREQ 3,800: ADSR 3,0,2,0,3
30 GATE 3,1: DELAY 30: GATE 3,0
40 FOR V=0 TO 2: WAVE V,2: ADSR V,2,6,10,8: PAN V,(V-1)*50: NEXT
50 NOTE 0,48: NOTE 1,52: NOTE 2,55
60 DELAY 1000
70 FOR V=0 TO 2: GATE V,0: NEXT
```

Changing a voice's waveform, envelope, pan, volume or pitch while it sounds
takes effect at once.

## Background music

`TRACK v,s$` turns a string of music text into a program for MIA's
**sequencer** and gives it to voice *v*; `BAND 1` starts every voice that has
a track. From then on MIA plays the music itself, and the BASIC program does
not spend any time on it. The program can draw, read keys and even wait in
`INPUT` while the tune plays.

```basic
10 SNDON
20 WAVE 0,1: ADSR 0,0,8,12,7
30 TRACK 0,"T120 L8 O4 C D E F | G4 G4 A A A A G2 F F F F E2"
40 WAVE 1,3: ADSR 1,0,6,10,6
50 TRACK 1,"T120 L4 O2 C G | C G C G C G"
60 BAND 1
```

Set each voice's waveform, envelope, pan and volume before its track starts:
the track itself only plays notes and rests, and can change the waveform and
volume.

The music text is **MML**, the language of MSX BASIC's `PLAY`. Letters can be
upper or lower case, and spaces and commas are ignored.

| Text | Meaning |
| --- | --- |
| `A`-`G` | A note in the current octave. `#` or `+` after it makes it sharp, `-` flat. A length and dots can follow. |
| `R` or `P` | A rest, with an optional length and dots. |
| `O n` | Octave 0-7. `O4` holds middle C. |
| `<`, `>` | One octave down or up. |
| `L n` | The default length, 1-64: `L4` is a quarter note, `L8` an eighth, `L3` a triplet half. |
| `.` | After a length, adds half of it again. |
| `T n` | Tempo, 1-255 quarter notes a minute. |
| `V n` | Voice volume 0-15 from here on. |
| `W n` | Waveform 0-4 from here on. |
| `&` | Tie: the next note continues this one without a new attack. |
| `\|` | Loop point: what follows repeats forever; what comes before plays once. |

Each track starts at `O4 T120 L4`. Without a `|`, the track plays once and
stops. Lengths are turned into MIA's own clock ticks when `TRACK` runs, so the
music keeps time exactly and all voices stay together.

| Statement or function | Effect |
| --- | --- |
| `BAND 1` / `BAND 0` | Start every voice that has a track / stop all four. |
| `BAND v,1` / `BAND v,0` | Start or stop one voice. A stopped voice resumes where it stopped; a new `TRACK` starts from its top. |
| `VTAKE v` | Pause voice *v*'s track so the program can play on it directly. |
| `VGIVE v` | Give the voice back to its track, which catches up to where it would have been. |
| `PLAYING(v)` | 1 while voice *v*'s track is running, else 0. |
| `CUE(v)` | How many notes, ties and rests voice *v* has started since its track was loaded. |

`VTAKE` and `VGIVE` mix sound effects with music. An explosion steals voice 1
for a moment, and the bass line comes back in time:

<!-- example: with=previous -->
```basic
100 VTAKE 1
110 WAVE 1,4: ADSR 1,0,2,0,3: NOTE 1,24
120 DELAY 300
130 VGIVE 1: WAVE 1,3: ADSR 1,0,6,10,6
```

`CUE` lets a program act at a point in the music. It keeps counting through
loops, so in the first example `CUE(0)` reaches 5 when the loop part starts
for the first time:

<!-- example: with=previous -->
```basic
70 IF CUE(0)<5 THEN 70
80 PRINT "NOW THE LOOP STARTS"
```

The music stops when the program ends with `END`, stops with `STOP`, Ctrl-C
or an error, and on `NEW`. A program that ends by running off its last line
leaves it playing; `BAND 0` stops it.

A track is stored in MIA's memory, by default at `$14000 + v*$1000` for voice
*v*. `TRACK v,s$,address` puts it elsewhere. How the sequencer's code looks
and how machine code can write it directly is in Part III,
[Sound](../mia/sound.md).
