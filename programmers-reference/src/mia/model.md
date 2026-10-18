# The MIA programming model

MIA, the Multifunction Interface Adapter, is a Raspberry Pi Pico 2 W that
does almost everything in Clementina that is not the 6502: it makes the CPU's
clock, holds the video, sound, input and SD card state in 256 KiB of RAM of
its own, and talks to the video client over Wi-Fi. To the 6502 it is 32
registers at `$FFE0-$FFFF`. This chapter explains how those 32 registers give
a program the whole of MIA; the chapters after it apply them to graphics,
sound, input, files and time.

The SDK's `mia.inc` (included by `clementina.inc`) names every register,
command, field and bit used here, with MIA's own names. Every value is listed
in [Appendix D](../appendix/mia.md).

## The registers

{{#include ../../../tables/mia-registers.md}}

They fall into six groups:

- the two **index windows**, A and B, through which the 6502 reads and writes
  MIA's RAM;
- the **configuration** port, which sets up the windows and the CPU's speed;
- the **command** registers, which ask MIA to do something;
- **status** and **errors**;
- **interrupts**;
- the **input** registers, a shortcut for reading typed keys
  ([Input](input.md)), and the 6502's **vectors**.

The block repeats every 32 bytes from `$E000` up, because MIA sees only five
address lines. Use `$FFE0-$FFFF`: a read of a mirror has the same side effects
as the real register.

## Index windows

The 6502 cannot address MIA's 256 KiB directly. Instead, MIA keeps 256
**index descriptors**, numbered `$00-$FF`, each a pointer into its RAM with
rules for how it moves:

| Field | Meaning |
| --- | --- |
| Current address | Where the next read or write goes. |
| Default address | Where the index goes back to when reset or when it wraps forward. |
| Limit address | The first address past the end of its range. |
| Step | How far it moves after each access, 0-65535. |
| Flags | Whether reads and writes step it, in which direction, whether it wraps, and whether a wrap interrupts. |

Two of them are in use at a time, one in each **window**. Writing an index's
number to `IDXA_SELECT` (`$FFE1`) puts it in window A; then each read of
`IDXA_PORT` (`$FFE0`) gives the byte at its current address, and each write
stores one there. After the access, the index steps if its flags say so. So a
program sets an index up once and then streams bytes through one register,
which is as fast as the 6502 can go. Window B, `IDXB_SELECT` (`$FFE5`) and
`IDXB_PORT` (`$FFE4`), works the same way.

The flags:

| Bit | Name | When set |
| --- | --- | --- |
| 0 | `IDX_FLAG_R_STP_ENA` | A read steps the index. |
| 1 | `IDX_FLAG_W_STP_ENA` | A write steps the index. |
| 2 | `IDX_FLAG_STP_DIR` | It steps backwards. |
| 3 | `IDX_FLAG_WRAP_ENA` | Reaching the limit sends it back to the default address; going below the default sends it to the limit minus one. |
| 4 | `IDX_FLAG_WRAP_IRQ` | A wrap raises the window's wrap interrupt. |

`mia.inc` gives the flags as bit numbers, so write
`(1 << IDX_FLAG_W_STP_ENA)`.

### Who owns which index

| Indexes | Owner |
| --- | --- |
| `$00-$4F` | Programs. The SDK's runtime library uses `$40-$41`. |
| `$50-$6F` | Input, set up by MIA. |
| `$70-$DF` | Video, set up by MIA. |
| `$E0-$E5` | SD card and files, set up by MIA. |
| `$E6-$EF` | Sound, set up by MIA. |
| `$F0-$FF` | The kernel and BASIC. |

MIA sets up its own indexes when it starts: each covers one structure, such
as the text screen or one palette, steps forward one byte on every read and
write, and wraps at its end. A program can use them as they are. Its own
indexes, `$00-$4F`, it sets up itself.

### Configuring an index

The fields of the indexes in the two windows are reached through the
**configuration** port: write a field's number to `CFG_SELECT` (`$FFE2`), and
`CFG_PORT` (`$FFE3`) then reads or writes that field. Fields `$00-$0B` belong
to the index in window A and `$10-$1B` to the one in window B:

{{#include ../../../tables/mia-config.md}}

Writing a byte of the current address moves the index at once, and the
window's port then holds the byte at the new address, so a read right after
gives the right value. This routine sets index `$00` up to write at `$20000`,
stepping one byte each write, and writes three bytes:

<!-- example: org=$0280 prg=INDEX.PRG run="BLOAD \"INDEX.PRG\"|SYS 640|PRINT MPEEK($20000);MPEEK($20001);MPEEK($20002)" -->
```asm
.include "clementina.inc"

        lda #$00
        sta IDXA_SELECT         ; index $00 in window A
        ldx #0
setup:  lda fields,x
        sta CFG_SELECT
        lda values,x
        sta CFG_PORT
        inx
        cpx #6
        bne setup
        lda #10
        sta IDXA_PORT           ; $20000
        lda #20
        sta IDXA_PORT           ; $20001
        lda #30
        sta IDXA_PORT           ; $20002
        rts

fields: .byte CFG_IDXA_ADDR_L, CFG_IDXA_ADDR_M, CFG_IDXA_ADDR_H
        .byte CFG_IDXA_STP_L, CFG_IDXA_STP_H, CFG_IDXA_FLAGS
values: .byte $00, $00, $02     ; $020000
        .byte 1, 0              ; step 1
        .byte (1 << IDX_FLAG_W_STP_ENA)
```

```text
 10  20  30
```

A step larger than one walks down a column: a step of 40 through a text
screen table moves one row at a time.

### Selecting does not rewind

Putting an index in a window does not move it: it stays where its last access
left it. To start again from the beginning, reset it with a command (below),
or write its current address through the configuration port. Code that
assumes a fresh select starts at the beginning works the first time and reads
the wrong bytes after that.

## Commands

For anything more than reading and writing bytes, the 6502 sends MIA a
**command**: it writes up to three parameters in `CMD_PARAM1-3`
(`$FFE6-$FFE8`), then the command's number in `CMD_TRIGGER` (`$FFE9`). MIA
queues it and carries it out while the 6502 goes on. While commands run, the
status bit `MIA_STAT_CMD_RUNNING` is set:

```asm
wait:   lda STATUS_L
        and #MIA_STAT_CMD_RUNNING
        bne wait
```

Wait like this before using what a command produces. This routine resets
index `$B8`, MIA's index for the text screen's characters, to the start of the
screen and writes two characters in the top-left corner:

<!-- example: org=$0280 prg=CMD.PRG run="BLOAD \"CMD.PRG\"|SYS 640" -->
```asm
.include "clementina.inc"

        lda #MIA_VIDEO_INDEX_OVERLAY_NT
        sta CMD_PARAM1
        lda #MIA_CMD_RESET_INDEX
        sta CMD_TRIGGER         ; back to its default address, $10080
wait:   lda STATUS_L
        and #MIA_STAT_CMD_RUNNING
        bne wait
        lda #MIA_VIDEO_INDEX_OVERLAY_NT
        sta IDXA_SELECT
        lda #'H'
        sta IDXA_PORT
        lda #'I'
        sta IDXA_PORT
        rts
```

The commands are grouped by subject:

| Commands | Subject |
| --- | --- |
| `$00-$07` | Resetting and moving indexes. |
| `$10-$11` | Copying blocks and rectangles inside MIA RAM. |
| `$30` | Pausing the CPU (for debugging). |
| `$42-$43` | Video. |
| `$50-$56` | Input and the clock. |
| `$60-$6B` | Sound. |
| `$70-$8A` | SD card and files. |

The full list is in [Appendix D](../appendix/mia.md); the chapters that
follow explain each group.

### Copying inside MIA

Command `$10`, `MIA_CMD_COPY_INDEXES`, copies bytes from where one index
points to where another points, without the 6502 touching them: parameter 1
is the source index, 2 the destination index and 3 the byte count (0 copies up
to the source index's limit). Command `$11`, `MIA_CMD_COPY_RECT`, copies a
rectangle, using each index's step as the distance between rows. The indexes
do not move. A copy runs in the background; `MIA_STAT_DMA_RUNNING` stays set
until it ends, and up to eight more copies can wait behind it. BASIC's
`MCOPY` and `MFILL` are built on these two commands.

## Status and errors

`STATUS_L` and `STATUS_H` (`$FFEA-$FFEB`) form a 16-bit status word that
describes what MIA is busy with:

{{#include ../../../tables/mia-status.md}}

When something goes wrong, MIA puts an error code in a queue of 16 and sets
`MIA_STAT_ERRORS`. Each read of `ERROR_L` (`$FFEC`) takes the oldest code
from the queue, and 0 means the queue is empty. A program that sends commands
should drain the queue now and then, at least when a result is not what it
expected:

```asm
errors: lda ERROR_L
        beq done                ; queue empty
        jsr KERN_PRBYTE         ; show the code
        bra errors
done:   rts
```

The codes are in [Appendix D](../appendix/mia.md).

## Interrupts

MIA can interrupt the 6502 when something happens: a command finished, a key
was pressed, the video client asked for an update, a file operation ended, a
track of music ended. Each source has a bit in the 16-bit `IRQ_STATUS`
(`$FFF0-$FFF1`) and the same bit in `IRQ_MASK` (`$FFEE-$FFEF`). A source sets
its status bit whenever its event happens; it pulls the IRQ line only if its
mask bit is set too. All mask bits are clear after reset, so MIA interrupts
nothing until a program asks.

{{#include ../../../tables/mia-irq.md}}

**Reading `IRQ_STATUS_L` (`$FFF0`) clears every bit**, high byte included, and
releases the IRQ line. `IRQ_STATUS_H` (`$FFF1`) can be read without clearing
anything. So a handler that needs to know the sources reads `$FFF1` first,
then `$FFF0`:

```asm
        lda IRQ_STATUS_H        ; look, no side effect
        sta irq_high
        lda IRQ_STATUS_L        ; read and clear
        sta irq_low
```

The kernel's own handler reads `$FFF0` on every interrupt, so a program's
handler chained in front of it must read the flags before chaining
([Interrupts](../ml/interrupts.md)). A program that only polls can leave the
mask clear and test the status bits, reading `$FFF1` and then `$FFF0` to clear
them.

## The context stack

An interrupt handler that uses MIA's windows can upset the code it
interrupted: that code may have had an index selected in window A, a
configuration field selected, or command parameters half written. Writing
`MIA_CTX_PUSH` (`$01`) to `MIA_CTX` (`$FFF5`) saves all of that: both windows'
selections and the full descriptors of the two indexes in them, the
configuration selection, and the three command parameters. Writing
`MIA_CTX_POP` (`$02`) puts it back. The stack holds four levels.

```asm
handler:
        pha
        lda #MIA_CTX_PUSH
        sta MIA_CTX
        ; ... use the windows, the configuration port and commands ...
        lda #MIA_CTX_POP
        sta MIA_CTX
        pla
        jmp KERN_IRQ
```

A command the handler starts still runs after the pop, and reads its indexes
when it runs. If it uses one of the two indexes the pop restores, wait for
`MIA_STAT_CMD_RUNNING` to clear before popping.

## The CPU's speed

MIA makes the 6502's clock, and a program can change its speed. The speed in
hertz is the 24-bit configuration value `CFG_SPEED_L/M/H` (`$20-$22`).
Writing the high byte asks for the change; MIA applies it a little later,
clears `MIA_STAT_SPEED_CHANGING` and raises `IRQ_SPEED_CHANGED`. Reading the
three bytes gives the speed actually in use. MIA starts at 1.2 MHz and accepts
requests from 1 Hz to 8 MHz.

```asm
        lda #CFG_SPEED_L        ; 2,000,000 Hz = $1E8480
        sta CFG_SELECT
        lda #$80
        sta CFG_PORT
        lda #CFG_SPEED_M
        sta CFG_SELECT
        lda #$84
        sta CFG_PORT
        lda #CFG_SPEED_H
        sta CFG_SELECT
        lda #$1E
        sta CFG_PORT            ; this write asks for the change
```

How fast the board can really run is not known yet: it has not been built.
The VIA's timers and the kernel's `KJIFFY` follow the CPU's clock; MIA's
clocks, sound and key repeat do not.

## Where this is in Mapping Clementina

The registers byte by byte are in *Mapping Clementina*,
[MIA registers](../../../mapping/src/cpu/mia-registers.md); the index ids in
[Indexes](../../../mapping/src/spaces/indexes.md), the configuration fields in
[Configuration](../../../mapping/src/spaces/config.md), and the commands in
[Commands](../../../mapping/src/spaces/commands.md).
