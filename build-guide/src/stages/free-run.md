# Stage 4: The CPU runs free

This is the classic first test of a 6502 computer. Resistors hold the data
bus at `$EA`, the opcode for NOP, so whatever address the CPU reads, it
reads a NOP. It reads its reset vector as `$EAEA`, jumps there, and then
executes NOPs forever, walking through all 64 KB of addresses. Every address
line toggles, and every chip select goes low in its turn.

MIA makes the clock and the reset, as it always will. The only thing you
change for this test is that MIA must not answer the CPU: its chip select
input stays grounded, so it never drives the data bus.

## What you add

The CPU (U1) on board 2, in the rows you marked in stage 3, with its 100 nF
capacitor and its three pull-up resistors, and its links to MIA.

### U1, the CPU

| U1 pin | Signal | Connects to | Notes |
| --- | --- | --- | --- |
| 1 | unconnected | | `VPB` |
| 2 | RDY | R1 | Pulled up (below) |
| 3 | unconnected | | `PHI1O` |
| 4 | ~IRQB | R2 | Pulled up (below) |
| 5 | unconnected | | `~ML` |
| 6 | ~NMI | R5 | Pulled up (below) |
| 7 | unconnected | | `SYNC` |
| 8 | 3.3 V | 3.3 V | `VDD` |
| 9 | A0 | Pico 21 (GP16) | |
| 10 | A1 | Pico 22 (GP17) | |
| 11 | A2 | Pico 24 (GP18) | |
| 12 | A3 | Pico 25 (GP19) | |
| 13 | A4 | Pico 26 (GP20) | MIA sees only A0-A4 |
| 14 | A5 | | The RAM chips, from stage 6 |
| 15 | A6 | | |
| 16 | A7 | | |
| 17 | A8 | | |
| 18 | A9 | | |
| 19 | A10 | U6.1 | From stage 3 |
| 20 | A11 | U6.2 | From stage 3 |
| 21 | GND | GND | `VSS` |
| 22 | A12 | U6.3 | From stage 3 |
| 23 | A13 | U6.4, U8.1 | From stage 3 |
| 24 | A14 | U6.6, U8.2 | From stage 3 |
| 25 | A15 | U8.6, U9.12 | From stage 3 |
| 26 | D7 | Pico 20 (GP15) | |
| 27 | D6 | Pico 19 (GP14) | |
| 28 | D5 | Pico 17 (GP13) | |
| 29 | D4 | Pico 16 (GP12) | |
| 30 | D3 | Pico 15 (GP11) | |
| 31 | D2 | Pico 14 (GP10) | |
| 32 | D1 | Pico 12 (GP9) | |
| 33 | D0 | Pico 11 (GP8) | |
| 34 | RWB | U9.1, Pico 10 (GP7) | |
| 35 | unconnected | | `NC` |
| 36 | 3.3 V | 3.3 V | `BE`: the CPU drives the buses |
| 37 | PHI2 | U9.5, Pico 27 (GP21) | MIA's clock |
| 38 | 3.3 V | 3.3 V | `~SO`: unused |
| 39 | unconnected | | `PHI2O` |
| 40 | ~RESB | Pico 31 (GP26) | MIA's reset |

The D lines run in the opposite order to the pin numbers: D0 is pin 33 and
D7 pin 26. On the Pico they run in order, GP8 to GP15, skipping the GND
pins 13 and 18.

| Part | Value | First leg | Second leg | Notes |
| --- | --- | --- | --- | --- |
| R1 | 2.2 kΩ | 3.3 V | U1.2 | RDY pull-up. Not stronger: the CPU pulls RDY low itself during `WAI` |
| R2 | 4.7 kΩ | 3.3 V | U1.4 | `~IRQB` pull-up |
| R5 | 4.7 kΩ | 3.3 V | U1.6 | `~NMI` pull-up |

### Just for this test

These come off again in stage 5.

- **The NOP resistors.** `$EA` is `1110 1010` in binary. Put a 4.7 kΩ
  resistor from each of D7, D6, D5, D3 and D1 to 3.3 V, and from each of D4,
  D2 and D0 to GND. Use 4.7 kΩ, not 10 kΩ: a Pico 2 input can hold a pin up
  against a pull-down weaker than about 8.2 kΩ (RP2350 erratum E9).
- **MIA's select, grounded.** Push a jumper from Pico 9 (GP6) to GND. Leave
  U9.8 (`MIACS`) unconnected: never join it to Pico 9 while that jumper is
  in, or the gate's output is shorted to GND.

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 150" width="100%" style="max-width:640px" role="img" aria-label="The data bus held at $EA: D7, D6, D5, D3 and D1 pulled up to 3.3 V, D4, D2 and D0 pulled down to GND, each through 4.7 kilohms.">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<path d="M20 20h520M20 130h520"/>
<path d="M60 20v15M60 65v20M52 35h16v30h-16zM120 20v15M120 65v20M112 35h16v30h-16zM180 20v15M180 65v20M172 35h16v30h-16zM300 20v15M300 65v20M292 35h16v30h-16zM420 20v15M420 65v20M412 35h16v30h-16z"/>
<path d="M240 130v-15M240 85v-20M232 85h16v30h-16zM360 130v-15M360 85v-20M352 85h16v30h-16zM480 130v-15M480 85v-20M472 85h16v30h-16z"/>
</g>
<g fill="currentColor" font-family="sans-serif" font-size="12" text-anchor="middle">
<text x="280" y="14">3.3 V</text><text x="280" y="146">GND</text>
<text x="60" y="98">D7</text><text x="120" y="98">D6</text><text x="180" y="98">D5</text><text x="240" y="60">D4</text><text x="300" y="98">D3</text><text x="360" y="60">D2</text><text x="420" y="98">D1</text><text x="480" y="60">D0</text>
<text x="60" y="113" font-size="10">1</text><text x="120" y="113" font-size="10">1</text><text x="180" y="113" font-size="10">1</text><text x="240" y="45" font-size="10">0</text><text x="300" y="113" font-size="10">1</text><text x="360" y="45" font-size="10">0</text><text x="420" y="113" font-size="10">1</text><text x="480" y="45" font-size="10">0</text>
</g>
</svg>
</div>

## Check

The check watches the address lines count. MIA's `speed` command slows the
clock until you can read the count on the LEDs.

1. Wire eight LEDs the "high" way (lit = 1) on A0-A7: U1.9 to U1.16. Put
   them in a row with A7 on the left, so they read as a binary number.
2. Plug in the USB cable and open the console. MIA starts the CPU at
   1.2 MHz, far too fast to see: all eight LEDs glow at half brightness.
3. Type `speed 10`. The LEDs now count up in binary, one step every 0.2 s:
   a NOP takes two clock cycles, and the CPU reads each address twice, once
   for the opcode and once for the byte after it.
4. Press RESET. After a short pause the count restarts from `1110 1010`, the
   low byte of `$EAEA`, and counts up from there: `1110 1011`, `1110 1100`...
5. Type `speed 2` and press RESET again to watch the reset itself. Among the
   first few patterns, at half a second each, you catch `1111 1100` and
   `1111 1101`: the CPU reading its reset vector at `$FFFC` and `$FFFD`.
   Then the count starts at `1110 1010`. (For clocks under about 72 Hz MIA slows the whole Pico down: to
   18 MHz for `speed 10`, to about 4 MHz for `speed 2`. If the console turns
   sluggish at `speed 2`, skip this step; nothing later needs it.)
6. Move the eight LEDs to A8-A15 (U1.17, U1.18, U1.19, U1.20, U1.22, U1.23,
   U1.24, U1.25; pin 21 is GND, skip it) and type `speed 2000`. After a reset
   the high byte also starts at `1110 1010` and counts up every 0.26 s. A full
   trip through memory takes about 65 seconds.

Every LED must blink at half the rate of the one to its right. One that
stays dark or lit, or two that always match, is an open, stuck or swapped
address line.

### The chip selects

Now watch the memory map go by. Rewire the LEDs:

| LED on | Wired | Lit while |
| --- | --- | --- |
| A15 (U1.25) | high way | the CPU is in `$8000-$FFFF` |
| `~EXRAMCS` (U7.3) | low way | `$8000-$BFFF` |
| `~IOCS0` (U6.15) | low way | `$C000-$C3FF` |
| `~IOCS7` (U6.7) | low way | `$DC00-$DFFF` |
| `MIACS` (U9.8) | high way | `$E000-$FFFF` |
| `~OE` (U9.3) | low way | the CPU reads: always |
| `~WE` (U9.6) | low way | the CPU writes: never |

Type `speed 4000`. One trip through memory now takes about 33 seconds:

- A15 is dark for 16 seconds, then lit for 16.
- While A15 is lit, `~EXRAMCS` lights for the first 8 seconds.
- Then `~IOCS0` flashes for half a second, and `~IOCS7` half a second just
  before `MIACS` lights for the last 8 seconds.
- `~OE` stays lit and `~WE` stays dark the whole time, because a NOP sweep
  never writes.

When you are done, type `speed 1200000` and take the LEDs off.

## With a scope

Put the clock back to 1.2 MHz first.

- **PHI2 at the CPU.** Probe U1.37: the same clean 0-3.3 V square wave as at
  the Pico, now with a real load. Small overshoot is normal; ringing that
  takes a large part of the half-cycle to settle means a long PHI2 wire or a
  long probe ground.
- **Address lines.** A0 (U1.9) is a 300 kHz square wave, a quarter of PHI2:
  each address lasts two cycles. Each line up is half the frequency of the
  one below; A15 (U1.25) is about 9.2 Hz.
- **Chip selects against A15.** Channel 1 on A15, triggered on its rising
  edge, at 20 ms per division. Channel 2 on each select in turn: while A15
  is high, `~EXRAMCS` is low for the first half, `~IOCS0` dips low for one
  thirty-second (about 1.7 ms) starting right at the middle, and `MIACS` is
  high for the last half.
- **A gate delay.** At 5 ns per division, trigger on a rising edge of A15
  and look at U9.11 (`~A15`) on channel 2: it falls a few nanoseconds later.
  That is one 74AC gate, near the limit of what a 50 MHz scope resolves;
  you will see it as about 7-10 ns.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| No LED moves | RESB held low (U1.40), no PHI2 (U1.37), RDY low (U1.2) or BE low (U1.36): measure them |
| The count starts at a value other than `1110 1010` | A data line is not at its `$EA` level: check the eight resistors |
| The count skips or repeats | Two address lines swapped or shorted: compare A0-A7 to the table, beep neighbouring rows |
| The CPU gets warm | It's in backwards, or VDD/VSS swapped: unplug at once |
| `~OE` LED blinks | RWB isn't always high: a data line is floating and the CPU is running something other than NOPs |
