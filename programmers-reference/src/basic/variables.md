# Numbers, strings and variables

BASIC has three types of value: floating-point numbers, 16-bit integers and
strings. A variable's name says which type it holds.

## Numbers

Every number BASIC computes with is a **floating-point** number, stored in
five bytes: a one-byte exponent and a 32-bit mantissa. That gives about nine
significant digits and a range of about ±1.70141183E+38. BASIC prints up to
nine digits and switches to E notation for very large and very small values:

```basic
PRINT 1/3, 2^31, 123456789
```

```text
 .333333333    2.14748365E+09
   123456789
```

A positive number prints with a leading space, where a negative one has its
minus sign, and every number is followed by a space.

A result larger than the range gives `?OVERFLOW ERROR`; a result too small to
represent becomes 0. Whole numbers up to 2^32 (4,294,967,296) are exact, which
is why file positions and sizes up to 4 GiB come back exactly (see
[Files and the SD card](files.md)). Decimal fractions such as 0.1 are not
exact, so compare computed values with a tolerance rather than with `=`.

### Writing numbers

A number is written in decimal (`42`, `-3.5`, `1E6`, `.25`) or in
**hexadecimal** with a `$` and one to six hex digits: `$C000` is 49152 and
`$3FFFF` is 262143. Hex is handy for addresses:

```basic
PRINT $FF, $C000, $14000
```

```text
 255           49152         81920
```

The tokenizer keeps the digits after `$` exactly as typed, so `$CD00` never
hides the keyword `CD`. A `$` right after a letter or digit is part of a
string variable's name instead (`A$`). A seventh digit, a value past
`$FFFFFF`, gives `?OVERFLOW ERROR`. `VAL` does not understand `$`; hex works
only in program text.

## Strings

A string is a sequence of up to 255 characters. String constants are written
in double quotes: `"HELLO"`. There is no way to put a double quote inside a
constant; use `CHR$(34)`.

Strings are joined with `+`, and taken apart with `LEFT$`, `MID$` and
`RIGHT$`. `LEN` gives the length, `ASC` and `CHR$` convert between a character
and its code, and `STR$` and `VAL` between numbers and text. A result longer
than 255 characters gives `?STRING TOO LONG ERROR`.

Clementina strings also remember a color and display style for every
character. That is described in [Styled strings](styled-strings.md); it does
not change how strings are compared, measured or sliced.

## Variable names

A variable name starts with a letter and may continue with letters and digits.
A suffix gives its type:

| Type | Suffix | Example | Holds |
| --- | --- | --- | --- |
| Floating point | none | `A`, `X1`, `SPEED` | Any number. |
| Integer | `%` | `A%`, `N1%` | A whole number from -32768 to 32767. |
| String | `$` | `A$`, `NAME$` | Up to 255 characters. |

The rules that trip people up:

- **Only the first two characters count.** `SPEED` and `SPIN` are the same
  variable, `SP`. Longer names are allowed and kept in the listing, but BASIC
  sees only two characters.
- **A name cannot contain a keyword.** `SCORE` holds `OR`, `FORM` holds `FOR`,
  `TOTAL` holds `TO`. Such a line gives `?SYNTAX ERROR` or, worse, means
  something else. Two-letter names, or a letter and a digit, avoid the
  problem.
- **Each type has its own names.** `A`, `A%`, `A$` and the arrays `A()`,
  `A%()` and `A$()` are six different variables.
- **`TI` is the clock.** `TI` (and so `TIME`, since only `TI` counts) is not
  an ordinary variable: reading it gives MIA's 60 Hz clock and assigning it
  sets the clock (see [Time](time.md)). `TI%` and `TI$` are ordinary variables;
  unlike the Commodore 64, `TI$` is not a clock string.
- **Variables start at zero.** A numeric variable that has not been assigned
  is 0, and a string variable is the empty string `""`.

An integer variable saves memory in an array (two bytes an element instead
of five), but BASIC still computes in floating point, converting on every
assignment. Assigning a value outside -32768 to 32767 to an integer variable
gives `?ILLEGAL QUANTITY ERROR`; a fraction is rounded down (`A%=-1.5` stores
-2).

## Arrays

`DIM` creates an array. The number in parentheses is the **highest
subscript**, and subscripts start at 0, so `DIM A(10)` has eleven elements.

```basic
10 DIM N(9), W$(4), G%(39,24)
20 FOR I=0 TO 9: N(I)=I*I: NEXT
30 PRINT N(9)
```

- An array can have several dimensions: `G%(39,24)` is a 40 by 25 grid.
- Using an array without `DIM` creates it with highest subscript 10 in every
  dimension it is used with.
- A subscript past the highest one gives `?BAD SUBSCRIPT ERROR`; `DIM` on an
  array that already exists, including one created by use, gives
  `?REDIM'D ARRAY ERROR`. `CLEAR` and `RUN` remove all arrays.

## Memory

BASIC's workspace, from the end of BASIC's own code up to `$BFFF`, holds
everything a program creates, in this order from the bottom:

```text
TXTTAB   program text         grows up as lines are added
VARTAB   simple variables      7 bytes each
ARYTAB   arrays                header plus 5, 2 or 3 bytes an element
STREND   free memory
FRETOP   strings               grow down from the top
MEMSIZ   end of the workspace  $C000
```

A simple variable takes seven bytes: two for the name and five for the value
(a string variable keeps a three-byte **descriptor** there, the length and
the address of the characters). The characters of a string built while the
program runs (by `+`, `LEFT$`, `INPUT` and so on) live in the **string heap**
at the top. A string constant assigned straight from the program,
`A$="HELLO"`, is not copied: its descriptor points into the program text.

Every change to a string variable allocates a new copy in the heap, and the
old one becomes garbage. When the heap meets the arrays, BASIC **collects the
garbage**, moving the live strings together. This can pause a program for a
moment when there are many strings. `FRE(0)` forces a collection and returns
the free bytes:

```basic
PRINT FRE(0)
```

prints ` 23645` with no program loaded. The value is a signed 16-bit number,
so it would read negative above 32767; the workspace is smaller than that.

When the program, variables, arrays and strings no longer fit, BASIC stops
with `?OUT OF MEMORY ERROR`. The same message appears when `GOSUB`, `FOR` and
parentheses nest too deeply for the 6502's stack.

### Reserving memory

A program that wants a block of CPU RAM for machine code or data can move the
top of the workspace down. `MEMSIZ` is at `$3F-$40` (63-64), low byte first:

```basic
POKE 63,0: POKE 64,176: CLEAR
```

moves the top to `$B000`, leaving `$B000-$BFFF` (4 KiB) to the program until
the next cold start. `CLEAR` must follow, because it rebuilds the string heap
under the new top; it also erases all variables, so do this first thing in a
program. Clementina spells the statement `CLEAR`, not the Commodore 64's
`CLR`. Other places for machine code, and why `$8000-$BFFF` needs care, are in
[Mixing BASIC and machine language](../ml/mixing.md).
