# The kernel

The **kernel** is the part of Clementina's system software that sits under
BASIC and WozMon: it starts the machine, runs the text screen and the screen
editor, reads keys, loads files and answers the timer interrupt. Together with
BASIC and WozMon it is built into MIA's firmware, and MIA copies it into RAM
at `$0400` when it starts.

Machine code reaches the kernel through its **jump table**: a list of `JMP`
instructions at the bottom of the kernel, one per service, at addresses that
never change from one version to the next. A program calls the entry with
`JSR`; the routine behind it may move, but the entry stays. Never call an
address inside the kernel other than these.

{{#include ../../../tables/kernel-abi.md}}

The SDK's `clementina.inc` names every entry. The rest of this chapter
describes them, grouped by what they do. "Preserved" registers come back as
they were; the others may change.

## The text screen

### KERN_CHROUT ($0406)

Prints the character in A at the cursor and moves the cursor on. A, X and Y
are preserved. The character is drawn with the attribute in `TEXT_ATTR`
(`$0302`), so storing an attribute there first prints in another color.
Some codes are actions instead of characters:

| Code | Action |
| --- | --- |
| `$08` | Backspace: move left and erase. Stops at column 0. |
| `$0A` | Line feed: ignored. |
| `$0C` | Form feed: clear the screen and home the cursor. |
| `$0D` | Carriage return: start a new line, scrolling at the bottom. |
| `$11` | Cursor down. |
| `$91` | Cursor up. |
| `$1D` | Cursor right. |
| `$9D` | Cursor left. |
| `$13` | Home: the top-left corner. |

The cursor moves stop at the edges of the screen; they never scroll. Every
other code prints its tile.

### KERN_CHROUT_GLYPH ($0421)

Prints A as a tile, even if it is one of the control codes above. A, X and Y
are preserved. Use it to draw tiles `$08`, `$0D`, `$11` and the like.

### KERN_PRSTR ($0418)

Prints the string that `KPTR` (`$F0-$F1`) points at, up to a zero byte or 255
characters, through `KERN_CHROUT`. [Introduction](intro.md) shows it.

### KERN_PRBYTE ($0415) and KERN_PRHEX ($0412)

`KERN_PRBYTE` prints A as two hex digits; `KERN_PRHEX` prints the low four
bits of A as one.

### KERN_CLRSCR ($040F)

Clears the text screen and puts the cursor at the top-left corner.

### KERN_PLOT ($042D)

Reads or moves the cursor, like the Commodore 64's `PLOT`. With the carry
set, it returns the row in X and the column in Y. With the carry clear, it
moves the cursor to row X (0-24) and column Y (0-39); a position off the
screen moves nothing and returns with the carry set. A is preserved.

This routine prints a hex byte at row 2, column 30, in yellow:

<!-- example: org=$0280 prg=PLOT.PRG run="BLOAD \"PLOT.PRG\"|CLS: SYS 640" -->
```asm
.include "clementina.inc"
TEXT_ATTR = $0302

        clc
        ldx #2                  ; row
        ldy #30                 ; column
        jsr KERN_PLOT
        lda #3                  ; palette 3: yellow
        sta TEXT_ATTR
        lda #$C0
        jsr KERN_PRBYTE
        stz TEXT_ATTR           ; palette 0 again
        rts
```

```text
                              C0
```

BASIC's own idea of the print column, which `POS` and `TAB` use, does not
change; print a carriage return before going back to `PRINT`.

### KERN_SET_BACKDROP ($0427)

Sets the screen's backdrop to the ink color of palette A, as BASIC's `BCOLOR`
does.

## Keys

### KERN_CHRIN ($0409)

Waits for a key, with the cursor showing, and returns its code in A. The codes
are ASCII for printable keys and the key codes of
[Appendix E](../appendix/charset-keys.md) for the others: Return is `$0D`,
the arrows `$11`, `$91`, `$1D` and `$9D`.

### KERN_GETKEY_NB ($040C)

Returns at once. If a key is waiting, the carry is set and A holds it;
otherwise the carry is clear. A game loop calls it once a frame:

<!-- example: org=$0280 prg=KEY.PRG run="BLOAD \"KEY.PRG\"|SYS 640" keys="Q" -->
```asm
.include "clementina.inc"

wait:   jsr KERN_GETKEY_NB
        bcc wait                ; no key yet
        jsr KERN_PRBYTE         ; print its code
        lda #13
        jmp KERN_CHROUT         ; new line, and return from there
```

```text
51
```

Pressing `Q` prints `51`, its ASCII code in hex. The last line uses `JMP`
instead of `JSR` and `RTS`: `KERN_CHROUT`'s own `RTS` returns to BASIC.

### KERN_EDITKEY ($041E)

The full-screen editor that BASIC reads its lines through. The first call
lets the user edit the screen until Return, then returns the first character
of the line under the cursor; each later call returns the next character, and
a `$0D` ends the line. A program that wants a line typed in the same way as
BASIC's `INPUT` calls it until it returns `$0D`.

## Loading and starting

### KERN_LOAD ($041B)

Loads a PRG file from the SD card into the 6502's memory, and either returns
or jumps to it. It is what `BLOAD` and `BRUN` use. Before calling it:

- write the file's path, ending with a zero byte, into MIA's path buffer
  ([SD card and files](../mia/sd.md) shows how);
- put in A the bank to use at `$8000-$BFFF`;
- put in `KPTR` (`$F0-$F1`) the address to load at, or 0 to use the file's
  header;
- clear the carry to come back after the load, or set it to jump. When
  jumping, put in `KTMP` (`$F2-$F3`) the address to jump to, or 0 for the first
  byte loaded.

The copy runs entirely inside the kernel, so the file may overwrite BASIC. A
returning load maps the bank that was mapped before; a jump maps bank A and
enables interrupts. Errors found before the first byte is written, such as a
missing file, go to BASIC's `?FILE I/O ERROR`, so a program that has replaced
BASIC should check that the file exists before calling `KERN_LOAD`.

### KERN_COLDSTART ($0400)

Starts the system again, as at power-on: sets up the screen, the VIA and the
interrupts, prints the banner and starts BASIC with no program. It runs the
kernel and BASIC already in RAM; it does not copy them again. A reset of the
6502 lands here too.

### KERN_WARMSTART ($0403)

Returns to BASIC's `READY.` prompt, keeping the program and its variables. On
the way it resets the stack, puts the kernel's interrupt handler back, maps
bank 0 and sets the VIA up as reset does. It is the safe way out of any
program, from anywhere: `JMP KERN_WARMSTART`.

### KERN_WOZMON ($0424)

Starts the WozMon monitor ([WozMon](wozmon.md)). It does not return; WozMon's
`Q` command goes to `KERN_WARMSTART`.

## Interrupts and time

### KERN_IRQ ($042A)

The kernel's interrupt handler. A program's own handler ends with
`JMP KERN_IRQ`; [Interrupts](interrupts.md) explains how.

### KERN_RDTIM ($0430)

Asks MIA for its clocks and copies them to `CLOCK_SNAPSHOT` (`$02F8-$02FF`):
the milliseconds since MIA started in `CLOCK_MS` (4 bytes) and the 60 Hz count
that BASIC calls `TI` in `CLOCK_60HZ` (3 bytes). The carry is set when MIA
filled the snapshot. A, X and Y change. See [Time](../mia/time.md).

### KERN_SETTIM ($0433)

Sets MIA's 60 Hz count to the value in A (low byte), X and Y (high byte).
Values of 5,184,000 or more are ignored.

## Calling BASIC

The eight `BAS_` entries lead into BASIC's own routines, so machine code
called from BASIC can read arguments, print numbers and raise errors the way
BASIC's statements do. They work only while BASIC is in memory.
[Mixing BASIC and machine language](mixing.md) shows them at work.

| Entry | Does |
| --- | --- |
| `BAS_CHKCOM` | Skips a comma in the program text, or gives `?SYNTAX ERROR`. |
| `BAS_FRMNUM` | Evaluates a numeric expression into BASIC's floating-point accumulator, `FAC`. |
| `BAS_FRMEVL` | Evaluates any expression. |
| `BAS_GETADR` | Converts `FAC` to a 16-bit number: A high, Y low, and in `LINNUM` (`$11-$12`). |
| `BAS_GETBYT` | Evaluates an expression of 0-255 into X. |
| `BAS_PTRGET` | Finds a variable by name and returns the address of its value. |
| `BAS_ERROR` | Stops with the BASIC error whose code is in X ([Appendix B](../appendix/errors.md)). |
| `BAS_LINPRT` | Prints the number in A (high) and X (low) in decimal. |

## Registers the kernel uses

The kernel keeps its variables in zero page `$F0-$FB` and in page 3,
`$0300-$03FF`. A program may read them; the ones worth knowing are `KPTR`
and `KTMP` for the calls above, `KJIFFY` (`$F7-$F8`) for the interrupt count,
the cursor at `CURSOR_X` and `CURSOR_Y` (`$0300-$0301`) and `TEXT_ATTR`
(`$0302`). All of them are listed in *Mapping Clementina*,
[Zero page](../../../mapping/src/cpu/zero-page.md) and
[Page 3](../../../mapping/src/cpu/page-3.md).
