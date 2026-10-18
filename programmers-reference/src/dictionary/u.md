# U

## USR

**Function** · `USR(value)`

Calls a machine-code routine and returns a number from it. *value* is put
in BASIC's floating-point accumulator, `FAC`, and the routine is reached
through a `JMP` instruction at `$0A` in zero page: bytes `$0B` and `$0C` hold
the routine's address, low byte first. The routine ends with `RTS`, and the
number it leaves in `FAC` is the result.

| Argument | Range | Meaning |
| --- | --- | --- |
| *value* | | Any expression, passed in `FAC`. |

Until a program sets the address, `USR` gives `?ILLEGAL QUANTITY ERROR`:

```basic
PRINT USR(5)
```

```text
?ILLEGAL QUANTITY ERROR
```

This routine at 640 (`$0280`) returns 42. It loads 42 into `Y` and 0 into
`A`, and jumps through `GOGIVEAYF` at `$08`, BASIC's routine that turns the
number in `A` (high byte) and `Y` (low byte) into `FAC` and returns:

```basic
10 FOR I=0 TO 6: READ B: POKE 640+I,B: NEXT
20 DATA 160,42,169,0,108,8,0
30 POKE 11,128: POKE 12,2
40 PRINT USR(0)
```

```text
 42
```

See also: [SYS](s.md#sys), [DEF](d.md#def),
[Mixing BASIC and machine code](../ml/mixing.md).
