# Error messages

When BASIC cannot carry out a statement, it stops and prints an error
message: a question mark, the message, the word `ERROR` and, if a program was
running, `IN` and the line number.

```basic
10 PRINT "BEFORE"
20 PRINT 1/0
30 PRINT "AFTER"
```

```text
BEFORE

?DIVISION BY ZERO ERROR IN  20
READY.
```

An error always ends the program. It also stops background music, forgets
every open `FOR` loop and `GOSUB`, and makes `CONT` impossible. Variables keep
their values, so after an error you can `PRINT` them in direct mode to find
out what went wrong. Files stay open.

Clementina BASIC has no `ON ERROR`: a program cannot catch an error. It has to
check its values before it uses them, for example that a number is in range
before passing it to a statement, or that `EOF` is 0 before reading.

## The messages

{{#include ../../../tables/basic-errors.md}}

The codes are what BASIC's error routine receives, and they matter only to
machine code (see [Appendix B](../appendix/errors.md)).

## Common causes

**`?SYNTAX ERROR`** is the most common. Besides misspellings, look for:

- a variable name that holds a keyword: `SCORE` holds `OR`, `TOTAL` holds
  `TO` ([BASIC rules](rules.md));
- a line longer than two screen rows;
- a space in `BGET#`, `BPUT#` or `SEEK#` before the `#`;
- `READ` of a word into a numeric variable, which reports the error on the
  `DATA` line, not the `READ` line.

**`?ILLEGAL QUANTITY ERROR`** means an argument is out of range. Every
statement's ranges are in [the dictionary](../dictionary/index.md). Integer
variables (`A%`) also give it for values outside -32768 to 32767.

```basic
COLOR 16
```

```text
?ILLEGAL QUANTITY ERROR
```

**`?TYPE MISMATCH ERROR`** means a string where a number belongs, or the
reverse: `A$=5`, `PRINT "A"+1`, or a file path given as a number.

**`?OUT OF MEMORY ERROR`** comes either from a program that is too big, or
from too many nested `GOSUB`s, `FOR` loops or parentheses. A `GOSUB` that
jumps out of its subroutine with `GOTO` instead of `RETURN` leaves its entry
on the stack, and enough of them fill it.

**`?FILE I/O ERROR`** covers every SD card problem. Check that the card is in,
that the file exists in the current directory (`DIR`), and that the file
number is open.

**`?ILLEGAL DIRECT ERROR`** means `INPUT`, `GET` or `DEF` was typed outside a
program.

```basic
GET A$
```

```text
?ILLEGAL DIRECT ERROR
```

## BREAK

Pressing Ctrl-C while a program runs, or a `STOP` statement, stops the
program with `BREAK IN` and the line number. This is not an error: `CONT`
carries on from the next statement, as long as the program has not been
changed.

```basic
10 PRINT "ONE"
20 STOP
30 PRINT "TWO"
```

```text
ONE

BREAK IN  20
READY.
```

Typing `CONT` then prints `TWO`.

## Messages from INPUT

`INPUT` has two messages of its own, which do not stop the program:

- `?REDO FROM START`: a number was expected and something else was typed.
  `INPUT` asks for the whole line again. The current ROM has a bug here: it
  stops with `?SYNTAX ERROR` instead of showing this message.
- `?EXTRA IGNORED`: more values were typed than there are variables. The extra
  ones are dropped.
