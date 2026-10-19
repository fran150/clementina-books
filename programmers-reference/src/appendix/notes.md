# F. Notes and frequencies

`NOTE v,n` and `TRACK` play semitone *n*, 0 to 95: the octave times 12 plus
the note's place in the octave. This table gives the frequency in hertz that
each one sets. Middle C, C4, is note 48; the A above it, note 57, is 440 Hz.

| Octave | First note | C | C# | D | D# | E | F | F# | G | G# | A | A# | B |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 0 | 16.38 | 17.31 | 18.38 | 19.44 | 20.62 | 21.81 | 23.12 | 24.50 | 25.94 | 27.50 | 29.12 | 30.88 |
| 1 | 12 | 32.75 | 34.62 | 36.75 | 38.88 | 41.25 | 43.62 | 46.25 | 49.00 | 51.88 | 55.00 | 58.25 | 61.75 |
| 2 | 24 | 65.50 | 69.25 | 73.50 | 77.75 | 82.50 | 87.25 | 92.50 | 98.00 | 103.75 | 110.00 | 116.50 | 123.50 |
| 3 | 36 | 131.00 | 138.50 | 147.00 | 155.50 | 165.00 | 174.50 | 185.00 | 196.00 | 207.50 | 220.00 | 233.00 | 247.00 |
| 4 | 48 | 262.00 | 277.00 | 294.00 | 311.00 | 330.00 | 349.00 | 370.00 | 392.00 | 415.00 | 440.00 | 466.00 | 494.00 |
| 5 | 60 | 524.00 | 554.00 | 588.00 | 622.00 | 660.00 | 698.00 | 740.00 | 784.00 | 830.00 | 880.00 | 932.00 | 988.00 |
| 6 | 72 | 1048.00 | 1108.00 | 1176.00 | 1244.00 | 1320.00 | 1396.00 | 1480.00 | 1568.00 | 1660.00 | 1760.00 | 1864.00 | 1976.00 |
| 7 | 84 | 2096.00 | 2216.00 | 2352.00 | 2488.00 | 2640.00 | 2792.00 | 2960.00 | 3136.00 | 3320.00 | 3520.00 | 3728.00 | 3952.00 |

BASIC works these out from the twelve notes of octave 0, rounded to sixteenths
of a hertz, doubling them once for each octave up. So the higher octaves are
slightly sharp of exact equal temperament: C7 is 2,096 Hz instead of 2,093.
The value MIA receives, in a voice's frequency bytes or a sequencer note, is
the frequency times 16:

```basic
10 NOTE 0,57
20 PRINT MPEEK($12010)+256*MPEEK($12011)
```

```text
 7040
```

A program that wants a pitch between the notes, or exact equal temperament,
uses `FREQ` or writes the frequency bytes itself
([Sound](../mia/sound.md)).
