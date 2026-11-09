# Stage 3: Glue logic

The four small chips turn the CPU's address and R/W lines into chip selects
and read and write strobes. You wire them before the CPU goes in, so you can
set their inputs by hand with jumpers and check every output with the
multimeter.

## Parts

| Part | Qty | On the schematic | Notes |
| --- | --- | --- | --- |
| 74AC138 decoder | 2 | U8, U6 | U8 decodes memory, U6 the I/O slots |
| 74AC08 quad AND | 1 | U7 |  |
| 74AC00 quad NAND | 1 | U9 |  |
| 100 nF ceramic capacitor | 4 |  | One per chip |
| Jumper wires | 8 |  | Test inputs, any colour; they come out at the end |
| LEDs and 1 kΩ resistors | a few |  | Optional, for the check without a meter |

## What you add

The four glue chips on board 3, each with its 100 nF capacitor: U8 and
U6 (74AC138), U7 (74AC08) and U9 (74AC00).

First, decide where the CPU (U1, W65C02S) goes on board 2 and mark the rows its 40
pins will sit in, but leave the CPU out. The glue logic's inputs are wired
to the CPU's rows, so you drive them with jumpers now and the CPU drives
them in stage 4.

### Where the chips go

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 420" width="100%" style="max-width:760px" role="img" aria-label="Boards 2 and 3 seen from above, column 1 at the left, board 3 above board 2. On board 3 the glue chips sit in a row across the centre gap: U8 in columns 2 to 9, U7 in 12 to 18, U9 in 21 to 27 and U6 in 30 to 37, with columns 40 to 59 left for the VIA. On board 2 the CPU rows are marked in columns 2 to 21, with columns 24 to 37 and 40 to 55 left for the two RAM chips. Every chip has its notch toward column 1. Eight wires run from the CPU rows up to board 3: A10 to A15 in yellow, RWB in green and PHI2 in white.">
<rect x="20" y="30" width="640" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g stroke-width="3" opacity="0.35"><path d="M35 40H645M35 170H645" stroke="currentColor"/><path d="M35 50H645M35 160H645" stroke="#d0312d"/></g>
<path d="M35 105H645" stroke="currentColor" stroke-dasharray="2 4" opacity="0.4"/>
<text x="28" y="24" font-family="sans-serif" font-size="12" fill="currentColor">Board 3: glue logic and VIA</text>
<rect x="44" y="80" width="82" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
<path d="M44 99.0a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="50" cy="80" r="2.2"/><circle cx="50" cy="130" r="2.2"/><circle cx="60" cy="80" r="2.2"/><circle cx="60" cy="130" r="2.2"/><circle cx="70" cy="80" r="2.2"/><circle cx="70" cy="130" r="2.2"/><circle cx="80" cy="80" r="2.2"/><circle cx="80" cy="130" r="2.2"/><circle cx="90" cy="80" r="2.2"/><circle cx="90" cy="130" r="2.2"/><circle cx="100" cy="80" r="2.2"/><circle cx="100" cy="130" r="2.2"/><circle cx="110" cy="80" r="2.2"/><circle cx="110" cy="130" r="2.2"/><circle cx="120" cy="80" r="2.2"/><circle cx="120" cy="130" r="2.2"/></g>
<text x="85.0" y="109.0" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor">U8</text>
<rect x="144" y="80" width="72" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
<path d="M144 99.0a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="150" cy="80" r="2.2"/><circle cx="150" cy="130" r="2.2"/><circle cx="160" cy="80" r="2.2"/><circle cx="160" cy="130" r="2.2"/><circle cx="170" cy="80" r="2.2"/><circle cx="170" cy="130" r="2.2"/><circle cx="180" cy="80" r="2.2"/><circle cx="180" cy="130" r="2.2"/><circle cx="190" cy="80" r="2.2"/><circle cx="190" cy="130" r="2.2"/><circle cx="200" cy="80" r="2.2"/><circle cx="200" cy="130" r="2.2"/><circle cx="210" cy="80" r="2.2"/><circle cx="210" cy="130" r="2.2"/></g>
<text x="180.0" y="109.0" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor">U7</text>
<rect x="234" y="80" width="72" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
<path d="M234 99.0a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="240" cy="80" r="2.2"/><circle cx="240" cy="130" r="2.2"/><circle cx="250" cy="80" r="2.2"/><circle cx="250" cy="130" r="2.2"/><circle cx="260" cy="80" r="2.2"/><circle cx="260" cy="130" r="2.2"/><circle cx="270" cy="80" r="2.2"/><circle cx="270" cy="130" r="2.2"/><circle cx="280" cy="80" r="2.2"/><circle cx="280" cy="130" r="2.2"/><circle cx="290" cy="80" r="2.2"/><circle cx="290" cy="130" r="2.2"/><circle cx="300" cy="80" r="2.2"/><circle cx="300" cy="130" r="2.2"/></g>
<text x="270.0" y="109.0" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor">U9</text>
<rect x="324" y="80" width="82" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
<path d="M324 99.0a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="330" cy="80" r="2.2"/><circle cx="330" cy="130" r="2.2"/><circle cx="340" cy="80" r="2.2"/><circle cx="340" cy="130" r="2.2"/><circle cx="350" cy="80" r="2.2"/><circle cx="350" cy="130" r="2.2"/><circle cx="360" cy="80" r="2.2"/><circle cx="360" cy="130" r="2.2"/><circle cx="370" cy="80" r="2.2"/><circle cx="370" cy="130" r="2.2"/><circle cx="380" cy="80" r="2.2"/><circle cx="380" cy="130" r="2.2"/><circle cx="390" cy="80" r="2.2"/><circle cx="390" cy="130" r="2.2"/><circle cx="400" cy="80" r="2.2"/><circle cx="400" cy="130" r="2.2"/></g>
<text x="365.0" y="109.0" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor">U6</text>
<rect x="424" y="80" width="202" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>
<path d="M424 99.0a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>
<text x="525.0" y="109.0" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor" opacity="0.8">VIA U3</text>
<text x="525.0" y="146" text-anchor="middle" font-family="sans-serif" font-size="9" fill="currentColor" opacity="0.8">stage 8</text>
<rect x="20" y="240" width="640" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g stroke-width="3" opacity="0.35"><path d="M35 250H645M35 380H645" stroke="currentColor"/><path d="M35 260H645M35 370H645" stroke="#d0312d"/></g>
<path d="M35 315H645" stroke="currentColor" stroke-dasharray="2 4" opacity="0.4"/>
<text x="370" y="234" font-family="sans-serif" font-size="12" fill="currentColor">Board 2: CPU and memory</text>
<rect x="44" y="290" width="202" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>
<path d="M44 309.0a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>
<text x="145.0" y="319.0" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor" opacity="0.8">U1 CPU: mark only</text>
<text x="145.0" y="356" text-anchor="middle" font-family="sans-serif" font-size="9" fill="currentColor" opacity="0.8">goes in in stage 4</text>
<rect x="264" y="290" width="142" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>
<path d="M264 309.0a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>
<text x="335.0" y="319.0" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor" opacity="0.8">U4</text>
<text x="335.0" y="356" text-anchor="middle" font-family="sans-serif" font-size="9" fill="currentColor" opacity="0.8">stage 6</text>
<rect x="424" y="290" width="162" height="50" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>
<path d="M424 309.0a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>
<text x="505.0" y="319.0" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor" opacity="0.8">U2</text>
<text x="505.0" y="356" text-anchor="middle" font-family="sans-serif" font-size="9" fill="currentColor" opacity="0.8">stage 7</text>
<g><path d="M200 290V214H100V130" fill="none" stroke="#d4a017" stroke-width="2"/><path d="M210 290V218H60V130" fill="none" stroke="#d4a017" stroke-width="2"/><path d="M220 290V222H50V130" fill="none" stroke="#d4a017" stroke-width="2"/><path d="M230 290V226H350V130" fill="none" stroke="#d4a017" stroke-width="2"/><path d="M110 290V206H240V130" fill="none" stroke="#2e9d5b" stroke-width="2"/><path d="M80 290V202H280V130" fill="none" stroke="currentColor" stroke-width="4"/><path d="M80 290V202H280V130" fill="none" stroke="#ffffff" stroke-width="2"/><path d="M230 340V350H260V226H330V130" fill="none" stroke="#d4a017" stroke-width="2" opacity="0.9"/><path d="M240 340V350H260V230H340V130" fill="none" stroke="#d4a017" stroke-width="2" opacity="0.9"/></g>
<g fill="currentColor" font-family="sans-serif" font-size="9"><text x="370" y="200">8 wires from the CPU rows:</text><text x="370" y="212">A10-A15 yellow, RWB green, PHI2 white</text><text x="40" y="410">Every notch points to column 1. Dashed: parts of later stages.</text></g>
</svg>
</div>

- **The CPU's place** is board 2, columns 2-21, straddling the centre gap
  with its notch toward column 1, like every chip in this guide. Mark pin 1
  (column 2, on the board-1 side) and pin 40 (column 2, on the board-3
  side). Pins 1-20 then face board 1, and pins 21-40, where A12-A15, RWB and
  PHI2 live, face board 3.
- **The glue chips** go in a row on board 3, notch toward column 1: U8 (74AC138) in
  columns 2-9, U7 (74AC08) in 12-18, U9 (74AC00) in 21-27 and U6 (74AC138)
  in 30-37. Leave columns
  40-59 free for the VIA (stage 8), and columns 24-37 and 40-55 on board 2
  free for the base RAM (stage 6) and the extended RAM (stage 7).
- **The CPU is a wide chip** (0.6", like the VIA and both RAMs): its body
  covers some of the holes in its rows, so its pins keep only one to four
  free holes, not four like the glue chips (see
  [Breadboard basics](../breadboard.md#reading-a-chips-pins)). Plug each test
  jumper into the hole the CPU's own leg will take in stage 4, so the test
  costs none of the free ones.

What the four chips do:

| Chip | Job |
| --- | --- |
| U8 (74AC138) | Splits the top half of memory into 8 KB blocks from A13-A15 |
| U7 (74AC08) | ANDs two of U8's outputs into `~EXRAMCS`: extended RAM at `$8000-$BFFF` |
| U9 (74AC00) | Makes MIA's select (`MIACS`, `$E000-$FFFF`), `~A15`, and the strobes `~OE` and `~WE` |
| U6 (74AC138) | Splits `$C000-$DFFF` into eight 1 KB I/O slots, `~IOCS0`-`~IOCS7` |

### Wiring at a glance

Board 3 alone, with every wire from the four tables below. Each chip's
100 nF capacitor sits across the top rails next to its 3.3 V pin. Wires to
the CPU's rows leave at the bottom; the outputs that later stages use
(`~EXRAMCS`, `~WE`, `MIACS`, `~IOCS0`-`~IOCS7`) keep a free hole each.

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 360" width="100%" style="max-width:780px" role="img" aria-label="Wiring of the four glue chips on board 3, columns 1 to 39, every notch toward column 1. Red wires take each chip's top-left power pin to the + rail and black wires take the ground pins and the unused inputs to GND. Green wires join U8 pin 12 to U9 pin 9, U8 pin 15 to U7 pin 1, U8 pin 14 to U7 pin 2, U9 pin 11 to U6 pin 5, and short green links join U9 pins 1 and 2, 3 and 4, 9 and 10. A yellow link joins U9 pins 12 and 13. Wires from the CPU rows on board 2 arrive from below: yellow A13, A14 and A15 to U8, A10 to A12 to U6, green RWB to U9 pin 1 and white PHI2 to U9 pin 5. Three yellow wires chain from U8 rows: U8 pin 1 to U6 pin 4 (A13), U8 pin 2 to U6 pin 6 (A14) and U8 pin 6 to U9 pin 12 (A15).">
<rect x="8" y="16" width="664" height="280" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g stroke-width="3" opacity="0.35"><path d="M24 28H656M24 266H656" stroke="currentColor"/><path d="M24 44H656M24 282H656" stroke="#d0312d"/></g>
<g fill="currentColor" opacity="0.22"><circle cx="36" cy="70" r="1.8"/><circle cx="36" cy="86" r="1.8"/><circle cx="36" cy="102" r="1.8"/><circle cx="36" cy="118" r="1.8"/><circle cx="36" cy="134" r="1.8"/><circle cx="36" cy="174" r="1.8"/><circle cx="36" cy="190" r="1.8"/><circle cx="36" cy="206" r="1.8"/><circle cx="36" cy="222" r="1.8"/><circle cx="36" cy="238" r="1.8"/><circle cx="52" cy="70" r="1.8"/><circle cx="52" cy="86" r="1.8"/><circle cx="52" cy="102" r="1.8"/><circle cx="52" cy="118" r="1.8"/><circle cx="52" cy="134" r="1.8"/><circle cx="52" cy="174" r="1.8"/><circle cx="52" cy="190" r="1.8"/><circle cx="52" cy="206" r="1.8"/><circle cx="52" cy="222" r="1.8"/><circle cx="52" cy="238" r="1.8"/><circle cx="68" cy="70" r="1.8"/><circle cx="68" cy="86" r="1.8"/><circle cx="68" cy="102" r="1.8"/><circle cx="68" cy="118" r="1.8"/><circle cx="68" cy="134" r="1.8"/><circle cx="68" cy="174" r="1.8"/><circle cx="68" cy="190" r="1.8"/><circle cx="68" cy="206" r="1.8"/><circle cx="68" cy="222" r="1.8"/><circle cx="68" cy="238" r="1.8"/><circle cx="84" cy="70" r="1.8"/><circle cx="84" cy="86" r="1.8"/><circle cx="84" cy="102" r="1.8"/><circle cx="84" cy="118" r="1.8"/><circle cx="84" cy="134" r="1.8"/><circle cx="84" cy="174" r="1.8"/><circle cx="84" cy="190" r="1.8"/><circle cx="84" cy="206" r="1.8"/><circle cx="84" cy="222" r="1.8"/><circle cx="84" cy="238" r="1.8"/><circle cx="100" cy="70" r="1.8"/><circle cx="100" cy="86" r="1.8"/><circle cx="100" cy="102" r="1.8"/><circle cx="100" cy="118" r="1.8"/><circle cx="100" cy="134" r="1.8"/><circle cx="100" cy="174" r="1.8"/><circle cx="100" cy="190" r="1.8"/><circle cx="100" cy="206" r="1.8"/><circle cx="100" cy="222" r="1.8"/><circle cx="100" cy="238" r="1.8"/><circle cx="116" cy="70" r="1.8"/><circle cx="116" cy="86" r="1.8"/><circle cx="116" cy="102" r="1.8"/><circle cx="116" cy="118" r="1.8"/><circle cx="116" cy="134" r="1.8"/><circle cx="116" cy="174" r="1.8"/><circle cx="116" cy="190" r="1.8"/><circle cx="116" cy="206" r="1.8"/><circle cx="116" cy="222" r="1.8"/><circle cx="116" cy="238" r="1.8"/><circle cx="132" cy="70" r="1.8"/><circle cx="132" cy="86" r="1.8"/><circle cx="132" cy="102" r="1.8"/><circle cx="132" cy="118" r="1.8"/><circle cx="132" cy="134" r="1.8"/><circle cx="132" cy="174" r="1.8"/><circle cx="132" cy="190" r="1.8"/><circle cx="132" cy="206" r="1.8"/><circle cx="132" cy="222" r="1.8"/><circle cx="132" cy="238" r="1.8"/><circle cx="148" cy="70" r="1.8"/><circle cx="148" cy="86" r="1.8"/><circle cx="148" cy="102" r="1.8"/><circle cx="148" cy="118" r="1.8"/><circle cx="148" cy="134" r="1.8"/><circle cx="148" cy="174" r="1.8"/><circle cx="148" cy="190" r="1.8"/><circle cx="148" cy="206" r="1.8"/><circle cx="148" cy="222" r="1.8"/><circle cx="148" cy="238" r="1.8"/><circle cx="164" cy="70" r="1.8"/><circle cx="164" cy="86" r="1.8"/><circle cx="164" cy="102" r="1.8"/><circle cx="164" cy="118" r="1.8"/><circle cx="164" cy="134" r="1.8"/><circle cx="164" cy="174" r="1.8"/><circle cx="164" cy="190" r="1.8"/><circle cx="164" cy="206" r="1.8"/><circle cx="164" cy="222" r="1.8"/><circle cx="164" cy="238" r="1.8"/><circle cx="180" cy="70" r="1.8"/><circle cx="180" cy="86" r="1.8"/><circle cx="180" cy="102" r="1.8"/><circle cx="180" cy="118" r="1.8"/><circle cx="180" cy="134" r="1.8"/><circle cx="180" cy="174" r="1.8"/><circle cx="180" cy="190" r="1.8"/><circle cx="180" cy="206" r="1.8"/><circle cx="180" cy="222" r="1.8"/><circle cx="180" cy="238" r="1.8"/><circle cx="196" cy="70" r="1.8"/><circle cx="196" cy="86" r="1.8"/><circle cx="196" cy="102" r="1.8"/><circle cx="196" cy="118" r="1.8"/><circle cx="196" cy="134" r="1.8"/><circle cx="196" cy="174" r="1.8"/><circle cx="196" cy="190" r="1.8"/><circle cx="196" cy="206" r="1.8"/><circle cx="196" cy="222" r="1.8"/><circle cx="196" cy="238" r="1.8"/><circle cx="212" cy="70" r="1.8"/><circle cx="212" cy="86" r="1.8"/><circle cx="212" cy="102" r="1.8"/><circle cx="212" cy="118" r="1.8"/><circle cx="212" cy="134" r="1.8"/><circle cx="212" cy="174" r="1.8"/><circle cx="212" cy="190" r="1.8"/><circle cx="212" cy="206" r="1.8"/><circle cx="212" cy="222" r="1.8"/><circle cx="212" cy="238" r="1.8"/><circle cx="228" cy="70" r="1.8"/><circle cx="228" cy="86" r="1.8"/><circle cx="228" cy="102" r="1.8"/><circle cx="228" cy="118" r="1.8"/><circle cx="228" cy="134" r="1.8"/><circle cx="228" cy="174" r="1.8"/><circle cx="228" cy="190" r="1.8"/><circle cx="228" cy="206" r="1.8"/><circle cx="228" cy="222" r="1.8"/><circle cx="228" cy="238" r="1.8"/><circle cx="244" cy="70" r="1.8"/><circle cx="244" cy="86" r="1.8"/><circle cx="244" cy="102" r="1.8"/><circle cx="244" cy="118" r="1.8"/><circle cx="244" cy="134" r="1.8"/><circle cx="244" cy="174" r="1.8"/><circle cx="244" cy="190" r="1.8"/><circle cx="244" cy="206" r="1.8"/><circle cx="244" cy="222" r="1.8"/><circle cx="244" cy="238" r="1.8"/><circle cx="260" cy="70" r="1.8"/><circle cx="260" cy="86" r="1.8"/><circle cx="260" cy="102" r="1.8"/><circle cx="260" cy="118" r="1.8"/><circle cx="260" cy="134" r="1.8"/><circle cx="260" cy="174" r="1.8"/><circle cx="260" cy="190" r="1.8"/><circle cx="260" cy="206" r="1.8"/><circle cx="260" cy="222" r="1.8"/><circle cx="260" cy="238" r="1.8"/><circle cx="276" cy="70" r="1.8"/><circle cx="276" cy="86" r="1.8"/><circle cx="276" cy="102" r="1.8"/><circle cx="276" cy="118" r="1.8"/><circle cx="276" cy="134" r="1.8"/><circle cx="276" cy="174" r="1.8"/><circle cx="276" cy="190" r="1.8"/><circle cx="276" cy="206" r="1.8"/><circle cx="276" cy="222" r="1.8"/><circle cx="276" cy="238" r="1.8"/><circle cx="292" cy="70" r="1.8"/><circle cx="292" cy="86" r="1.8"/><circle cx="292" cy="102" r="1.8"/><circle cx="292" cy="118" r="1.8"/><circle cx="292" cy="134" r="1.8"/><circle cx="292" cy="174" r="1.8"/><circle cx="292" cy="190" r="1.8"/><circle cx="292" cy="206" r="1.8"/><circle cx="292" cy="222" r="1.8"/><circle cx="292" cy="238" r="1.8"/><circle cx="308" cy="70" r="1.8"/><circle cx="308" cy="86" r="1.8"/><circle cx="308" cy="102" r="1.8"/><circle cx="308" cy="118" r="1.8"/><circle cx="308" cy="134" r="1.8"/><circle cx="308" cy="174" r="1.8"/><circle cx="308" cy="190" r="1.8"/><circle cx="308" cy="206" r="1.8"/><circle cx="308" cy="222" r="1.8"/><circle cx="308" cy="238" r="1.8"/><circle cx="324" cy="70" r="1.8"/><circle cx="324" cy="86" r="1.8"/><circle cx="324" cy="102" r="1.8"/><circle cx="324" cy="118" r="1.8"/><circle cx="324" cy="134" r="1.8"/><circle cx="324" cy="174" r="1.8"/><circle cx="324" cy="190" r="1.8"/><circle cx="324" cy="206" r="1.8"/><circle cx="324" cy="222" r="1.8"/><circle cx="324" cy="238" r="1.8"/><circle cx="340" cy="70" r="1.8"/><circle cx="340" cy="86" r="1.8"/><circle cx="340" cy="102" r="1.8"/><circle cx="340" cy="118" r="1.8"/><circle cx="340" cy="134" r="1.8"/><circle cx="340" cy="174" r="1.8"/><circle cx="340" cy="190" r="1.8"/><circle cx="340" cy="206" r="1.8"/><circle cx="340" cy="222" r="1.8"/><circle cx="340" cy="238" r="1.8"/><circle cx="356" cy="70" r="1.8"/><circle cx="356" cy="86" r="1.8"/><circle cx="356" cy="102" r="1.8"/><circle cx="356" cy="118" r="1.8"/><circle cx="356" cy="134" r="1.8"/><circle cx="356" cy="174" r="1.8"/><circle cx="356" cy="190" r="1.8"/><circle cx="356" cy="206" r="1.8"/><circle cx="356" cy="222" r="1.8"/><circle cx="356" cy="238" r="1.8"/><circle cx="372" cy="70" r="1.8"/><circle cx="372" cy="86" r="1.8"/><circle cx="372" cy="102" r="1.8"/><circle cx="372" cy="118" r="1.8"/><circle cx="372" cy="134" r="1.8"/><circle cx="372" cy="174" r="1.8"/><circle cx="372" cy="190" r="1.8"/><circle cx="372" cy="206" r="1.8"/><circle cx="372" cy="222" r="1.8"/><circle cx="372" cy="238" r="1.8"/><circle cx="388" cy="70" r="1.8"/><circle cx="388" cy="86" r="1.8"/><circle cx="388" cy="102" r="1.8"/><circle cx="388" cy="118" r="1.8"/><circle cx="388" cy="134" r="1.8"/><circle cx="388" cy="174" r="1.8"/><circle cx="388" cy="190" r="1.8"/><circle cx="388" cy="206" r="1.8"/><circle cx="388" cy="222" r="1.8"/><circle cx="388" cy="238" r="1.8"/><circle cx="404" cy="70" r="1.8"/><circle cx="404" cy="86" r="1.8"/><circle cx="404" cy="102" r="1.8"/><circle cx="404" cy="118" r="1.8"/><circle cx="404" cy="134" r="1.8"/><circle cx="404" cy="174" r="1.8"/><circle cx="404" cy="190" r="1.8"/><circle cx="404" cy="206" r="1.8"/><circle cx="404" cy="222" r="1.8"/><circle cx="404" cy="238" r="1.8"/><circle cx="420" cy="70" r="1.8"/><circle cx="420" cy="86" r="1.8"/><circle cx="420" cy="102" r="1.8"/><circle cx="420" cy="118" r="1.8"/><circle cx="420" cy="134" r="1.8"/><circle cx="420" cy="174" r="1.8"/><circle cx="420" cy="190" r="1.8"/><circle cx="420" cy="206" r="1.8"/><circle cx="420" cy="222" r="1.8"/><circle cx="420" cy="238" r="1.8"/><circle cx="436" cy="70" r="1.8"/><circle cx="436" cy="86" r="1.8"/><circle cx="436" cy="102" r="1.8"/><circle cx="436" cy="118" r="1.8"/><circle cx="436" cy="134" r="1.8"/><circle cx="436" cy="174" r="1.8"/><circle cx="436" cy="190" r="1.8"/><circle cx="436" cy="206" r="1.8"/><circle cx="436" cy="222" r="1.8"/><circle cx="436" cy="238" r="1.8"/><circle cx="452" cy="70" r="1.8"/><circle cx="452" cy="86" r="1.8"/><circle cx="452" cy="102" r="1.8"/><circle cx="452" cy="118" r="1.8"/><circle cx="452" cy="134" r="1.8"/><circle cx="452" cy="174" r="1.8"/><circle cx="452" cy="190" r="1.8"/><circle cx="452" cy="206" r="1.8"/><circle cx="452" cy="222" r="1.8"/><circle cx="452" cy="238" r="1.8"/><circle cx="468" cy="70" r="1.8"/><circle cx="468" cy="86" r="1.8"/><circle cx="468" cy="102" r="1.8"/><circle cx="468" cy="118" r="1.8"/><circle cx="468" cy="134" r="1.8"/><circle cx="468" cy="174" r="1.8"/><circle cx="468" cy="190" r="1.8"/><circle cx="468" cy="206" r="1.8"/><circle cx="468" cy="222" r="1.8"/><circle cx="468" cy="238" r="1.8"/><circle cx="484" cy="70" r="1.8"/><circle cx="484" cy="86" r="1.8"/><circle cx="484" cy="102" r="1.8"/><circle cx="484" cy="118" r="1.8"/><circle cx="484" cy="134" r="1.8"/><circle cx="484" cy="174" r="1.8"/><circle cx="484" cy="190" r="1.8"/><circle cx="484" cy="206" r="1.8"/><circle cx="484" cy="222" r="1.8"/><circle cx="484" cy="238" r="1.8"/><circle cx="500" cy="70" r="1.8"/><circle cx="500" cy="86" r="1.8"/><circle cx="500" cy="102" r="1.8"/><circle cx="500" cy="118" r="1.8"/><circle cx="500" cy="134" r="1.8"/><circle cx="500" cy="174" r="1.8"/><circle cx="500" cy="190" r="1.8"/><circle cx="500" cy="206" r="1.8"/><circle cx="500" cy="222" r="1.8"/><circle cx="500" cy="238" r="1.8"/><circle cx="516" cy="70" r="1.8"/><circle cx="516" cy="86" r="1.8"/><circle cx="516" cy="102" r="1.8"/><circle cx="516" cy="118" r="1.8"/><circle cx="516" cy="134" r="1.8"/><circle cx="516" cy="174" r="1.8"/><circle cx="516" cy="190" r="1.8"/><circle cx="516" cy="206" r="1.8"/><circle cx="516" cy="222" r="1.8"/><circle cx="516" cy="238" r="1.8"/><circle cx="532" cy="70" r="1.8"/><circle cx="532" cy="86" r="1.8"/><circle cx="532" cy="102" r="1.8"/><circle cx="532" cy="118" r="1.8"/><circle cx="532" cy="134" r="1.8"/><circle cx="532" cy="174" r="1.8"/><circle cx="532" cy="190" r="1.8"/><circle cx="532" cy="206" r="1.8"/><circle cx="532" cy="222" r="1.8"/><circle cx="532" cy="238" r="1.8"/><circle cx="548" cy="70" r="1.8"/><circle cx="548" cy="86" r="1.8"/><circle cx="548" cy="102" r="1.8"/><circle cx="548" cy="118" r="1.8"/><circle cx="548" cy="134" r="1.8"/><circle cx="548" cy="174" r="1.8"/><circle cx="548" cy="190" r="1.8"/><circle cx="548" cy="206" r="1.8"/><circle cx="548" cy="222" r="1.8"/><circle cx="548" cy="238" r="1.8"/><circle cx="564" cy="70" r="1.8"/><circle cx="564" cy="86" r="1.8"/><circle cx="564" cy="102" r="1.8"/><circle cx="564" cy="118" r="1.8"/><circle cx="564" cy="134" r="1.8"/><circle cx="564" cy="174" r="1.8"/><circle cx="564" cy="190" r="1.8"/><circle cx="564" cy="206" r="1.8"/><circle cx="564" cy="222" r="1.8"/><circle cx="564" cy="238" r="1.8"/><circle cx="580" cy="70" r="1.8"/><circle cx="580" cy="86" r="1.8"/><circle cx="580" cy="102" r="1.8"/><circle cx="580" cy="118" r="1.8"/><circle cx="580" cy="134" r="1.8"/><circle cx="580" cy="174" r="1.8"/><circle cx="580" cy="190" r="1.8"/><circle cx="580" cy="206" r="1.8"/><circle cx="580" cy="222" r="1.8"/><circle cx="580" cy="238" r="1.8"/><circle cx="596" cy="70" r="1.8"/><circle cx="596" cy="86" r="1.8"/><circle cx="596" cy="102" r="1.8"/><circle cx="596" cy="118" r="1.8"/><circle cx="596" cy="134" r="1.8"/><circle cx="596" cy="174" r="1.8"/><circle cx="596" cy="190" r="1.8"/><circle cx="596" cy="206" r="1.8"/><circle cx="596" cy="222" r="1.8"/><circle cx="596" cy="238" r="1.8"/><circle cx="612" cy="70" r="1.8"/><circle cx="612" cy="86" r="1.8"/><circle cx="612" cy="102" r="1.8"/><circle cx="612" cy="118" r="1.8"/><circle cx="612" cy="134" r="1.8"/><circle cx="612" cy="174" r="1.8"/><circle cx="612" cy="190" r="1.8"/><circle cx="612" cy="206" r="1.8"/><circle cx="612" cy="222" r="1.8"/><circle cx="612" cy="238" r="1.8"/><circle cx="628" cy="70" r="1.8"/><circle cx="628" cy="86" r="1.8"/><circle cx="628" cy="102" r="1.8"/><circle cx="628" cy="118" r="1.8"/><circle cx="628" cy="134" r="1.8"/><circle cx="628" cy="174" r="1.8"/><circle cx="628" cy="190" r="1.8"/><circle cx="628" cy="206" r="1.8"/><circle cx="628" cy="222" r="1.8"/><circle cx="628" cy="238" r="1.8"/><circle cx="644" cy="70" r="1.8"/><circle cx="644" cy="86" r="1.8"/><circle cx="644" cy="102" r="1.8"/><circle cx="644" cy="118" r="1.8"/><circle cx="644" cy="134" r="1.8"/><circle cx="644" cy="174" r="1.8"/><circle cx="644" cy="190" r="1.8"/><circle cx="644" cy="206" r="1.8"/><circle cx="644" cy="222" r="1.8"/><circle cx="644" cy="238" r="1.8"/></g>
<path d="M24 154H656" stroke="currentColor" stroke-dasharray="2 4" opacity="0.4"/>
<rect x="44" y="134" width="128" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M44 148a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="52" cy="134" r="3"/><circle cx="52" cy="174" r="3"/><circle cx="68" cy="134" r="3"/><circle cx="68" cy="174" r="3"/><circle cx="84" cy="134" r="3"/><circle cx="84" cy="174" r="3"/><circle cx="100" cy="134" r="3"/><circle cx="100" cy="174" r="3"/><circle cx="116" cy="134" r="3"/><circle cx="116" cy="174" r="3"/><circle cx="132" cy="134" r="3"/><circle cx="132" cy="174" r="3"/><circle cx="148" cy="134" r="3"/><circle cx="148" cy="174" r="3"/><circle cx="164" cy="134" r="3"/><circle cx="164" cy="174" r="3"/></g>
<text x="108.0" y="152" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor">U8</text><text x="108.0" y="164" text-anchor="middle" font-family="sans-serif" font-size="8" fill="currentColor" opacity="0.8">74AC138</text>
<path d="M84 28V44" stroke="#4a7fd4" stroke-width="2"/><rect x="80" y="32" width="8" height="8" fill="#4a7fd4"/>
<rect x="204" y="134" width="112" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M204 148a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="212" cy="134" r="3"/><circle cx="212" cy="174" r="3"/><circle cx="228" cy="134" r="3"/><circle cx="228" cy="174" r="3"/><circle cx="244" cy="134" r="3"/><circle cx="244" cy="174" r="3"/><circle cx="260" cy="134" r="3"/><circle cx="260" cy="174" r="3"/><circle cx="276" cy="134" r="3"/><circle cx="276" cy="174" r="3"/><circle cx="292" cy="134" r="3"/><circle cx="292" cy="174" r="3"/><circle cx="308" cy="134" r="3"/><circle cx="308" cy="174" r="3"/></g>
<text x="260.0" y="152" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor">U7</text><text x="260.0" y="164" text-anchor="middle" font-family="sans-serif" font-size="8" fill="currentColor" opacity="0.8">74AC08</text>
<path d="M260 28V44" stroke="#4a7fd4" stroke-width="2"/><rect x="256" y="32" width="8" height="8" fill="#4a7fd4"/>
<rect x="348" y="134" width="112" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M348 148a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="356" cy="134" r="3"/><circle cx="356" cy="174" r="3"/><circle cx="372" cy="134" r="3"/><circle cx="372" cy="174" r="3"/><circle cx="388" cy="134" r="3"/><circle cx="388" cy="174" r="3"/><circle cx="404" cy="134" r="3"/><circle cx="404" cy="174" r="3"/><circle cx="420" cy="134" r="3"/><circle cx="420" cy="174" r="3"/><circle cx="436" cy="134" r="3"/><circle cx="436" cy="174" r="3"/><circle cx="452" cy="134" r="3"/><circle cx="452" cy="174" r="3"/></g>
<text x="404.0" y="152" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor">U9</text><text x="404.0" y="164" text-anchor="middle" font-family="sans-serif" font-size="8" fill="currentColor" opacity="0.8">74AC00</text>
<path d="M404 28V44" stroke="#4a7fd4" stroke-width="2"/><rect x="400" y="32" width="8" height="8" fill="#4a7fd4"/>
<rect x="492" y="134" width="128" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M492 148a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="500" cy="134" r="3"/><circle cx="500" cy="174" r="3"/><circle cx="516" cy="134" r="3"/><circle cx="516" cy="174" r="3"/><circle cx="532" cy="134" r="3"/><circle cx="532" cy="174" r="3"/><circle cx="548" cy="134" r="3"/><circle cx="548" cy="174" r="3"/><circle cx="564" cy="134" r="3"/><circle cx="564" cy="174" r="3"/><circle cx="580" cy="134" r="3"/><circle cx="580" cy="174" r="3"/><circle cx="596" cy="134" r="3"/><circle cx="596" cy="174" r="3"/><circle cx="612" cy="134" r="3"/><circle cx="612" cy="174" r="3"/></g>
<text x="556.0" y="152" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor">U6</text><text x="556.0" y="164" text-anchor="middle" font-family="sans-serif" font-size="8" fill="currentColor" opacity="0.8">74AC138</text>
<path d="M548 28V44" stroke="#4a7fd4" stroke-width="2"/><rect x="544" y="32" width="8" height="8" fill="#4a7fd4"/>
<path d="M52.0 70.0 L52.0 44.0" fill="none" stroke="#d0312d" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M212.0 70.0 L212.0 44.0" fill="none" stroke="#d0312d" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M356.0 70.0 L356.0 44.0" fill="none" stroke="#d0312d" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M500.0 70.0 L500.0 44.0" fill="none" stroke="#d0312d" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M228.0 70.0 L228.0 28.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M244.0 70.0 L244.0 28.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M276.0 70.0 L276.0 28.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M292.0 70.0 L292.0 28.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M84.0 238.0 L84.0 266.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M100.0 238.0 L100.0 266.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M116.0 238.0 L116.0 266.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M164.0 238.0 L164.0 266.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M260.0 238.0 L260.0 266.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M276.0 238.0 L276.0 266.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M308.0 238.0 L308.0 266.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M452.0 238.0 L452.0 266.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M612.0 238.0 L612.0 266.0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M116.0 86.0 L436.0 86.0" fill="none" stroke="#2e9d5b" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M68.0 102.0 L192.8 102.0 L192.8 206.0 L212.0 206.0" fill="none" stroke="#2e9d5b" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M84.0 118.0 L186.4 118.0 L186.4 190.0 L228.0 190.0" fill="none" stroke="#2e9d5b" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M420.0 118.0 L436.0 118.0" fill="none" stroke="#2e9d5b" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M404.0 102.0 L480.8 102.0 L480.8 206.0 L564.0 206.0" fill="none" stroke="#2e9d5b" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M356.0 190.0 L372.0 190.0" fill="none" stroke="#2e9d5b" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M388.0 190.0 L404.0 190.0" fill="none" stroke="#2e9d5b" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M372.0 102.0 L388.0 102.0" fill="none" stroke="#d4a017" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M52.0 238.0 L52.0 320.0" fill="none" stroke="#d4a017" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M68.0 238.0 L68.0 320.0" fill="none" stroke="#d4a017" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M132.0 238.0 L132.0 320.0" fill="none" stroke="#d4a017" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M356.0 238.0 L356.0 320.0" fill="none" stroke="#2e9d5b" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M420.0 238.0 L420.0 320.0" fill="none" stroke="currentColor" stroke-width="4.5"/><path d="M420.0 238.0 L420.0 320.0" fill="none" stroke="#ffffff" stroke-width="2.5"/>
<path d="M500.0 238.0 L500.0 320.0" fill="none" stroke="#d4a017" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M516.0 238.0 L516.0 320.0" fill="none" stroke="#d4a017" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M532.0 238.0 L532.0 320.0" fill="none" stroke="#d4a017" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M52.0 222.0 L52.0 230.0 L548.0 230.0 L548.0 222.0" fill="none" stroke="#d4a017" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M68.0 206.0 L68.0 214.0 L580.0 214.0 L580.0 206.0" fill="none" stroke="#d4a017" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M132.0 190.0 L132.0 198.0 L333.6 198.0 L333.6 118.0 L388.0 118.0" fill="none" stroke="#d4a017" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="52.0" cy="70.0" r="3" fill="#d0312d" stroke="none"/>
<circle cx="52.0" cy="44.0" r="3" fill="#d0312d" stroke="none"/>
<circle cx="212.0" cy="70.0" r="3" fill="#d0312d" stroke="none"/>
<circle cx="212.0" cy="44.0" r="3" fill="#d0312d" stroke="none"/>
<circle cx="356.0" cy="70.0" r="3" fill="#d0312d" stroke="none"/>
<circle cx="356.0" cy="44.0" r="3" fill="#d0312d" stroke="none"/>
<circle cx="500.0" cy="70.0" r="3" fill="#d0312d" stroke="none"/>
<circle cx="500.0" cy="44.0" r="3" fill="#d0312d" stroke="none"/>
<circle cx="228.0" cy="70.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="228.0" cy="28.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="244.0" cy="70.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="244.0" cy="28.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="276.0" cy="70.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="276.0" cy="28.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="292.0" cy="70.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="292.0" cy="28.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="84.0" cy="238.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="84.0" cy="266.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="100.0" cy="238.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="100.0" cy="266.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="116.0" cy="238.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="116.0" cy="266.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="164.0" cy="238.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="164.0" cy="266.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="260.0" cy="238.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="260.0" cy="266.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="276.0" cy="238.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="276.0" cy="266.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="308.0" cy="238.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="308.0" cy="266.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="452.0" cy="238.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="452.0" cy="266.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="612.0" cy="238.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="612.0" cy="266.0" r="3" fill="currentColor" stroke="none"/>
<circle cx="116.0" cy="86.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="436.0" cy="86.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="68.0" cy="102.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="212.0" cy="206.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="84.0" cy="118.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="228.0" cy="190.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="420.0" cy="118.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="436.0" cy="118.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="404.0" cy="102.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="564.0" cy="206.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="356.0" cy="190.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="372.0" cy="190.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="388.0" cy="190.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="404.0" cy="190.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="372.0" cy="102.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="388.0" cy="102.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="52.0" cy="238.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="68.0" cy="238.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="132.0" cy="238.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="356.0" cy="238.0" r="3" fill="#2e9d5b" stroke="none"/>
<circle cx="420.0" cy="238.0" r="3" fill="#ffffff" stroke="currentColor"/>
<circle cx="500.0" cy="238.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="516.0" cy="238.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="532.0" cy="238.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="52.0" cy="222.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="548.0" cy="222.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="68.0" cy="206.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="580.0" cy="206.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="132.0" cy="190.0" r="3" fill="#d4a017" stroke="none"/>
<circle cx="388.0" cy="118.0" r="3" fill="#d4a017" stroke="none"/>
<g fill="currentColor" font-family="sans-serif" font-size="9">
<text x="55" y="324" font-size="8" transform="rotate(90 55 324)">A13</text>
<text x="71" y="324" font-size="8" transform="rotate(90 71 324)">A14</text>
<text x="135" y="324" font-size="8" transform="rotate(90 135 324)">A15</text>
<text x="359" y="324" font-size="8" transform="rotate(90 359 324)">RWB</text>
<text x="423" y="324" font-size="8" transform="rotate(90 423 324)">PHI2</text>
<text x="503" y="324" font-size="8" transform="rotate(90 503 324)">A10</text>
<text x="519" y="324" font-size="8" transform="rotate(90 519 324)">A11</text>
<text x="535" y="324" font-size="8" transform="rotate(90 535 324)">A12</text>
<text x="248" y="193" font-size="8">~EXRAMCS</text>
<text x="440" y="209" font-size="8">~WE</text>
<text x="458" y="66" font-size="8" opacity="0.8">MIACS</text>
<text x="556.0" y="66" text-anchor="middle" font-size="8" opacity="0.8">~IOCS0-7 (U6.15 to U6.7)</text>
<text x="644" y="48" text-anchor="end" font-size="8">+</text><text x="644" y="32" text-anchor="end" font-size="8">GND</text>
<text x="644" y="270" text-anchor="end" font-size="8">GND</text><text x="644" y="286" text-anchor="end" font-size="8">+</text>
<text x="100" y="24" font-size="8" fill="#4a7fd4">100 nF</text>
<text x="628" y="350" text-anchor="end" font-size="9">from the CPU rows on board 2 ↓</text>
</g>
</svg>
</div>

Only eight wires come up from the CPU: A13, A14 and A15 go to U8 alone,
and U8's rows pass them on. U6 takes A13 and A14 from U8.1 and U8.2, and
U9.12 takes A15 from U8.6. The glue chips are narrow, so their rows have
holes to spare, while the CPU's rows are needed for the RAM chips later
(see [Chain, don't star](../breadboard.md#chain-dont-star)).

### U8 (74AC138), the memory decoder

| U8 pin | Signal | Connects to | Wire | Notes |
| --- | --- | --- | --- | --- |
| 1 | A13 | U1.23, U6.4 | yellow | Input A0. Passes A13 on to U6 |
| 2 | A14 | U1.24, U6.6 | yellow | Input A1. Passes A14 on to U6 |
| 3 | GND | GND | black | Input A2 |
| 4 | GND | GND | black | `~E1` |
| 5 | GND | GND | black | `~E2` |
| 6 | A15 | U1.25, U9.12 | yellow | `E3`: U8 only works while A15 is high. Passes A15 on to U9 |
| 7 | unconnected | | - | `~Y7` |
| 8 | GND | GND | black | |
| 9 | unconnected | | - | `~Y6` |
| 10 | unconnected | | - | `~Y5` |
| 11 | unconnected | | - | `~Y4` |
| 12 | ~Y3 | U9.9, U9.10 | green | Low for `$E000-$FFFF` |
| 13 | unconnected | | - | `~Y2` (`$C000-$DFFF` is U6's job) |
| 14 | ~Y1 | U7.2 | green | Low for `$A000-$BFFF` |
| 15 | ~Y0 | U7.1 | green | Low for `$8000-$9FFF` |
| 16 | 3.3 V | 3.3 V | red | |

### U7 (74AC08), the AND gates

Only one gate is used. Tie the unused gates' inputs to GND so they don't
float, and leave their outputs open.

| U7 pin | Signal | Connects to | Wire | Notes |
| --- | --- | --- | --- | --- |
| 1 | ~Y0 | U8.15 | green | |
| 2 | ~Y1 | U8.14 | green | |
| 3 | ~EXRAMCS | | - | Goes to U2.22 in stage 7: leave a free hole |
| 4 | GND | GND | black | Unused input |
| 5 | GND | GND | black | Unused input |
| 6 | unconnected | | - | Unused output |
| 7 | GND | GND | black | |
| 8 | unconnected | | - | Unused output |
| 9 | GND | GND | black | Unused input |
| 10 | GND | GND | black | Unused input |
| 11 | unconnected | | - | Unused output |
| 12 | GND | GND | black | Unused input |
| 13 | GND | GND | black | Unused input |
| 14 | 3.3 V | 3.3 V | red | |

### U9 (74AC00), the NAND gates

All four gates are used. A NAND with both inputs joined is an inverter.

| U9 pin | Signal | Connects to | Wire | Notes |
| --- | --- | --- | --- | --- |
| 1 | RWB | U1.34 | green | Gate 1: `~OE` is RWB inverted |
| 2 | RWB | U9.1 | green | |
| 3 | ~OE | U9.4 | green | Low while the CPU reads; goes to both RAMs later |
| 4 | ~OE | U9.3 | green | Gate 2: `~WE` = NAND(PHI2, `~OE`) |
| 5 | PHI2 | U1.37 | white | |
| 6 | ~WE | | - | Low while the CPU writes and PHI2 is high; goes to both RAMs later |
| 7 | GND | GND | black | |
| 8 | MIACS | | - | Gate 3 output, active high. Goes to Pico 9 (GP6) in stage 5, not before |
| 9 | ~Y3 | U8.12 | green | Gate 3: `MIACS` is `~Y3` inverted |
| 10 | ~Y3 | U9.9 | green | |
| 11 | ~A15 | U6.5 | green | Gate 4 output |
| 12 | A15 | U8.6 | yellow | Gate 4: `~A15` is A15 inverted |
| 13 | A15 | U9.12 | yellow | |
| 14 | 3.3 V | 3.3 V | red | |

### U6 (74AC138), the I/O decoder

U6 is enabled straight from A13-A15 rather than through U8 (the other 74AC138), which saves a
gate delay on the selects the VIA and the expansion cards need early.

| U6 pin | Signal | Connects to | Wire | Notes |
| --- | --- | --- | --- | --- |
| 1 | A10 | U1.19 | yellow | Input A0 |
| 2 | A11 | U1.20 | yellow | Input A1 |
| 3 | A12 | U1.22 | yellow | Input A2 |
| 4 | A13 | U8.1 | yellow | `~E1`: A13 must be low |
| 5 | ~A15 | U9.11 | green | `~E2`: A15 must be high |
| 6 | A14 | U8.2 | yellow | `E3`: A14 must be high |
| 7 | ~IOCS7 | | - | Expansion slot 7: nothing on the breadboard |
| 8 | GND | GND | black | |
| 9 | ~IOCS6 | | - | Expansion slot 6 |
| 10 | ~IOCS5 | | - | Expansion slot 5 |
| 11 | ~IOCS4 | | - | Expansion slot 4 |
| 12 | ~IOCS3 | | - | Expansion slot 3 |
| 13 | ~IOCS2 | | - | Expansion slot 2 |
| 14 | ~IOCS1 | | - | Expansion slot 1 |
| 15 | ~IOCS0 | | - | The VIA's select: goes to U3.23 in stage 8 |
| 16 | 3.3 V | 3.3 V | red | |

## Check

**Before you plug in**, run the
[power-up checks](../breadboard.md#before-you-power-up) on what you just
added.

Plug the USB cable in: the glue logic needs power, and MIA can run as it is
(MIA's pins aren't wired to the CPU's rows yet).

Push jumper wires from the rails into the CPU's rows for A10-A15 (CPU pins U1.19,
U1.20, U1.22-U1.25), RWB (U1.34) and PHI2 (U1.37). Every one of those inputs
must go to a rail, high or low: a floating CMOS input gives random readings.
Any colour will do for these test jumpers; they come out at the end.

This is the one place in the guide where you move wires with the power on,
to step through the tables without unplugging each time. It is safe
because each jumper only feeds a chip input: move one end at a time, only
between a rail and a CPU row, and never let a loose end touch the other
rail. If you'd rather not, unplug for every change; the results are the
same.

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

Try a few more A10-A12 values with A15-A13 at 1 1 0: exactly one U6 (74AC138) output
is 0 each time, `~IOCSn` where n is A12 A11 A10 read as a binary number.

Check that U9.11 (`~A15`, on the 74AC00) is always the opposite of A15. Then the strobes:

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
