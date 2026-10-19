# I

## IF

**Statement** · `IF condition THEN line|statement | IF condition GOTO line`

Tests a condition. When it is true, `IF` jumps to a line or runs the rest of
its own line. When it is false, the rest of the line is skipped and the
program goes on with the next line.

| Argument | Range | Meaning |
| --- | --- | --- |
| *condition* | | A number: 0 is false, anything else is true. Comparisons give -1 (true) or 0 (false). |
| *line* | 0-63999 | After `THEN` or `GOTO`: the line to jump to. |
| *statement* | | After `THEN`: the statements to run, up to the end of the line. |

```basic
10 X=5
20 IF X>3 THEN PRINT "BIG": PRINT "VERY"
30 IF X>9 THEN PRINT "HUGE": PRINT "NO"
40 IF X=5 GOTO 60
50 PRINT "SKIPPED"
60 PRINT "END"
```

```text
BIG
VERY
END
```

There is no `ELSE`: everything after `THEN` on the same line belongs to the
true case. `AND`, `OR` and `NOT` join several conditions. To test a string,
compare it: `IF A$="Y" THEN ...`.

See also: [GOTO](g.md#goto), [ON](o.md#on),
[Expressions and operators](../basic/expressions.md).

## INPUT

**Statement** · `INPUT [prompt;] variable[,variable...]`

Prints the prompt, if there is one, and a question mark, then lets the user
type a line in the screen editor. When RETURN is pressed, the values on the
line, separated by commas, are put in the variables.

| Argument | Range | Meaning |
| --- | --- | --- |
| *prompt* | | A string in quotes, followed by a semicolon. `? ` is printed after it. |
| *variable* | | A numeric or string variable for each value. |

<!-- example: keys="BOB\r" -->
```basic
10 INPUT "YOUR NAME";N$
20 PRINT "HELLO ";N$
```

```text
YOUR NAME? BOB
HELLO BOB
```

If the line has too few values, `INPUT` asks for the rest with `??`. If it
has too many, the extra ones are dropped and `?EXTRA IGNORED` is printed. A
comma always separates values, so a string with a comma loses everything from
the comma on. An empty line stops the program quietly; `CONT` continues it.

<!-- example: keys="1\r2\r" -->
```basic
10 INPUT A,B
20 PRINT A+B
```

```text
? 1
?? 2
 3
```

`INPUT` works only in a program; as a direct command it gives
`?ILLEGAL DIRECT ERROR`.

See also: [GET](g.md#get), [READ](r.md#read),
[Text and the screen](../basic/text.md).

## INPUTDEV

**Function** · `INPUTDEV(dummy)`

Returns what MIA reports as connected right now, as a sum of these values:

| Value | Device |
| ---: | --- |
| 1 | Keyboard. |
| 2 | Consumer keys (volume, play and so on). |
| 4 | Mouse. |
| 8, 16, 32, 64 | Gamepad 0, 1, 2, 3. |

| Argument | Range | Meaning |
| --- | --- | --- |
| *dummy* | 0 | Must be 0, or `?ILLEGAL QUANTITY ERROR`. |

```basic
10 IF INPUTDEV(0) AND 4 THEN PRINT "MOUSE READY"
20 IF INPUTDEV(0) AND 8 THEN PRINT "GAMEPAD 0 READY"
```

The console sends text only, so with it as the source the value is 0.

See also: [INPUTMODE](#inputmode), [PADON](p.md#padon), [MOUSE](m.md#mouse),
[Input](../basic/input.md).

## INPUTMODE

**Statement** · `INPUTMODE mode`

Chooses where keys, the mouse and gamepads come from.

| Argument | Range | Meaning |
| --- | --- | --- |
| *mode* | 0-2 | 0 the console (MIA's USB serial line, text only), 1 the video client over Wi-Fi, 2 a USB keyboard. |

A source that MIA does not report as available gives
`?ILLEGAL QUANTITY ERROR`. No current MIA firmware offers mode 2.

```basic
10 INPUTMODE 0
20 PRINT "KEYS NOW COME FROM THE CONSOLE"
```

See also: [INPUTDEV](#inputdev), [Input](../basic/input.md).

## INT

**Function** · `INT(number)`

Returns the largest whole number that is not greater than *number*. For a
positive number that drops the fraction; a negative number goes down, away
from zero.

```basic
PRINT INT(2.7);INT(-1.5);INT(-0.1)
```

```text
 2 -2 -1
```

To round to the nearest whole number, use `INT(X+.5)`.

See also: [ABS](a.md#abs), [SGN](s.md#sgn),
[Numbers, strings and variables](../basic/variables.md).
