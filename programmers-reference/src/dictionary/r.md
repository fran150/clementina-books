# R

## READ

**Statement** · `READ variable[,variable...]`

Takes the next items from the program's `DATA` statements and puts them in
the variables, in order. The first `READ` starts at the first `DATA` item of
the program; each one goes on from where the last stopped, from one `DATA`
statement to the next. `RESTORE` starts again from the first item.

| Argument | Range | Meaning |
| --- | --- | --- |
| *variable* | | A numeric or string variable, or an array element. |

A string variable takes any item. A numeric variable needs a number: an item
that is not one gives `?SYNTAX ERROR` on the `DATA` line. Reading past the
last item gives `?OUT OF DATA ERROR`.

```basic
10 READ A,B$,C
20 PRINT A;B$;C
30 READ D
40 DATA 1,HELLO,3
```

```text
 1 HELLO 3

?OUT OF DATA ERROR IN  30
```

See also: [DATA](d.md#data), [RESTORE](#restore), [NTREAD](n.md#ntread),
[Numbers, strings and variables](../basic/variables.md).

## REM

**Statement** · `REM [text]`

Marks a remark: a note for whoever reads the program. BASIC ignores
everything after `REM` to the end of the line, colons included, so a `REM`
must be the last statement on its line. The text is kept exactly as typed.

| Argument | Range | Meaning |
| --- | --- | --- |
| *text* | | Any text. |

```basic
10 REM COUNT TO 3: PRINT "NOT PRINTED"
20 FOR I=1 TO 3: PRINT I;: NEXT: REM THE LOOP
```

```text
 1  2  3
```

See also: [DATA](d.md#data), [Programming rules](../basic/rules.md).

## RESTORE

**Statement** · `RESTORE`

Sets the `DATA` position back to the first `DATA` item of the program, so
the next `READ` reads it again. `RESTORE` cannot start at a chosen line:
`RESTORE 10` gives `?SYNTAX ERROR`. The statements that copy `DATA` into MIA,
such as `NTREAD` and `PALREAD`, share the same position.

```basic
10 FOR I=1 TO 2
20 READ A,B: PRINT A;B
30 RESTORE
40 NEXT
50 DATA 5,7
```

```text
 5  7
 5  7
```

See also: [READ](#read), [DATA](d.md#data).

## RETURN

**Statement** · `RETURN`

Ends a subroutine: the program goes back to the statement after the `GOSUB`
or `ON ... GOSUB` that called it. Any `FOR` loops started inside the
subroutine are closed, so a `RETURN` may leave a loop early.

A `RETURN` with no `GOSUB` running gives `?RETURN WITHOUT GOSUB ERROR`.

```basic
10 GOSUB 100: PRINT "BACK"
20 END
100 FOR I=1 TO 3
110 PRINT I;
120 IF I=2 THEN RETURN
130 NEXT
```

```text
 1  2 BACK
```

See also: [GOSUB](g.md#gosub), [ON](o.md#on), [END](e.md#end).

## RIGHT$

**Function** · `RIGHT$(string, length)`

Returns the last *length* characters of *string*. When *string* is shorter,
it returns all of it, and a *length* of 0 returns an empty string. The
characters keep their colors and other attributes.

| Argument | Range | Meaning |
| --- | --- | --- |
| *string* | | The string. |
| *length* | 0-255 | How many characters to keep. |

```basic
PRINT RIGHT$("CLEMENTINA",4)
PRINT RIGHT$("HI",5);RIGHT$("HI",0)
```

```text
TINA
```

The second line prints `HI`. A *length* below 0 or above 255 gives
`?ILLEGAL QUANTITY ERROR`.

See also: [LEFT$](l.md#left), [MID$](m.md#mid), [LEN](l.md#len),
[Styled strings](../basic/styled-strings.md).

## RMDIR

**Statement** · `RMDIR path`

Removes a directory from the SD card. The directory must be empty. `RMDIR`
works like `KILL`, so given the name of a file it deletes the file.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The directory. |

A directory that does not exist or is not empty gives `?FILE I/O ERROR`.

```basic
MKDIR "OLD"
MKDIR "NEW"
RMDIR "OLD"
DIR
```

```text
NEW/
```

See also: [MKDIR](m.md#mkdir), [KILL](k.md#kill), [CD](c.md#cd),
[DIR](d.md#dir), [Files and the SD card](../basic/files.md).

## RND

**Function** · `RND(number)`

Returns a random number from 0 up to, but not including, 1. What *number*
does depends on its sign:

| *number* | Result |
| --- | --- |
| Positive | The next number of the sequence. |
| 0 | The last number again. |
| Negative | Starts a new sequence from *number*. The same negative number always starts the same sequence. |

| Argument | Range | Meaning |
| --- | --- | --- |
| *number* | | Usually 1. |

The numbers are not truly random: after power-on the sequence is always the
same. `INT(RND(1)*N)+1` gives a whole number from 1 to *N*.

```basic
X=RND(-1)
FOR I=1 TO 8: PRINT INT(RND(1)*6)+1;: NEXT
```

```text
 5  2  2  4  6  1  1  6
```

throws a die eight times. Typing both lines again gives the same throws,
because `RND(-1)` starts the same sequence each time.

See also: [INT](i.md#int), [TICKS](t.md#ticks).

## RUN

**Statement** · `RUN [line]`

Starts the program in memory. `RUN` first clears all variables, arrays and
strings, sets the `DATA` position back to the start and forgets open `FOR`
loops and `GOSUB`s. Then it runs the program from its first line, or from
*line*.

| Argument | Range | Meaning |
| --- | --- | --- |
| *line* | 0-63999 | The line to start at; the first line if left out. |

A *line* that does not exist gives `?UNDEF'D STATEMENT ERROR`. To start at a
line without clearing the variables, use `GOTO` as a direct command.

```basic
10 PRINT "FIRST"
20 PRINT "SECOND";A
30 A=5
RUN 20
```

```text
SECOND 0
```

See also: [GOTO](g.md#goto), [CONT](c.md#cont), [CLEAR](c.md#clear),
[END](e.md#end), [Programming rules](../basic/rules.md).
