# I/O and the VIA

`$C000-$DFFF` (49152-57343)

The I/O area is eight slots of 1 KiB, each with its own chip select line
from the decoder ([The address decode](decode.md)). Slot 0 is the board's
65C22 VIA; slots 1-7 go to the two expansion headers.

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

## Address entries

Decimal addresses come first, followed by hexadecimal and the register or
slot name. The VIA's sixteen registers repeat every 16 bytes in slot 0;
use the first copy at `$C000-$C00F`.

### 49152　　$C000　　VIA_ORB

Data register for VIA Port B. Its eight PB pins reach the user port, and
the kernel leaves them available to programs. Set the matching direction
bits in `VIA_DDRB` at `$C002` before driving outputs. Reading a pin
configured as input samples its external level.

### 49153　　$C001　　VIA_ORA

Data register for VIA Port A. Bits 0-4 drive the five high address lines
of extended RAM, selecting one of 32 banks at `$8000-$BFFF`. A program may
write a bank number here temporarily, but must map bank 0 before returning
to BASIC. Bits 5-7 are not connected to the bank chip.

### 49154　　$C002　　VIA_DDRB

Direction register for Port B: a bit set to 1 makes that PB pin an output,
and 0 makes it an input. The kernel does not use Port B, so a program can
configure its pins for devices on the user port. The matching data values
are read or written through `VIA_ORB` at `$C000`.

### 49155　　$C003　　VIA_DDRA

Direction register for Port A. The kernel sets bits 0-4 to outputs so the
bank number in `VIA_ORA` reaches extended RAM. Changing those bits to
inputs would make the bank selection unreliable. The upper three bits are
not used by the system.

### 49156　　$C004　　VIA_T1CL

Low byte of Timer 1's current count. The kernel uses Timer 1 for its
regular interrupt; reading this register also clears Timer 1's interrupt
flag. A program inspecting it must account for that side effect, because
clearing the flag can suppress a tick the kernel was about to service.

### 49157　　$C005　　VIA_T1CH

High byte of Timer 1's current count. Writing it starts the timer using
the current latch value. The kernel owns Timer 1, so changing this byte
affects its tick counter and cursor blink as well as the next interrupt.

### 49158　　$C006　　VIA_T1LL

Low byte of Timer 1's reload latch. The kernel normally loads 6,250
cycles, giving 192 interrupts per second at a 1.2 MHz CPU clock. Changing
the latch changes the future interrupt rate; see the example in the
[jump-table chapter](jump-table.md#taking-over-the-irq).

### 49159　　$C007　　VIA_T1LH

High byte of Timer 1's reload latch, paired with `$C006`. Together the
two bytes form the timer period used in free-running mode. A program that
alters them changes how often `KJIFFY` advances; MIA's independent `TI`
clock is unaffected.

### 49160　　$C008　　VIA_T2CL

Low byte of Timer 2's count. Unlike Timer 1, Timer 2 is not used by the
kernel, so an application can use it for its own timing or user-port work.
It still shares the VIA's interrupt line; enable and service its interrupt
properly if the application uses one.

### 49161　　$C009　　VIA_T2CH

High byte of Timer 2's count. Together with `$C008`, it is Timer 2's
16-bit counter interface. The kernel leaves the timer free, but warm start
disables non-Timer-1 VIA interrupts, so a returning application must not
expect its Timer 2 interrupt setup to persist.

### 49162　　$C00A　　VIA_SR

The VIA's shift register. The kernel does not use it, and it is available
to an application connected through the user port. Its timing and pin
behavior are controlled by the shift-register bits in `VIA_ACR` at `$C00B`.

### 49163　　$C00B　　VIA_ACR

Auxiliary control register. The kernel owns bits 6-7 for Timer 1's
free-running mode and its PB7 output setting; it preserves bits 0-5 when
it initializes the VIA. Programs using Timer 2 or the shift register can
change those lower bits without changing the kernel's timer mode.

### 49164　　$C00C　　VIA_PCR

Peripheral control register for the CA1, CA2, CB1 and CB2 user-port pins.
It selects their edge and handshake behavior. The kernel leaves these
lines to applications, but an application using their interrupts must
clear its flags before chaining to the kernel's handler.

### 49165　　$C00D　　VIA_IFR

Interrupt flag register. Each source sets its bit here; bit 6 is Timer 1,
which the kernel services. A program using another source checks its bit
and clears it before returning from the handler. Timer 1's flag also
clears when `VIA_T1CL` is read.

### 49166　　$C00E　　VIA_IER

Interrupt enable register. Writing with bit 7 set enables the sources
named by the other bits; writing with bit 7 clear disables them. The
kernel enables only Timer 1 at reset and warm start. An application should
disable its own sources before returning to BASIC if no handler will
remain to service them.

### 49167　　$C00F　　VIA_ORA_NH

An alternate way to access Port A without the ordinary handshake action.
It reaches the same PA pins as `VIA_ORA`, including PA0-PA4 that select the
extended-RAM bank. It is not a second bank register; a write here changes
the bank visible at `$8000-$BFFF` just as a write to `$C001` does.

### 49168–50175　　$C010–$C3FF　　VIA mirrors

The VIA sees only address lines A0-A3, so its sixteen registers appear
again every 16 bytes through the rest of slot 0. For example, `$C010`
acts exactly like `$C000`, including any read or write side effects. Use
the first copy when documenting or sharing software so addresses stay
unambiguous.

### 50176–51199　　$C400–$C7FF　　IOCS1

Expansion slot 1 is selected by `~IOCS1`. No device on the base board
answers here. An expansion card can claim the slot and define its own
registers; without one, reads have no defined value and writes do nothing.

### 51200–52223　　$C800–$CBFF　　IOCS2

Expansion slot 2 is selected by `~IOCS2`. Its 1 KiB is available to a card
on the expansion headers. The card decides which of the ten low address
lines it decodes, so it may mirror a smaller register set within the slot.

### 52224–53247　　$CC00–$CFFF　　IOCS3

Expansion slot 3 is selected by `~IOCS3`. It has no base-board device and
therefore no fixed register meanings in this book. Software should access
it only when a card's own documentation assigns addresses there.

### 53248–54271　　$D000–$D3FF　　IOCS4

Expansion slot 4 is selected by `~IOCS4`. A card can use it for up to
1 KiB of I/O registers or mirror fewer registers through the range.
With no card installed, a read is undefined and a write has no target.

### 54272–55295　　$D400–$D7FF　　IOCS5

Expansion slot 5 is selected by `~IOCS5`. It is part of the same shared
expansion bus as the other free slots, with data lines, control strobes
and interrupt lines on the headers. No Clementina system component owns it.

### 55296–56319　　$D800–$DBFF　　IOCS6

Expansion slot 6 is selected by `~IOCS6`. A card that claims this select
line may place its registers here. Programs should use the card's register
map rather than assuming this range behaves like RAM.

### 56320–57343　　$DC00–$DFFF　　IOCS7

Expansion slot 7 is selected by `~IOCS7`, the last 1 KiB before MIA's
mirrored register block begins at `$E000`. It is empty on the base board.
A card may claim it; otherwise reads are undefined and writes go nowhere.
