# The kernel jump table

`$0400-$044D` (1024-1101)

The jump table is the kernel's fixed interface. Each entry is a three-byte
`JMP` to a routine, and the entries never move: a program calls
`KERN_CHROUT` at `$0406` today and in every later build, wherever the routine
behind it ends up. Everything else in the kernel, BASIC and WozMon moves
from build to build, so programs call the system only through this table.

The table is the first thing in the loaded image, so it always starts at
`$0400`. It has 26 entries: 18 kernel calls (`KERN_`) and, at the end, 8
entries into BASIC (`BAS_`).

{{#include ../../../tables/kernel-abi.md}}

## How the table grows

New calls are added at the end, never in between, and existing entries are
never reordered or removed. Adding one moves only what follows the table
(`DIR_NAME_BUF`, the kernel code and BASIC), so programs built for an older
table keep working. The SDK's drift check compares the table in its specs
with the ROM build.

## Registers and flags

Most entries take their input in `A`, `X`, `Y` or the carry flag, as the
table says. A few take it in zero page: `KERN_PRSTR` prints the string at
`KPTR` (`$F0`), and `KERN_LOAD` reads `KPTR` and `KTMP` (`$F2`). Unless an
entry says it preserves them, assume `A`, `X` and `Y` come back changed.
`KERN_CHROUT` and `KERN_CHROUT_GLYPH` preserve all three, so they can be
called in the middle of a loop.

`KERN_RDTIM` and `KERN_SETTIM` talk to MIA through its command registers,
which an interrupt handler may be using, so they are for the main program
only.

## Calling BASIC from machine code

Machine code that BASIC calls with `SYS` or `USR` can use BASIC's own
routines to read arguments, print numbers and raise errors, through the
`BAS_` entries. They stay at the same address in every build, like the rest
of the table. The routines behind them are part of BASIC, so they work only
while BASIC is in memory, not in a program that has loaded over it.

`SYS` leaves `TXTPTR` just past the address, so a routine can read arguments
written after it on the same line. For `SYS 640,10,4660`:

```asm
BAS_CHKCOM = $0436
BAS_FRMNUM = $0439
BAS_GETADR = $043F
BAS_GETBYT = $0442

        jsr BAS_CHKCOM          ; skip the comma
        jsr BAS_GETBYT          ; X = 10
        stx count
        jsr BAS_CHKCOM
        jsr BAS_FRMNUM          ; FAC = 4660
        jsr BAS_GETADR          ; Y = low, A = high (also in LINNUM)
        sty addr
        sta addr+1
        rts                     ; BASIC goes on with the rest of the line
```

If an argument is missing or out of range, these routines raise the BASIC
error themselves and never return. `BAS_ERROR` raises any error by its code.
Every error maps extended RAM bank 0 back first, so a routine running in
another bank can raise one safely.

`USR(x)` hands over its argument in `FAC` (`$69`) instead. Zero page also
holds four older entry points that stay put: `GOSTROUT` (`$03`), `GOAYINT`
(`$06`), `GOGIVEAYF` (`$08`) and `USR` (`$0A`); see [Zero page](zero-page.md).

## Taking over the IRQ

At reset the kernel starts VIA Timer 1, points the IRQ vector (`$FFFE`) at
its handler and enables interrupts. The handler runs 192 times a second at
the default 1.2 MHz and takes 65-73 cycles a tick, about 1% of the CPU. It
counts `KJIFFY`, blinks the cursor while the kernel waits for a key, and
read-clears MIA's interrupt status. This keeps running after a program
replaces BASIC.

A program has four choices:

- **Leave it.**
- **Change its rate.** Timer 1 reloads from its latch (`$C006-$C007`) every
  period, so a new value takes effect from the next one.
  `POKE 49158,212:POKE 49159,48` sets 12,500 cycles and halves the rate.
  `KJIFFY` and the cursor blink slow down with it; `TI` and key repeat come
  from MIA and don't.
- **Stop it.** Write `$40` to the VIA's `IER` (`$C00E`) to turn off only
  Timer 1's interrupt, or `SEI` to mask every interrupt.
- **Chain to it.** Point the IRQ vector at your own handler, which does its
  work, restores `A`, `X` and `Y` to their values at entry and ends with
  `JMP KERN_IRQ` (`$042A`). The kernel's handler then saves them again, does
  its own work and returns with `RTI`.

Two rules for a chained handler:

- To see MIA's interrupt flags, read `IRQ_STATUS_H` (`$FFF1`) and then
  `IRQ_STATUS_L` (`$FFF0`) before chaining, because the kernel's handler
  clears them.
- If it uses MIA's index windows or `CFG_SELECT`, bracket that work with
  `MIA_CTX` (`$FFF5`): write `$01` before and `$02` after, as the kernel
  does, so the code it interrupted finds MIA as it left it.

Write the vector with interrupts masked, since an interrupt between the two
stores would jump to half an address. Put the kernel's handler back before
returning to BASIC with `RTS`, or the vector may point into memory BASIC
reuses. Reset and warm start (`KERN_WARMSTART`, WozMon's `Q`) put it back
for you, and they also restart Timer 1 at 6250 with only its interrupt
enabled. [I/O and the VIA](io.md#using-another-via-interrupt) has a complete
example that chains a handler for the VIA's CA1 input.
