# The VIA and the user port

Clementina has one **W65C22S VIA** (Versatile Interface Adapter), the CMOS
version of the 6522 in the Commodore 64's disk drive and many other 6502
computers. It has two 8-bit ports, four handshake lines, two timers and a
shift register. Its 16 registers are at `$C000-$C00F`.

The system uses only part of it:

| Part | Used for |
| --- | --- |
| Port A, bits 0-4 | Choosing the extended RAM bank ([Extended RAM and banking](banking.md)). |
| Port A, bits 5-7 | Not connected. |
| Timer 1 | The kernel's interrupt ([Interrupts](interrupts.md)). |
| Port B, CA1, CA2, CB1, CB2 | Free, on the **user port**. |
| Timer 2, shift register | Free. |

The registers, with the names the SDK's `clementina.inc` gives them:

| Address | Name | Register |
| --- | --- | --- |
| `$C000` | `VIA_ORB` | Port B data. |
| `$C001` | `VIA_ORA` | Port A data: the bank. |
| `$C002` | `VIA_DDRB` | Port B direction: 1 makes a bit an output. |
| `$C003` | `VIA_DDRA` | Port A direction. |
| `$C004-$C005` | `VIA_T1CL`, `VIA_T1CH` | Timer 1 counter. |
| `$C006-$C007` | `VIA_T1LL`, `VIA_T1LH` | Timer 1 latch. |
| `$C008-$C009` | `VIA_T2CL`, `VIA_T2CH` | Timer 2 counter. |
| `$C00A` | `VIA_SR` | Shift register. |
| `$C00B` | `VIA_ACR` | Auxiliary control: timer and shift register modes. |
| `$C00C` | `VIA_PCR` | Peripheral control: CA1, CA2, CB1, CB2. |
| `$C00D` | `VIA_IFR` | Interrupt flags. |
| `$C00E` | `VIA_IER` | Interrupt enable. |
| `$C00F` | `VIA_ORA_NH` | Port A data, without handshake. |

The registers repeat every 16 bytes up to `$C3FF`; use `$C000-$C00F`. What
each bit means is in *Mapping Clementina*,
[Input/output](../../../mapping/src/cpu/io.md), and in WDC's W65C22 data
sheet.

## The user port

The **user port** is a 20-pin header at the edge of the board. It carries
port B (PB0-PB7), CA1, CA2, CB1, CB2, the reset line, 3.3 V, 5 V and ground;
the pin numbers are in the *Hardware & MIA Technical Reference*. The pins
work at 3.3 V: never connect 5 V to one, and drive LEDs through a resistor.

Port B starts as eight inputs. A program makes bits outputs by setting them
in `VIA_DDRB`, then writes them in `VIA_ORB`. From BASIC:

```basic
10 POKE 49154,255: REM DDRB: ALL OUTPUTS
20 POKE 49152,170: REM ORB: %10101010
30 PRINT PEEK(49152)
```

```text
 170
```

Reading `VIA_ORB` gives the level of each pin: for an output the value written,
for an input whatever drives it. The kernel never touches port B, `DDRB` or
`PCR`, and warm start leaves them as they are.

## Timer 2

Timer 2 counts down once every CPU cycle from the value written to it. It is
free for programs. Writing the high byte, `VIA_T2CH`, starts it, and when it
reaches zero it sets bit 5 of `VIA_IFR`. This routine waits for 1,000 cycles
with it:

<!-- example: org=$0280 prg=T2.PRG run="BLOAD \"T2.PRG\"|SYS 640: PRINT \"DONE\"" -->
```asm
.include "clementina.inc"

        lda #<1000
        sta VIA_T2CL
        lda #>1000
        sta VIA_T2CH            ; starts counting
wait:   lda VIA_IFR
        and #%00100000          ; Timer 2 done?
        beq wait
        lda VIA_T2CL            ; reading the low byte clears the flag
        rts
```

The timers count CPU cycles, so how long a count lasts depends on the CPU's
clock. To wait for a length of time, use MIA's clocks instead
([Time](../mia/time.md)).

## Interrupts from the VIA

The VIA shares the 6502's IRQ line with MIA and any expansion card. Only Timer
1's interrupt is enabled after reset. To use another source, CA1 for example,
a program:

1. chains its own handler in front of the kernel's
   ([Interrupts](interrupts.md));
2. enables the source by writing `VIA_IER` with bit 7 and the source's bit
   set;
3. in the handler, checks the source's bit in `VIA_IFR`, does its work and
   clears the flag by writing the bit back to `VIA_IFR`, then chains with
   `JMP KERN_IRQ`. The kernel's handler clears only Timer 1's flag.
4. turns the source off again, by writing its bit to `VIA_IER` with bit 7
   clear, before returning to BASIC.

The last step matters: a source that keeps interrupting with no handler to
clear it holds the IRQ line down, and the machine hangs in its interrupt
handler. `KERN_WARMSTART` turns every source but Timer 1 off.

This program counts falling edges on CA1 in `$98`:

<!-- example: org=$0280 prg=CA1.PRG run="BLOAD \"CA1.PRG\"|SYS 640: SYS 643: PRINT PEEK(152)" -->
```asm
.include "clementina.inc"
CA1   = %00000010
COUNT = $98

        jmp ca1_on              ; SYS 640
        jmp ca1_off             ; SYS 643
ca1_on:
        sei
        lda #<ca1_irq
        sta IRQ_VEC
        lda #>ca1_irq
        sta IRQ_VEC+1
        lda #CA1
        sta VIA_IFR             ; drop an old CA1 flag
        lda #($80 | CA1)
        sta VIA_IER             ; enable CA1
        cli
        rts
ca1_off:
        lda #CA1
        sta VIA_IER             ; bit 7 clear: disable CA1
        sei
        lda #<KERN_IRQ
        sta IRQ_VEC
        lda #>KERN_IRQ
        sta IRQ_VEC+1
        cli
        rts
ca1_irq:
        pha
        lda VIA_IFR
        and #CA1
        beq chain
        sta VIA_IFR             ; clear the CA1 flag
        inc COUNT
chain:  pla
        jmp KERN_IRQ
```

After reset CA1 reacts to a falling edge; setting bit 0 of `VIA_PCR` makes it
react to a rising one.

## Changing the bank bits

Port A's bits 0-4 are outputs for the bank, and bits 5-7 lead nowhere. Write
only bank numbers 0-31 to `VIA_ORA`, and leave `VIA_DDRA` as the kernel sets
it: making a bank bit an input leaves that address line floating.
