# Parts and tools

## The parts

You need the plug-in parts of the rev 1 board, the passive parts from its
factory bill of materials, and a few extras that only the breadboard needs.
[Appendix B](appendix/bom.md) has the full list with designators.

| Part | Qty | Notes |
| --- | --- | --- |
| W65C02S CPU, W65C22S VIA | 1 each | DIP-40 |
| AS6C62256 (32 KB SRAM), AS6C4008 (512 KB SRAM) | 1 each | DIP-28 and DIP-32 |
| 74AC138 / 74AC08 / 74AC00 | 2 / 1 / 1 | Must be 74**AC**, not 74HC: at 3.3 V a 74HC gate is too slow for the write strobe |
| Raspberry Pi Pico 2 WH | 1 | MIA. The WH has its header pins already soldered |
| Adafruit 4682 microSD breakout | 1 | Solder its 9-pin header first |
| microSD card | 1 | FAT32. Holds `WIFI.CFG` |
| 100 nF ceramic capacitor | 10 | 8 for decoupling, one per chip; 2 for the audio filter |
| 22 µF electrolytic capacitor | 1 | C14, bulk capacitor at the Pico |
| 47 µF electrolytic capacitor | 2 | C3 and C5, audio DC block |
| 1 µF ceramic capacitor | 1 | C1, reset button debounce |
| Resistors | 11 | 2.2 kΩ (R1), 4.7 kΩ ×2 (R2, R5), 10 kΩ (R3), 100 Ω ×3 (R4, R7, R10), 220 Ω ×2 (R6, R9), 1.8 kΩ ×2 (R8, R11) |
| BAT85 Schottky diode | 2 | D1 and D2, on the interrupt line |
| 6 × 6 mm tactile switch | 1 | SW1, RESET |
| 3.5 mm stereo jack | 1 | The board's SJ1-3533NG doesn't plug into a breadboard: use a jack breakout, or solder short wires to it |

The DIP sockets, the Pico's 1×20 female headers and the J1-J3 box headers in
the factory list are for the PCB. Leave them in the bag.

### Breadboard-only extras

| Part | Qty | Used for |
| --- | --- | --- |
| 4.7 kΩ resistors | 8 | Holding the data bus at `$EA` in stage 4 |
| LEDs | 8 | Watching signals in stages 2 to 7. Any colour; red and green ones light best at 3.3 V |
| 1 kΩ resistors | 8 | One in series with each LED (about 1.3 mA at 3.3 V) |
| 10 kΩ resistors | 4 | Optional: holding the VIA's unused CA1, CA2, CB1 and CB2 high (stage 7) |
| 22 AWG solid wire | a kit and spools | Pre-cut lengths for short hops, spools for the long bus runs |

That is all the extra hardware. The LEDs and their resistors are the only
test equipment the book asks you to build.

## Tools

| Tool | Need | Used for |
| --- | --- | --- |
| Multimeter with a continuity beep | Required; a cheap one is fine | Every stage |
| A computer with a USB port | Required | MIA's console, building the firmware, the video client |
| Serial terminal program (screen, minicom, PuTTY) | Required, free | MIA's console |
| Wire stripper, flush cutters | Required | Every wire |
| Chip puller | Recommended | Moving the 40-pin chips without bending legs |
| Oscilloscope, 50 MHz, 2 channels, 10× probes | Optional | The *With a scope* boxes |

Don't put a 5 V board such as an Arduino Uno on this bus to help debug it.
Everything in Clementina is 3.3 V, and one pin set as an output by mistake
puts 5 V on a 3.3 V chip.

### About the scope

A 50 MHz, 2-channel scope covers everything in this book. Clementina's
clock runs at 8 MHz at most, so the scope sees PHI2, the address lines and
the chip selects clearly, and can measure how they line up.

What it can't do is resolve the fastest edges. A 50 MHz scope has a rise
time of about 7 ns (0.35 divided by the bandwidth), so a 74AC edge of 2-3 ns
shows up as about 7 ns, and timing differences under about 10 ns are at the
edge of what it can measure. The scope boxes use it for levels, frequencies
and timing, and say when a measurement is only a sanity check.

Set the probes to 10× and clip each probe's ground lead to the GND rail right
next to the point you measure. A long ground lead adds ringing that isn't on
the board.
