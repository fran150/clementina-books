# Interrupts

An **interrupt** makes the 6502 stop what it is doing, run a handler, and go
back. Clementina has two sources of the ordinary interrupt, **IRQ**, on one
shared line: the **VIA**, whose Timer 1 the kernel runs all the time, and
**MIA**, which can interrupt when video, sound, input or the SD card need
attention. Expansion cards can join the same line.

When an IRQ arrives and the I flag is clear, the 6502 finishes its
instruction, pushes the program counter and the status register, sets the I
flag, and jumps to the address in the **IRQ vector** at `$FFFE-$FFFF`. The
handler ends with `RTI`, which pulls them back.

On most 6502 computers the vectors are in ROM. Clementina has no ROM: the
vectors are registers of MIA, and a program can write them like memory.

## The kernel's handler

At reset the kernel starts VIA Timer 1 counting 6,250 CPU cycles and
interrupting each time it runs out, points the IRQ vector at its handler, and
clears the I flag. Each interrupt, the handler:

1. reads MIA's `IRQ_STATUS_L` (`$FFF0`), which acknowledges anything MIA
   raised;
2. if Timer 1 interrupted, acknowledges it and adds one to `KJIFFY`
   (`$F7-$F8`), a 16-bit count;
3. while the kernel waits for a key, counts down to the next blink of the
   cursor.

It touches nothing else. `KJIFFY` counts CPU cycles in units of 6,250, so it
measures how much work the CPU has done, not time; a program that needs time
reads MIA's clocks ([Time](../mia/time.md)). Read `KJIFFY` high byte, low byte,
high byte, and read again if the high byte changed: an interrupt can carry
into it between the two reads.

## Adding a handler of your own

A program does not replace the kernel's handler; it puts its own in front
and lets the kernel's run after it. This is called **chaining**:

1. Write the address of the new handler into the IRQ vector, with interrupts
   masked (`SEI`) so that no interrupt finds the vector half written.
2. The new handler saves the registers it uses, does its work, restores
   **A, X and Y** to the values they had when the interrupt arrived, and ends
   with `JMP KERN_IRQ` (`$042A`). The kernel's handler saves them again, does
   its own work and returns with `RTI`.

This program installs a handler that adds one to the byte at `$98` on every
interrupt, and returns to BASIC with the handler running:

<!-- example: org=$0280 prg=TICK.PRG run="BLOAD \"TICK.PRG\"|SYS 640|A=PEEK(152): DELAY 100: PRINT PEEK(152)<>A|SYS 643" -->
```asm
.include "clementina.inc"
COUNT = $98

        jmp install             ; SYS 640
        jmp remove              ; SYS 643
install:
        sei
        lda #<handler
        sta IRQ_VEC
        lda #>handler
        sta IRQ_VEC+1
        cli
        rts
remove:
        sei
        lda #<KERN_IRQ
        sta IRQ_VEC
        lda #>KERN_IRQ
        sta IRQ_VEC+1
        cli
        rts
handler:
        inc COUNT               ; changes no register
        jmp KERN_IRQ
```

```text
-1
```

`SYS 640` installs it, and BASIC can watch `PEEK(152)` change. `SYS 643` puts
the kernel's handler back. The handler lives at `$0280`, where BASIC never
writes, so it is safe to leave it running while BASIC works. A handler in
memory that BASIC might reuse must be removed before returning to BASIC.

Two rules make a handler safe:

- **MIA's interrupts.** The kernel's handler acknowledges MIA by reading
  `IRQ_STATUS_L`, which clears every MIA flag. A handler that wants to know
  what MIA raised reads `IRQ_STATUS_H` (`$FFF1`) first and `IRQ_STATUS_L`
  second, then acts, then chains ([The MIA model](../mia/model.md)).
- **MIA's windows.** If the handler uses MIA's index windows or configuration
  registers, the interrupted program may have been in the middle of using them
  too. The handler saves MIA's state by writing `MIA_CTX_PUSH` to `MIA_CTX`
  (`$FFF5`) before, and restores it with `MIA_CTX_POP` after. The kernel does
  the same around the cursor blink.

## Changing or stopping the timer

Timer 1 reloads from its latch, `VIA_T1LL` and `VIA_T1LH` (`$C006-$C007`),
every time it runs out. Writing a new count there changes the rate from the
next period: 12,500 halves it. Writing `$40` to `VIA_IER` (`$C00E`) turns the
Timer 1 interrupt off, and `SEI` masks every interrupt. `KJIFFY` and the
cursor blink stop with it; BASIC's `TI`, `DELAY` and key repeat do not, since
MIA counts them. Reset and `KERN_WARMSTART` start Timer 1 again with 6,250.

## What warm start restores

`KERN_WARMSTART`, which WozMon's `Q` also uses, puts things back the way the
kernel needs them, whatever a program changed:

- the IRQ vector points at the kernel's handler again;
- the VIA is set up as at reset: bank 0 mapped, every VIA interrupt off but
  Timer 1, which restarts at 6,250;
- the stack is reset, and interrupts are enabled.

So a program that ends with `JMP KERN_WARMSTART` never has to clean up
interrupts. A program that returns to BASIC with `RTS` keeps everything it
set, including VIA interrupts it turned on: it must turn them off, or point
the vector back at a handler that clears them, before it returns.

## BRK and NMI

`BRK` uses the IRQ vector too. The kernel's handler does not tell it from an
IRQ, so a `BRK` simply carries on two bytes later. A program that wants to
catch `BRK`, for debugging, checks the B flag in the status register its
handler finds on the stack.

The **NMI** (non-maskable interrupt) line is pulled up on the board and
brought out on the expansion connectors; nothing on the board drives it. Its
vector is at `$FFFA-$FFFB`, and the kernel points it at a bare `RTI`. A card
that uses NMI comes with a program that writes its own handler there.

How the IRQ line is shared and how to use the VIA's other interrupt sources is
in [The VIA and the user port](via.md); MIA's interrupt sources are in
[The MIA model](../mia/model.md).
