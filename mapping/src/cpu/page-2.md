# Page 2: line buffers and the clock

`$0200-$02FF` (512-767)

Page 2 holds three things: the line you are typing, 120 bytes nobody else
uses, and a copy of MIA's clock.

```text
$0200 ┌──────────────────────────┐
      │ Line input buffer        │ BASIC and WozMon
$0280 ├──────────────────────────┤
      │ Free for programs        │ 120 bytes
$02F8 ├──────────────────────────┤
      │ Clock snapshot           │ 8 bytes
$02FF └──────────────────────────┘
```

## The line input buffer: `$0200-$027F`

BASIC and WozMon both read typed lines here. They never run at the same
time (WozMon's `Q` returns to BASIC through warm start), so they share the
space.

- **BASIC** (`INPUTBUFFER`) takes up to 80 characters, the screen editor's
  longest logical line, at `$0200-$024F`, followed by a `$00` at `$0250`.
  The tokenizer crunches the line in place, so tokenized text never runs past
  the typed text, and it writes an end-of-program `$00` two bytes past the
  line's terminator, at most at `$0252`. `GET` uses `$0200-$0201`. The four
  bytes just below the buffer belong to it too (see [the stack](stack.md)).
- **WozMon** (`IN`) uses the whole 128 bytes.

Anything a program stores here is overwritten by the next typed line.

## Free bytes: `$0280-$02F7`

120 bytes (decimal 640 to 759) that nothing in the system writes, at cold
start or ever. They survive `NEW`, `RUN` and `CLEAR`, which makes them the
easy home for a short machine-language routine called from BASIC with `SYS`
or `USR`:

```basic
10 FOR I=0 TO 5:READ B:POKE 640+I,B:NEXT
20 SYS 640
30 PRINT PEEK(647)
40 DATA 169,42,141,135,2,96
```

The six bytes are `LDA #42`, `STA $0287`, `RTS`: the routine stores 42 at
`$0287` (647), just past itself, and returns, and line 30 prints it.

## The clock snapshot: `$02F8-$02FF`

MIA keeps two clocks that run from its own timer, independent of the CPU's
speed: milliseconds since MIA started, and a 60 Hz count that BASIC reads as
`TI`. `KERN_RDTIM` (`$0430`) asks MIA to latch both and copies the eight
bytes here:

| Address | Name | Size | Contents |
| --- | --- | --- | --- |
| `$02F8` | `CLOCK_MS` | 4 | Milliseconds since MIA started, little-endian. Wraps after 2^32 ms, about 49.7 days. |
| `$02FC` | `CLOCK_60HZ` | 3 | The 60 Hz count, little-endian. Wraps at 5,184,000, every 24 hours. `KERN_SETTIM` and `TI=` set it. |
| `$02FF` | `CLOCK_VERSION` | 1 | `1` when MIA filled the snapshot. |

The bytes are a snapshot, not a live counter: they keep their values until
the next `KERN_RDTIM`. BASIC's `TI`, `TICKS` and `DELAY` take snapshots the
same way, so read the bytes right after your own call:

```asm
KERN_RDTIM = $0430
CLOCK_MS   = $02F8

        jsr KERN_RDTIM          ; C=0: this MIA firmware has no clock
        bcc no_clock
        lda CLOCK_MS            ; milliseconds, low byte first
        ...
```

`KERN_RDTIM` and `KERN_SETTIM` are for the main program only, not for
interrupt handlers. MIA latches the same eight bytes into its own RAM at
`$11078` ([Input state](../mia/input.md)), where a program can also read them
through an index.

{{#include ../../../tables/cpu-memory-map.md:input-page}}
