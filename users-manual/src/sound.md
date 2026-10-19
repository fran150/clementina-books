# Sound and music

Clementina has four **voices**, numbered 0 to 3. Each plays one note at a
time, so four notes can sound together. On the board the sound comes out of
the audio jack; in the emulator, out of your computer's speakers.

## Your first note

```basic
NEW
10 SNDON
20 WAVE 0,1:ADSR 0,0,8,12,6
30 NOTE 0,48
40 DELAY 500
50 GATE 0,0
```

`RUN` plays middle C for half a second. Line by line:

- **10** `SNDON` switches the sound on. Sound starts switched off, so every
  program that makes sound does this once.
- **20** `WAVE` picks the voice's sound and `ADSR` its shape (below).
- **30** `NOTE voice,number` plays a note. 48 is middle C.
- **40** `DELAY 500` waits 500 milliseconds, half a second.
- **50** `GATE 0,0` lets go of the note, like lifting a finger from a piano
  key. The note fades out rather than stopping dead.

## Notes

Notes are numbered by semitone: each number is one piano key higher than
the one before, and 12 numbers make an octave. Middle C is 48:

| Number | 48 | 50 | 52 | 53 | 55 | 57 | 59 | 60 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Note | C | D | E | F | G | A | B | C |

Add 1 for a sharp (49 is C♯) and add or take 12 to move an octave. The
numbers run from 0, a very low C, to 95. Note 57 is the A at 440 Hz that
orchestras tune to.

This plays a scale:

```basic
NEW
10 SNDON:WAVE 0,1:ADSR 0,0,8,12,6
20 FOR I=1 TO 8
30 READ N:NOTE 0,N:DELAY 300
40 NEXT I
50 GATE 0,0
60 DATA 48,50,52,53,55,57,59,60
```

## The sound of a voice

`WAVE voice,shape` picks the basic sound:

| Shape | Sounds like |
| --- | --- |
| 0, sine | soft and pure, like a flute or a whistle |
| 1, pulse | bright and hollow, the classic computer-game sound |
| 2, sawtooth | buzzy and rich, like a brass or string section |
| 3, triangle | mellow, between sine and pulse |
| 4, noise | a hiss, for drums, explosions and wind |

`ADSR voice,attack,decay,sustain,release` shapes each note over time. Each
number is 0 to 15:

- **attack**: how fast the note rises when it starts (0 is instant);
- **decay**: how fast it falls from that peak to the sustain level;
- **sustain**: how loud it stays while held (0 silent, 15 full);
- **release**: how fast it fades after `GATE voice,0`.

Small numbers are fast. A piano-like pluck has a fast attack, a slow decay
and no sustain, `ADSR 0,0,9,0,9`; an organ starts and stops at once and
holds full, `ADSR 0,0,0,15,0`.

Other voice settings:

| Statement | What it does |
| --- | --- |
| `VOL n` | Volume of all sound, 0 (silent) to 15 (full, the default). |
| `VOL voice,n` | Volume of one voice, 0 to 255 (the default). |
| `PAN voice,p` | Left or right: -64 is fully left, 0 the middle, 63 fully right. |
| `FREQ voice,hz` | Set a pitch in hertz instead of a note number. |
| `SNDOFF` | Switch the sound off. `SNDCLR` also puts every voice back to its defaults. |

## Music that plays by itself

`NOTE` and `DELAY` make the program wait for every note. For music, write
the tune as a string and let MIA play it in the background while your
program carries on:

```basic
NEW
10 SNDON:WAVE 0,1:ADSR 0,0,8,12,7
20 TRACK 0,"T120 L8 O4 C D E F G4 G4 A A A A G2 F F F F E2"
30 BAND 1
40 PRINT "THE MUSIC PLAYS ON ITS OWN"
```

The program ends at once, the `READY.` prompt comes back, and the tune
keeps playing. `TRACK voice,tune$` gives a voice its tune; `BAND 1` starts
every voice that has one, and `BAND 0` stops them all.

The tune is written in MML, the music language of MSX BASIC's `PLAY`:

| In the tune | Means |
| --- | --- |
| `C D E F G A B` | A note. Add `#` or `+` for sharp, `-` for flat: `F#`, `B-`. |
| a number after a note | Its length: `4` a quarter note, `8` an eighth, `2` a half, `1` a whole. `C4.` adds a dot (half as long again). |
| `R` | A rest, with a length like a note: `R4`. |
| `O n` | Octave, 0 to 7. `O4` is the octave from middle C. |
| `<` and `>` | One octave down or up. |
| `L n` | The length for notes that don't give one. |
| `T n` | Tempo, in quarter notes a minute (120 if you don't say). |
| `V n` | Volume, 0 to 15. |
| `&` | Tie two notes into one: `C4&C8`. |
| `\|` | Loop: everything after it repeats forever. |

Spaces don't matter, and upper or lowercase is the same.

### A band

Each voice can have its own tune, and they stay in time with each other.
This plays a melody over a bass line, and repeats it forever from the `|`:

```basic
NEW
10 SNDON
20 WAVE 0,1:ADSR 0,0,8,12,7
30 TRACK 0,"T120 L8 O4 C D E F | G4 G4 A A A A G2 F F F F E2"
40 WAVE 1,2:ADSR 1,0,6,10,6
50 TRACK 1,"T120 L4 O2 C G | C G C G C G"
60 BAND 1
```

The music keeps going after the program ends. `BAND 0` stops it, and so do
`Ctrl+C`, `END`, `NEW` and any error, so a game that stops never leaves a
tune playing.

## Sound effects over the music

A game wants a sound effect without stopping its music. `VTAKE voice`
borrows a voice from its tune, and `VGIVE voice` hands it back, already
caught up with the rest of the band:

```basic
NEW
10 SNDON
20 WAVE 0,1:ADSR 0,0,8,12,7:TRACK 0,"T120 L8 O4 C D E F | G4 G4 A A A A G2 F F F F E2"
30 WAVE 1,2:ADSR 1,0,6,10,6:TRACK 1,"T120 L4 O2 C G | C G C G C G"
40 BAND 1
50 PRINT "PRESS A KEY FOR AN EXPLOSION, Q TO QUIT"
60 GET K$:IF K$="Q" OR K$="q" THEN END
70 VTAKE 1
80 WAVE 1,4:ADSR 1,0,2,0,3:NOTE 1,24
90 DELAY 400
100 WAVE 1,2:ADSR 1,0,6,10,6:VGIVE 1
110 GOTO 60
```

Each key press borrows the bass voice for a noise burst (`WAVE 1,4`) and
then gives it back. `GET` waits for a key, and while it waits it takes
`Ctrl+C` as an ordinary key, so the program offers Q to quit; `END` stops
the music too.

`PLAYING(voice)` is 1 while a voice's tune is playing, so a program can wait
for a tune to end: `IF PLAYING(0) THEN ...`.

The *Programmer's Reference Guide* has the rest: syncing a program to the
music with `CUE`, and placing tunes anywhere in MIA's memory.
