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

## Address entries

Each address is the first byte of a three-byte `JMP` instruction in the
fixed table. Call an entry with `JSR` unless its description says it takes
over control. Decimal addresses come first, then hexadecimal and the entry
name.

### 1024　　$0400　　KERN_COLDSTART

The CPU's reset vector points here after MIA has loaded the resident image.
Cold start initializes the stack, VIA, console and video, prints the banner,
then starts BASIC. Calling it deliberately restarts the machine's software
state; it is not a way to return to a running BASIC program.

### 1027　　$0403　　KERN_WARMSTART

This returns to BASIC's `READY` prompt while keeping the stored program and
variables. Before doing so it resets the stack, IRQ vector, bank selection
and VIA interrupt setup. WozMon's `Q` uses this path. A program that jumps
here does not come back to its caller.

### 1030　　$0406　　KERN_CHROUT

Put a character in `A` and call this entry to print it at the current text
cursor. The routine interprets control characters as cursor or display
commands; it preserves `A`, `X` and `Y`. Use `KERN_CHROUT_GLYPH` at `$0421`
when a byte must be drawn as a tile rather than interpreted as a command.

### 1033　　$0409　　KERN_CHRIN

Waits until MIA's text input queue supplies a character, then returns it in
`A`. The kernel shows and blinks the software cursor while waiting. This is
the input path BASIC uses for typed lines; a program that cannot pause
should use `KERN_GETKEY_NB` instead.

### 1036　　$040C　　KERN_GETKEY_NB

Checks MIA's text queue without waiting. Carry set means a character was
available and `A` contains it; carry clear means the queue was empty.
Polling this entry lets a program keep running its own loop while still
accepting typed input.

### 1039　　$040F　　KERN_CLRSCR

Clears the overlay text screen and returns the console cursor home. The
overlay is the fixed 40-by-25 text layer in MIA RAM, so this does not erase
the background tile maps or sprite records. Subsequent `KERN_CHROUT` calls
begin at the top-left cell.

### 1042　　$0412　　KERN_PRHEX

Prints the low four bits of `A` as one hexadecimal digit. It is useful for
displaying a nibble from a status register without writing a conversion
routine. The upper four bits of `A` do not appear in the output.

### 1045　　$0415　　KERN_PRBYTE

Prints all eight bits of `A` as two hexadecimal digits. For example, a
value of 255 appears as `FF`. This is convenient in monitor-like code that
shows memory bytes or device status.

### 1048　　$0418　　KERN_PRSTR

Prints bytes starting at the address in the zero-page pointer `KPTR`
(`$F0-$F1`). It stops at a zero byte or after 255 bytes, so the source must
be a zero-terminated string in readable CPU memory. The routine consumes
the pointer as an input; it does not discover a BASIC string descriptor for
you.

### 1051　　$041B　　KERN_LOAD

Loads a PRG file into CPU RAM. `A` selects the extended-RAM bank at
`$8000-$BFFF`, and `KPTR` can override the file's destination address.
With carry clear the routine returns after loading; with carry set it jumps
to the run address in `KTMP` (or the first loaded byte if `KTMP` is zero).
It may continue across bank boundaries, so a program must choose a
destination that does not overwrite the kernel.

### 1054　　$041E　　KERN_EDITKEY

Returns the next character of a logical line collected by the screen
editor, ending with carriage return. The editor can recover text from the
cursor's screen row, including a wrapped line, rather than only taking
fresh keystrokes. BASIC uses repeated calls here to obtain its input line.

### 1057　　$0421　　KERN_CHROUT_GLYPH

Draws the value in `A` as a raw tile at the current cursor and advances the
cursor. Unlike `KERN_CHROUT`, it never interprets the byte as a control
character. It preserves `A`, `X` and `Y`, which makes it useful when a
program wants to display a glyph whose code would otherwise control the
console.

### 1060　　$0424　　KERN_WOZMON

Enters the WozMon memory monitor. Its commands can examine and change CPU
memory; `Q` returns through `KERN_WARMSTART` to BASIC's prompt without
discarding the stored program. This call takes over the console rather
than returning directly to the instruction after `JSR`.

### 1063　　$0427　　KERN_SET_BACKDROP

Sets the backdrop color selector from `A`. The backdrop is the color drawn
behind all background, sprite and overlay pixels. It does not change the
contents of a palette or any individual screen cell.

### 1066　　$042A　　KERN_IRQ

The kernel's interrupt handler services the VIA's Timer 1 tick, cursor
blink and MIA interrupt status. A custom IRQ handler that wants those
services to continue can restore `A`, `X` and `Y`, then `JMP` here so the
kernel performs its work and finishes with `RTI`. It is not a routine to
call from ordinary foreground code.

### 1069　　$042D　　KERN_PLOT

With carry set, reads the cursor position into `X` (row) and `Y` (column).
With carry clear, attempts to move the cursor to those coordinates and
returns carry set if they are outside the screen. It maintains the
software cursor state, which is why callers should use it instead of
writing `$0300-$0301` directly.

### 1072　　$0430　　KERN_RDTIM

Asks MIA for a clock snapshot and copies it into `$02F8-$02FF`. Carry set
means the firmware supplied a clock; carry clear means it did not. The
snapshot includes milliseconds and a 60 Hz time-of-day count. Call it from
foreground code, then read the bytes before another clock call replaces
them.

### 1075　　$0433　　KERN_SETTIM

Sets MIA's 60 Hz time-of-day count, the value BASIC exposes as `TI`.
Supply the three bytes in `A`, `X` and `Y`, low byte first. This changes
the clock's time-of-day value, not the millisecond counter that measures
time since MIA started.

### 1078　　$0436　　BAS_CHKCOM

Checks for the comma expected before another argument after a machine-code
call from BASIC. If present it advances BASIC's text pointer and leaves the
next character in `A`; if absent it raises `SYNTAX ERROR`. This entry works
only while BASIC's interpreter is still resident.

### 1081　　$0439　　BAS_FRMNUM

Evaluates a numeric expression at BASIC's current text pointer and places
the result in its floating-point accumulator, `FAC`. A string expression
raises `TYPE MISMATCH`. Machine code called by `SYS` can use this entry to
accept expressions rather than only literal numbers.

### 1084　　$043C　　BAS_FRMEVL

Evaluates an expression of either type at BASIC's current text pointer.
`VALTYP` at `$17` tells whether the result is numeric or a string. For a
string, `FAC+3` and `FAC+4` contain the address of its descriptor; a caller
must check the type before interpreting those bytes.

### 1087　　$043F　　BAS_GETADR

Converts the number currently in `FAC` to an unsigned 16-bit address. It
returns the value in `LINNUM`, with its low byte in `Y` and high byte in
`A`. Values outside 0-65535 raise `ILLEGAL QUANTITY`, so callers do not
need to implement that range check themselves.

### 1090　　$0442　　BAS_GETBYT

Evaluates the numeric expression at BASIC's text pointer and returns an
8-bit result in `X`. A value outside 0-255 raises `ILLEGAL QUANTITY`.
Use it for arguments such as a color, register value or bank number when
the syntax allows a full BASIC expression.

### 1093　　$0445　　BAS_PTRGET

Finds or creates the variable named at BASIC's current text pointer. It
returns the address of that variable's value in `VARPNT`, with low byte in
`A` and high byte in `Y`. The caller still has to interpret the bytes
according to the variable's type.

### 1096　　$0448　　BAS_ERROR

Raises the BASIC error whose code is in `X`. BASIC maps extended-RAM bank 0,
prints the message and returns to its prompt; this call does not return to
the machine-code caller. It is useful when a routine finds an invalid
argument and wants BASIC's normal error handling.

### 1099　　$044B　　BAS_LINPRT

Prints the unsigned 16-bit value whose high byte is in `A` and low byte in
`X` as decimal text. It uses the leading space BASIC's `PRINT` uses before
a positive number. This lets machine code display a number without its
own decimal conversion routine.
