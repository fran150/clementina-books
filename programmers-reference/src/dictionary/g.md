# G

## GATE

**Statement** · `GATE voice,enabled`

Releases a voice's note (0), so that it fades over its release time, or holds
it on again (any other value) without a new attack. `NOTE` is what starts a
note from its attack.

| Argument | Range | Meaning |
| --- | --- | --- |
| *voice* | 0-3 | The voice. |
| *enabled* | 0-255 | 0 releases the note; any other value holds it on. |

```basic
10 SNDON: WAVE 3,4: FREQ 3,800: ADSR 3,0,2,0,3
20 GATE 3,1: DELAY 30: GATE 3,0
```

plays a short noise drum.

See also: [NOTE](n.md#note), [ADSR](a.md#adsr), [FREQ](f.md#freq),
[Sound](../basic/sound.md).

## GET

**Statement** · `GET variable[,variable...]`

Waits for a key for each variable and stores it there, without printing it.
A string variable gets the key as a one-character string. A numeric variable
accepts only a digit key, and gets its value.

<!-- example: keys="Y" -->
```basic
10 PRINT "PRESS A KEY"
20 GET K$
30 PRINT "YOU PRESSED ";K$
```

```text
PRESS A KEY
YOU PRESSED Y
```

With a numeric variable, pressing 7 here:

<!-- example: keys="7" -->
```basic
10 GET N
20 PRINT N*2
```

```text
 14
```

Any other key for a numeric variable gives `?SYNTAX ERROR`, with no line
number. `GET` works only in a program; as a direct command it gives
`?ILLEGAL DIRECT ERROR`.

Unlike the Commodore 64's, Clementina's `GET` waits for a key. While a
program runs, BASIC throws away keys typed between statements, so only a key
pressed while `GET` waits reaches it. To read keys without stopping, use
`KEYDOWN`.

See also: [INPUT](i.md#input), [KEYDOWN](k.md#keydown),
[KEYCLEAR](k.md#keyclear), [Text and the screen](../basic/text.md),
[Input](../basic/input.md).

## GO

**Statement** · `GO TO line`

`GO TO` is `GOTO` written as two words. It does the same thing. There is no
`GO SUB`; it gives `?SYNTAX ERROR`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *line* | 0-63999 | The line to jump to. |

```basic
10 GO TO 30
20 PRINT "SKIPPED"
30 PRINT "HERE"
```

```text
HERE
```

See also: [GOTO](#goto).

## GOSUB

**Statement** · `GOSUB line`

Calls a subroutine: jumps to *line* and remembers where it came from. The
next `RETURN` goes back to the statement after the `GOSUB`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *line* | 0-63999 | The first line of the subroutine. |

```basic
10 FOR I=1 TO 3: GOSUB 100: NEXT
20 END
100 PRINT I;: RETURN
```

```text
 1  2  3
```

A line that does not exist gives `?UNDEF'D STATEMENT ERROR`. Subroutines can
call others, but nesting too deep, as in a subroutine that calls itself
without end, gives `?OUT OF MEMORY ERROR`.

See also: [RETURN](r.md#return), [ON](o.md#on), [GOTO](#goto).

## GOTO

**Statement** · `GOTO line`

Jumps to *line* and goes on from there. Typed as a direct command, it starts
the program at that line without clearing the variables, unlike `RUN`.

| Argument | Range | Meaning |
| --- | --- | --- |
| *line* | 0-63999 | The line to jump to. |

```basic
10 N=N+1: PRINT N;
20 IF N<5 THEN GOTO 10
30 PRINT "DONE"
```

```text
 1  2  3  4  5 DONE
```

A line that does not exist gives `?UNDEF'D STATEMENT ERROR`.

See also: [GO](#go), [GOSUB](#gosub), [IF](i.md#if), [ON](o.md#on),
[RUN](r.md#run).
