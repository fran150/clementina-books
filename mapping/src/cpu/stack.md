# The stack

`$0100-$01FF` (256-511)

Page 1 is the 6502's hardware stack. `JSR`, interrupts and `PHA`/`PHP`/
`PHX`/`PHY` push onto it, and the stack pointer `S` counts down from the top
of the page.

## Who uses it

- **Cold start** sets `S = $FF`, so the first push lands at `$01FF`.
- **BASIC** resets the stack whenever it starts or recovers: its cold start
  sets `S = $FB`, and warm start (`KERN_WARMSTART`) and `STKINI`, which runs
  on every `RUN`, `CLEAR` and error, set `S = $FC`. From then on BASIC's
  pushes reach `$01FC` at most.
- **`FOR` and `GOSUB`** keep their bookkeeping on the stack, as on every
  Microsoft BASIC. Each `FOR` pushes 18 bytes (the text pointer, line number,
  loop variable's value and address, step and its sign, and the `FOR`
  token); each `GOSUB` pushes 5 (the text pointer, line number and the
  `GOSUB` token). Before pushing, BASIC checks the room left and stops with
  `OUT OF MEMORY` rather than overrun the page.
- **Machine code called with `SYS` or `USR`** runs on the same stack, below
  whatever BASIC has pushed. It returns with the stack as it found it.

## The top four bytes

`$01FC-$01FF` sit right below BASIC's line input buffer at `$0200`, and BASIC
uses them as part of it. When you type a numbered line, BASIC stages the
line's link and line number in the four bytes before the buffer, then copies
link, number and text into the program in one move:

| Address | Use |
| --- | --- |
| `$01FC-$01FD` | The staged link. BASIC writes `$01` to the high byte just before the copy, since a zero high byte would mark the end of the program; the low byte is rewritten when the links are fixed. |
| `$01FE-$01FF` | The staged line number, copied from `LINNUM`. `INPUT` also stores its leading comma at `$01FF`. |

BASIC's deepest push lands on `$01FC`, the one byte of the four it doesn't
need to keep.

A program that replaces BASIC owns the whole page. It sets `S` itself
(`LDX #$FF`, `TXS`) and may use all of it.

{{#include ../../../tables/cpu-memory-map.md:stack}}
