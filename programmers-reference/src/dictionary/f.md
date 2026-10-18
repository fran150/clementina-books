# F

## FLIPX

**Statement** · `FLIPX enabled`

Turns the horizontal flip on (any value but 0) or off (0) in the **BASIC
pen**, the style used for numbers, messages and unstyled text. A flipped
character is drawn mirrored left to right.

| Argument | Range | Meaning |
| --- | --- | --- |
| *enabled* | 0-255 | 0 off, any other value on. |

```basic
10 CLS: FLIPX 1: PRINT 5: FLIPX 0
20 PRINT MPEEK($10468+1)
```

```text
 16
```

Line 20 reads the attribute byte of the `5` on the screen: bit 4, flip X, is
set.

See also: [FLIPY](#flipy), [ALT](a.md#alt), [COLOR](c.md#color),
[STYLE](s.md#style), [Styled strings](../basic/styled-strings.md).

## FLIPY

**Statement** · `FLIPY enabled`

Turns the vertical flip on (any value but 0) or off (0) in the **BASIC pen**.
A flipped character is drawn upside down.

| Argument | Range | Meaning |
| --- | --- | --- |
| *enabled* | 0-255 | 0 off, any other value on. |

```basic
10 CLS: FLIPY 1: PRINT 6: FLIPY 0
20 PRINT MPEEK($10468+1)
```

```text
 32
```

The attribute byte of the `6` has bit 5, flip Y, set.

See also: [FLIPX](#flipx), [ALT](a.md#alt), [STYLE](s.md#style),
[Styled strings](../basic/styled-strings.md).

## FLUSH

**Statement** · `FLUSH #handle`

Writes everything still waiting for an open file to the SD card, and brings
its size and date up to date, without closing it. The file stays open at the
same position. Use it on a file that is kept open for a long time, so that
its data is safe if the card is taken out.

| Argument | Range | Meaning |
| --- | --- | --- |
| *handle* | 1-16 | The file number, written `#n`, with a space after `FLUSH`. |

```basic
10 OPEN "LOG.TXT" FOR OUTPUT AS #1
20 BPUT#1,65: FLUSH #1
30 FSTAT "LOG.TXT",S,A,D,T: PRINT S
40 CLOSE #1
```

```text
 1
```

A file number that is not open gives `?FILE I/O ERROR`.

See also: [CLOSE](c.md#close), [OPEN](o.md#open),
[Files and the SD card](../basic/files.md).

## FN

**Function** · `FNname(argument)`

Calls a function defined with `DEF FNname`. The argument is given to the
function's parameter, the body is worked out, and its value is returned. The
parameter variable keeps its own value after the call.

```basic
10 DEF FNSQ(X)=X*X
20 X=5: PRINT FNSQ(7);X
```

```text
 49  5
```

A name with no `DEF FN` gives `?UNDEF'D FUNCTION ERROR`. The name follows the
rules of variable names: only two characters count.

See also: [DEF](d.md#def), [Expressions](../basic/expressions.md).

## FOR

**Statement** · `FOR variable=start TO end [STEP step]`

Starts a loop. `FOR` sets *variable* to *start*; the statements up to the
matching `NEXT` run; then `NEXT` adds *step* to the variable and goes back if
it has not passed *end*. The test is made at `NEXT`, so the body always runs
at least once.

| Argument | Range | Meaning |
| --- | --- | --- |
| *variable* | | A simple numeric variable. An integer (`%`) variable or an array element gives `?SYNTAX ERROR`. |
| *start* | | The first value. |
| *end* | | The last value. It is worked out once, when the loop starts. |
| *step* | | Added at each `NEXT`; 1 if left out. A negative step counts down; `STEP 0` never ends. |

```basic
10 FOR I=10 TO 1 STEP -3: PRINT I;: NEXT
20 PRINT: PRINT I
```

```text
 10  7  4  1
-2
```

After the loop the variable holds the first value that passed *end*. Loops
can nest, each with its own variable. A `FOR` on a variable that is already
looping replaces that loop, and the loops inside it:

```basic
10 FOR I=1 TO 3
20 FOR I=5 TO 6: PRINT I;: NEXT
30 NEXT
```

```text
 5  6
?NEXT WITHOUT FOR ERROR IN  30
```

Too many nested loops give `?OUT OF MEMORY ERROR`.

See also: [NEXT](n.md#next), [GOSUB](g.md#gosub), [DELAY](d.md#delay),
[Programming rules](../basic/rules.md).

## FPOS

**Function** · `FPOS(handle)`

Returns the position in an open file, in bytes from its start: where the next
`BGET#` reads or the next `BPUT#` writes. The first byte is position 0.

| Argument | Range | Meaning |
| --- | --- | --- |
| *handle* | 1-16 | The file number, written without `#`. |

```basic
10 OPEN "T.DAT" FOR OUTPUT AS #1
20 FOR I=1 TO 300: BPUT#1,I AND 255: NEXT
30 CLOSE #1: OPEN "T.DAT" FOR INPUT AS #1
40 SEEK#1,100: BGET#1,B
50 PRINT FPOS(1);FSIZE(1);B
60 CLOSE #1
```

```text
 101  300  101
```

A file number that is not open gives `?FILE I/O ERROR`; one outside 1-16
gives `?ILLEGAL QUANTITY ERROR`.

See also: [FSIZE](#fsize), [SEEK#](s.md#seek), [EOF](e.md#eof),
[Files and the SD card](../basic/files.md).

## FRE

**Function** · `FRE(value)`

Collects the unused strings, then returns the number of free bytes in BASIC's
workspace, between the arrays and the strings. *value* can be anything; it is
not used.

```basic
PRINT FRE(0)
```

```text
 23645
```

That is the value with no program in memory. The result is a signed 16-bit
number, so more than 32767 free bytes would read negative; the workspace is
smaller than that.

See also: [CLEAR](c.md#clear),
[Numbers, strings and variables](../basic/variables.md).

## FREQ

**Statement** · `FREQ voice,hz`

Sets the pitch of a voice in whole hertz. Unlike `NOTE`, it does not start a
new note: a note that is sounding changes pitch without a new attack, which
makes slides and vibrato.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |
| *hz* | 0-4095 | The pitch in hertz. |

```basic
10 SNDON: WAVE 0,1: ADSR 0,0,8,12,6: NOTE 0,48
20 FOR F=262 TO 523 STEP 4: FREQ 0,F: DELAY 10: NEXT
30 GATE 0,0
```

slides middle C up one octave.

See also: [NOTE](n.md#note), [GATE](g.md#gate), [Sound](../basic/sound.md).

## FSIZE

**Function** · `FSIZE(handle)`

Returns the size in bytes of an open file, including bytes written but not
yet flushed to the card.

| Argument | Range | Meaning |
| --- | --- | --- |
| *handle* | 1-16 | The file number, written without `#`. |

```basic
10 OPEN "T.DAT" FOR OUTPUT AS #1
20 FOR I=1 TO 5: BPUT#1,I: NEXT
30 PRINT FPOS(1);FSIZE(1)
40 CLOSE #1
```

```text
 5  5
```

A file number that is not open gives `?FILE I/O ERROR`.

See also: [FPOS](#fpos), [FSTAT](#fstat),
[Files and the SD card](../basic/files.md).

## FSTAT

**Statement** · `FSTAT path,size,attributes,date,time`

Reads a file's size, attributes, date and time into four numeric variables.
The file does not have to be open.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The file or directory. |
| *size* | | Gets the size in bytes; 0 for a directory. |
| *attributes* | | Gets the FAT attributes, added: read-only 1, hidden 2, system 4, volume label 8, directory 16, archive 32. |
| *date* | | Gets the date, packed as `(year-1980)*512 + month*32 + day`. |
| *time* | | Gets the time, packed as `hour*2048 + minute*32 + second/2`. |

Use floating-point variables. An integer (`%`) variable gives
`?ILLEGAL QUANTITY ERROR` for a date or time above 32767. A file that does
not exist gives `?FILE I/O ERROR`.

```basic
10 MKDIR "SUB"
20 FSTAT "SUB",S,A,D,T
30 PRINT S;A
40 PRINT "YEAR";INT(D/512)+1980
```

prints ` 0  16` for the directory, then the year it was made.

See also: [FSIZE](#fsize), [DIR](d.md#dir), [DISKFREE](d.md#diskfree),
[Files and the SD card](../basic/files.md).
