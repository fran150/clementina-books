# Mixing BASIC and machine language

The usual way to use machine language on Clementina is together with BASIC:
BASIC for the parts that are easy to write, machine code for the parts that
must be fast. This chapter shows how the two work together.

## Loading machine code

Machine code is kept on the SD card in **PRG** files, the format of the
Commodore 64: two bytes of load address, low byte first, then the code. The
SDK writes them; `BSAVE` writes them from memory. Three statements load them:

| Statement | Effect |
| --- | --- |
| `BLOAD "file"` | Load at the address in the file's header and return to BASIC. |
| `BLOAD "file",address` | Load at *address* instead. |
| `BRUN "file"` | Load at the header's address and jump to the first byte. BASIC does not come back. |
| `BRUN "file",address` | Load, then jump to *address*. |

Bytes that fall at `$8000-$BFFF` go to the bank chosen with `BANK`, and a file
that runs past `$BFFF` continues at `$8000` of the next bank
([Extended RAM and banking](banking.md)). Only `$C000` and up, where there is
no RAM, is refused. Nothing else is checked, so the program decides where its
code can go safely.

## Where machine code can go

Code that **returns to BASIC** must leave BASIC, its program and its
variables intact. There are three places for it:

| Where | Size | Notes |
| --- | --- | --- |
| `$0280-$02F7` | 120 bytes | Free. Nothing in the system writes here. |
| Banks 1-31 at `$8000-$BFFF` | 16 KiB each | Free. `SYS` maps the bank while the code runs. |
| The top of BASIC's memory | As much as needed | After moving BASIC's top down. |

To make room at the top of BASIC's memory, lower `MEMSIZ` (`$3F-$40`, 63-64)
and run `CLEAR`, first thing in the program:

```basic
10 POKE 63,0: POKE 64,176: CLEAR
20 PRINT FRE(0)
```

```text
 19514
```

This gives `$B000-$BFFF`, 4 KiB, to machine code until the next cold start.

Code that **takes over the machine** and never returns to BASIC can use
everything from `$1600` up: BASIC's code and memory included. The kernel below
`$1600` must stay, because it does the loading. The SDK's templates load
programs at `$1800`. Such a program is started with `BRUN`. Once it has
overwritten BASIC, there is no BASIC to return to. It runs until the machine
is switched off: a reset of the 6502 restarts the kernel and BASIC already in
RAM, which the program has overwritten. Only MIA, when it starts, copies them
in again.

## Calling machine code: SYS

`SYS address` calls the code at *address* with `JSR`. When the code returns
with `RTS`, BASIC goes on with the next statement. If the address is in
`$8000-$BFFF`, `SYS` maps the bank chosen with `BANK` before the call and bank
0 after it.

The code may change A, X and Y and the flags. It must:

- leave the stack as it found it, so its `RTS` returns to BASIC;
- use only zero page `$98-$DF`, or save and restore whatever else it uses;
- return with bank 0 mapped at `$8000-$BFFF`, if it switched banks itself;
- leave the interrupts as BASIC needs them ([Interrupts](interrupts.md)).

### Passing values with SYS

After `SYS` reads its address, BASIC's text pointer stays where it stopped, so
the routine can read more arguments from the same statement with the `BAS_`
entries of the kernel. This routine reads two numbers, `SYS 640,a,b`, and
prints their sum:

<!-- example: org=$0280 prg=ADD.PRG run="BLOAD \"ADD.PRG\"|SYS 640,20,22|SYS 640,250,6+1" -->
```asm
.include "clementina.inc"
FIRST = $98

        jsr BAS_CHKCOM          ; skip the comma after the address
        jsr BAS_GETBYT          ; first number, 0-255, into X
        stx FIRST
        jsr BAS_CHKCOM
        jsr BAS_GETBYT          ; second number into X
        txa
        clc
        adc FIRST
        tax                     ; low byte of the sum
        lda #0
        adc #0                  ; high byte: the carry
        jmp BAS_LINPRT          ; print A (high) and X (low)
```

```text
SYS 640,20,22
 42
READY.
SYS 640,250,6+1
 257
READY.
```

The arguments can be any expressions, and `BAS_GETBYT` gives
`?ILLEGAL QUANTITY ERROR` for values outside 0-255, as a BASIC statement
would. `BAS_FRMNUM` and `BAS_GETADR` read a number up to 65535 instead; the
[kernel](kernel.md#calling-basic) lists them all. A routine reads its arguments
with these entries, or skips them, but must not leave unread arguments
behind: BASIC would then find a comma where it expects the next statement,
and stop with `?SYNTAX ERROR`.

### Raising errors

`BAS_ERROR` stops with a BASIC error, as if a statement had failed. Load X
with the error's code from [Appendix B](../appendix/errors.md): `LDX #53`,
`JMP BAS_ERROR` gives `?ILLEGAL QUANTITY ERROR`. It maps bank 0 back first, so
code running in another bank can use it.

## Functions: USR

`USR(x)` calls machine code as a function: the code receives *x* in BASIC's
floating-point accumulator, `FAC`, and leaves the result there. The address of
the code is in the `USR` vector, a `JMP` instruction at `$0A-$0C`: the address
goes in `$0B` (low) and `$0C` (high). Until a program sets it, `USR` gives
`?ILLEGAL QUANTITY ERROR`.

Two more vectors help convert numbers: `GOAYINT` (`$06-$07`) holds the address
of BASIC's routine that converts `FAC` to a 16-bit integer, and `GOGIVEAYF`
(`$08-$09`) the address of the routine that converts the signed integer in A
(high) and Y (low) into `FAC`. This function returns its argument times two:

<!-- example: org=$0280 prg=TWICE.PRG run="BLOAD \"TWICE.PRG\"|POKE 11,128: POKE 12,2|PRINT USR(21);USR(20000)" -->
```asm
.include "clementina.inc"
GOGIVEAYF = $08
VALUE = $98

        jsr BAS_GETADR          ; FAC to 16 bits: A high, Y low
        sty VALUE
        asl VALUE               ; times two
        rol a
        ldy VALUE
        jmp (GOGIVEAYF)         ; A/Y into FAC, and return to BASIC
```

```text
 42 -25536
```

`POKE 11,128: POKE 12,2` points the vector at `$0280`. `BAS_GETADR` accepts
0-65535 and gives `?ILLEGAL QUANTITY ERROR` for anything else. The result
goes back as a signed 16-bit number, so 40000 comes out as -25536, as the
second value shows.

## Strings and variables

`BAS_PTRGET` finds a variable by its name in the program text and returns the
address of its value, so a routine can read or change a BASIC variable
directly: `SYS 640,A` lets the routine call `BAS_CHKCOM` and `BAS_PTRGET` to
reach `A`. A floating-point variable's value is five bytes, an integer
variable's two (high byte first), and a string variable's three: the length,
then the address of the characters. How BASIC lays out its variables is in
*Mapping Clementina*, [BASIC's workspace](../../../mapping/src/cpu/basic-workspace.md).

## Returning for good

A program started with `BRUN` that has left BASIC's code and memory alone
(one loaded in a free bank, for example) can end with:

- `JMP KERN_WARMSTART` to return to `READY.` with BASIC's program kept;
- `JMP KERN_COLDSTART` to restart BASIC with no program;
- `JMP KERN_WOZMON` to go to the monitor.
