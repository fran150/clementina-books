# Index descriptors

Ids `$00-$FF`

The CPU reaches MIA RAM only through index descriptors. There are 256, each
holding:

| Field | Size | Meaning |
| --- | --- | --- |
| current address | 24 bits | The MIA RAM byte the window's port reads and writes. |
| default address | 24 bits | Where the reset commands put the current address back, and where a forward wrap lands. |
| limit address | 24 bits | One past the end of the range; a forward wrap happens on reaching it. |
| step | 16 bits | How far the address moves after each access, when the flags ask for it. |
| flags | 8 bits | When to step, which way, and whether to wrap (below). |

A window (A at `$FFE0-$FFE1`, B at `$FFE4-$FFE5`) shows one descriptor at a
time. Binding one doesn't change it, so a program can keep several ready and
switch between them with a single write to `IDXA_SELECT` or `IDXB_SELECT`.
The descriptors' fields are set through the configuration fields
([Configuration fields](config.md)) of the window they are bound to.

## Who owns which ids

| Ids | Owner | Use |
| --- | --- | --- |
| `$00-$4F` | Programs | 80 descriptors, never set up or touched by the firmware, the kernel or BASIC. |
| `$50-$6F` | MIA: input | The input block and its probes. |
| `$70-$BF` | MIA: video | Local and render control, palettes, CHR banks, background tables, overlay. |
| `$C0-$DF` | MIA: video | Sprites 0-31, one record each. |
| `$E0-$E5` | MIA: SD | The SD block's buffers. |
| `$E6-$EF` | MIA: audio | The audio block, each voice, the header, each voice's sequencer status. |
| `$F0-$FF` | Kernel | The console's scroll and the MIA memory routines; `$F6-$FF` reserved. |

Every id, with the address and length MIA sets it to at reset:

{{#include ../../../tables/mia-indexes.md}}

## The rules

- **`$00-$4F` are yours.** Nothing else sets or moves them, so a descriptor
  set up once keeps its place across kernel calls and interrupts. The SDK's
  game runtime, when a program links it, takes `$40` and `$41`.
- **MIA's ids are for programs too.** `$50-$EF` are the documented way to
  reach video, input, audio and SD memory, and programs use them. The kernel
  and BASIC use them as well and set the address before each use, so their
  current address doesn't survive a kernel call: `CHROUT`, for one, moves
  `$B8` and `$B9`.
- **Rebind after a kernel call.** Kernel routines leave window A bound to
  whatever id they used last.
- **Interrupts are safe.** The kernel's interrupt handler saves and restores
  both window bindings and `CFG_SELECT` with `MIA_CTX`, so a program's
  bindings survive an interrupt.
- **Never change `$F0-$FF`.**

## The ids the kernel uses

| Id | Use |
| --- | --- |
| `$81` | `video_init`: turn on the overlay layer. |
| `$85` | `video_init`: CHR bank 0 for background, overlay and sprites, bank 1 for the overlay's alternate. |
| `$86` | `video_init`: banks 0 and 1 decoded as one bit per pixel, overlay on plane 0. |
| `$87` | `video_init` and `KERN_SET_BACKDROP`: the backdrop color. |
| `$B8` | The console's character cursor: set to the cell at `CURSOR_X`, `CURSOR_Y` before each write. |
| `$B9` | The console's attribute cursor, the same cell in the attribute table. |
| `$F0-$F3` | Scrolling: the overlay's characters and attributes copied up one row by a MIA copy. |
| `$F4-$F5` | Source and destination of the kernel's MIA memory copy, fill and rectangle routines, behind BASIC's `MPEEK`, `MPOKE`, `MCOPY` and `MFILL`. |
| `$60` | Reading the input block, one byte at a time. |
| `$E0`, `$E4` | `KERN_LOAD`: the SD control block and the transfer buffer. |

## Wrapping

The flag bits are in the table above. A forward wrap happens when the current address reaches the limit and puts
it back at the default; a backward wrap happens when it drops below the
default and puts it at the limit minus one. A window's wrap sets its
`IRQ_IDXA_WRAPPED` or `IRQ_IDXB_WRAPPED` flag when `WRAP_IRQ` is on.
