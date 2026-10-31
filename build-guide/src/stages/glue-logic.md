# Stage 3: Glue logic

The four small chips turn the CPU's address and R/W lines into chip selects
and read and write strobes. You wire them before the CPU goes in, so you can
set their inputs by hand with jumpers and check every output with the
multimeter.

## What you add

U8, U7, U9 and U6 on board 3, each with its 100 nF capacitor.

First, decide where the CPU (U1) goes on board 2 and mark the rows its 40
pins will sit in, but leave the CPU out. The glue logic's inputs are wired
to the CPU's rows, so you drive them with jumpers now and the CPU drives
them in stage 4.

What the four chips do:

| Chip | Job |
| --- | --- |
| U8 (74AC138) | Splits the top half of memory into 8 KB blocks from A13-A15 |
| U7 (74AC08) | ANDs two of U8's outputs into `~EXRAMCS`: extended RAM at `$8000-$BFFF` |
| U9 (74AC00) | Makes MIA's select (`MIACS`, `$E000-$FFFF`), `~A15`, and the strobes `~OE` and `~WE` |
| U6 (74AC138) | Splits `$C000-$DFFF` into eight 1 KB I/O slots, `~IOCS0`-`~IOCS7` |

### U8, the memory decoder

| U8 pin | Signal | Connects to | Notes |
| --- | --- | --- | --- |
| 1 | A13 | U1.23 | Input A0 |
| 2 | A14 | U1.24 | Input A1 |
| 3 | GND | GND | Input A2 |
| 4 | GND | GND | `~E1` |
| 5 | GND | GND | `~E2` |
| 6 | A15 | U1.25 | `E3`: U8 only works while A15 is high |
| 7 | unconnected | | `~Y7` |
| 8 | GND | GND | |
| 9 | unconnected | | `~Y6` |
| 10 | unconnected | | `~Y5` |
| 11 | unconnected | | `~Y4` |
| 12 | ~Y3 | U9.9, U9.10 | Low for `$E000-$FFFF` |
| 13 | unconnected | | `~Y2` (`$C000-$DFFF` is U6's job) |
| 14 | ~Y1 | U7.2 | Low for `$A000-$BFFF` |
| 15 | ~Y0 | U7.1 | Low for `$8000-$9FFF` |
| 16 | 3.3 V | 3.3 V | |

### U7, the AND gates

Only one gate is used. Tie the unused gates' inputs to GND so they don't
float, and leave their outputs open.

| U7 pin | Signal | Connects to | Notes |
| --- | --- | --- | --- |
| 1 | ~Y0 | U8.15 | |
| 2 | ~Y1 | U8.14 | |
| 3 | ~EXRAMCS | | Goes to U2.22 in stage 8: leave a free hole |
| 4 | GND | GND | Unused input |
| 5 | GND | GND | Unused input |
| 6 | unconnected | | Unused output |
| 7 | GND | GND | |
| 8 | unconnected | | Unused output |
| 9 | GND | GND | Unused input |
| 10 | GND | GND | Unused input |
| 11 | unconnected | | Unused output |
| 12 | GND | GND | Unused input |
| 13 | GND | GND | Unused input |
| 14 | 3.3 V | 3.3 V | |

### U9, the NAND gates

All four gates are used. A NAND with both inputs joined is an inverter.

| U9 pin | Signal | Connects to | Notes |
| --- | --- | --- | --- |
| 1 | RWB | U1.34 | Gate 1: `~OE` is RWB inverted |
| 2 | RWB | U9.1 | |
| 3 | ~OE | U9.4 | Low while the CPU reads; goes to both RAMs later |
| 4 | ~OE | U9.3 | Gate 2: `~WE` = NAND(PHI2, `~OE`) |
| 5 | PHI2 | U1.37 | |
| 6 | ~WE | | Low while the CPU writes and PHI2 is high; goes to both RAMs later |
| 7 | GND | GND | |
| 8 | MIACS | | Gate 3 output, active high. Goes to Pico 9 (GP6) in stage 5, not before |
| 9 | ~Y3 | U8.12 | Gate 3: `MIACS` is `~Y3` inverted |
| 10 | ~Y3 | U9.9 | |
| 11 | ~A15 | U6.5 | Gate 4 output |
| 12 | A15 | U1.25 | Gate 4: `~A15` is A15 inverted |
| 13 | A15 | U9.12 | |
| 14 | 3.3 V | 3.3 V | |

### U6, the I/O decoder

U6 is enabled straight from A13-A15 rather than through U8, which saves a
gate delay on the selects the VIA and the expansion cards need early.

| U6 pin | Signal | Connects to | Notes |
| --- | --- | --- | --- |
| 1 | A10 | U1.19 | Input A0 |
| 2 | A11 | U1.20 | Input A1 |
| 3 | A12 | U1.22 | Input A2 |
| 4 | A13 | U1.23 | `~E1`: A13 must be low |
| 5 | ~A15 | U9.11 | `~E2`: A15 must be high |
| 6 | A14 | U1.24 | `E3`: A14 must be high |
| 7 | ~IOCS7 | | Expansion slot 7: nothing on the breadboard |
| 8 | GND | GND | |
| 9 | ~IOCS6 | | Expansion slot 6 |
| 10 | ~IOCS5 | | Expansion slot 5 |
| 11 | ~IOCS4 | | Expansion slot 4 |
| 12 | ~IOCS3 | | Expansion slot 3 |
| 13 | ~IOCS2 | | Expansion slot 2 |
| 14 | ~IOCS1 | | Expansion slot 1 |
| 15 | ~IOCS0 | | The VIA's select: goes to U3.23 in stage 7 |
| 16 | 3.3 V | 3.3 V | |

## Check

Plug the USB cable in: the glue logic needs power, and MIA can run as it is
(MIA's pins aren't wired to the CPU's rows yet).

Push jumper wires from the rails into the CPU's rows for A10-A15 (U1.19,
U1.20, U1.22-U1.25), RWB (U1.34) and PHI2 (U1.37). Every one of those inputs
must go to a rail, high or low: a floating CMOS input gives random readings.
Then set each row of the table below and measure the outputs. "0" is under
0.3 V and "1" is over 3.0 V. An "x" means it doesn't matter; try both.

| A15 A14 A13 | A12 A11 A10 | Range | `~EXRAMCS` (U7.3) | `MIACS` (U9.8) | U6 outputs |
| --- | --- | --- | --- | --- | --- |
| 0 x x | x x x | `$0000-$7FFF` | 1 | 0 | all 1 |
| 1 0 0 | x x x | `$8000-$9FFF` | 0 | 0 | all 1 |
| 1 0 1 | x x x | `$A000-$BFFF` | 0 | 0 | all 1 |
| 1 1 0 | 0 0 0 | `$C000-$C3FF` | 1 | 0 | `~IOCS0` (U6.15) = 0, the rest 1 |
| 1 1 0 | 1 1 1 | `$DC00-$DFFF` | 1 | 0 | `~IOCS7` (U6.7) = 0, the rest 1 |
| 1 1 1 | x x x | `$E000-$FFFF` | 1 | 1 | all 1 |

Try a few more A10-A12 values with A15-A13 at 1 1 0: exactly one U6 output
is 0 each time, `~IOCSn` where n is A12 A11 A10 read as a binary number.

Check that U9.11 (`~A15`) is always the opposite of A15. Then the strobes:

| RWB | PHI2 | `~OE` (U9.3) | `~WE` (U9.6) |
| --- | --- | --- | --- |
| 1 (read) | 0 or 1 | 0 | 1 |
| 0 (write) | 0 | 1 | 1 |
| 0 (write) | 1 | 1 | 0 |

`~WE` is only low for the second half of a write cycle, while PHI2 is high;
that is what makes the RAM latch the data at the right moment.

Without a meter, an LED wired the "low" way shows each active-low output
(lit = 0), and one wired the "high" way shows `MIACS`.

When you are done, **remove every test jumper** from the CPU's rows.

## With a scope

Nothing to see yet: the inputs are static. The glue logic's timing comes up
in stage 4, when the CPU drives it, and in stage 10, when it limits the
speed.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| An output reads about 1.5 V or wanders | An input is floating: a missing jumper, or an unused gate input not tied to GND |
| U8's outputs never change | U8.6 (E3) not on A15, or U8.4/U8.5 not on GND |
| U6's outputs never change | `~A15` (U9.11) not reaching U6.5, or A13/A14 swapped |
| The wrong `~IOCSn` goes low | A10-A12 in the wrong order on U6.1-U6.3 |
| A chip gets warm | It's in backwards, or its power pins are swapped: unplug at once |
