# Time

MIA keeps two clocks, counted by its own hardware timer. They run at the same
speed whatever the 6502's clock speed and however busy a program is.

| Clock | Counts | Range |
| --- | --- | --- |
| `TI` | Sixtieths of a second. | 0 to 5,183,999, then back to 0: one day. |
| `TICKS(0)` | Milliseconds since MIA started. | 0 to 4,294,967,295, then back to 0: about 49.7 days. |

`TI` reads like a variable and can be set like one; `TICKS(0)` can only be
read (the 0 is required). Both keep counting through `RUN`, `NEW` and the
`READY.` prompt, and start again from 0 only when MIA itself restarts.

## Waiting

`DELAY n` waits *n* milliseconds, from 0 to 65535. Ctrl-C stops it like any
statement.

<!-- example: cycles=8000000 -->
```basic
10 FOR I=3 TO 1 STEP -1
20 PRINT I: DELAY 1000
30 NEXT
40 PRINT "GO!"
```

```text
 3
 2
 1
GO!
```

Use `DELAY`, not an empty `FOR` loop, whenever a program needs to wait for
a length of time: a `FOR` loop's speed depends on the 6502's clock and on what
else the program does.

## Measuring time

Set `TI` to 0, do the work, and read it:

```basic
10 TI=0
20 FOR I=1 TO 1000: NEXT
30 PRINT "1000 LOOPS IN";TI/60;"SECONDS"
```

For shorter times `TICKS(0)` is finer. Take a reading before and after:

```basic
10 A=TICKS(0)
20 DELAY 250
30 PRINT TICKS(0)-A;"MS"
```

Readings are taken when BASIC reaches the function, so a measurement includes
a little of BASIC's own time.

When a measurement may cross the point where a clock goes back to 0, add the
clock's range to a negative difference: 5184000 for `TI`, 4294967296 for
`TICKS`.

## Time of day

Clementina has no battery clock. To show the time of day, set `TI` from the
user once, and work out the hours, minutes and seconds from it:

<!-- example: keys="13,45\r" cycles=8000000 -->
```basic
10 INPUT "HOUR, MINUTE";H,M
20 TI=(H*60+M)*3600
30 T=INT(TI/60)
40 CRSR 30,0: PRINT RIGHT$(STR$(100+INT(T/3600)),2);":";
50 PRINT RIGHT$(STR$(100+INT(T/60)-INT(T/3600)*60),2);":";
60 PRINT RIGHT$(STR$(100+T-INT(T/60)*60),2)
70 DELAY 500: GOTO 30
```

`TI` wraps to 0 at midnight, so the clock keeps the right time of day. Unlike
the Commodore 64, there is no `TI$`: `TI$` is an ordinary string variable.

## Timing machine code

The kernel also counts the interrupts from the 6502's VIA timer in `KJIFFY`.
That count depends on the CPU clock, so it measures work, not time. Machine
code reads MIA's clocks through the kernel instead; see Part III,
[Time](../mia/time.md).
