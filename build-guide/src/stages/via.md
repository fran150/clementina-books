# Stage 7: The VIA

The W65C22S VIA is Clementina's I/O chip. Its port A selects the extended
RAM bank (stage 8), its port B goes to the user port, and its Timer 1
interrupts the CPU about 190 times a second. The kernel uses that interrupt
to blink the cursor, which makes the blink this stage's first check.

## Parts

| Part | Qty | On the schematic | Notes |
| --- | --- | --- | --- |
| W65C22S VIA | 1 | U3 | DIP-40 |
| 100 nF ceramic capacitor | 1 |  |  |
| BAT85 Schottky diode | 1 | D2 | The VIA's interrupt |
| LEDs and 1 kΩ resistors | 8 each |  | On port B; the ones from stage 4 |
| 10 kΩ resistor | 4 |  | Optional: CA1, CA2, CB1, CB2 to 3.3 V |

## What you add

The VIA (U3, W65C22S) on board 3, with its 100 nF capacitor, the diode D2 on its
interrupt output, and eight LEDs on port B. The VIA takes its bus lines
from its neighbours' rows, not from the CPU's: D0-D7 and A0-A3 from the base
RAM (U4), RWB and PHI2 from U9 (74AC00). Its data pins carry D7-D0 on the
same pin numbers as the CPU's, 26 to 33. Leave a free hole in each of its
D0-D7 and A0-A3 rows: the extended RAM takes them from here in stage 8.

| U3 pin | Signal | Connects to | Wire | Notes |
| --- | --- | --- | --- | --- |
| 1 | GND | GND | black | `VSS` |
| 2 | PA0 | | - | Extended RAM bank bit 0, in stage 8 |
| 3 | PA1 | | - | Bank bit 1, stage 8 |
| 4 | PA2 | | - | Bank bit 2, stage 8 |
| 5 | PA3 | | - | Bank bit 3, stage 8 |
| 6 | PA4 | | - | Bank bit 4, stage 8 |
| 7 | unconnected | | - | `PA5` |
| 8 | unconnected | | - | `PA6` |
| 9 | unconnected | | - | `PA7` |
| 10 | PB0 | | - | LED, the "high" way, to GND |
| 11 | PB1 | | - | LED |
| 12 | PB2 | | - | LED |
| 13 | PB3 | | - | LED |
| 14 | PB4 | | - | LED |
| 15 | PB5 | | - | LED |
| 16 | PB6 | | - | LED |
| 17 | PB7 | | - | LED |
| 18 | CB1 | | - | User port; see below |
| 19 | CB2 | | - | User port |
| 20 | 3.3 V | 3.3 V | red | `VDD` |
| 21 | ~VIAIRQ | | - | To D2 (below) |
| 22 | RWB | U9.1 | green | From U9.1's row on board 3 |
| 23 | ~IOCS0 | U6.15 | green | `~CS2`: the VIA is slot 0, `$C000` |
| 24 | 3.3 V | 3.3 V | red | `CS1`: always enabled; `~CS2` alone selects it |
| 25 | PHI2 | U9.5 | white | From U9.5's row on board 3 |
| 26 | D7 | U4.19 | blue | |
| 27 | D6 | U4.18 | blue | |
| 28 | D5 | U4.17 | blue | |
| 29 | D4 | U4.16 | blue | |
| 30 | D3 | U4.15 | blue | |
| 31 | D2 | U4.13 | blue | |
| 32 | D1 | U4.12 | blue | |
| 33 | D0 | U4.11 | blue | |
| 34 | ~RESB | U1.40 | green | MIA resets the VIA with the CPU |
| 35 | A3 | U4.7 | yellow | `RS3` |
| 36 | A2 | U4.8 | yellow | `RS2` |
| 37 | A1 | U4.9 | yellow | `RS1` |
| 38 | A0 | U4.10 | yellow | `RS0` |
| 39 | CA2 | | - | User port |
| 40 | CA1 | | - | User port |

| Part | Value | First leg (band) | Second leg | Notes |
| --- | --- | --- | --- | --- |
| D2 | BAT85 | U3.21 | U1.4 | The band (cathode) faces the VIA. The second leg goes in the `~IRQB` row from stage 4 |

The register selects run backwards: RS0 (A0) is pin 38 and RS3 (A3) pin 35.

On the PCB, port B and CA1, CA2, CB1 and CB2 go only to the user port
header. On the breadboard, port B drives the LEDs (through their 1 kΩ
resistors; the VIA's outputs have no current limit of their own). CA1, CA2,
CB1 and CB2 can be left open, but floating handshake inputs can pick up
noise and set interrupt flags the kernel doesn't expect. A 10 kΩ resistor
from each to 3.3 V is a cheap insurance; it is a breadboard extra, not part
of the schematic.

## Check

**Before you plug in**, run the
[power-up checks](../breadboard.md#before-you-power-up) on what you just
added.

1. Plug in, start the video client, and press RESET. The banner and
   `READY.` come up as in stage 6, and **the cursor now blinks**, about
   once every 0.8 s. The blink comes from the VIA's Timer 1 interrupt, so it
   proves the VIA, its chip select, the data bus to it, and the interrupt
   path through D2.
2. The blink is counted in clock cycles, not seconds. On the console, type
   `speed 2400000`: it blinks twice as fast. `speed 1200000` puts it back.
3. Light the LEDs from BASIC. These lines use only numbers, which is safe
   before the extended RAM:

   ```basic
   POKE 49154,255
   POKE 49152,85
   ```

   49154 is `$C002`, port B's direction register: 255 makes all eight pins
   outputs. 49152 is `$C000`, port B itself: 85 is `0101 0101`, so PB0, PB2,
   PB4 and PB6 light. `POKE 49152,170` lights the other four.
4. Make them count: type this program, then `RUN`.

   <!-- example: skip -->
   ```basic
   10 FOR I=0 TO 255:POKE 49152,I:NEXT:GOTO 10
   ```

   PB0 flickers fastest and PB7 slowest. Stop it with `Ctrl+C`.
5. In WozMon (`MON`), read the registers back. `C002` shows `FF`. Read
   `C004` twice: the two values differ, because Timer 1 counts down every
   clock cycle.
6. Run the stage 6 address test again, then RESET: the VIA must not disturb
   the RAM.

## With a scope

- **The interrupt.** Probe the VIA's U3.21 (`~VIAIRQ`) and trigger on a falling edge.
  It goes low every 5.21 ms (Timer 1 counts 6250, plus two cycles to
  reload, at 1.2 MHz) and comes back up a few microseconds later, when the
  kernel's interrupt handler reads Timer 1 and clears the flag. On the CPU's U1.4
  (`~IRQB`) the same pulse sits a diode drop higher: about 0.2-0.3 V instead
  of 0 V, still well under the CPU's threshold.
- **The chip select's setup time.** The VIA needs `~CS2` low at least about
  10 ns before PHI2 rises. Run the counting program, put channel 1 on PHI2
  (U3.25, the VIA) and channel 2 on `~IOCS0` (U3.23), and trigger on `~IOCS0`
  falling. At 1.2 MHz the select falls hundreds of nanoseconds before PHI2
  rises. Note the gap: stage 10 watches it shrink.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| No blink, everything else fine | D2 reversed (its band must face U3.21), or `~CS2` (U3.23) not on `~IOCS0` |
| No blink, and the screen shows nothing new after RESET | The VIA holds the data bus: check it's not in backwards, and that U3.22 is RWB |
| LEDs stay dark | RS0-RS3 swapped (they run backwards), LEDs reversed, or CS1 (U3.24) not at 3.3 V |
| The wrong LEDs light | PB pins in the wrong order, or the LEDs not in PB0-PB7 order |
| `C004` reads the same twice | PHI2 not reaching U3.25 |
