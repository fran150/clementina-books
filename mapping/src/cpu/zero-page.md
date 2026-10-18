# Zero page

`$0000-$00FF` (0-255)

Zero page is the 6502's fast page: instructions reach it with one address
byte instead of two, and only zero page can hold the pointers that `(zp),Y`
and `(zp,X)` addressing use. Clementina splits it into three blocks, from
the bottom up:

```text
$00 ┌──────────────────────────┐
    │ BASIC                    │ 152 bytes
$98 ├──────────────────────────┤
    │ Programs                 │  72 bytes
$E0 ├──────────────────────────┤
    │ System: spare, WozMon,   │  32 bytes
    │ kernel                   │
$FF └──────────────────────────┘
```

Each block has one owner, so machine code always knows which bytes it may
touch.

## The rules

- **Machine code that returns to BASIC** (called with `SYS` or `USR`) uses
  `$98-$DF`. Those 72 bytes are never touched by BASIC, WozMon or the kernel,
  so a routine can also keep state there from one call to the next. Any
  other byte it borrows, it puts back before it returns.
- **A program that replaces BASIC** (loaded over it with `BRUN`) may also use
  BASIC's `$00-$97`. It still leaves `$E0-$FF` alone: the kernel's interrupt
  handler updates `KJIFFY` on every tick, and `KERN_LOAD` takes its
  parameters in `KPTR` and `KTMP`.
- **Nobody uses `$E0-$E7` yet.** It is the system's spare, kept next to the
  programs' block so it can be handed to programs later without splitting
  either block.

The rules are enforced where they can be. The ROM build fails if BASIC's
zero page grows past `$97`, and the kernel grows into its own spare bytes
(`$FC-$FF`) first and into `$E0-$E7` only after that.

## BASIC: `$00-$97`

BASIC is a fork of Microsoft BASIC for the 6502 (mist64/msbasic), so most of
its zero page will look familiar from the Commodore 64 or the Apple II,
though at different addresses. Every location is in the table at the end of
this chapter. These are the ones a program is most likely to read or change:

- **`USR` (`$0A-$0C`)** is a `JMP` instruction followed by its address.
  `USR(x)` jumps there with `x` already in the floating-point accumulator.
  Cold start points it at the `ILLEGAL QUANTITY` error. To use it, POKE your
  routine's address into `$0B` (low) and `$0C` (high). For a routine at
  `$0280` (640), in the free bytes of page 2:

  ```basic
  10 POKE 11,128:POKE 12,2:PRINT USR(5)
  ```

  `GOAYINT` (`$06`) and `GOGIVEAYF` (`$08`) hold the addresses of the
  routines that convert between the accumulator and a 16-bit integer, so a
  `USR` routine can read its argument and return a result.
- **The program pointers (`$33-$40`)**, `TXTTAB` to `MEMSIZ`, divide BASIC's
  workspace. [BASIC's workspace](basic-workspace.md) explains them.
  `MEMSIZ` (`$3F-$40`) is the one programs change: `POKE 63,lo:POKE 64,hi:
  CLEAR` lowers the top of BASIC's memory and frees the RAM above it.
- **`LINNUM` (`$11-$12`)** holds the 16-bit value of the last line number or
  address BASIC parsed: the number `GOTO`, `PEEK`, `POKE` and `SYS` act on.
- **`FAC` (`$69-$6E`) and `ARG` (`$71-$76`)** are the two floating-point
  accumulators: an exponent, four mantissa bytes and a sign byte. `USR`
  passes its argument and takes its result in `FAC`.
- **`VALTYP` (`$17`)** says what the last expression was: `$FF` for a string,
  `$00` for a number.
- **`CHRGET` (`$7B-$92`)** is code, not data. Cold start copies a 24-byte
  routine here that steps through the program text. `TXTPTR` (`$82-$83`),
  inside that routine, is the address of the character BASIC is reading;
  `CHRGET` (`$7B`) moves to the next non-space character and `CHRGOT`
  (`$81`) rereads the current one. A routine called with `SYS` that wants
  arguments after the address calls them through the
  [kernel jump table](jump-table.md#calling-basic-from-machine-code)'s
  `BAS_` entries rather than directly.
- **`RNDSEED` (`$93-$97`)** is the seed `RND` works from.

## Programs: `$98-$DF`

Seventy-two bytes, decimal 152 to 223, for programs. Nothing in the system
reads or writes them, at cold start or ever. The SDK's
`ZP_FREE_START`/`ZP_FREE_END` name the two ends.

## System: `$E0-$FF`

| Range | Owner | Use |
| --- | --- | --- |
| `$E0-$E7` | system | Spare. |
| `$E8-$EF` | WozMon | Its eight variables, used only while WozMon runs. They sit outside BASIC's block, so entering the monitor with `MON` and leaving with `Q` keeps the BASIC program and its variables. |
| `$F0-$FB` | kernel | Pointers, scratch and counters (below). |
| `$FC-$FF` | kernel | Spare. |

The kernel's bytes:

- **`KPTR` (`$F0-$F1`)** is the kernel's general pointer. `KERN_PRSTR` prints
  the string it points at, and `KERN_LOAD` takes its destination override
  here.
- **`KTMP` (`$F2-$F3`)** is scratch. `KERN_LOAD` takes its run address here
  when it jumps to the loaded program.
- **`KCNT` (`$F4-$F5`)** and **`KCHR` (`$F6`)** are scratch for screen fills
  and `CHROUT`.
- **`KJIFFY` (`$F7-$F8`)** counts the VIA Timer 1 interrupts: one more every
  6250 PHI2 cycles, 192 times a second at the default 1.2 MHz. It follows the
  CPU clock, so it measures CPU work, not time; `TI` and `TICKS` (MIA's
  clock) measure time. It wraps every 65,536 ticks and stops while
  interrupts are off. The interrupt can update it between two reads, so read
  the high byte, the low byte, then the high byte again, and start over if
  the high byte changed. Programs only read it.
- **`KLOAD_BANK`, `KLOAD_CHUNKLEN`, `KLOAD_SCRATCH` (`$F9-$FB`)** are
  `KERN_LOAD`'s working bytes.

## Every location

Generated from clementina-sdk's `specs/cpu-memory-map.json`, which the SDK
checks against the ROM build's symbols:

{{#include ../../../tables/cpu-memory-map.md:zero-page}}
