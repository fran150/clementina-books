# L

## LEFT$

**Function** · `LEFT$(string, length)`

Returns the first *length* characters of *string*. If the string is shorter,
all of it is returned. The characters keep their colors and styles.

| Argument | Range | Meaning |
| --- | --- | --- |
| *string* | | The string. |
| *length* | 0-255 | How many characters; 0 gives an empty string. |

```basic
PRINT LEFT$("HELLO",3);"|";LEFT$("HI",10);"|"
```

```text
HEL|HI|
```

See also: [MID$](m.md#mid), [RIGHT$](r.md#right), [LEN](#len),
[Numbers, strings and variables](../basic/variables.md).

## LEN

**Function** · `LEN(string)`

Returns the number of characters in *string*, 0-255. Colors and styles are
not counted.

```basic
PRINT LEN("HELLO");LEN("");LEN(STR$(42))
```

```text
 5  0  3
```

`STR$(42)` is ` 42`, with a space before the number, so its length is 3.

See also: [LEFT$](#left), [MID$](m.md#mid), [STR$](s.md#str).

## LET

**Statement** · `[LET] variable=expression`

Works out the expression and puts its value in the variable. The word `LET`
can be left out, and almost always is: `A=5` is the same as `LET A=5`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *variable* | | Any variable or array element. An integer (`%`) variable takes the value rounded down and must stay within -32768 to 32767. |
| *expression* | | A value of the variable's type: a number, or a string for a `$` variable. |

```basic
LET A%=-1.5: B=A%*2: PRINT A%;B
```

```text
-2 -4
```

`A%` takes -1.5 rounded down, -2.

A string assigned to a numeric variable, or a number to a string variable,
gives `?TYPE MISMATCH ERROR`. Assigning to `TI` sets the clock, from 0 to
5183999 sixtieths of a second.

See also: [DIM](d.md#dim), [Numbers, strings and variables](../basic/variables.md),
[Time](../basic/time.md).

## LIST

**Statement** · `LIST [start][-[end]]`

Lists the program, or part of it, on the screen. String constants show in
the colors they were typed in. Each line is printed with a space before its
number.

| Form | Lists |
| --- | --- |
| `LIST` | The whole program. |
| `LIST n` | Line *n* only. |
| `LIST n-` | From line *n* to the end. |
| `LIST -m` | From the start to line *m*. |
| `LIST n-m` | Lines *n* to *m*. |

<!-- example: norun -->
```basic
10 REM ONE
20 REM TWO
30 REM THREE
```

<!-- example: with=previous -->
```basic
LIST 20-
```

```text
 20 REM TWO
 30 REM THREE
```

`LIST` ends at `READY.`, also in a program,
where it ends the run.

See also: [RUN](r.md#run), [NEW](n.md#new),
[Programming rules](../basic/rules.md).

## LOAD

**Statement** · `LOAD path`

Replaces the program in memory with a program saved on the SD card by
`SAVE`. All variables are cleared, as by `NEW`, and BASIC goes to `READY.`.
This also happens when a running program uses `LOAD`: the new program is
loaded, but it does not start until `RUN` is typed.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The program file. |

```basic
10 PRINT "HELLO"
SAVE "HELLO.BAS"
NEW
LOAD "HELLO.BAS"
LIST
```

```text
 10 PRINT "HELLO"
```

A file that does not exist gives `?FILE I/O ERROR` and leaves the program in
memory alone. A program too large for BASIC's memory also gives
`?FILE I/O ERROR`. `LOAD` uses file number 16 itself, so leave it closed.

See also: [SAVE](s.md#save), [RUN](r.md#run), [BLOAD](b.md#bload),
[Files and the SD card](../basic/files.md).

## LOG

**Function** · `LOG(number)`

Returns the natural logarithm of *number*, the power to which e (about
2.71828183) must be raised to give it. For the logarithm to base 10, divide
by `LOG(10)`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *number* | Greater than 0 | 0 or a negative number gives `?ILLEGAL QUANTITY ERROR`. |

```basic
PRINT LOG(10);INT(LOG(1000)/LOG(10)+.5)
```

```text
 2.30258509  3
```

See also: [EXP](e.md#exp), [SQR](s.md#sqr).
