# B. Bill of materials

## Plug-in parts

| Ref | Part |
| --- | --- |
| U1 | WDC W65C02S CPU, DIP-40 (W65C02S6TPG-14) |
| U3 | WDC W65C22S VIA, DIP-40 (W65C22S6TPG-14) |
| U4 | Alliance AS6C62256-55PCN, 32K × 8 SRAM, DIP-28 |
| U2 | Alliance AS6C4008-55PCN, 512K × 8 SRAM, DIP-32 |
| U6, U8 | 74AC138, DIP-16 |
| U7 | 74AC08, DIP-14 |
| U9 | 74AC00, DIP-14 |
| A1 | Raspberry Pi Pico 2 WH (the version with its pins already soldered) |
| J5 | Adafruit 4682 microSD breakout, 3 V (solder its 9-pin header first) |

## Passive parts

From the rev 1 factory bill of materials (`bom/factory-bom.csv` in
clementina-hardware), without the sockets and headers, which only the PCB
needs:

| Part | Qty | Refs |
| --- | --- | --- |
| Ceramic capacitor 1 µF, 50 V, X7R | 1 | C1 |
| Electrolytic capacitor 22 µF, 16 V | 1 | C14 |
| Ceramic capacitor 100 nF, 50 V, X7R | 10 | C2, C4, C6-C13 |
| Electrolytic capacitor 47 µF, 16 V | 2 | C3, C5 |
| BAT85 Schottky diode, DO-34 | 2 | D1, D2 |
| 3.5 mm stereo jack (CUI SJ1-3533NG, or a jack breakout for the breadboard) | 1 | J4 |
| Resistor 2.2 kΩ, 1/4 W | 1 | R1 |
| Resistor 4.7 kΩ, 1/4 W | 2 | R2, R5 |
| Resistor 10 kΩ, 1/4 W | 1 | R3 |
| Resistor 100 Ω, 1/4 W | 3 | R4, R7, R10 |
| Resistor 220 Ω, 1/4 W | 2 | R6, R9 |
| Resistor 1.8 kΩ, 1/4 W | 2 | R8, R11 |
| Tactile switch 6 × 6 mm | 1 | SW1 |

C6-C13 are the eight decoupling capacitors, one per chip.

## Breadboard extras

| Part | Qty | Used in |
| --- | --- | --- |
| Breadboards, about 15 × 5.5 cm | 3 (4 if short) | Everything |
| 4.7 kΩ resistors | 8 | Stage 4, the `$EA` data bus |
| LEDs | 8 | Stages 2-7 |
| 1 kΩ resistors | 8 | One per LED |
| 10 kΩ resistors (optional) | 4 | Stage 7, pull-ups on CA1, CA2, CB1, CB2 |
| 22 AWG solid wire | kit and spools | Everything |
| microSD card | 1 | `WIFI.CFG`, and BASIC's files later |
