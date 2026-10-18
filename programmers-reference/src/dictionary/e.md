# E

## END

**Statement** · `END`

Ends the program and returns to the `READY.` prompt without a message. It
also stops background music started with `TRACK` and `BAND`. `END` can appear
anywhere, any number of times; a program that runs off its last line ends
too, but leaves the music playing.

```basic
10 PRINT "BEFORE"
20 END
30 PRINT "NEVER PRINTED"
```

```text
BEFORE
```

Line 30 is never reached.

`CONT` after `END` goes on with the next statement.

See also: [STOP](s.md#stop), [CONT](c.md#cont), [BAND](b.md#band),
[Programming rules](../basic/rules.md).

## EOF

**Function** · `EOF(handle)`

Returns 1 when a read from an open file has used up its last byte, else 0.
Test it before each `BGET#`, because it turns to 1 as soon as the last byte
has been read. The handle is written without `#`. A number that is not open
gives 0 and no error.

| Argument | Range | Meaning |
| --- | --- | --- |
| *handle* | 1-16 | The file number given to `OPEN`. |

<!-- example: files=TWO.DAT:0102 -->
```basic
10 OPEN "TWO.DAT" FOR INPUT AS #1
20 PRINT EOF(1);: BGET#1,A
30 PRINT EOF(1);: BGET#1,A
40 PRINT EOF(1)
50 CLOSE #1
```

```text
 0  0  1
```

See also: [BGET#](b.md#bget), [FPOS](f.md#fpos), [FSIZE](f.md#fsize),
[Files and the SD card](../basic/files.md).

## EXP

**Function** · `EXP(number)`

Returns e, about 2.71828183, raised to the power *number*. It is the inverse
of `LOG`. An argument above about 88.03 gives a result too large for a number
and `?OVERFLOW ERROR`; a very negative one gives 0.

```basic
PRINT EXP(1);EXP(0);LOG(EXP(2))
```

```text
 2.71828183  1  2
```

See also: [LOG](l.md#log), [SQR](s.md#sqr),
[Expressions and operators](../basic/expressions.md).
