# Stage 4: The CPU runs free

This is the classic first test of a 6502 computer. Resistors hold the data
bus at `$EA`, the opcode for NOP, so whatever address the CPU reads, it
reads a NOP. It reads its reset vector as `$EAEA`, jumps there, and then
executes NOPs forever, walking through all 64 KB of addresses. Every address
line toggles, and every chip select goes low in its turn.

MIA makes the clock and the reset, as it always will. The only thing you
change for this test is that MIA must not answer the CPU: its chip select
input stays grounded, so it never drives the data bus.

## Parts

| Part | Qty | On the schematic | Notes |
| --- | --- | --- | --- |
| W65C02S CPU | 1 | U1 | DIP-40 |
| 100 nF ceramic capacitor | 1 |  |  |
| 2.2 kΩ resistor | 1 | R1 | RDY pull-up |
| 4.7 kΩ resistor | 2 | R2, R5 | `~IRQB` and `~NMI` pull-ups |
| 4.7 kΩ resistor | 8 |  | The `$EA` resistors; they come off in stage 5 |
| Jumper wire | 1 |  | Pico 9 to GND; it comes out in stage 5 |
| LEDs and 1 kΩ resistors | 8 each |  | For the check |

## What you add

The CPU (U1, W65C02S) on board 2, in the rows you marked in stage 3, with its 100 nF
capacitor and its three pull-up resistors, and its links to MIA.

### Where things go

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 770 360" width="100%" style="max-width:850px" role="img" aria-label="Board 2 close-up, column 1 at the left. The CPU straddles the centre gap in columns 2 to 21, notch toward column 1, legs in rows d and h, so its top pins keep rows a to c free and its bottom pins rows i and j. Red wires take pins 36 and 38 to the top + rail and pin 8 to the bottom + rail, with the 100 nF capacitor from pin 8's row to GND. A black wire takes pin 21 to the top GND rail. R1 and R5 pull pins 2 and 6 up to the bottom + rail. A green wire takes pin 4 to column 22, the IRQB row, where R2 pulls it up. Eight 4.7 kilohm resistors hold D0 to D7 at $EA from the top rows. Faded wires from stage 3 go up to board 3. Wires to the Pico leave downward: A0 to A4 from the bottom rows, and RESB, PHI2, RWB and D0 to D7 from the top rows, crossing over the chip. Eight LEDs with 1 kilohm resistors sit in columns 40 to 55, fed from A0 to A7 with A7 on the left.">
<rect x="9.9" y="30" width="746.2" height="256" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g stroke-width="3" opacity="0.35"><path d="M17.9 42H748.1M17.9 262H748.1" stroke="currentColor"/><path d="M17.9 54H748.1M17.9 274H748.1" stroke="#d0312d"/></g>
<g fill="currentColor" opacity="0.22"><circle cx="19" cy="72" r="1.6"/><circle cx="19" cy="85" r="1.6"/><circle cx="19" cy="98" r="1.6"/><circle cx="19" cy="111" r="1.6"/><circle cx="19" cy="124" r="1.6"/><circle cx="19" cy="154" r="1.6"/><circle cx="19" cy="167" r="1.6"/><circle cx="19" cy="180" r="1.6"/><circle cx="19" cy="193" r="1.6"/><circle cx="19" cy="206" r="1.6"/><circle cx="32" cy="72" r="1.6"/><circle cx="32" cy="85" r="1.6"/><circle cx="32" cy="98" r="1.6"/><circle cx="32" cy="111" r="1.6"/><circle cx="32" cy="124" r="1.6"/><circle cx="32" cy="154" r="1.6"/><circle cx="32" cy="167" r="1.6"/><circle cx="32" cy="180" r="1.6"/><circle cx="32" cy="193" r="1.6"/><circle cx="32" cy="206" r="1.6"/><circle cx="45" cy="72" r="1.6"/><circle cx="45" cy="85" r="1.6"/><circle cx="45" cy="98" r="1.6"/><circle cx="45" cy="111" r="1.6"/><circle cx="45" cy="124" r="1.6"/><circle cx="45" cy="154" r="1.6"/><circle cx="45" cy="167" r="1.6"/><circle cx="45" cy="180" r="1.6"/><circle cx="45" cy="193" r="1.6"/><circle cx="45" cy="206" r="1.6"/><circle cx="58" cy="72" r="1.6"/><circle cx="58" cy="85" r="1.6"/><circle cx="58" cy="98" r="1.6"/><circle cx="58" cy="111" r="1.6"/><circle cx="58" cy="124" r="1.6"/><circle cx="58" cy="154" r="1.6"/><circle cx="58" cy="167" r="1.6"/><circle cx="58" cy="180" r="1.6"/><circle cx="58" cy="193" r="1.6"/><circle cx="58" cy="206" r="1.6"/><circle cx="71" cy="72" r="1.6"/><circle cx="71" cy="85" r="1.6"/><circle cx="71" cy="98" r="1.6"/><circle cx="71" cy="111" r="1.6"/><circle cx="71" cy="124" r="1.6"/><circle cx="71" cy="154" r="1.6"/><circle cx="71" cy="167" r="1.6"/><circle cx="71" cy="180" r="1.6"/><circle cx="71" cy="193" r="1.6"/><circle cx="71" cy="206" r="1.6"/><circle cx="84" cy="72" r="1.6"/><circle cx="84" cy="85" r="1.6"/><circle cx="84" cy="98" r="1.6"/><circle cx="84" cy="111" r="1.6"/><circle cx="84" cy="124" r="1.6"/><circle cx="84" cy="154" r="1.6"/><circle cx="84" cy="167" r="1.6"/><circle cx="84" cy="180" r="1.6"/><circle cx="84" cy="193" r="1.6"/><circle cx="84" cy="206" r="1.6"/><circle cx="97" cy="72" r="1.6"/><circle cx="97" cy="85" r="1.6"/><circle cx="97" cy="98" r="1.6"/><circle cx="97" cy="111" r="1.6"/><circle cx="97" cy="124" r="1.6"/><circle cx="97" cy="154" r="1.6"/><circle cx="97" cy="167" r="1.6"/><circle cx="97" cy="180" r="1.6"/><circle cx="97" cy="193" r="1.6"/><circle cx="97" cy="206" r="1.6"/><circle cx="110" cy="72" r="1.6"/><circle cx="110" cy="85" r="1.6"/><circle cx="110" cy="98" r="1.6"/><circle cx="110" cy="111" r="1.6"/><circle cx="110" cy="124" r="1.6"/><circle cx="110" cy="154" r="1.6"/><circle cx="110" cy="167" r="1.6"/><circle cx="110" cy="180" r="1.6"/><circle cx="110" cy="193" r="1.6"/><circle cx="110" cy="206" r="1.6"/><circle cx="123" cy="72" r="1.6"/><circle cx="123" cy="85" r="1.6"/><circle cx="123" cy="98" r="1.6"/><circle cx="123" cy="111" r="1.6"/><circle cx="123" cy="124" r="1.6"/><circle cx="123" cy="154" r="1.6"/><circle cx="123" cy="167" r="1.6"/><circle cx="123" cy="180" r="1.6"/><circle cx="123" cy="193" r="1.6"/><circle cx="123" cy="206" r="1.6"/><circle cx="136" cy="72" r="1.6"/><circle cx="136" cy="85" r="1.6"/><circle cx="136" cy="98" r="1.6"/><circle cx="136" cy="111" r="1.6"/><circle cx="136" cy="124" r="1.6"/><circle cx="136" cy="154" r="1.6"/><circle cx="136" cy="167" r="1.6"/><circle cx="136" cy="180" r="1.6"/><circle cx="136" cy="193" r="1.6"/><circle cx="136" cy="206" r="1.6"/><circle cx="149" cy="72" r="1.6"/><circle cx="149" cy="85" r="1.6"/><circle cx="149" cy="98" r="1.6"/><circle cx="149" cy="111" r="1.6"/><circle cx="149" cy="124" r="1.6"/><circle cx="149" cy="154" r="1.6"/><circle cx="149" cy="167" r="1.6"/><circle cx="149" cy="180" r="1.6"/><circle cx="149" cy="193" r="1.6"/><circle cx="149" cy="206" r="1.6"/><circle cx="162" cy="72" r="1.6"/><circle cx="162" cy="85" r="1.6"/><circle cx="162" cy="98" r="1.6"/><circle cx="162" cy="111" r="1.6"/><circle cx="162" cy="124" r="1.6"/><circle cx="162" cy="154" r="1.6"/><circle cx="162" cy="167" r="1.6"/><circle cx="162" cy="180" r="1.6"/><circle cx="162" cy="193" r="1.6"/><circle cx="162" cy="206" r="1.6"/><circle cx="175" cy="72" r="1.6"/><circle cx="175" cy="85" r="1.6"/><circle cx="175" cy="98" r="1.6"/><circle cx="175" cy="111" r="1.6"/><circle cx="175" cy="124" r="1.6"/><circle cx="175" cy="154" r="1.6"/><circle cx="175" cy="167" r="1.6"/><circle cx="175" cy="180" r="1.6"/><circle cx="175" cy="193" r="1.6"/><circle cx="175" cy="206" r="1.6"/><circle cx="188" cy="72" r="1.6"/><circle cx="188" cy="85" r="1.6"/><circle cx="188" cy="98" r="1.6"/><circle cx="188" cy="111" r="1.6"/><circle cx="188" cy="124" r="1.6"/><circle cx="188" cy="154" r="1.6"/><circle cx="188" cy="167" r="1.6"/><circle cx="188" cy="180" r="1.6"/><circle cx="188" cy="193" r="1.6"/><circle cx="188" cy="206" r="1.6"/><circle cx="201" cy="72" r="1.6"/><circle cx="201" cy="85" r="1.6"/><circle cx="201" cy="98" r="1.6"/><circle cx="201" cy="111" r="1.6"/><circle cx="201" cy="124" r="1.6"/><circle cx="201" cy="154" r="1.6"/><circle cx="201" cy="167" r="1.6"/><circle cx="201" cy="180" r="1.6"/><circle cx="201" cy="193" r="1.6"/><circle cx="201" cy="206" r="1.6"/><circle cx="214" cy="72" r="1.6"/><circle cx="214" cy="85" r="1.6"/><circle cx="214" cy="98" r="1.6"/><circle cx="214" cy="111" r="1.6"/><circle cx="214" cy="124" r="1.6"/><circle cx="214" cy="154" r="1.6"/><circle cx="214" cy="167" r="1.6"/><circle cx="214" cy="180" r="1.6"/><circle cx="214" cy="193" r="1.6"/><circle cx="214" cy="206" r="1.6"/><circle cx="227" cy="72" r="1.6"/><circle cx="227" cy="85" r="1.6"/><circle cx="227" cy="98" r="1.6"/><circle cx="227" cy="111" r="1.6"/><circle cx="227" cy="124" r="1.6"/><circle cx="227" cy="154" r="1.6"/><circle cx="227" cy="167" r="1.6"/><circle cx="227" cy="180" r="1.6"/><circle cx="227" cy="193" r="1.6"/><circle cx="227" cy="206" r="1.6"/><circle cx="240" cy="72" r="1.6"/><circle cx="240" cy="85" r="1.6"/><circle cx="240" cy="98" r="1.6"/><circle cx="240" cy="111" r="1.6"/><circle cx="240" cy="124" r="1.6"/><circle cx="240" cy="154" r="1.6"/><circle cx="240" cy="167" r="1.6"/><circle cx="240" cy="180" r="1.6"/><circle cx="240" cy="193" r="1.6"/><circle cx="240" cy="206" r="1.6"/><circle cx="253" cy="72" r="1.6"/><circle cx="253" cy="85" r="1.6"/><circle cx="253" cy="98" r="1.6"/><circle cx="253" cy="111" r="1.6"/><circle cx="253" cy="124" r="1.6"/><circle cx="253" cy="154" r="1.6"/><circle cx="253" cy="167" r="1.6"/><circle cx="253" cy="180" r="1.6"/><circle cx="253" cy="193" r="1.6"/><circle cx="253" cy="206" r="1.6"/><circle cx="266" cy="72" r="1.6"/><circle cx="266" cy="85" r="1.6"/><circle cx="266" cy="98" r="1.6"/><circle cx="266" cy="111" r="1.6"/><circle cx="266" cy="124" r="1.6"/><circle cx="266" cy="154" r="1.6"/><circle cx="266" cy="167" r="1.6"/><circle cx="266" cy="180" r="1.6"/><circle cx="266" cy="193" r="1.6"/><circle cx="266" cy="206" r="1.6"/><circle cx="279" cy="72" r="1.6"/><circle cx="279" cy="85" r="1.6"/><circle cx="279" cy="98" r="1.6"/><circle cx="279" cy="111" r="1.6"/><circle cx="279" cy="124" r="1.6"/><circle cx="279" cy="154" r="1.6"/><circle cx="279" cy="167" r="1.6"/><circle cx="279" cy="180" r="1.6"/><circle cx="279" cy="193" r="1.6"/><circle cx="279" cy="206" r="1.6"/><circle cx="292" cy="72" r="1.6"/><circle cx="292" cy="85" r="1.6"/><circle cx="292" cy="98" r="1.6"/><circle cx="292" cy="111" r="1.6"/><circle cx="292" cy="124" r="1.6"/><circle cx="292" cy="154" r="1.6"/><circle cx="292" cy="167" r="1.6"/><circle cx="292" cy="180" r="1.6"/><circle cx="292" cy="193" r="1.6"/><circle cx="292" cy="206" r="1.6"/><circle cx="305" cy="72" r="1.6"/><circle cx="305" cy="85" r="1.6"/><circle cx="305" cy="98" r="1.6"/><circle cx="305" cy="111" r="1.6"/><circle cx="305" cy="124" r="1.6"/><circle cx="305" cy="154" r="1.6"/><circle cx="305" cy="167" r="1.6"/><circle cx="305" cy="180" r="1.6"/><circle cx="305" cy="193" r="1.6"/><circle cx="305" cy="206" r="1.6"/><circle cx="318" cy="72" r="1.6"/><circle cx="318" cy="85" r="1.6"/><circle cx="318" cy="98" r="1.6"/><circle cx="318" cy="111" r="1.6"/><circle cx="318" cy="124" r="1.6"/><circle cx="318" cy="154" r="1.6"/><circle cx="318" cy="167" r="1.6"/><circle cx="318" cy="180" r="1.6"/><circle cx="318" cy="193" r="1.6"/><circle cx="318" cy="206" r="1.6"/><circle cx="331" cy="72" r="1.6"/><circle cx="331" cy="85" r="1.6"/><circle cx="331" cy="98" r="1.6"/><circle cx="331" cy="111" r="1.6"/><circle cx="331" cy="124" r="1.6"/><circle cx="331" cy="154" r="1.6"/><circle cx="331" cy="167" r="1.6"/><circle cx="331" cy="180" r="1.6"/><circle cx="331" cy="193" r="1.6"/><circle cx="331" cy="206" r="1.6"/><circle cx="344" cy="72" r="1.6"/><circle cx="344" cy="85" r="1.6"/><circle cx="344" cy="98" r="1.6"/><circle cx="344" cy="111" r="1.6"/><circle cx="344" cy="124" r="1.6"/><circle cx="344" cy="154" r="1.6"/><circle cx="344" cy="167" r="1.6"/><circle cx="344" cy="180" r="1.6"/><circle cx="344" cy="193" r="1.6"/><circle cx="344" cy="206" r="1.6"/><circle cx="357" cy="72" r="1.6"/><circle cx="357" cy="85" r="1.6"/><circle cx="357" cy="98" r="1.6"/><circle cx="357" cy="111" r="1.6"/><circle cx="357" cy="124" r="1.6"/><circle cx="357" cy="154" r="1.6"/><circle cx="357" cy="167" r="1.6"/><circle cx="357" cy="180" r="1.6"/><circle cx="357" cy="193" r="1.6"/><circle cx="357" cy="206" r="1.6"/><circle cx="370" cy="72" r="1.6"/><circle cx="370" cy="85" r="1.6"/><circle cx="370" cy="98" r="1.6"/><circle cx="370" cy="111" r="1.6"/><circle cx="370" cy="124" r="1.6"/><circle cx="370" cy="154" r="1.6"/><circle cx="370" cy="167" r="1.6"/><circle cx="370" cy="180" r="1.6"/><circle cx="370" cy="193" r="1.6"/><circle cx="370" cy="206" r="1.6"/><circle cx="383" cy="72" r="1.6"/><circle cx="383" cy="85" r="1.6"/><circle cx="383" cy="98" r="1.6"/><circle cx="383" cy="111" r="1.6"/><circle cx="383" cy="124" r="1.6"/><circle cx="383" cy="154" r="1.6"/><circle cx="383" cy="167" r="1.6"/><circle cx="383" cy="180" r="1.6"/><circle cx="383" cy="193" r="1.6"/><circle cx="383" cy="206" r="1.6"/><circle cx="396" cy="72" r="1.6"/><circle cx="396" cy="85" r="1.6"/><circle cx="396" cy="98" r="1.6"/><circle cx="396" cy="111" r="1.6"/><circle cx="396" cy="124" r="1.6"/><circle cx="396" cy="154" r="1.6"/><circle cx="396" cy="167" r="1.6"/><circle cx="396" cy="180" r="1.6"/><circle cx="396" cy="193" r="1.6"/><circle cx="396" cy="206" r="1.6"/><circle cx="409" cy="72" r="1.6"/><circle cx="409" cy="85" r="1.6"/><circle cx="409" cy="98" r="1.6"/><circle cx="409" cy="111" r="1.6"/><circle cx="409" cy="124" r="1.6"/><circle cx="409" cy="154" r="1.6"/><circle cx="409" cy="167" r="1.6"/><circle cx="409" cy="180" r="1.6"/><circle cx="409" cy="193" r="1.6"/><circle cx="409" cy="206" r="1.6"/><circle cx="422" cy="72" r="1.6"/><circle cx="422" cy="85" r="1.6"/><circle cx="422" cy="98" r="1.6"/><circle cx="422" cy="111" r="1.6"/><circle cx="422" cy="124" r="1.6"/><circle cx="422" cy="154" r="1.6"/><circle cx="422" cy="167" r="1.6"/><circle cx="422" cy="180" r="1.6"/><circle cx="422" cy="193" r="1.6"/><circle cx="422" cy="206" r="1.6"/><circle cx="435" cy="72" r="1.6"/><circle cx="435" cy="85" r="1.6"/><circle cx="435" cy="98" r="1.6"/><circle cx="435" cy="111" r="1.6"/><circle cx="435" cy="124" r="1.6"/><circle cx="435" cy="154" r="1.6"/><circle cx="435" cy="167" r="1.6"/><circle cx="435" cy="180" r="1.6"/><circle cx="435" cy="193" r="1.6"/><circle cx="435" cy="206" r="1.6"/><circle cx="448" cy="72" r="1.6"/><circle cx="448" cy="85" r="1.6"/><circle cx="448" cy="98" r="1.6"/><circle cx="448" cy="111" r="1.6"/><circle cx="448" cy="124" r="1.6"/><circle cx="448" cy="154" r="1.6"/><circle cx="448" cy="167" r="1.6"/><circle cx="448" cy="180" r="1.6"/><circle cx="448" cy="193" r="1.6"/><circle cx="448" cy="206" r="1.6"/><circle cx="461" cy="72" r="1.6"/><circle cx="461" cy="85" r="1.6"/><circle cx="461" cy="98" r="1.6"/><circle cx="461" cy="111" r="1.6"/><circle cx="461" cy="124" r="1.6"/><circle cx="461" cy="154" r="1.6"/><circle cx="461" cy="167" r="1.6"/><circle cx="461" cy="180" r="1.6"/><circle cx="461" cy="193" r="1.6"/><circle cx="461" cy="206" r="1.6"/><circle cx="474" cy="72" r="1.6"/><circle cx="474" cy="85" r="1.6"/><circle cx="474" cy="98" r="1.6"/><circle cx="474" cy="111" r="1.6"/><circle cx="474" cy="124" r="1.6"/><circle cx="474" cy="154" r="1.6"/><circle cx="474" cy="167" r="1.6"/><circle cx="474" cy="180" r="1.6"/><circle cx="474" cy="193" r="1.6"/><circle cx="474" cy="206" r="1.6"/><circle cx="487" cy="72" r="1.6"/><circle cx="487" cy="85" r="1.6"/><circle cx="487" cy="98" r="1.6"/><circle cx="487" cy="111" r="1.6"/><circle cx="487" cy="124" r="1.6"/><circle cx="487" cy="154" r="1.6"/><circle cx="487" cy="167" r="1.6"/><circle cx="487" cy="180" r="1.6"/><circle cx="487" cy="193" r="1.6"/><circle cx="487" cy="206" r="1.6"/><circle cx="500" cy="72" r="1.6"/><circle cx="500" cy="85" r="1.6"/><circle cx="500" cy="98" r="1.6"/><circle cx="500" cy="111" r="1.6"/><circle cx="500" cy="124" r="1.6"/><circle cx="500" cy="154" r="1.6"/><circle cx="500" cy="167" r="1.6"/><circle cx="500" cy="180" r="1.6"/><circle cx="500" cy="193" r="1.6"/><circle cx="500" cy="206" r="1.6"/><circle cx="513" cy="72" r="1.6"/><circle cx="513" cy="85" r="1.6"/><circle cx="513" cy="98" r="1.6"/><circle cx="513" cy="111" r="1.6"/><circle cx="513" cy="124" r="1.6"/><circle cx="513" cy="154" r="1.6"/><circle cx="513" cy="167" r="1.6"/><circle cx="513" cy="180" r="1.6"/><circle cx="513" cy="193" r="1.6"/><circle cx="513" cy="206" r="1.6"/><circle cx="526" cy="72" r="1.6"/><circle cx="526" cy="85" r="1.6"/><circle cx="526" cy="98" r="1.6"/><circle cx="526" cy="111" r="1.6"/><circle cx="526" cy="124" r="1.6"/><circle cx="526" cy="154" r="1.6"/><circle cx="526" cy="167" r="1.6"/><circle cx="526" cy="180" r="1.6"/><circle cx="526" cy="193" r="1.6"/><circle cx="526" cy="206" r="1.6"/><circle cx="539" cy="72" r="1.6"/><circle cx="539" cy="85" r="1.6"/><circle cx="539" cy="98" r="1.6"/><circle cx="539" cy="111" r="1.6"/><circle cx="539" cy="124" r="1.6"/><circle cx="539" cy="154" r="1.6"/><circle cx="539" cy="167" r="1.6"/><circle cx="539" cy="180" r="1.6"/><circle cx="539" cy="193" r="1.6"/><circle cx="539" cy="206" r="1.6"/><circle cx="552" cy="72" r="1.6"/><circle cx="552" cy="85" r="1.6"/><circle cx="552" cy="98" r="1.6"/><circle cx="552" cy="111" r="1.6"/><circle cx="552" cy="124" r="1.6"/><circle cx="552" cy="154" r="1.6"/><circle cx="552" cy="167" r="1.6"/><circle cx="552" cy="180" r="1.6"/><circle cx="552" cy="193" r="1.6"/><circle cx="552" cy="206" r="1.6"/><circle cx="565" cy="72" r="1.6"/><circle cx="565" cy="85" r="1.6"/><circle cx="565" cy="98" r="1.6"/><circle cx="565" cy="111" r="1.6"/><circle cx="565" cy="124" r="1.6"/><circle cx="565" cy="154" r="1.6"/><circle cx="565" cy="167" r="1.6"/><circle cx="565" cy="180" r="1.6"/><circle cx="565" cy="193" r="1.6"/><circle cx="565" cy="206" r="1.6"/><circle cx="578" cy="72" r="1.6"/><circle cx="578" cy="85" r="1.6"/><circle cx="578" cy="98" r="1.6"/><circle cx="578" cy="111" r="1.6"/><circle cx="578" cy="124" r="1.6"/><circle cx="578" cy="154" r="1.6"/><circle cx="578" cy="167" r="1.6"/><circle cx="578" cy="180" r="1.6"/><circle cx="578" cy="193" r="1.6"/><circle cx="578" cy="206" r="1.6"/><circle cx="591" cy="72" r="1.6"/><circle cx="591" cy="85" r="1.6"/><circle cx="591" cy="98" r="1.6"/><circle cx="591" cy="111" r="1.6"/><circle cx="591" cy="124" r="1.6"/><circle cx="591" cy="154" r="1.6"/><circle cx="591" cy="167" r="1.6"/><circle cx="591" cy="180" r="1.6"/><circle cx="591" cy="193" r="1.6"/><circle cx="591" cy="206" r="1.6"/><circle cx="604" cy="72" r="1.6"/><circle cx="604" cy="85" r="1.6"/><circle cx="604" cy="98" r="1.6"/><circle cx="604" cy="111" r="1.6"/><circle cx="604" cy="124" r="1.6"/><circle cx="604" cy="154" r="1.6"/><circle cx="604" cy="167" r="1.6"/><circle cx="604" cy="180" r="1.6"/><circle cx="604" cy="193" r="1.6"/><circle cx="604" cy="206" r="1.6"/><circle cx="617" cy="72" r="1.6"/><circle cx="617" cy="85" r="1.6"/><circle cx="617" cy="98" r="1.6"/><circle cx="617" cy="111" r="1.6"/><circle cx="617" cy="124" r="1.6"/><circle cx="617" cy="154" r="1.6"/><circle cx="617" cy="167" r="1.6"/><circle cx="617" cy="180" r="1.6"/><circle cx="617" cy="193" r="1.6"/><circle cx="617" cy="206" r="1.6"/><circle cx="630" cy="72" r="1.6"/><circle cx="630" cy="85" r="1.6"/><circle cx="630" cy="98" r="1.6"/><circle cx="630" cy="111" r="1.6"/><circle cx="630" cy="124" r="1.6"/><circle cx="630" cy="154" r="1.6"/><circle cx="630" cy="167" r="1.6"/><circle cx="630" cy="180" r="1.6"/><circle cx="630" cy="193" r="1.6"/><circle cx="630" cy="206" r="1.6"/><circle cx="643" cy="72" r="1.6"/><circle cx="643" cy="85" r="1.6"/><circle cx="643" cy="98" r="1.6"/><circle cx="643" cy="111" r="1.6"/><circle cx="643" cy="124" r="1.6"/><circle cx="643" cy="154" r="1.6"/><circle cx="643" cy="167" r="1.6"/><circle cx="643" cy="180" r="1.6"/><circle cx="643" cy="193" r="1.6"/><circle cx="643" cy="206" r="1.6"/><circle cx="656" cy="72" r="1.6"/><circle cx="656" cy="85" r="1.6"/><circle cx="656" cy="98" r="1.6"/><circle cx="656" cy="111" r="1.6"/><circle cx="656" cy="124" r="1.6"/><circle cx="656" cy="154" r="1.6"/><circle cx="656" cy="167" r="1.6"/><circle cx="656" cy="180" r="1.6"/><circle cx="656" cy="193" r="1.6"/><circle cx="656" cy="206" r="1.6"/><circle cx="669" cy="72" r="1.6"/><circle cx="669" cy="85" r="1.6"/><circle cx="669" cy="98" r="1.6"/><circle cx="669" cy="111" r="1.6"/><circle cx="669" cy="124" r="1.6"/><circle cx="669" cy="154" r="1.6"/><circle cx="669" cy="167" r="1.6"/><circle cx="669" cy="180" r="1.6"/><circle cx="669" cy="193" r="1.6"/><circle cx="669" cy="206" r="1.6"/><circle cx="682" cy="72" r="1.6"/><circle cx="682" cy="85" r="1.6"/><circle cx="682" cy="98" r="1.6"/><circle cx="682" cy="111" r="1.6"/><circle cx="682" cy="124" r="1.6"/><circle cx="682" cy="154" r="1.6"/><circle cx="682" cy="167" r="1.6"/><circle cx="682" cy="180" r="1.6"/><circle cx="682" cy="193" r="1.6"/><circle cx="682" cy="206" r="1.6"/><circle cx="695" cy="72" r="1.6"/><circle cx="695" cy="85" r="1.6"/><circle cx="695" cy="98" r="1.6"/><circle cx="695" cy="111" r="1.6"/><circle cx="695" cy="124" r="1.6"/><circle cx="695" cy="154" r="1.6"/><circle cx="695" cy="167" r="1.6"/><circle cx="695" cy="180" r="1.6"/><circle cx="695" cy="193" r="1.6"/><circle cx="695" cy="206" r="1.6"/><circle cx="708" cy="72" r="1.6"/><circle cx="708" cy="85" r="1.6"/><circle cx="708" cy="98" r="1.6"/><circle cx="708" cy="111" r="1.6"/><circle cx="708" cy="124" r="1.6"/><circle cx="708" cy="154" r="1.6"/><circle cx="708" cy="167" r="1.6"/><circle cx="708" cy="180" r="1.6"/><circle cx="708" cy="193" r="1.6"/><circle cx="708" cy="206" r="1.6"/><circle cx="721" cy="72" r="1.6"/><circle cx="721" cy="85" r="1.6"/><circle cx="721" cy="98" r="1.6"/><circle cx="721" cy="111" r="1.6"/><circle cx="721" cy="124" r="1.6"/><circle cx="721" cy="154" r="1.6"/><circle cx="721" cy="167" r="1.6"/><circle cx="721" cy="180" r="1.6"/><circle cx="721" cy="193" r="1.6"/><circle cx="721" cy="206" r="1.6"/><circle cx="734" cy="72" r="1.6"/><circle cx="734" cy="85" r="1.6"/><circle cx="734" cy="98" r="1.6"/><circle cx="734" cy="111" r="1.6"/><circle cx="734" cy="124" r="1.6"/><circle cx="734" cy="154" r="1.6"/><circle cx="734" cy="167" r="1.6"/><circle cx="734" cy="180" r="1.6"/><circle cx="734" cy="193" r="1.6"/><circle cx="734" cy="206" r="1.6"/><circle cx="747" cy="72" r="1.6"/><circle cx="747" cy="85" r="1.6"/><circle cx="747" cy="98" r="1.6"/><circle cx="747" cy="111" r="1.6"/><circle cx="747" cy="124" r="1.6"/><circle cx="747" cy="154" r="1.6"/><circle cx="747" cy="167" r="1.6"/><circle cx="747" cy="180" r="1.6"/><circle cx="747" cy="193" r="1.6"/><circle cx="747" cy="206" r="1.6"/></g>
<path d="M17.9 139.0H748.1" stroke="currentColor" stroke-dasharray="2 4" opacity="0.4"/>
<g fill="currentColor" font-family="sans-serif" font-size="8"><text x="746.1" y="39" text-anchor="end">GND</text><text x="746.1" y="51" text-anchor="end">+</text><text x="746.1" y="259" text-anchor="end">GND</text><text x="746.1" y="271" text-anchor="end">+</text></g>
<rect x="24.2" y="111" width="262.6" height="69" rx="3" fill="var(--chipbg,none)" stroke="currentColor" stroke-width="1.5"/><path d="M24.2 133.0a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="32" cy="111" r="2.6"/><circle cx="32" cy="180" r="2.6"/><circle cx="45" cy="111" r="2.6"/><circle cx="45" cy="180" r="2.6"/><circle cx="58" cy="111" r="2.6"/><circle cx="58" cy="180" r="2.6"/><circle cx="71" cy="111" r="2.6"/><circle cx="71" cy="180" r="2.6"/><circle cx="84" cy="111" r="2.6"/><circle cx="84" cy="180" r="2.6"/><circle cx="97" cy="111" r="2.6"/><circle cx="97" cy="180" r="2.6"/><circle cx="110" cy="111" r="2.6"/><circle cx="110" cy="180" r="2.6"/><circle cx="123" cy="111" r="2.6"/><circle cx="123" cy="180" r="2.6"/><circle cx="136" cy="111" r="2.6"/><circle cx="136" cy="180" r="2.6"/><circle cx="149" cy="111" r="2.6"/><circle cx="149" cy="180" r="2.6"/><circle cx="162" cy="111" r="2.6"/><circle cx="162" cy="180" r="2.6"/><circle cx="175" cy="111" r="2.6"/><circle cx="175" cy="180" r="2.6"/><circle cx="188" cy="111" r="2.6"/><circle cx="188" cy="180" r="2.6"/><circle cx="201" cy="111" r="2.6"/><circle cx="201" cy="180" r="2.6"/><circle cx="214" cy="111" r="2.6"/><circle cx="214" cy="180" r="2.6"/><circle cx="227" cy="111" r="2.6"/><circle cx="227" cy="180" r="2.6"/><circle cx="240" cy="111" r="2.6"/><circle cx="240" cy="180" r="2.6"/><circle cx="253" cy="111" r="2.6"/><circle cx="253" cy="180" r="2.6"/><circle cx="266" cy="111" r="2.6"/><circle cx="266" cy="180" r="2.6"/><circle cx="279" cy="111" r="2.6"/><circle cx="279" cy="180" r="2.6"/></g>
<text x="259.5" y="138.0" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor">U1</text><text x="259.5" y="149.0" text-anchor="middle" font-family="sans-serif" font-size="8" fill="currentColor" opacity="0.8">W65C02S</text>
<path d="M123.0 206.0 L123.0 274.0" fill="none" stroke="#d0312d" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="123.0" cy="206.0" r="2.8" fill="#d0312d" stroke="none"/>
<circle cx="123.0" cy="274.0" r="2.8" fill="#d0312d" stroke="none"/>
<path d="M110.0 262.0 L110.0 274.0" fill="none" stroke="#4a7fd4" stroke-width="1.8" stroke-linejoin="round" opacity="1"/>
<rect x="106.0" y="264.0" width="8" height="8" fill="#4a7fd4"/>
<path d="M279.0 72.0 L279.0 42.0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="279.0" cy="72.0" r="2.8" fill="currentColor" stroke="none"/>
<circle cx="279.0" cy="42.0" r="2.8" fill="currentColor" stroke="none"/>
<path d="M84.0 72.0 L84.0 54.0" fill="none" stroke="#d0312d" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="84.0" cy="72.0" r="2.8" fill="#d0312d" stroke="none"/>
<circle cx="84.0" cy="54.0" r="2.8" fill="#d0312d" stroke="none"/>
<path d="M58.0 72.0 L58.0 54.0" fill="none" stroke="#d0312d" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="58.0" cy="72.0" r="2.8" fill="#d0312d" stroke="none"/>
<circle cx="58.0" cy="54.0" r="2.8" fill="#d0312d" stroke="none"/>
<path d="M45.0 206.0 L45.0 274.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="45.0" cy="206.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="45.0" cy="274.0" r="2.8" fill="#888" stroke="none"/>
<rect x="42.0" y="234.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M97.0 206.0 L97.0 274.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="97.0" cy="206.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="97.0" cy="274.0" r="2.8" fill="#888" stroke="none"/>
<rect x="94.0" y="234.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M71.0 193.0 L71.0 199.0 L292.0 199.0 L292.0 193.0" fill="none" stroke="#2e9d5b" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="71.0" cy="193.0" r="2.8" fill="#2e9d5b" stroke="none"/>
<circle cx="292.0" cy="193.0" r="2.8" fill="#2e9d5b" stroke="none"/>
<path d="M292.0 206.0 L292.0 274.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="292.0" cy="206.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="292.0" cy="274.0" r="2.8" fill="#888" stroke="none"/>
<rect x="289.0" y="234.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M123.0 72.0 L123.0 42.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="123.0" cy="72.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="123.0" cy="42.0" r="2.8" fill="#888" stroke="none"/>
<rect x="120.0" y="51.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M136.0 72.0 L136.0 54.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="136.0" cy="72.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="136.0" cy="54.0" r="2.8" fill="#888" stroke="none"/>
<rect x="133.0" y="57.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M149.0 72.0 L149.0 42.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="149.0" cy="72.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="149.0" cy="42.0" r="2.8" fill="#888" stroke="none"/>
<rect x="146.0" y="51.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M162.0 72.0 L162.0 54.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="162.0" cy="72.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="162.0" cy="54.0" r="2.8" fill="#888" stroke="none"/>
<rect x="159.0" y="57.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M175.0 72.0 L175.0 42.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="175.0" cy="72.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="175.0" cy="42.0" r="2.8" fill="#888" stroke="none"/>
<rect x="172.0" y="51.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M188.0 72.0 L188.0 54.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="188.0" cy="72.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="188.0" cy="54.0" r="2.8" fill="#888" stroke="none"/>
<rect x="185.0" y="57.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M201.0 72.0 L201.0 54.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="201.0" cy="72.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="201.0" cy="54.0" r="2.8" fill="#888" stroke="none"/>
<rect x="198.0" y="57.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M214.0 72.0 L214.0 54.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="214.0" cy="72.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="214.0" cy="54.0" r="2.8" fill="#888" stroke="none"/>
<rect x="211.0" y="57.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M227.0 98.0 L227.0 14.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="0.35"/>
<circle cx="227.0" cy="98.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M240.0 98.0 L240.0 14.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="0.35"/>
<circle cx="240.0" cy="98.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M253.0 98.0 L253.0 14.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="0.35"/>
<circle cx="253.0" cy="98.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M266.0 98.0 L266.0 14.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="0.35"/>
<circle cx="266.0" cy="98.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M110.0 98.0 L110.0 14.0" fill="none" stroke="#2e9d5b" stroke-width="2.4" stroke-linejoin="round" opacity="0.35"/>
<circle cx="110.0" cy="98.0" r="2.8" fill="#2e9d5b" stroke="none"/>
<g opacity="0.35"><path d="M71.0 98.0 L71.0 14.0" fill="none" stroke="currentColor" stroke-width="4"/><path d="M71.0 98.0 L71.0 14.0" fill="none" stroke="#ffffff" stroke-width="2"/></g>
<circle cx="71.0" cy="98.0" r="2.8" fill="#ffffff" stroke="currentColor"/>
<path d="M266.0 193.0 L272.5 193.0 L272.5 14.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="0.35"/>
<circle cx="266.0" cy="193.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M279.0 193.0 L285.5 193.0 L285.5 14.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="0.35"/>
<circle cx="279.0" cy="193.0" r="2.8" fill="#d4a017" stroke="none"/>
<text x="221.8" y="10.0" font-family="sans-serif" font-size="8" text-anchor="start" fill="currentColor" opacity="0.75">stage 3 wires to board 3 ↑ (A10-A15, RWB, PHI2)</text>
<path d="M136.0 193.0 L136.0 326.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="136.0" cy="193.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M149.0 193.0 L149.0 326.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="149.0" cy="193.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M162.0 193.0 L162.0 326.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="162.0" cy="193.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M175.0 193.0 L175.0 326.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="175.0" cy="193.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M188.0 193.0 L188.0 326.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="188.0" cy="193.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M32.0 85.0 L38.5 85.0 L38.5 326.0" fill="none" stroke="#2e9d5b" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="32.0" cy="85.0" r="2.8" fill="#2e9d5b" stroke="none"/>
<g opacity="1"><path d="M71.0 85.0 L77.5 85.0 L77.5 326.0" fill="none" stroke="currentColor" stroke-width="4"/><path d="M71.0 85.0 L77.5 85.0 L77.5 326.0" fill="none" stroke="#ffffff" stroke-width="2"/></g>
<circle cx="71.0" cy="85.0" r="2.8" fill="#ffffff" stroke="currentColor"/>
<path d="M110.0 85.0 L116.5 85.0 L116.5 326.0" fill="none" stroke="#2e9d5b" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="110.0" cy="85.0" r="2.8" fill="#2e9d5b" stroke="none"/>
<path d="M123.0 85.0 L129.5 85.0 L129.5 326.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="123.0" cy="85.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M136.0 85.0 L142.5 85.0 L142.5 326.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="136.0" cy="85.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M149.0 85.0 L155.5 85.0 L155.5 326.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="149.0" cy="85.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M162.0 85.0 L168.5 85.0 L168.5 326.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="162.0" cy="85.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M175.0 85.0 L181.5 85.0 L181.5 326.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="175.0" cy="85.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M188.0 85.0 L194.5 85.0 L194.5 326.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="188.0" cy="85.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M201.0 85.0 L207.5 85.0 L207.5 326.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="201.0" cy="85.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M214.0 85.0 L220.5 85.0 L220.5 326.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="214.0" cy="85.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M227.0 206.0 L230.0 212.0 L230.0 249.5 L526.0 249.5 L526.0 206.0" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="227.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<circle cx="526.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M526.0 167.0 L539.0 167.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="526.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="539.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<rect x="526.5" y="164.0" width="12" height="6" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M539.0 206.0 L539.0 262.0" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<path d="M535 240h8l-4 6z" fill="#e74c3c" stroke="currentColor" stroke-width="0.6"/><path d="M535 247h8" stroke="currentColor" stroke-width="1"/>
<circle cx="539.0" cy="206.0" r="2.8" fill="#c0392b" stroke="none"/>
<text x="532.0" y="149.0" font-family="sans-serif" font-size="8" text-anchor="middle" fill="currentColor" opacity="1">A7</text>
<path d="M214.0 206.0 L217.0 212.0 L217.0 245.0 L552.0 245.0 L552.0 206.0" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="214.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<circle cx="552.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M552.0 167.0 L565.0 167.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="552.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="565.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<rect x="552.5" y="164.0" width="12" height="6" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M565.0 206.0 L565.0 262.0" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<path d="M561 240h8l-4 6z" fill="#e74c3c" stroke="currentColor" stroke-width="0.6"/><path d="M561 247h8" stroke="currentColor" stroke-width="1"/>
<circle cx="565.0" cy="206.0" r="2.8" fill="#c0392b" stroke="none"/>
<text x="558.0" y="149.0" font-family="sans-serif" font-size="8" text-anchor="middle" fill="currentColor" opacity="1">A6</text>
<path d="M201.0 206.0 L204.0 212.0 L204.0 240.5 L578.0 240.5 L578.0 206.0" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="201.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<circle cx="578.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M578.0 167.0 L591.0 167.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="578.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="591.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<rect x="578.5" y="164.0" width="12" height="6" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M591.0 206.0 L591.0 262.0" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<path d="M587 240h8l-4 6z" fill="#e74c3c" stroke="currentColor" stroke-width="0.6"/><path d="M587 247h8" stroke="currentColor" stroke-width="1"/>
<circle cx="591.0" cy="206.0" r="2.8" fill="#c0392b" stroke="none"/>
<text x="584.0" y="149.0" font-family="sans-serif" font-size="8" text-anchor="middle" fill="currentColor" opacity="1">A5</text>
<path d="M188.0 206.0 L191.0 212.0 L191.0 236.0 L604.0 236.0 L604.0 206.0" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="188.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<circle cx="604.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M604.0 167.0 L617.0 167.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="604.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="617.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<rect x="604.5" y="164.0" width="12" height="6" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M617.0 206.0 L617.0 262.0" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<path d="M613 240h8l-4 6z" fill="#e74c3c" stroke="currentColor" stroke-width="0.6"/><path d="M613 247h8" stroke="currentColor" stroke-width="1"/>
<circle cx="617.0" cy="206.0" r="2.8" fill="#c0392b" stroke="none"/>
<text x="610.0" y="149.0" font-family="sans-serif" font-size="8" text-anchor="middle" fill="currentColor" opacity="1">A4</text>
<path d="M175.0 206.0 L178.0 212.0 L178.0 231.5 L630.0 231.5 L630.0 206.0" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="175.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<circle cx="630.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M630.0 167.0 L643.0 167.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="630.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="643.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<rect x="630.5" y="164.0" width="12" height="6" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M643.0 206.0 L643.0 262.0" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<path d="M639 240h8l-4 6z" fill="#e74c3c" stroke="currentColor" stroke-width="0.6"/><path d="M639 247h8" stroke="currentColor" stroke-width="1"/>
<circle cx="643.0" cy="206.0" r="2.8" fill="#c0392b" stroke="none"/>
<text x="636.0" y="149.0" font-family="sans-serif" font-size="8" text-anchor="middle" fill="currentColor" opacity="1">A3</text>
<path d="M162.0 206.0 L165.0 212.0 L165.0 227.0 L656.0 227.0 L656.0 206.0" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="162.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<circle cx="656.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M656.0 167.0 L669.0 167.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="656.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="669.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<rect x="656.5" y="164.0" width="12" height="6" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M669.0 206.0 L669.0 262.0" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<path d="M665 240h8l-4 6z" fill="#e74c3c" stroke="currentColor" stroke-width="0.6"/><path d="M665 247h8" stroke="currentColor" stroke-width="1"/>
<circle cx="669.0" cy="206.0" r="2.8" fill="#c0392b" stroke="none"/>
<text x="662.0" y="149.0" font-family="sans-serif" font-size="8" text-anchor="middle" fill="currentColor" opacity="1">A2</text>
<path d="M149.0 206.0 L152.0 212.0 L152.0 222.5 L682.0 222.5 L682.0 206.0" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="149.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<circle cx="682.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M682.0 167.0 L695.0 167.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="682.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="695.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<rect x="682.5" y="164.0" width="12" height="6" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M695.0 206.0 L695.0 262.0" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<path d="M691 240h8l-4 6z" fill="#e74c3c" stroke="currentColor" stroke-width="0.6"/><path d="M691 247h8" stroke="currentColor" stroke-width="1"/>
<circle cx="695.0" cy="206.0" r="2.8" fill="#c0392b" stroke="none"/>
<text x="688.0" y="149.0" font-family="sans-serif" font-size="8" text-anchor="middle" fill="currentColor" opacity="1">A1</text>
<path d="M136.0 206.0 L139.0 212.0 L139.0 218.0 L708.0 218.0 L708.0 206.0" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="136.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<circle cx="708.0" cy="206.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M708.0 167.0 L721.0 167.0" fill="none" stroke="#888" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="708.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<circle cx="721.0" cy="167.0" r="2.8" fill="#888" stroke="none"/>
<rect x="708.5" y="164.0" width="12" height="6" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.8"/>
<path d="M721.0 206.0 L721.0 262.0" fill="none" stroke="#c0392b" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<path d="M717 240h8l-4 6z" fill="#e74c3c" stroke="currentColor" stroke-width="0.6"/><path d="M717 247h8" stroke="currentColor" stroke-width="1"/>
<circle cx="721.0" cy="206.0" r="2.8" fill="#c0392b" stroke="none"/>
<text x="714.0" y="149.0" font-family="sans-serif" font-size="8" text-anchor="middle" fill="currentColor" opacity="1">A0</text>
<text x="623.5" y="85.0" font-family="sans-serif" font-size="8" text-anchor="middle" fill="currentColor" opacity="1">LEDs for the check (columns 40-55):</text>
<text x="623.5" y="100.0" font-family="sans-serif" font-size="8" text-anchor="middle" fill="currentColor" opacity="0.85">A7 on the left, lit = 1; 1 kΩ across each pair</text>
<text x="297.0" y="183.0" font-family="sans-serif" font-size="8" text-anchor="start" fill="currentColor" opacity="1">~IRQB row</text>
<text x="40.0" y="270.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1">R1</text>
<text x="92.0" y="270.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1">R5</text>
<text x="287.0" y="270.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1">R2</text>
<text x="106.0" y="284.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="#4a7fd4" opacity="1">100 nF</text>
<text x="168.5" y="38.0" font-family="sans-serif" font-size="7" text-anchor="middle" fill="currentColor" opacity="1">$EA resistors, 4.7 kΩ (stage 4 only)</text>
<text x="138.0" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 138 330)">A0</text>
<text x="151.0" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 151 330)">A1</text>
<text x="164.0" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 164 330)">A2</text>
<text x="177.0" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 177 330)">A3</text>
<text x="190.0" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 190 330)">A4</text>
<text x="40.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 40.5 330)">RESB</text>
<text x="79.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 79.5 330)">PHI2</text>
<text x="118.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 118.5 330)">RWB</text>
<text x="131.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 131.5 330)">D0</text>
<text x="144.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 144.5 330)">D1</text>
<text x="157.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 157.5 330)">D2</text>
<text x="170.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 170.5 330)">D3</text>
<text x="183.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 183.5 330)">D4</text>
<text x="196.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 196.5 330)">D5</text>
<text x="209.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 209.5 330)">D6</text>
<text x="222.5" y="330.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1" transform="rotate(90 222.5 330)">D7</text>
<text x="747.0" y="346.0" font-family="sans-serif" font-size="9" text-anchor="end" fill="currentColor" opacity="1">to the Pico on board 1 ↓</text>
</svg>
</div>

- **The CPU** goes in the rows you marked in stage 3: board 2, columns
  2-21, notch toward column 1, pins 21-40 facing board 3. Push its legs into
  rows d and h if your board allows: the top pins then keep three free holes
  (rows a-c) and the bottom pins two (rows i and j). The drawing assumes
  that.
- **Count the holes before you use them.** The CPU's rows are shared with
  later stages. On the top side, each D row takes its `$EA` resistor and its
  Pico wire, and keeps the third hole for the base RAM (stage 6). On the
  bottom side, A0-A4 take their Pico wire and, for the check, an LED wire;
  the LED wire comes out before the base RAM needs that hole.
- **Its 100 nF capacitor** goes right beside pin 8's red wire, across the
  + and GND rails, or better, from pin 8's own row to GND.
- **R1 and R5** go from pins 2 and 6 to the + rail. Pin 4 (`~IRQB`) gets a
  green wire to its own row in column 22, and R2 goes there (see
  [the `~IRQB` row](#the-irqb-row) below).
- **The LEDs for the check** sit in columns 40-55 of board 2, which stay
  free until the extended RAM arrives in stage 7.

### U1, the CPU (W65C02S)

| U1 pin | Signal | Connects to | Wire | Notes |
| --- | --- | --- | --- | --- |
| 1 | unconnected | | - | `VPB` |
| 2 | RDY | R1 | - | Pulled up (below) |
| 3 | unconnected | | - | `PHI1O` |
| 4 | ~IRQB | R2 | - | Pulled up (below) |
| 5 | unconnected | | - | `~ML` |
| 6 | ~NMI | R5 | - | Pulled up (below) |
| 7 | unconnected | | - | `SYNC` |
| 8 | 3.3 V | 3.3 V | red | `VDD` |
| 9 | A0 | Pico 21 (GP16) | yellow | |
| 10 | A1 | Pico 22 (GP17) | yellow | |
| 11 | A2 | Pico 24 (GP18) | yellow | |
| 12 | A3 | Pico 25 (GP19) | yellow | |
| 13 | A4 | Pico 26 (GP20) | yellow | MIA sees only A0-A4 |
| 14 | A5 | | - | The RAM chips, from stage 6 |
| 15 | A6 | | - | |
| 16 | A7 | | - | |
| 17 | A8 | | - | |
| 18 | A9 | | - | |
| 19 | A10 | U6.1 | yellow | From stage 3 |
| 20 | A11 | U6.2 | yellow | From stage 3 |
| 21 | GND | GND | black | `VSS` |
| 22 | A12 | U6.3 | yellow | From stage 3 |
| 23 | A13 | U8.1 | yellow | From stage 3 |
| 24 | A14 | U8.2 | yellow | From stage 3 |
| 25 | A15 | U8.6 | yellow | From stage 3 |
| 26 | D7 | Pico 20 (GP15) | blue | |
| 27 | D6 | Pico 19 (GP14) | blue | |
| 28 | D5 | Pico 17 (GP13) | blue | |
| 29 | D4 | Pico 16 (GP12) | blue | |
| 30 | D3 | Pico 15 (GP11) | blue | |
| 31 | D2 | Pico 14 (GP10) | blue | |
| 32 | D1 | Pico 12 (GP9) | blue | |
| 33 | D0 | Pico 11 (GP8) | blue | |
| 34 | RWB | U9.1, Pico 10 (GP7) | green | |
| 35 | unconnected | | - | `NC` |
| 36 | 3.3 V | 3.3 V | red | `BE`: the CPU drives the buses |
| 37 | PHI2 | U9.5, Pico 27 (GP21) | white | MIA's clock |
| 38 | 3.3 V | 3.3 V | red | `~SO`: unused |
| 39 | unconnected | | - | `PHI2O` |
| 40 | ~RESB | Pico 31 (GP26) | green | MIA's reset |

The D lines run in the opposite order to the pin numbers: D0 is pin 33 and
D7 pin 26. On the Pico they run in order, GP8 to GP15, skipping the GND
pins 13 and 18.

| Part | Value | First leg | Second leg | Notes |
| --- | --- | --- | --- | --- |
| R1 | 2.2 kΩ | 3.3 V | U1.2 | RDY pull-up. Not stronger: the CPU pulls RDY low itself during `WAI` |
| R2 | 4.7 kΩ | 3.3 V | U1.4 | `~IRQB` pull-up, in the `~IRQB` row (below) |
| R5 | 4.7 kΩ | 3.3 V | U1.6 | `~NMI` pull-up |

### The `~IRQB` row

By stage 8, U1.4 has three parts on it: R2 now, D1
in stage 5 and D2 in stage 8. That's more than its row has free holes. Run
one short green wire from U1.4 to a free row on board 2, on the same
side of the gap (column 22 or 23, between the CPU and the base RAM), and
put R2's leg there. D1 and D2 go in the same row later. The tables
still say U1.4 for that row, because it's the same signal.

### The wires to MIA

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 408" width="100%" style="max-width:620px" role="img" aria-label="Board 1 close-up of the Pico, USB end at column 1, legs in rows c and h. From board 2 above, yellow A0 to A4 land on Pico pins 21, 22, 24, 25 and 26, white PHI2 on pin 27 and green RESB on pin 31, all on the near side. Green RWB and blue D0 to D7 cross over the Pico to pins 10, 11, 12, 14, 15, 16, 17, 19 and 20 on the far side, crossing before the antenna end; D6 and D7 run along the bottom rows to reach pins 19 and 20. A dashed green jumper ties Pico pin 9 (GP6) to GND for this stage only.">
<rect x="10.0" y="74" width="508.0" height="300" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g stroke-width="3" opacity="0.35"><path d="M18.0 86H510.0M18.0 350H510.0" stroke="currentColor"/><path d="M18.0 98H510.0M18.0 362H510.0" stroke="#d0312d"/></g>
<g fill="currentColor" opacity="0.22"><circle cx="24" cy="116" r="1.6"/><circle cx="24" cy="136" r="1.6"/><circle cx="24" cy="156" r="1.6"/><circle cx="24" cy="176" r="1.6"/><circle cx="24" cy="196" r="1.6"/><circle cx="24" cy="240" r="1.6"/><circle cx="24" cy="260" r="1.6"/><circle cx="24" cy="280" r="1.6"/><circle cx="24" cy="300" r="1.6"/><circle cx="24" cy="320" r="1.6"/><circle cx="44" cy="116" r="1.6"/><circle cx="44" cy="136" r="1.6"/><circle cx="44" cy="156" r="1.6"/><circle cx="44" cy="176" r="1.6"/><circle cx="44" cy="196" r="1.6"/><circle cx="44" cy="240" r="1.6"/><circle cx="44" cy="260" r="1.6"/><circle cx="44" cy="280" r="1.6"/><circle cx="44" cy="300" r="1.6"/><circle cx="44" cy="320" r="1.6"/><circle cx="64" cy="116" r="1.6"/><circle cx="64" cy="136" r="1.6"/><circle cx="64" cy="156" r="1.6"/><circle cx="64" cy="176" r="1.6"/><circle cx="64" cy="196" r="1.6"/><circle cx="64" cy="240" r="1.6"/><circle cx="64" cy="260" r="1.6"/><circle cx="64" cy="280" r="1.6"/><circle cx="64" cy="300" r="1.6"/><circle cx="64" cy="320" r="1.6"/><circle cx="84" cy="116" r="1.6"/><circle cx="84" cy="136" r="1.6"/><circle cx="84" cy="156" r="1.6"/><circle cx="84" cy="176" r="1.6"/><circle cx="84" cy="196" r="1.6"/><circle cx="84" cy="240" r="1.6"/><circle cx="84" cy="260" r="1.6"/><circle cx="84" cy="280" r="1.6"/><circle cx="84" cy="300" r="1.6"/><circle cx="84" cy="320" r="1.6"/><circle cx="104" cy="116" r="1.6"/><circle cx="104" cy="136" r="1.6"/><circle cx="104" cy="156" r="1.6"/><circle cx="104" cy="176" r="1.6"/><circle cx="104" cy="196" r="1.6"/><circle cx="104" cy="240" r="1.6"/><circle cx="104" cy="260" r="1.6"/><circle cx="104" cy="280" r="1.6"/><circle cx="104" cy="300" r="1.6"/><circle cx="104" cy="320" r="1.6"/><circle cx="124" cy="116" r="1.6"/><circle cx="124" cy="136" r="1.6"/><circle cx="124" cy="156" r="1.6"/><circle cx="124" cy="176" r="1.6"/><circle cx="124" cy="196" r="1.6"/><circle cx="124" cy="240" r="1.6"/><circle cx="124" cy="260" r="1.6"/><circle cx="124" cy="280" r="1.6"/><circle cx="124" cy="300" r="1.6"/><circle cx="124" cy="320" r="1.6"/><circle cx="144" cy="116" r="1.6"/><circle cx="144" cy="136" r="1.6"/><circle cx="144" cy="156" r="1.6"/><circle cx="144" cy="176" r="1.6"/><circle cx="144" cy="196" r="1.6"/><circle cx="144" cy="240" r="1.6"/><circle cx="144" cy="260" r="1.6"/><circle cx="144" cy="280" r="1.6"/><circle cx="144" cy="300" r="1.6"/><circle cx="144" cy="320" r="1.6"/><circle cx="164" cy="116" r="1.6"/><circle cx="164" cy="136" r="1.6"/><circle cx="164" cy="156" r="1.6"/><circle cx="164" cy="176" r="1.6"/><circle cx="164" cy="196" r="1.6"/><circle cx="164" cy="240" r="1.6"/><circle cx="164" cy="260" r="1.6"/><circle cx="164" cy="280" r="1.6"/><circle cx="164" cy="300" r="1.6"/><circle cx="164" cy="320" r="1.6"/><circle cx="184" cy="116" r="1.6"/><circle cx="184" cy="136" r="1.6"/><circle cx="184" cy="156" r="1.6"/><circle cx="184" cy="176" r="1.6"/><circle cx="184" cy="196" r="1.6"/><circle cx="184" cy="240" r="1.6"/><circle cx="184" cy="260" r="1.6"/><circle cx="184" cy="280" r="1.6"/><circle cx="184" cy="300" r="1.6"/><circle cx="184" cy="320" r="1.6"/><circle cx="204" cy="116" r="1.6"/><circle cx="204" cy="136" r="1.6"/><circle cx="204" cy="156" r="1.6"/><circle cx="204" cy="176" r="1.6"/><circle cx="204" cy="196" r="1.6"/><circle cx="204" cy="240" r="1.6"/><circle cx="204" cy="260" r="1.6"/><circle cx="204" cy="280" r="1.6"/><circle cx="204" cy="300" r="1.6"/><circle cx="204" cy="320" r="1.6"/><circle cx="224" cy="116" r="1.6"/><circle cx="224" cy="136" r="1.6"/><circle cx="224" cy="156" r="1.6"/><circle cx="224" cy="176" r="1.6"/><circle cx="224" cy="196" r="1.6"/><circle cx="224" cy="240" r="1.6"/><circle cx="224" cy="260" r="1.6"/><circle cx="224" cy="280" r="1.6"/><circle cx="224" cy="300" r="1.6"/><circle cx="224" cy="320" r="1.6"/><circle cx="244" cy="116" r="1.6"/><circle cx="244" cy="136" r="1.6"/><circle cx="244" cy="156" r="1.6"/><circle cx="244" cy="176" r="1.6"/><circle cx="244" cy="196" r="1.6"/><circle cx="244" cy="240" r="1.6"/><circle cx="244" cy="260" r="1.6"/><circle cx="244" cy="280" r="1.6"/><circle cx="244" cy="300" r="1.6"/><circle cx="244" cy="320" r="1.6"/><circle cx="264" cy="116" r="1.6"/><circle cx="264" cy="136" r="1.6"/><circle cx="264" cy="156" r="1.6"/><circle cx="264" cy="176" r="1.6"/><circle cx="264" cy="196" r="1.6"/><circle cx="264" cy="240" r="1.6"/><circle cx="264" cy="260" r="1.6"/><circle cx="264" cy="280" r="1.6"/><circle cx="264" cy="300" r="1.6"/><circle cx="264" cy="320" r="1.6"/><circle cx="284" cy="116" r="1.6"/><circle cx="284" cy="136" r="1.6"/><circle cx="284" cy="156" r="1.6"/><circle cx="284" cy="176" r="1.6"/><circle cx="284" cy="196" r="1.6"/><circle cx="284" cy="240" r="1.6"/><circle cx="284" cy="260" r="1.6"/><circle cx="284" cy="280" r="1.6"/><circle cx="284" cy="300" r="1.6"/><circle cx="284" cy="320" r="1.6"/><circle cx="304" cy="116" r="1.6"/><circle cx="304" cy="136" r="1.6"/><circle cx="304" cy="156" r="1.6"/><circle cx="304" cy="176" r="1.6"/><circle cx="304" cy="196" r="1.6"/><circle cx="304" cy="240" r="1.6"/><circle cx="304" cy="260" r="1.6"/><circle cx="304" cy="280" r="1.6"/><circle cx="304" cy="300" r="1.6"/><circle cx="304" cy="320" r="1.6"/><circle cx="324" cy="116" r="1.6"/><circle cx="324" cy="136" r="1.6"/><circle cx="324" cy="156" r="1.6"/><circle cx="324" cy="176" r="1.6"/><circle cx="324" cy="196" r="1.6"/><circle cx="324" cy="240" r="1.6"/><circle cx="324" cy="260" r="1.6"/><circle cx="324" cy="280" r="1.6"/><circle cx="324" cy="300" r="1.6"/><circle cx="324" cy="320" r="1.6"/><circle cx="344" cy="116" r="1.6"/><circle cx="344" cy="136" r="1.6"/><circle cx="344" cy="156" r="1.6"/><circle cx="344" cy="176" r="1.6"/><circle cx="344" cy="196" r="1.6"/><circle cx="344" cy="240" r="1.6"/><circle cx="344" cy="260" r="1.6"/><circle cx="344" cy="280" r="1.6"/><circle cx="344" cy="300" r="1.6"/><circle cx="344" cy="320" r="1.6"/><circle cx="364" cy="116" r="1.6"/><circle cx="364" cy="136" r="1.6"/><circle cx="364" cy="156" r="1.6"/><circle cx="364" cy="176" r="1.6"/><circle cx="364" cy="196" r="1.6"/><circle cx="364" cy="240" r="1.6"/><circle cx="364" cy="260" r="1.6"/><circle cx="364" cy="280" r="1.6"/><circle cx="364" cy="300" r="1.6"/><circle cx="364" cy="320" r="1.6"/><circle cx="384" cy="116" r="1.6"/><circle cx="384" cy="136" r="1.6"/><circle cx="384" cy="156" r="1.6"/><circle cx="384" cy="176" r="1.6"/><circle cx="384" cy="196" r="1.6"/><circle cx="384" cy="240" r="1.6"/><circle cx="384" cy="260" r="1.6"/><circle cx="384" cy="280" r="1.6"/><circle cx="384" cy="300" r="1.6"/><circle cx="384" cy="320" r="1.6"/><circle cx="404" cy="116" r="1.6"/><circle cx="404" cy="136" r="1.6"/><circle cx="404" cy="156" r="1.6"/><circle cx="404" cy="176" r="1.6"/><circle cx="404" cy="196" r="1.6"/><circle cx="404" cy="240" r="1.6"/><circle cx="404" cy="260" r="1.6"/><circle cx="404" cy="280" r="1.6"/><circle cx="404" cy="300" r="1.6"/><circle cx="404" cy="320" r="1.6"/><circle cx="424" cy="116" r="1.6"/><circle cx="424" cy="136" r="1.6"/><circle cx="424" cy="156" r="1.6"/><circle cx="424" cy="176" r="1.6"/><circle cx="424" cy="196" r="1.6"/><circle cx="424" cy="240" r="1.6"/><circle cx="424" cy="260" r="1.6"/><circle cx="424" cy="280" r="1.6"/><circle cx="424" cy="300" r="1.6"/><circle cx="424" cy="320" r="1.6"/><circle cx="444" cy="116" r="1.6"/><circle cx="444" cy="136" r="1.6"/><circle cx="444" cy="156" r="1.6"/><circle cx="444" cy="176" r="1.6"/><circle cx="444" cy="196" r="1.6"/><circle cx="444" cy="240" r="1.6"/><circle cx="444" cy="260" r="1.6"/><circle cx="444" cy="280" r="1.6"/><circle cx="444" cy="300" r="1.6"/><circle cx="444" cy="320" r="1.6"/><circle cx="464" cy="116" r="1.6"/><circle cx="464" cy="136" r="1.6"/><circle cx="464" cy="156" r="1.6"/><circle cx="464" cy="176" r="1.6"/><circle cx="464" cy="196" r="1.6"/><circle cx="464" cy="240" r="1.6"/><circle cx="464" cy="260" r="1.6"/><circle cx="464" cy="280" r="1.6"/><circle cx="464" cy="300" r="1.6"/><circle cx="464" cy="320" r="1.6"/><circle cx="484" cy="116" r="1.6"/><circle cx="484" cy="136" r="1.6"/><circle cx="484" cy="156" r="1.6"/><circle cx="484" cy="176" r="1.6"/><circle cx="484" cy="196" r="1.6"/><circle cx="484" cy="240" r="1.6"/><circle cx="484" cy="260" r="1.6"/><circle cx="484" cy="280" r="1.6"/><circle cx="484" cy="300" r="1.6"/><circle cx="484" cy="320" r="1.6"/><circle cx="504" cy="116" r="1.6"/><circle cx="504" cy="136" r="1.6"/><circle cx="504" cy="156" r="1.6"/><circle cx="504" cy="176" r="1.6"/><circle cx="504" cy="196" r="1.6"/><circle cx="504" cy="240" r="1.6"/><circle cx="504" cy="260" r="1.6"/><circle cx="504" cy="280" r="1.6"/><circle cx="504" cy="300" r="1.6"/><circle cx="504" cy="320" r="1.6"/></g>
<path d="M18.0 218.0H510.0" stroke="currentColor" stroke-dasharray="2 4" opacity="0.4"/>
<g fill="currentColor" font-family="sans-serif" font-size="8"><text x="508.0" y="83" text-anchor="end">GND</text><text x="508.0" y="95" text-anchor="end">+</text><text x="508.0" y="347" text-anchor="end">GND</text><text x="508.0" y="359" text-anchor="end">+</text></g>
<rect x="12.0" y="156" width="404.0" height="124" rx="3" fill="var(--chipbg,none)" stroke="currentColor" stroke-width="1.5"/><path d="M12.0 212.0a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="24" cy="156" r="2.6"/><circle cx="24" cy="280" r="2.6"/><circle cx="44" cy="156" r="2.6"/><circle cx="44" cy="280" r="2.6"/><circle cx="64" cy="156" r="2.6"/><circle cx="64" cy="280" r="2.6"/><circle cx="84" cy="156" r="2.6"/><circle cx="84" cy="280" r="2.6"/><circle cx="104" cy="156" r="2.6"/><circle cx="104" cy="280" r="2.6"/><circle cx="124" cy="156" r="2.6"/><circle cx="124" cy="280" r="2.6"/><circle cx="144" cy="156" r="2.6"/><circle cx="144" cy="280" r="2.6"/><circle cx="164" cy="156" r="2.6"/><circle cx="164" cy="280" r="2.6"/><circle cx="184" cy="156" r="2.6"/><circle cx="184" cy="280" r="2.6"/><circle cx="204" cy="156" r="2.6"/><circle cx="204" cy="280" r="2.6"/><circle cx="224" cy="156" r="2.6"/><circle cx="224" cy="280" r="2.6"/><circle cx="244" cy="156" r="2.6"/><circle cx="244" cy="280" r="2.6"/><circle cx="264" cy="156" r="2.6"/><circle cx="264" cy="280" r="2.6"/><circle cx="284" cy="156" r="2.6"/><circle cx="284" cy="280" r="2.6"/><circle cx="304" cy="156" r="2.6"/><circle cx="304" cy="280" r="2.6"/><circle cx="324" cy="156" r="2.6"/><circle cx="324" cy="280" r="2.6"/><circle cx="344" cy="156" r="2.6"/><circle cx="344" cy="280" r="2.6"/><circle cx="364" cy="156" r="2.6"/><circle cx="364" cy="280" r="2.6"/><circle cx="384" cy="156" r="2.6"/><circle cx="384" cy="280" r="2.6"/><circle cx="404" cy="156" r="2.6"/><circle cx="404" cy="280" r="2.6"/></g>
<text x="104" y="217.0" text-anchor="middle" font-family="sans-serif" font-size="11" fill="currentColor">Pico 2 WH</text><text x="104" y="228.0" text-anchor="middle" font-family="sans-serif" font-size="8" fill="currentColor" opacity="0.8">MIA</text>
<rect x="378.0" y="161" width="38.0" height="114" fill="none" stroke="#d0312d" stroke-dasharray="3 3"/>
<text x="397.0" y="221.0" font-family="sans-serif" font-size="7" text-anchor="middle" fill="#d0312d" opacity="1">antenna</text>
<rect x="22.0" y="213.0" width="24.0" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="0.8"/>
<text x="34.0" y="236.0" font-family="sans-serif" font-size="7" text-anchor="middle" fill="currentColor" opacity="0.7">USB</text>
<path d="M404.0 116.0 L404.0 56.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="404.0" cy="116.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M384.0 116.0 L384.0 56.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="384.0" cy="116.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M344.0 116.0 L344.0 56.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="344.0" cy="116.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M324.0 116.0 L324.0 56.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="324.0" cy="116.0" r="2.8" fill="#d4a017" stroke="none"/>
<path d="M304.0 116.0 L304.0 56.0" fill="none" stroke="#d4a017" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="304.0" cy="116.0" r="2.8" fill="#d4a017" stroke="none"/>
<g opacity="1"><path d="M284.0 116.0 L284.0 56.0" fill="none" stroke="currentColor" stroke-width="4.4"/><path d="M284.0 116.0 L284.0 56.0" fill="none" stroke="#ffffff" stroke-width="2.4"/></g>
<circle cx="284.0" cy="116.0" r="2.8" fill="#ffffff" stroke="currentColor"/>
<path d="M204.0 116.0 L204.0 56.0" fill="none" stroke="#2e9d5b" stroke-width="2.4" stroke-linejoin="round" opacity="1"/>
<circle cx="204.0" cy="116.0" r="2.8" fill="#2e9d5b" stroke="none"/>
<path d="M214.0 56.0 L214.0 300.0 L204.0 300.0" fill="none" stroke="#2e9d5b" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="204.0" cy="300.0" r="2.8" fill="#2e9d5b" stroke="none"/>
<path d="M234.0 56.0 L234.0 300.0 L224.0 300.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="224.0" cy="300.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M254.0 56.0 L254.0 300.0 L244.0 300.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="244.0" cy="300.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M294.0 56.0 L294.0 300.0 L284.0 300.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="284.0" cy="300.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M314.0 56.0 L314.0 300.0 L304.0 300.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="304.0" cy="300.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M334.0 56.0 L334.0 300.0 L324.0 300.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="324.0" cy="300.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M354.0 56.0 L354.0 300.0 L344.0 300.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="344.0" cy="300.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M359.6 56.0 L359.6 320.0 L384.0 320.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="384.0" cy="320.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<path d="M370.0 56.0 L370.0 329.0 L404.0 329.0 L404.0 320.0" fill="none" stroke="#4a7fd4" stroke-width="2" stroke-linejoin="round" opacity="1"/>
<circle cx="404.0" cy="320.0" r="2.8" fill="#4a7fd4" stroke="none"/>
<text x="402.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 402 52)">A0 (pin 21)</text>
<text x="382.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 382 52)">A1 (pin 22)</text>
<text x="342.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 342 52)">A2 (pin 24)</text>
<text x="322.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 322 52)">A3 (pin 25)</text>
<text x="302.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 302 52)">A4 (pin 26)</text>
<text x="282.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 282 52)">PHI2 (pin 27)</text>
<text x="202.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 202 52)">RESB (pin 31)</text>
<text x="212.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 212.0 52)">RWB (pin 10)</text>
<text x="232.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 232.0 52)">D0 (pin 11)</text>
<text x="252.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 252.0 52)">D1 (pin 12)</text>
<text x="292.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 292.0 52)">D2 (pin 14)</text>
<text x="312.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 312.0 52)">D3 (pin 15)</text>
<text x="332.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 332.0 52)">D4 (pin 16)</text>
<text x="352.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 352.0 52)">D5 (pin 17)</text>
<text x="357.6" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 357.6 52)">D6 (pin 19)</text>
<text x="368.0" y="52.0" font-family="sans-serif" font-size="7" text-anchor="end" fill="currentColor" opacity="1" transform="rotate(90 368.0 52)">D7 (pin 20)</text>
<path d="M184.0 320.0 L184.0 350.0" fill="none" stroke="#2e9d5b" stroke-width="2.2" stroke-linejoin="round" opacity="1" stroke-dasharray="4 2"/>
<circle cx="184.0" cy="320.0" r="2.8" fill="#2e9d5b" stroke="none"/>
<text x="24.0" y="388.0" font-family="sans-serif" font-size="8" text-anchor="start" fill="currentColor" opacity="1">Dashed: Pico 9 (GP6) to GND, stage 4 only.</text>
<text x="24.0" y="400.0" font-family="sans-serif" font-size="8" text-anchor="start" fill="currentColor" opacity="1">RWB and D0-D7 cross over the Pico to its far-side pins, before the antenna end.</text>
<text x="428.0" y="119.0" font-family="sans-serif" font-size="8" text-anchor="start" fill="currentColor" opacity="0.8">from the CPU</text>
<text x="428.0" y="129.0" font-family="sans-serif" font-size="8" text-anchor="start" fill="currentColor" opacity="0.8">on board 2 ↑</text>
</svg>
</div>

Sixteen wires join the CPU to the Pico. Two things make them tidier:

- **The CPU's top-side wires cross over the chip.** D0-D7, RWB, PHI2 and
  `~RESB` are on the side facing board 3, and the Pico is on board 1, so
  those wires run over the CPU's body. Lay them flat and keep them clear of
  the other pins' free holes.
- **RWB and D0-D7 cross over the Pico.** Their Pico pins (10-20) are on
  the far side, away from board 2. Cross over the Pico's middle, between
  columns 10 and 18, and keep clear of the antenna end (columns 19-20 and
  past them): D6 and D7 cross before it and run along the far side's free
  holes to pins 19 and 20. The near-side pins (A0-A4, PHI2, `~RESB`) need
  no crossing.

### Just for this test

These come off again in stage 5.

- **The NOP resistors.** `$EA` is `1110 1010` in binary. Put a 4.7 kΩ
  resistor from each of D7, D6, D5, D3 and D1 to 3.3 V, and from each of D4,
  D2 and D0 to GND. Use 4.7 kΩ, not 10 kΩ: a Pico 2 input can hold a pin up
  against a pull-down weaker than about 8.2 kΩ (RP2350 erratum E9).
- **MIA's select, grounded.** Push a jumper from Pico 9 (GP6) to GND. Leave
  U9.8 (`MIACS`, on the 74AC00) unconnected: never join it to Pico 9 while that jumper is
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

**Before you plug in**, run the
[power-up checks](../breadboard.md#before-you-power-up) on what you just
added.

The check watches the address lines count. MIA's `speed` command slows the
clock until you can read the count on the LEDs.

1. Wire eight LEDs the "high" way (lit = 1) on A0-A7: CPU pins U1.9 to U1.16. Put
   them in a row with A7 on the left, so they read as a binary number: the
   drawing above puts them in columns 40-55 with a yellow wire from each
   CPU row.
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
6. Move the eight LEDs to A8-A15 (CPU pins U1.17, U1.18, U1.19, U1.20, U1.22, U1.23,
   U1.24, U1.25; pin 21 is GND, skip it) and type `speed 2000`. After a reset
   the high byte also starts at `1110 1010` and counts up every 0.26 s. A full
   trip through memory takes about 65 seconds.

Moving the LEDs (step 6 and the chip-select check below) is the other place where you
may move wires with the power on, as in stage 3. Each LED has its 1 kΩ in
series, so a wire end that lands in the wrong hole can't short anything:
move one end at a time, and only between a CPU or chip row and an LED. If
you'd rather unplug, remember that MIA starts the CPU at 1.2 MHz again at
every power-up (a RESET keeps the speed), so type the `speed` command again.

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

- **PHI2 at the CPU.** Probe the CPU's U1.37: the same clean 0-3.3 V square wave as at
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
  and look at U9.11 (`~A15`, on the 74AC00) on channel 2: it falls a few nanoseconds later.
  That is one 74AC gate, near the limit of what a 50 MHz scope resolves;
  you will see it as about 7-10 ns.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| No LED moves | RESB held low (U1.40), no PHI2 (U1.37), RDY low (U1.2) or BE low (U1.36): measure them |
| The count starts at a value other than `1110 1010` | A data line is not at its `$EA` level: check the eight resistors |
| The count skips or repeats | Two address lines swapped or shorted: compare A0-A7 to the table, beep neighbouring rows |
| The CPU gets warm | It's in backwards, or VDD/VSS swapped: unplug at once |
| One LED never lights, the others count | That LED is in backwards, or its 1 kΩ isn't bridging its two rows |
| The Pico drops off USB when you plug in | A short: a `$EA` resistor or a red wire in the wrong rail. Unplug and beep the rails |
| `~OE` LED blinks | RWB isn't always high: a data line is floating and the CPU is running something other than NOPs |
