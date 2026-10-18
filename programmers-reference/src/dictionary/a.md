# A

## ABS

**Function** · `ABS(number)`

Returns *number* without its sign.

```basic
PRINT ABS(-3.5);ABS(2)
```

```text
 3.5  2
```

See also: [SGN](s.md#sgn), [INT](i.md#int).

## ADSR

**Statement** · `ADSR voice,attack,decay,sustain,release`

Sets the envelope of a sound voice: how fast a note rises, falls to its
held level, and fades when released.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |
| *attack* | 0-15 | How fast the note rises to full volume; lower is faster. |
| *decay* | 0-15 | How fast it then falls to the sustain level; lower is faster. |
| *sustain* | 0-15 | The level held while the note is on: 0 silent, 15 full. |
| *release* | 0-15 | How fast it fades after `GATE v,0`; lower is faster. |

The new envelope applies at once, also to a note that is sounding.

```basic
10 SNDON: WAVE 0,1
20 ADSR 0,0,8,12,6: NOTE 0,48: DELAY 300: GATE 0,0
30 DELAY 500
40 ADSR 0,10,8,15,12: NOTE 0,48: DELAY 300: GATE 0,0
```

plays the same note twice, first sharp, then soft with a long fade.

See also: [NOTE](n.md#note), [GATE](g.md#gate), [WAVE](w.md#wave),
[Sound](../basic/sound.md).

## ALT

**Statement** · `ALT enabled`

Turns reverse video on (any value but 0) or off (0) in the **BASIC pen**, the
style used for numbers, messages and unstyled text. Reverse draws characters
from the alternate character bank.

```basic
10 ALT 1: PRINT 123: ALT 0: PRINT 456
```

prints 123 in reverse and 456 normally.

See also: [COLOR](c.md#color), [STYLE](s.md#style),
[Styled strings](../basic/styled-strings.md).

## ASC

**Function** · `ASC(string)`

Returns the code, 0-255, of the first character of *string*.

```basic
PRINT ASC("A");ASC("ABC");ASC(CHR$(200))
```

```text
 65  65  200
```

An empty string gives `?ILLEGAL QUANTITY ERROR`.

See also: [CHR$](c.md#chr), [Appendix E](../appendix/charset-keys.md).

## ATN

**Function** · `ATN(number)`

Returns the arctangent of *number*: the angle, in radians, whose tangent it
is. The result is between -π/2 and π/2.

```basic
PRINT ATN(1)*4
```

```text
 3.14159266
```

See also: [TAN](t.md#tan), [SIN](s.md#sin), [COS](c.md#cos).

## ATRLOAD

**Statement** · `ATRLOAD path,table[,cell]`

Loads a whole file into the attributes of a background table, from *cell*
on. A file longer than the rest of the table continues into the next tables.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file. |
| *table* | 0-7 | The background table. |
| *cell* | 0-999 | The first cell, counted row by row; 0 if left out. |

See also: [ATRSAVE](#atrsave), [ATRREAD](#atrread), [NTLOAD](n.md#ntload),
[Graphics](../basic/graphics.md).

## ATRREAD

**Statement** · `ATRREAD table,cell,count`

Copies *count* values from `DATA` statements into the attributes of a
background table, from *cell* on. It reads from where the last `READ` left
off, as `READ` does.

| Argument | Range | Meaning |
| --- | --- | --- |
| *table* | 0-7 | The background table. |
| *cell* | 0-999 | The first cell, counted row by row. |
| *count* | 0-65535 | The values to copy. Not checked against the table's end. |

`ATRREAD` uses the variable `Z9` while it works and puts its value back.

```basic
10 ATRREAD 0,0,4
20 DATA 1,2,3,4
30 PRINT MPEEK($E140);MPEEK($E143)
```

```text
 1  4
```

See also: [NTREAD](n.md#ntread), [CHRREAD](c.md#chrread), [RESTORE](r.md#restore).

## ATRSAVE

**Statement** · `ATRSAVE path,table[,cell[,count]]`

Saves *count* attribute bytes of a background table, from *cell* on, to a
file. Without *count* it saves to the end of the table; without *cell* it
starts at cell 0.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file, created or replaced. |
| *table* | 0-7 | The background table. |
| *cell* | 0-999 | The first cell. |
| *count* | 0-65535 | The bytes to save. |

See also: [ATRLOAD](#atrload), [NTSAVE](n.md#ntsave).
