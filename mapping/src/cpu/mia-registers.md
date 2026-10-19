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

## Address entries

Decimal addresses come first, followed by hexadecimal and the register
name. Each register repeats every 32 bytes below `$FFE0`; the addresses
here are the canonical copies at the top of CPU memory.

### 65504　　$FFE0　　IDXA_PORT

Data window A into MIA RAM. Its selected index descriptor determines which
MIA RAM byte the port reaches. A read returns that byte; a write changes
it. Depending on the descriptor's flags, either access can advance the
descriptor's address, so repeated reads or writes can stream through a
block without changing the CPU address used by the program.

### 65505　　$FFE1　　IDXA_SELECT

Selects one of MIA's 256 index descriptors for window A. Write an index id
here before using `$FFE0`; MIA then loads the port from that descriptor's
current address. Selecting an id does not reset its address, so a program
can keep several descriptors positioned and switch between them.

### 65506　　$FFE2　　CFG_SELECT

Selects a configuration field for the data port at `$FFE3`. Fields
`$00-$1B` describe the indexes currently bound to windows A and B; fields
`$20-$22` control CPU speed. Selecting a field loads its current value
into `CFG_PORT`. An interrupt handler using configuration fields must save
and restore the selection with `MIA_CTX`.

### 65507　　$FFE3　　CFG_PORT

Reads or writes the configuration field named by `CFG_SELECT`. For an
index's address, the fields are separate low, middle and high bytes.
Changing a current-address byte reloads that window's data port, so the
next read of its index port begins at the new address. Configuration
fields and their meanings are listed in [Part III](../spaces/config.md).

### 65508　　$FFE4　　IDXB_PORT

Data window B into MIA RAM. It works like window A but has its own selected
descriptor and data port. A program can therefore read through one window
while writing through the other, for example to transform a stream of
bytes. Its descriptor may advance after each access according to its flags.

### 65509　　$FFE5　　IDXB_SELECT

Selects the index descriptor bound to window B at `$FFE4`. The selection
loads the byte at that descriptor's current address into the port without
resetting the descriptor. Kernel calls may rebind a window, so code that
depends on a particular B selection should select it again after a call.

### 65510　　$FFE6　　CMD_PARAM1

First parameter byte for a MIA command. Its meaning depends on the command:
it may be an index id, a voice mask, or part of an address. Set all needed
parameter bytes before writing the command id to `CMD_TRIGGER`. An
interrupt handler that uses commands should preserve the parameter state
with `MIA_CTX`.

### 65511　　$FFE7　　CMD_PARAM2

Second command parameter byte. Copy commands, for example, use the
parameter registers to name their source and destination indexes. This
register by itself starts no action; the command begins only when the id
is written to `$FFE9`.

### 65512　　$FFE8　　CMD_PARAM3

Third command parameter byte. Some commands use all three bytes for a
24-bit MIA RAM address or a count; others ignore it. Consult the command's
entry in [Part III](../spaces/commands.md) before assigning a value.

### 65513　　$FFE9　　CMD_TRIGGER

Writing a command id here queues the operation described by the current
parameter registers. The CPU can continue while MIA processes it. Read
status or completion IRQ flags before assuming a long file, copy or audio
operation has finished; writing a new id is a request, not a synchronous
subroutine call.

### 65514　　$FFEA　　STATUS_L

Low byte of MIA's current status flags. Bits report states such as a
running command, a copy in progress or a video update. Reading it does not
consume a result. [Status codes](../spaces/codes.md) names each bit, and a
program should test the particular bit it needs rather than comparing the
whole byte to one fixed value.

### 65515　　$FFEB　　STATUS_H

High byte of MIA's status flags, extending the low byte at `$FFEA`.
Together they expose more than eight independent conditions. Some flags
can change while the CPU reads the pair, so software should use the
command's documented completion condition rather than treating a pair of
reads as a frozen snapshot.

### 65516　　$FFEC　　ERROR_L

Reading this register removes the oldest code from MIA's error queue.
When the queue is empty it returns `$00`. Because the read consumes the
code, a debugger or polling loop can change what a later reader sees;
store the value if it must be reported after inspection. [Error
codes](../spaces/codes.md#errors-ffec) explain each nonzero value.

### 65517　　$FFED　　ERROR_H

The high error register is currently unused. It is read-only and does not
pop the error queue; active error codes come from `ERROR_L` at `$FFEC`.
Programs should not use it as storage or infer future behavior from its
current value.

### 65518　　$FFEE　　IRQ_MASK_L

Low byte of the interrupt-enable mask for MIA events. Setting a bit lets
the corresponding pending event pull the CPU's IRQ line; clearing it
prevents that source from doing so. The bit positions match the event list
in [Status, IRQ and error codes](../spaces/codes.md).

### 65519　　$FFEF　　IRQ_MASK_H

High byte of the MIA IRQ mask. It enables or disables event bits 8-15 in
the same way as `$FFEE` handles bits 0-7. A masked event can still have
status; masking controls whether it requests an interrupt, not whether
the underlying event occurred.

### 65520　　$FFF0　　IRQ_STATUS_L

Shows the low pending IRQ bits, then clears MIA's top-level pending status
when read. That read also releases MIA's IRQ request. If a handler needs
both bytes, it must read `IRQ_STATUS_H` at `$FFF1` first, then this byte,
and save both values before chaining to the kernel's handler.

### 65521　　$FFF1　　IRQ_STATUS_H

Shows the high pending IRQ bits without clearing them. Bit 15 indicates
that at least one enabled MIA event is requesting the CPU's IRQ line.
Read this byte before `$FFF0` when the same interrupt needs both halves;
reading the low byte first would clear the pending report.

### 65522　　$FFF2　　INPUT_STATUS

Summarizes the current input devices and held controls. It reports state,
whereas `INPUT_CHAR` at `$FFF3` provides a queue of typed characters.
Use the status bits when a program needs to know whether a control is down
or which source is active, not merely which text byte arrived next.

### 65523　　$FFF3　　INPUT_CHAR

Reading pops the next byte from MIA's text input queue. It returns `$00`
when no character is waiting. A program polling the queue consumes input
that BASIC or the kernel might otherwise receive, so cooperate with the
foreground input path when sharing the console.

### 65524　　$FFF4　　INPUT_CHAR_COUNT

The number of bytes currently waiting in the text input queue, up to 64.
Reading the count does not remove a character. It can change immediately
as input arrives, so code should still handle `$00` from `INPUT_CHAR`
instead of assuming a count read guarantees a later byte.

### 65525　　$FFF5　　MIA_CTX

Write `$01` to push the current window selections, their bound descriptor
state, configuration selection and command parameters onto MIA's context
stack. Write `$02` to restore the last pushed state and reload the ports.
The stack is four deep; overflow and underflow queue errors. Interrupt
handlers use this around MIA operations so the interrupted program finds
its windows as it left them. Reading returns the last value written, not
the stack depth.

### 65526–65529　　$FFF6–$FFF9　　Reserved

These four registers are unassigned. Reads return zero and writes are
ignored. Their addresses still mirror through `$E000-$FFDF` like every
other MIA register, so the mirrored copies are not extra RAM.

### 65530–65531　　$FFFA–$FFFB　　NMI_VEC_L / NMI_VEC_H

The 65C02 fetches this two-byte address when a non-maskable interrupt
arrives. MIA exposes the bytes as writable registers; the kernel normally
points them at its bare `RTI` handler. A program taking over NMI must
install a valid handler and preserve any state it interrupts.

### 65532–65533　　$FFFC–$FFFD　　RESET_VEC_L / RESET_VEC_H

The CPU reads this address after reset. During the boot copy MIA points it
at a small loader in its register block; afterward it points at
`KERN_COLDSTART` at `$0400`. Changing it affects the next reset rather
than jumping there immediately, and an invalid value could prevent the
machine from starting normally.

### 65534–65535　　$FFFE–$FFFF　　IRQ_VEC_L / IRQ_VEC_H

The 65C02 fetches this two-byte address for an IRQ or `BRK`. The kernel
normally points it at `KERN_IRQ`. A program may install its own handler,
but it must write both bytes while interrupts are masked so the CPU cannot
fetch a half-updated address. Restore the kernel vector before returning
to BASIC unless warm start will do it for you.
