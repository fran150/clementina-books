# N

## NAME

**Statement** · `NAME oldPath AS newPath`

Renames a file or directory on the SD card. When *newPath* names another
directory, the file or directory moves there. Both paths are string
expressions.

| Argument | Range | Meaning |
| --- | --- | --- |
| *oldPath* | | The file or directory as it is now named. |
| *newPath* | | Its new name, or a path in another directory. |

A missing file, or a new name that is already taken, gives
`?FILE I/O ERROR`.

```basic
10 PRINT "HELLO"
SAVE "OLD.BAS"
MKDIR "KEEP"
NAME "OLD.BAS" AS "KEEP/NEW.BAS"
DIR "KEEP"
```

```text
NEW.BAS
```

saves a program as `OLD.BAS`, then renames it `NEW.BAS` and moves it into the
directory `KEEP` in one step.

See also: [RMDIR](r.md#rmdir), [KILL](k.md#kill), [MKDIR](m.md#mkdir),
[DIR](d.md#dir), [Files and the SD card](../basic/files.md).

## NEW

**Statement** · `NEW`

Erases the program in memory and all its variables, and stops background
music. Use it before typing a new program. Inside a running program, `NEW`
also ends the run.

There is no way to bring back a program erased by `NEW`, so `SAVE` it first.

```basic
10 PRINT "OLD PROGRAM"
NEW
LIST
```

lists nothing: the program is gone.

See also: [CLEAR](c.md#clear), [RUN](r.md#run), [SAVE](s.md#save),
[Programming rules](../basic/rules.md).

## NEXT

**Statement** · `NEXT [variable[,variable...]]`

Ends the body of a `FOR` loop. `NEXT` adds the step to the loop variable and
goes back to the statement after the `FOR` while the variable has not passed
the end value; once it has, the program continues after the `NEXT`.

Without a variable, `NEXT` closes the innermost loop. `NEXT J,I` closes loop
*J*, then loop *I*, and is the same as `NEXT J: NEXT I`. Naming an outer loop
also closes the loops inside it.

| Argument | Range | Meaning |
| --- | --- | --- |
| *variable* | | The loop variable of the `FOR` being closed. |

A `NEXT` with no `FOR` running, or one that names a variable with no loop,
gives `?NEXT WITHOUT FOR ERROR`.

```basic
FOR I=1 TO 2: FOR J=1 TO 3: PRINT I*10+J;: NEXT J,I
```

```text
 11  12  13  21  22  23
```

See also: [FOR](f.md#for), [STEP](s.md#step), [TO](t.md#to).

## NOTE

**Statement** · `NOTE voice,note`

Plays a note on a sound voice. The note is given as a semitone number: the
octave times 12 plus the step in the octave (C=0, C#=1 ... B=11). 48 is
middle C, and 57 is the A above it, 440 Hz.

`NOTE` always starts a new note: the envelope starts again from its attack and
the waveform from its start, even if the voice was already sounding. The
note sounds until `GATE voice,0` releases it. To change the pitch of a
sounding note without a new attack, use `FREQ`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |
| *note* | 0-95 | The semitone, from C0 to B7. |

```basic
10 SNDON: WAVE 0,3: ADSR 0,0,8,10,6
20 FOR N=48 TO 60: NOTE 0,N: DELAY 150: NEXT
30 GATE 0,0
```

plays a chromatic scale up one octave from middle C.

See also: [FREQ](f.md#freq), [GATE](g.md#gate), [ADSR](a.md#adsr),
[WAVE](w.md#wave), [SNDON](s.md#sndon), [Sound](../basic/sound.md).

## NTLOAD

**Statement** · `NTLOAD path,table[,cell]`

Loads a whole file into the tile numbers of a background table, from *cell*
on. Each byte of the file is the tile of one cell, counted row by row. A
file longer than the rest of the table continues into the next tables.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. |
| *table* | 0-7 | The background table. |
| *cell* | 0-999 | The first cell, counted row by row; 0 if left out. |

<!-- example: files=LEVEL.NT:48454c4c4f -->
```basic
10 NTLOAD "LEVEL.NT",0,5
20 PRINT MPEEK($C200+5);MPEEK($C200+9)
```

```text
 72  79
```

loads a five-byte file into cells 5 to 9 of table 0. Table 0's tile numbers
start at MIA address `$C200`.

See also: [NTSAVE](#ntsave), [NTREAD](#ntread), [ATRLOAD](a.md#atrload),
[Graphics](../basic/graphics.md).

## NTREAD

**Statement** · `NTREAD table,cell,count`

Copies *count* values from `DATA` statements into the tile numbers of a
background table, from *cell* on. It reads from where the last `READ` left
off, as `READ` does, and is much faster than a loop of `READ` and `MPOKE`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *table* | 0-7 | The background table. |
| *cell* | 0-999 | The first cell, counted row by row. |
| *count* | 0-65535 | The values to copy. Not checked against the table's end. |

Running out of `DATA` gives `?OUT OF DATA ERROR`. `NTREAD` uses the variable
`Z9` while it works and puts its value back.

```basic
10 NTREAD 0,0,5
20 DATA 72,69,76,76,79
30 PRINT MPEEK($C200);MPEEK($C204)
```

```text
 72  79
```

See also: [ATRREAD](a.md#atrread), [NTLOAD](#ntload), [CHRREAD](c.md#chrread),
[RESTORE](r.md#restore), [Graphics](../basic/graphics.md).

## NTSAVE

**Statement** · `NTSAVE path,table[,cell[,count]]`

Saves *count* tile numbers of a background table, from *cell* on, to a file.
Without *count* it saves to the end of the table; without *cell* it starts at
cell 0, so `NTSAVE path,table` saves all 1,000 cells.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file, created or replaced. |
| *table* | 0-7 | The background table. |
| *cell* | 0-999 | The first cell. |
| *count* | 0-65535 | The bytes to save. |

```basic
10 MFILL $C200,1000,42
20 NTSAVE "STARS.NT",0,0,40
30 FSTAT "STARS.NT",S,A,D,T: PRINT S
40 NTSAVE "ALL.NT",0
50 FSTAT "ALL.NT",S,A,D,T: PRINT S
```

```text
 40
 1000
```

saves the first row of table 0, then the whole table.

See also: [NTLOAD](#ntload), [ATRSAVE](a.md#atrsave), [FSTAT](f.md#fstat).
