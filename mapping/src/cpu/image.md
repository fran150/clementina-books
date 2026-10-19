# The resident image

`$0400` up to the start of BASIC's workspace

Everything the CPU runs at power-on comes from one file, `kernel.bin`, which
MIA's firmware carries inside it. MIA copies it into base RAM from `$0400`
up before the CPU starts. It holds, in this order:

1. the [kernel jump table](jump-table.md),
2. `DIR_NAME_BUF`, a 40-byte buffer,
3. the kernel,
4. WozMon, the monitor,
5. BASIC.

BASIC's workspace starts right after the image's last byte and runs up to
`$BFFF` ([BASIC's workspace](basic-workspace.md)). There is no gap anywhere:
page 3 ends at `$03FF`, the image starts at `$0400`, and the workspace starts
where the image ends.

## What lives where

Only the jump table has a fixed address. Everything after it moves whenever
the kernel or BASIC changes size, so these addresses are not an interface:
programs reach the kernel through the jump table and never call into the
image directly. In the build this book describes, the image is 24,480 bytes:

| Range | Segment | Holds |
| --- | --- | --- |
| `$0400-$044D` | `JUMPTAB` | The jump table. |
| `$044E-$0475` | `DIRBUF` | `DIR_NAME_BUF`. |
| `$0476-$147F` | `KERNCODE` | The kernel's code. |
| `$1480-$14C8` | `RODATA` | The startup banner. |
| `$14C9-$15BE` | `WOZCODE` | WozMon. |
| `$15BF-$639F` | `CODE` to `EXTRA` | BASIC: the interpreter, its keyword and error tables, `CHRGET`'s original copy, cold start and Clementina's own statements. |

The ROM's `make` prints the split for each build, and `build/kernel.map` and
`build/kernel.lbl` give every segment and symbol:

```text
Built build/kernel.bin (24480 bytes): kernel+wozmon $0400-0x15BE, basic 0x15BF-0x639F, heap 0x63A0-$BFFF
```

## The kernel region: `$0400-$15FF`

The jump table, `DIR_NAME_BUF`, the kernel and WozMon sit in a region that
ends at `$15FF` however they grow; the build fails if they outgrow it.
Today they end at `$15BE`, leaving 65 bytes. BASIC starts right after them,
so the region's spare bytes don't go to waste.

The boundary matters to programs that replace BASIC. `KERN_LOAD`, the loader
behind `BLOAD` and `BRUN`, runs from the kernel, so a file may overwrite
anything from `$1600` up, BASIC included, but nothing below it. The SDK's
templates load programs at `$1800`.

## `DIR_NAME_BUF`

A 40-byte scratch buffer, `$044E-$0475` today, where `DIR` reads each
directory entry's name before printing it. BASIC declares it, but the build
places it right after the jump table, inside the kernel region, so a program
loaded over BASIC doesn't overwrite it. Nothing needs its contents to survive
from one `DIR` to the next, so it simply moves up three bytes whenever the
jump table gains an entry. It is part of the image: 40 zero bytes in
`kernel.bin`.

## The kernel

The kernel is one assembly unit: the console and its screen editor, the
interrupt handler, the VIA setup, `KERN_LOAD`, and routines that read,
write, copy and fill MIA RAM for BASIC. A few of its routines matter to
anyone reading the map, because they decide what MIA state the system uses:

- **`video_init`**, at cold start, picks CHR banks 0 and 1 for the text
  screen, decodes both as one bit per pixel, sets the backdrop to palette 0
  color 0, enables video and turns on the overlay layer. It loads no font
  and no palette; MIA's firmware does that when video starts.
- **The console** writes each character through MIA index `$B8` (the
  overlay's characters) and `$B9` (their attributes), and scrolls the screen
  with a MIA copy through the kernel's own indexes `$F0-$F3`.
- **The interrupt handler** is `KERN_IRQ` ([the jump
  table](jump-table.md#taking-over-the-irq)). The NMI handler is a bare `RTI`.

[Index descriptors](../spaces/indexes.md) lists every index the kernel uses.

## WozMon

Steve Wozniak's monitor from the Apple 1, adapted for Clementina. `MON` in
BASIC, or `KERN_WOZMON` (`$0424`), enters it; `Q` leaves through
`KERN_WARMSTART`, which keeps the BASIC program. It reads lines into
`$0200` like BASIC and keeps its variables at `$E8-$EF`, so it never disturbs
BASIC's memory.

## BASIC

BASIC fills the rest of the image: Microsoft BASIC for the 6502 (from
mist64/msbasic) with Clementina's statements for files, video, sound, timing
and MIA memory added. Its code is followed directly by its workspace.

## How the system starts

1. MIA powers up in loader mode. It holds the CPU and VIA in reset, writes a
   tiny loader into its own register block and points the reset vector at
   `$FFE0`.
2. MIA lets the CPU run. The loader copies `kernel.bin` into base RAM from
   `$0400` up.
3. MIA switches to normal mode: its registers take their normal meaning, and
   the reset, NMI and IRQ vectors all point at `$0400`.
4. The CPU enters `KERN_COLDSTART` at `$0400`.
5. Cold start installs the kernel's NMI and IRQ handlers, sets up the VIA
   and video, clears the screen, prints the banner, enables interrupts and
   starts BASIC.

The load address `$0400` is fixed in MIA's firmware and in the emulator; the
image's size never enters into it.

## Address entries for this build

Only the jump table at `$0400` is a stable calling interface. The other
boundaries below describe the image size in this build and can move when
the kernel or BASIC is rebuilt.

### 1024–1101　　$0400–$044D　　JUMPTAB

The kernel's fixed entry points. Each three-byte slot jumps to a service
routine elsewhere in the image, so programs call the slot rather than an
internal address that may change after a rebuild. The [jump table](jump-table.md)
gives every entry and its calling convention.

### 1102–1141　　$044E–$0475　　DIR_NAME_BUF

A 40-byte scratch area used while BASIC's `DIR` prints file names. Its
contents have no meaning between directory operations. This location is
specific to the current jump-table size; the buffer moves if more entry
points are added.

### 1142–5247　　$0476–$147F　　KERNCODE

The resident kernel code, including console I/O, the screen editor,
interrupt handling, MIA helpers and the file loader. It is RAM, but
overwriting it while BASIC or `KERN_LOAD` is in use can stop the system.
Call its jump-table slots instead of branching to a current internal
address.

### 5248–5320　　$1480–$14C8　　RODATA

Read-only data in the image, including the startup banner. It is stored in
RAM because Clementina has no ROM, but the kernel expects its contents to
remain intact. Its exact range follows the kernel code size.

### 5321–5566　　$14C9–$15BE　　WOZCODE

WozMon's machine code. BASIC's `MON` enters the monitor through the
kernel interface; the monitor shares the line buffer at `$0200` and uses
its own zero-page bytes. This code may move in another build.

### 5567–25503　　$15BF–$639F　　BASIC image

The interpreter and its tables, followed by BASIC's cold-start code and
Clementina-specific statements. BASIC's program text does not live here;
the mutable program and variables begin at the workspace address after
the image. Programs that replace BASIC may load from `$1600` up while
preserving the kernel below it.
