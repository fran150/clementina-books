# The MIA registers and the vectors

`$FFE0-$FFFF` (65504-65535)

MIA, the Raspberry Pi Pico 2 W on the board, appears to the CPU as 32
registers at the very top of memory. Through them the CPU reaches
everything MIA does: its 256 KiB of RAM, video, input, sound, the SD card,
the clock, and the CPU's own speed. The last six registers are the 6502's
interrupt and reset vectors.

MIA is selected for all of `$E000-$FFFF` but sees only A0-A4, so the 32
registers repeat every 32 bytes below `$FFE0`. A mirror is the same
register, side effects included, so `$E000-$FFDF` is never used
([The address decode](decode.md#what-each-chip-sees)).

{{#include ../../../tables/mia-registers.md}}

Access: `rw` read and write; `r` read only; `w` write only; `r-pop` reading
takes the next value from a queue; `r-clear` reading clears the register.

## The index windows: `$FFE0-$FFE1`, `$FFE4-$FFE5`

MIA's RAM is not in the CPU's address space. The CPU reaches it through two
windows, A and B. Each window is bound to one of 256 *index descriptors*,
and a descriptor is a 24-bit address into MIA RAM plus rules for moving it:
a step, a direction, a range to wrap in.

- Writing `IDXA_SELECT` binds a descriptor to window A and loads
  `IDXA_PORT` with the byte at its address.
- Reading or writing `IDXA_PORT` reads or writes that byte, and the
  descriptor then steps if its flags say so. Reading a whole block is a loop
  of `LDA IDXA_PORT`.
- Window B, at `$FFE4-$FFE5`, works the same way, so a program can read
  through one window while writing through the other.

[Index descriptors](../spaces/indexes.md) lists the 256 ids and who owns
each.

## Configuration: `$FFE2-$FFE3`

`CFG_SELECT` picks a configuration field and loads its value into
`CFG_PORT`; reading or writing `CFG_PORT` then reads or writes the field.
Fields `$00-$0B` set up the descriptor bound to window A (its address,
default, limit, step and flags), `$10-$1B` window B's, and `$20-$22` the
CPU's clock speed. Writing an address byte reloads that window's port from
the new address, so the next read needs no new select.
[Configuration fields](../spaces/config.md) lists them.

To read MIA RAM at `$14000` through program index `$00`, one byte at a time
with the address stepping forward:

```asm
IDXA_PORT   = $FFE0
IDXA_SELECT = $FFE1
CFG_SELECT  = $FFE2
CFG_PORT    = $FFE3

        lda #$00
        sta IDXA_SELECT         ; bind index $00 to window A
        ldx #$00                ; CFG_IDXA_ADDR_L
        lda #$00
        jsr set
        inx                     ; CFG_IDXA_ADDR_M
        lda #$40
        jsr set
        inx                     ; CFG_IDXA_ADDR_H
        lda #$01
        jsr set
        ldx #$09                ; CFG_IDXA_STP_L: step 1
        lda #$01
        jsr set
        inx                     ; CFG_IDXA_STP_H
        lda #$00
        jsr set
        inx                     ; CFG_IDXA_FLAGS: step after each read and write
        lda #%00000011
        jsr set
        lda IDXA_PORT           ; the byte at $14000; the address moves to $14001
        ...

set:    stx CFG_SELECT
        sta CFG_PORT
        rts
```

## Commands: `$FFE6-$FFE9`

For work that takes more than a byte, the CPU asks MIA to do it: copy a
block of MIA RAM, start the sound, open a file. Write up to three
parameters to `CMD_PARAM1-3`, then the command's id to `CMD_TRIGGER`. MIA
queues the command and runs it while the CPU goes on.
[Commands](../spaces/commands.md) lists the ids.

## Status and errors: `$FFEA-$FFED`

`STATUS_L` and `STATUS_H` report what MIA is doing: whether a command or a
copy is running, whether the SD card is ready, where the video update
stands. `ERROR_L` pops MIA's error queue: each read returns the oldest error
code, or `$00` when there is none. `ERROR_H` is unused.
[Status, IRQ and error codes](../spaces/codes.md) lists the bits and codes.

## Interrupts: `$FFEE-$FFF1`

MIA can interrupt the CPU when something it watches happens: a command
finishes, a key is pressed, the video client asks for a frame. `IRQ_MASK_L`
and `IRQ_MASK_H` choose which events pull the IRQ line; `IRQ_STATUS_L` and
`IRQ_STATUS_H` show which are pending. Bit 15, `IRQ_TRIGGERED`, is set while
any enabled event is pending.

Reading `IRQ_STATUS_L` (`$FFF0`) clears every pending bit and releases the
line. Reading `IRQ_STATUS_H` (`$FFF1`) changes nothing, so a handler that
needs the high byte reads `$FFF1` first and `$FFF0` second. The kernel's
interrupt handler reads `$FFF0` on every tick, so a program that chains its
own handler in front reads both before passing control on.

## Input: `$FFF2-$FFF4`

`INPUT_CHAR` (`$FFF3`) pops MIA's text queue: each read returns the next
typed character, or `$00` when the queue is empty. `INPUT_CHAR_COUNT`
(`$FFF4`) says how many are waiting, up to 64, and `INPUT_STATUS` (`$FFF2`)
summarizes what is held down and which input source is active
([Input state](../mia/input.md) has its bits). The kernel's `CHRIN` and
`GETKEY_NB` read the queue for BASIC.

## The context stack: `$FFF5`

An interrupt handler that uses the windows, `CFG_SELECT` or the command
parameters changes state the interrupted code may be in the middle of
using. Writing `$01` to `MIA_CTX` saves both window selections, the two
descriptors bound to them, `CFG_SELECT` and `CMD_PARAM1-3`; writing `$02`
restores them and reloads the ports. The stack is four deep, enough for an
IRQ interrupted by an NMI. The kernel's handler does this around its own
MIA work, so a program's bindings survive interrupts.

## `$FFF6-$FFF9`

Reserved: they read as zero and ignore writes.

## The vectors: `$FFFA-$FFFF`

The 6502 fetches its NMI, reset and IRQ/`BRK` addresses from the top six
bytes of memory. On Clementina those bytes are MIA registers, not ROM, so
they can be written like any register:

| Address | Vector | Points at |
| --- | --- | --- |
| `$FFFA-$FFFB` | NMI | The kernel's NMI handler, a bare `RTI`. |
| `$FFFC-$FFFD` | RESET | `$0400`, `KERN_COLDSTART`. During boot, MIA's loader at `$FFE0`. |
| `$FFFE-$FFFF` | IRQ and `BRK` | The kernel's handler, `KERN_IRQ`. |

A program that takes over interrupts writes its handler's address to
`$FFFE-$FFFF`, with interrupts masked between the two stores, and puts
`KERN_IRQ` back before returning to BASIC ([the jump
table](jump-table.md#taking-over-the-irq)). Warm start restores the IRQ
vector.
