# I/O and the VIA

`$C000-$DFFF` (49152-57343)

The I/O area is eight slots of 1 KiB, each with its own chip select line
from the decoder ([The address decode](decode.md)). Slot 0 is the board's
65C22 VIA; slots 1-7 go to the two expansion headers.

{{#include ../../../tables/cpu-memory-map.md:io-slots}}

## Expansion slots 1-7: `$C400-$DFFF`

The expansion headers J1 and J2 carry A0-A9, the data bus, PHI2, R/W, the
read and write strobes, reset, `~IRQB`, `~NMI`, RDY and all seven slot
selects `~IOCS1`-`~IOCS7`. A card claims a slot by jumpering one select line
and decodes as many of A0-A9 as it needs; one that decodes fewer repeats its
registers through the slot, as the VIA does. An empty slot answers nothing.

The headers are 3.3 V logic. Never put 5 V on a pin. A card that interrupts
the CPU pulls `~IRQB` low through a Schottky diode or an open-drain output,
like MIA and the VIA do, and never drives it high; the same goes for `~NMI`
and RDY. The pin-out is in clementina-hardware's README.

## The VIA: `$C000-$C3FF`

The W65C22S has 16 registers on A0-A3, so they repeat every 16 bytes through
the slot. Use `$C000-$C00F` (49152-49167).

{{#include ../../../tables/cpu-memory-map.md:via}}

What the system uses, part by part:

| Part | Registers | Used for |
| --- | --- | --- |
| Port A, PA0-PA4 | `ORA` `$C001`, `DDRA` `$C003` | The extended RAM bank, 0-31. Outputs. |
| Port A, PA5-PA7 | the same | Nothing: not connected on the board. Inputs. |
| Port B, PB0-PB7 | `ORB` `$C000`, `DDRB` `$C002` | Free, on the user port. The kernel never touches them. |
| CA1, CA2, CB1, CB2 | `PCR` `$C00C` | Free, on the user port. |
| Timer 1 | `$C004-$C007`, `ACR` bits 7-6 | The kernel's tick. |
| Timer 2, shift register | `$C008-$C00A`, `ACR` bits 5-0 | Free. |
| Interrupts | `IFR` `$C00D`, `IER` `$C00E` | Only Timer 1's is enabled. |

### The user port

J3, a 2×10 header at the board's edge, carries PB0-PB7, CA1, CA2, CB1, CB2,
`~RESB`, 3.3 V, 5 V and ground. Like the expansion headers it is 3.3 V
logic: never put 5 V on a port pin, and drive LEDs through a resistor, since
the pins have no current limit. To use Port B, set the direction of each pin
in `DDRB` (1 is an output) and read or write `ORB`:

```basic
10 POKE 49154,255:REM DDRB: ALL OUTPUTS
20 FOR I=0 TO 255:POKE 49152,I:NEXT
```

### Timer 1

The kernel runs Timer 1 in free-running mode with its PB7 output off. It
reloads from a latch of 6250 (`VIA_T1_RELOAD`), so it interrupts every 6250
PHI2 cycles: 192 times a second at the default 1.2 MHz. Each interrupt adds
one to `KJIFFY` and, while the kernel waits for a key, counts down the cursor
blink. [The kernel jump table](jump-table.md#taking-over-the-irq) shows how
to change its rate, stop it or chain a handler in front of it.

### What reset and warm start set

Reset and warm start (`KERN_WARMSTART`, and WozMon's `Q`) both run
`via_init`. It:

- maps bank 0 (`ORA = 0`, then `DDRA = %00011111`) and sets `DATA_BANK` to 0;
- turns every interrupt source off and clears its flag;
- sets `ACR` bits 7-6 for Timer 1, keeping bits 5-0 (0 after a reset);
- loads Timer 1's latch and counter with 6250 and enables its interrupt.

Port B, `DDRB`, `PCR` and Timer 2 keep whatever they had. A program that
returns to BASIC with `RTS` keeps everything it set, so an interrupt source
it left on keeps firing.

### Using another VIA interrupt

Every VIA interrupt source but Timer 1 is off after reset. To use one, for
example CA1 on the user port (falling edge after reset; `PCR` bit 0 set
makes it the rising edge):

1. Chain a handler in front of the kernel's
   ([the jump table](jump-table.md#taking-over-the-irq)). The kernel's handler
   clears only Timer 1, so your handler clears its own flag, by writing that
   bit back to `IFR`, before it chains.
2. Enable the source by writing `IER` with bit 7 and the source's bit set.
   Writing it with bit 7 clear turns the source off.
3. Turn the source off before returning to BASIC with `RTS`. A source that
   fires with nobody to clear it holds `~IRQB` low, and BASIC hangs in an
   endless interrupt. Warm start turns it off for you.

```asm
VIA_IFR  = $C00D
VIA_IER  = $C00E
IRQ_VEC  = $FFFE
KERN_IRQ = $042A
CA1      = %00000010

ca1_on:
        sei
        lda #<ca1_irq
        sta IRQ_VEC
        lda #>ca1_irq
        sta IRQ_VEC+1
        lda #CA1
        sta VIA_IFR             ; drop a stale CA1 flag
        lda #($80 | CA1)
        sta VIA_IER             ; enable CA1
        cli
        rts

ca1_irq:
        pha
        lda VIA_IFR
        and #CA1
        beq @chain
        sta VIA_IFR             ; clear the CA1 flag
        ; ... the work, leaving X and Y as they were ...
@chain: pla
        jmp KERN_IRQ            ; KJIFFY, the cursor and MIA's IRQ status

ca1_off:
        lda #CA1
        sta VIA_IER             ; bit 7 clear: disable CA1
        sei
        lda #<KERN_IRQ          ; the kernel's handler again
        sta IRQ_VEC
        lda #>KERN_IRQ
        sta IRQ_VEC+1
        cli
        rts
```

## Sharing the interrupt line

`~IRQB` is a wired-AND line. MIA, the VIA and any card each pull it low
through a diode against a 4.7 kΩ pull-up, so none can fight another. The
CPU only sees that someone wants attention; a handler finds out who by
checking each source: the VIA's `IFR`, MIA's `IRQ_STATUS`
([The MIA registers](mia-registers.md)), and any card's own status.
