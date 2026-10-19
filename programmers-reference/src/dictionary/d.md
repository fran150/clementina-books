# D

## DATA

**Statement** · `DATA value[,value...]`

Holds a list of constants for `READ` to take. `READ` takes the values in the
order of the program, from the first `DATA` statement to the last, wherever
they are. When BASIC reaches a `DATA` statement while running the program,
it does nothing and goes on.

| Argument | Range | Meaning |
| --- | --- | --- |
| *value* | | A number or a string. A string in quotes can hold commas and colons; one without quotes ends at a comma or colon. |

`READ` past the last value gives `?OUT OF DATA ERROR`, and a string where
`READ` wants a number gives `?SYNTAX ERROR` in the `DATA` line. `RESTORE`
starts again from the first value. `CHRREAD`, `NTREAD` and the other `READ`
statements for graphics take their values from the same list.

```basic
10 FOR I=1 TO 3
20 READ N$,P: PRINT N$;P
30 NEXT
40 DATA APPLE,10,"PEAR, GREEN",25
50 DATA PLUM,7
```

```text
APPLE 10
PEAR, GREEN 25
PLUM 7
```

See also: [READ](r.md#read), [RESTORE](r.md#restore), [CHRREAD](c.md#chrread).

## DEF

**Statement** · `DEF FNname(variable)=expression`

Defines a function of one number, which the program then calls as `FNname`
anywhere an expression can go. The expression is worked out each time the
function is called, with *variable* set to the value in parentheses. The
variable of the same name outside the function is not changed.

| Argument | Range | Meaning |
| --- | --- | --- |
| *name* | | The function's name, written right after `FN`. Only two characters count, as with variables. |
| *variable* | | A simple numeric variable that stands for the argument. |
| *expression* | | A numeric expression. It can use other variables and functions. |

`DEF` works only in a program: in direct mode it gives
`?ILLEGAL DIRECT ERROR`. A string function, such as `FNA$`, gives
`?TYPE MISMATCH ERROR`. Calling a function before its `DEF` has run gives
`?UNDEFINED FUNCTION ERROR`.

```basic
10 DEF FNR(X)=INT(X*100+.5)/100
20 X=7
30 PRINT FNR(3.14159);FNR(2/3);X
```

```text
 3.14  .67  7
```

See also: [FN](f.md#fn), [Expressions and operators](../basic/expressions.md).

## DELAY

**Statement** · `DELAY milliseconds`

Waits the given number of milliseconds, measured by MIA's clock, then goes
on. Ctrl-C stops the wait and the program. Use `DELAY`, not an empty `FOR`
loop, whenever a program must wait.

| Argument | Range | Meaning |
| --- | --- | --- |
| *milliseconds* | 0-65535 | The time to wait. 0 does not wait. |

```basic
10 A=TICKS(0)
20 DELAY 500
30 PRINT TICKS(0)-A>=500
```

```text
-1
```

See also: [TICKS](t.md#ticks), [Time](../basic/time.md).

## DIM

**Statement** · `DIM array(dimensions)[,array...]`

Creates arrays. The number for each dimension is its highest subscript, and
subscripts start at 0, so `DIM A(10)` has eleven elements. An array can have
several dimensions, and one `DIM` can create several arrays. The elements
start at 0, or at the empty string in a string array.

| Argument | Range | Meaning |
| --- | --- | --- |
| *array* | | The name of a numeric, integer (`%`) or string (`$`) array. |
| *dimensions* | 0-32767 | The highest subscript of each dimension, separated by commas. |

An array used without `DIM` is created with highest subscript 10 in every
dimension. A subscript beyond the highest gives `?BAD SUBSCRIPT ERROR`.
`DIM` on an array that already exists, even one created by use, gives
`?REDIM'D ARRAY ERROR`; only `CLEAR` or `RUN` removes arrays. An array too
big for memory gives `?OUT OF MEMORY ERROR`.

```basic
10 DIM G%(39,24),N$(2)
20 G%(39,24)=7: N$(2)="LAST"
30 PRINT G%(39,24);N$(2)
40 DIM N$(5)
```

```text
?REDIM'D ARRAY ERROR IN  40
```

Line 30 prints ` 7 LAST`; line 40 stops the program.

An integer array (`%`) takes two bytes an element instead of five; `G%`
above takes 2,000 bytes for its 1,000 elements.

See also: [CLEAR](c.md#clear), [Numbers, strings and variables](../basic/variables.md).

## DIR

**Statement** · `DIR [path]`

Lists the files of the current directory, or of the directory *path* names,
one name a line. A directory's name ends with `/`. Sizes and dates are not
shown; `FSTAT` reads them.

| Argument | Range | Meaning |
| --- | --- | --- |
| *path* | | The directory to list. Left out, the current directory. |

`DIR` does not change the current directory. A directory that does not exist
gives `?FILE I/O ERROR`.

```basic
MKDIR "MUSIC"
BSAVE "MUSIC/SONG.PRG",640,4
DIR "MUSIC"
```

```text
SONG.PRG
```

See also: [CD](c.md#cd), [FSTAT](f.md#fstat), [MKDIR](m.md#mkdir),
[Files and the SD card](../basic/files.md).

## DISKFREE

**Function** · `DISKFREE(volume)`

Returns the number of free bytes on the SD card. *volume* must be 0, the
current card, because a Microsoft BASIC function needs an argument.

| Argument | Range | Meaning |
| --- | --- | --- |
| *volume* | 0 | Always 0. |

```basic
PRINT DISKFREE(0)>100000
```

```text
-1
```

Free space can be larger than 4 GiB, so keep it in a floating-point
variable, not an integer one.

See also: [FSTAT](f.md#fstat), [FSIZE](f.md#fsize),
[Files and the SD card](../basic/files.md).
