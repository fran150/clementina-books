# Stage 2: Reset button and microSD

Both hang off the Pico alone, so they can be proven before the CPU exists.
The SD card also brings `WIFI.CFG`, so from this stage on MIA joins your
network at power-on.

## Parts

| Part | Qty | On the schematic | Notes |
| --- | --- | --- | --- |
| 6 × 6 mm tactile switch | 1 | SW1 | The reset button |
| 10 kΩ resistor | 1 | R3 | Pull-up |
| 1 µF ceramic capacitor | 1 | C1 | Debounce |
| 100 Ω resistor | 1 | R4 |  |
| Adafruit 4682 microSD breakout | 1 |  | Solder its 9-pin header first |
| microSD card with `WIFI.CFG` | 1 |  | From stage 0 |
| LED and 1 kΩ resistor | 1 |  | Optional, for the check without a meter |

## What you add

The reset button SW1 with its debounce parts, and the microSD breakout.

### Where they go

Both go on board 1, past the Pico's antenna end. The drawing shows one way
to place them, with the board's column 1 at the Pico's USB end:

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 300" width="100%" style="max-width:760px" role="img" aria-label="Board 1 seen from above, column 1 at the left. The Pico fills columns 1 to 20 with its USB end at the board edge; columns 21 to 23 stay empty for the Wi-Fi antenna. The microSD breakout sits in the lower half at columns 25 to 33, wired to Pico pins 1, 2, 4 and 5 with green wires along the lower edge. The reset button straddles the centre gap at columns 41 to 43, with R3, C1 and R4 in the upper half at column 37, joined to Pico pin 32 by a green wire along the upper edge. Columns 46 to 60 are left for the audio stage.">
<rect x="20" y="16" width="640" height="212" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g stroke-width="3" opacity="0.4"><path d="M35 30H645M35 200H645" stroke="currentColor"/><path d="M35 42H645M35 212H645" stroke="#d0312d"/></g>
<g fill="currentColor" opacity="0.25"><circle cx="40" cy="66" r="1.6"/><circle cx="40" cy="76" r="1.6"/><circle cx="40" cy="86" r="1.6"/><circle cx="40" cy="96" r="1.6"/><circle cx="40" cy="106" r="1.6"/><circle cx="40" cy="136" r="1.6"/><circle cx="40" cy="146" r="1.6"/><circle cx="40" cy="156" r="1.6"/><circle cx="40" cy="166" r="1.6"/><circle cx="40" cy="176" r="1.6"/><circle cx="50" cy="66" r="1.6"/><circle cx="50" cy="76" r="1.6"/><circle cx="50" cy="86" r="1.6"/><circle cx="50" cy="96" r="1.6"/><circle cx="50" cy="106" r="1.6"/><circle cx="50" cy="136" r="1.6"/><circle cx="50" cy="146" r="1.6"/><circle cx="50" cy="156" r="1.6"/><circle cx="50" cy="166" r="1.6"/><circle cx="50" cy="176" r="1.6"/><circle cx="60" cy="66" r="1.6"/><circle cx="60" cy="76" r="1.6"/><circle cx="60" cy="86" r="1.6"/><circle cx="60" cy="96" r="1.6"/><circle cx="60" cy="106" r="1.6"/><circle cx="60" cy="136" r="1.6"/><circle cx="60" cy="146" r="1.6"/><circle cx="60" cy="156" r="1.6"/><circle cx="60" cy="166" r="1.6"/><circle cx="60" cy="176" r="1.6"/><circle cx="70" cy="66" r="1.6"/><circle cx="70" cy="76" r="1.6"/><circle cx="70" cy="86" r="1.6"/><circle cx="70" cy="96" r="1.6"/><circle cx="70" cy="106" r="1.6"/><circle cx="70" cy="136" r="1.6"/><circle cx="70" cy="146" r="1.6"/><circle cx="70" cy="156" r="1.6"/><circle cx="70" cy="166" r="1.6"/><circle cx="70" cy="176" r="1.6"/><circle cx="80" cy="66" r="1.6"/><circle cx="80" cy="76" r="1.6"/><circle cx="80" cy="86" r="1.6"/><circle cx="80" cy="96" r="1.6"/><circle cx="80" cy="106" r="1.6"/><circle cx="80" cy="136" r="1.6"/><circle cx="80" cy="146" r="1.6"/><circle cx="80" cy="156" r="1.6"/><circle cx="80" cy="166" r="1.6"/><circle cx="80" cy="176" r="1.6"/><circle cx="90" cy="66" r="1.6"/><circle cx="90" cy="76" r="1.6"/><circle cx="90" cy="86" r="1.6"/><circle cx="90" cy="96" r="1.6"/><circle cx="90" cy="106" r="1.6"/><circle cx="90" cy="136" r="1.6"/><circle cx="90" cy="146" r="1.6"/><circle cx="90" cy="156" r="1.6"/><circle cx="90" cy="166" r="1.6"/><circle cx="90" cy="176" r="1.6"/><circle cx="100" cy="66" r="1.6"/><circle cx="100" cy="76" r="1.6"/><circle cx="100" cy="86" r="1.6"/><circle cx="100" cy="96" r="1.6"/><circle cx="100" cy="106" r="1.6"/><circle cx="100" cy="136" r="1.6"/><circle cx="100" cy="146" r="1.6"/><circle cx="100" cy="156" r="1.6"/><circle cx="100" cy="166" r="1.6"/><circle cx="100" cy="176" r="1.6"/><circle cx="110" cy="66" r="1.6"/><circle cx="110" cy="76" r="1.6"/><circle cx="110" cy="86" r="1.6"/><circle cx="110" cy="96" r="1.6"/><circle cx="110" cy="106" r="1.6"/><circle cx="110" cy="136" r="1.6"/><circle cx="110" cy="146" r="1.6"/><circle cx="110" cy="156" r="1.6"/><circle cx="110" cy="166" r="1.6"/><circle cx="110" cy="176" r="1.6"/><circle cx="120" cy="66" r="1.6"/><circle cx="120" cy="76" r="1.6"/><circle cx="120" cy="86" r="1.6"/><circle cx="120" cy="96" r="1.6"/><circle cx="120" cy="106" r="1.6"/><circle cx="120" cy="136" r="1.6"/><circle cx="120" cy="146" r="1.6"/><circle cx="120" cy="156" r="1.6"/><circle cx="120" cy="166" r="1.6"/><circle cx="120" cy="176" r="1.6"/><circle cx="130" cy="66" r="1.6"/><circle cx="130" cy="76" r="1.6"/><circle cx="130" cy="86" r="1.6"/><circle cx="130" cy="96" r="1.6"/><circle cx="130" cy="106" r="1.6"/><circle cx="130" cy="136" r="1.6"/><circle cx="130" cy="146" r="1.6"/><circle cx="130" cy="156" r="1.6"/><circle cx="130" cy="166" r="1.6"/><circle cx="130" cy="176" r="1.6"/><circle cx="140" cy="66" r="1.6"/><circle cx="140" cy="76" r="1.6"/><circle cx="140" cy="86" r="1.6"/><circle cx="140" cy="96" r="1.6"/><circle cx="140" cy="106" r="1.6"/><circle cx="140" cy="136" r="1.6"/><circle cx="140" cy="146" r="1.6"/><circle cx="140" cy="156" r="1.6"/><circle cx="140" cy="166" r="1.6"/><circle cx="140" cy="176" r="1.6"/><circle cx="150" cy="66" r="1.6"/><circle cx="150" cy="76" r="1.6"/><circle cx="150" cy="86" r="1.6"/><circle cx="150" cy="96" r="1.6"/><circle cx="150" cy="106" r="1.6"/><circle cx="150" cy="136" r="1.6"/><circle cx="150" cy="146" r="1.6"/><circle cx="150" cy="156" r="1.6"/><circle cx="150" cy="166" r="1.6"/><circle cx="150" cy="176" r="1.6"/><circle cx="160" cy="66" r="1.6"/><circle cx="160" cy="76" r="1.6"/><circle cx="160" cy="86" r="1.6"/><circle cx="160" cy="96" r="1.6"/><circle cx="160" cy="106" r="1.6"/><circle cx="160" cy="136" r="1.6"/><circle cx="160" cy="146" r="1.6"/><circle cx="160" cy="156" r="1.6"/><circle cx="160" cy="166" r="1.6"/><circle cx="160" cy="176" r="1.6"/><circle cx="170" cy="66" r="1.6"/><circle cx="170" cy="76" r="1.6"/><circle cx="170" cy="86" r="1.6"/><circle cx="170" cy="96" r="1.6"/><circle cx="170" cy="106" r="1.6"/><circle cx="170" cy="136" r="1.6"/><circle cx="170" cy="146" r="1.6"/><circle cx="170" cy="156" r="1.6"/><circle cx="170" cy="166" r="1.6"/><circle cx="170" cy="176" r="1.6"/><circle cx="180" cy="66" r="1.6"/><circle cx="180" cy="76" r="1.6"/><circle cx="180" cy="86" r="1.6"/><circle cx="180" cy="96" r="1.6"/><circle cx="180" cy="106" r="1.6"/><circle cx="180" cy="136" r="1.6"/><circle cx="180" cy="146" r="1.6"/><circle cx="180" cy="156" r="1.6"/><circle cx="180" cy="166" r="1.6"/><circle cx="180" cy="176" r="1.6"/><circle cx="190" cy="66" r="1.6"/><circle cx="190" cy="76" r="1.6"/><circle cx="190" cy="86" r="1.6"/><circle cx="190" cy="96" r="1.6"/><circle cx="190" cy="106" r="1.6"/><circle cx="190" cy="136" r="1.6"/><circle cx="190" cy="146" r="1.6"/><circle cx="190" cy="156" r="1.6"/><circle cx="190" cy="166" r="1.6"/><circle cx="190" cy="176" r="1.6"/><circle cx="200" cy="66" r="1.6"/><circle cx="200" cy="76" r="1.6"/><circle cx="200" cy="86" r="1.6"/><circle cx="200" cy="96" r="1.6"/><circle cx="200" cy="106" r="1.6"/><circle cx="200" cy="136" r="1.6"/><circle cx="200" cy="146" r="1.6"/><circle cx="200" cy="156" r="1.6"/><circle cx="200" cy="166" r="1.6"/><circle cx="200" cy="176" r="1.6"/><circle cx="210" cy="66" r="1.6"/><circle cx="210" cy="76" r="1.6"/><circle cx="210" cy="86" r="1.6"/><circle cx="210" cy="96" r="1.6"/><circle cx="210" cy="106" r="1.6"/><circle cx="210" cy="136" r="1.6"/><circle cx="210" cy="146" r="1.6"/><circle cx="210" cy="156" r="1.6"/><circle cx="210" cy="166" r="1.6"/><circle cx="210" cy="176" r="1.6"/><circle cx="220" cy="66" r="1.6"/><circle cx="220" cy="76" r="1.6"/><circle cx="220" cy="86" r="1.6"/><circle cx="220" cy="96" r="1.6"/><circle cx="220" cy="106" r="1.6"/><circle cx="220" cy="136" r="1.6"/><circle cx="220" cy="146" r="1.6"/><circle cx="220" cy="156" r="1.6"/><circle cx="220" cy="166" r="1.6"/><circle cx="220" cy="176" r="1.6"/><circle cx="230" cy="66" r="1.6"/><circle cx="230" cy="76" r="1.6"/><circle cx="230" cy="86" r="1.6"/><circle cx="230" cy="96" r="1.6"/><circle cx="230" cy="106" r="1.6"/><circle cx="230" cy="136" r="1.6"/><circle cx="230" cy="146" r="1.6"/><circle cx="230" cy="156" r="1.6"/><circle cx="230" cy="166" r="1.6"/><circle cx="230" cy="176" r="1.6"/><circle cx="240" cy="66" r="1.6"/><circle cx="240" cy="76" r="1.6"/><circle cx="240" cy="86" r="1.6"/><circle cx="240" cy="96" r="1.6"/><circle cx="240" cy="106" r="1.6"/><circle cx="240" cy="136" r="1.6"/><circle cx="240" cy="146" r="1.6"/><circle cx="240" cy="156" r="1.6"/><circle cx="240" cy="166" r="1.6"/><circle cx="240" cy="176" r="1.6"/><circle cx="250" cy="66" r="1.6"/><circle cx="250" cy="76" r="1.6"/><circle cx="250" cy="86" r="1.6"/><circle cx="250" cy="96" r="1.6"/><circle cx="250" cy="106" r="1.6"/><circle cx="250" cy="136" r="1.6"/><circle cx="250" cy="146" r="1.6"/><circle cx="250" cy="156" r="1.6"/><circle cx="250" cy="166" r="1.6"/><circle cx="250" cy="176" r="1.6"/><circle cx="260" cy="66" r="1.6"/><circle cx="260" cy="76" r="1.6"/><circle cx="260" cy="86" r="1.6"/><circle cx="260" cy="96" r="1.6"/><circle cx="260" cy="106" r="1.6"/><circle cx="260" cy="136" r="1.6"/><circle cx="260" cy="146" r="1.6"/><circle cx="260" cy="156" r="1.6"/><circle cx="260" cy="166" r="1.6"/><circle cx="260" cy="176" r="1.6"/><circle cx="270" cy="66" r="1.6"/><circle cx="270" cy="76" r="1.6"/><circle cx="270" cy="86" r="1.6"/><circle cx="270" cy="96" r="1.6"/><circle cx="270" cy="106" r="1.6"/><circle cx="270" cy="136" r="1.6"/><circle cx="270" cy="146" r="1.6"/><circle cx="270" cy="156" r="1.6"/><circle cx="270" cy="166" r="1.6"/><circle cx="270" cy="176" r="1.6"/><circle cx="280" cy="66" r="1.6"/><circle cx="280" cy="76" r="1.6"/><circle cx="280" cy="86" r="1.6"/><circle cx="280" cy="96" r="1.6"/><circle cx="280" cy="106" r="1.6"/><circle cx="280" cy="136" r="1.6"/><circle cx="280" cy="146" r="1.6"/><circle cx="280" cy="156" r="1.6"/><circle cx="280" cy="166" r="1.6"/><circle cx="280" cy="176" r="1.6"/><circle cx="290" cy="66" r="1.6"/><circle cx="290" cy="76" r="1.6"/><circle cx="290" cy="86" r="1.6"/><circle cx="290" cy="96" r="1.6"/><circle cx="290" cy="106" r="1.6"/><circle cx="290" cy="136" r="1.6"/><circle cx="290" cy="146" r="1.6"/><circle cx="290" cy="156" r="1.6"/><circle cx="290" cy="166" r="1.6"/><circle cx="290" cy="176" r="1.6"/><circle cx="300" cy="66" r="1.6"/><circle cx="300" cy="76" r="1.6"/><circle cx="300" cy="86" r="1.6"/><circle cx="300" cy="96" r="1.6"/><circle cx="300" cy="106" r="1.6"/><circle cx="300" cy="136" r="1.6"/><circle cx="300" cy="146" r="1.6"/><circle cx="300" cy="156" r="1.6"/><circle cx="300" cy="166" r="1.6"/><circle cx="300" cy="176" r="1.6"/><circle cx="310" cy="66" r="1.6"/><circle cx="310" cy="76" r="1.6"/><circle cx="310" cy="86" r="1.6"/><circle cx="310" cy="96" r="1.6"/><circle cx="310" cy="106" r="1.6"/><circle cx="310" cy="136" r="1.6"/><circle cx="310" cy="146" r="1.6"/><circle cx="310" cy="156" r="1.6"/><circle cx="310" cy="166" r="1.6"/><circle cx="310" cy="176" r="1.6"/><circle cx="320" cy="66" r="1.6"/><circle cx="320" cy="76" r="1.6"/><circle cx="320" cy="86" r="1.6"/><circle cx="320" cy="96" r="1.6"/><circle cx="320" cy="106" r="1.6"/><circle cx="320" cy="136" r="1.6"/><circle cx="320" cy="146" r="1.6"/><circle cx="320" cy="156" r="1.6"/><circle cx="320" cy="166" r="1.6"/><circle cx="320" cy="176" r="1.6"/><circle cx="330" cy="66" r="1.6"/><circle cx="330" cy="76" r="1.6"/><circle cx="330" cy="86" r="1.6"/><circle cx="330" cy="96" r="1.6"/><circle cx="330" cy="106" r="1.6"/><circle cx="330" cy="136" r="1.6"/><circle cx="330" cy="146" r="1.6"/><circle cx="330" cy="156" r="1.6"/><circle cx="330" cy="166" r="1.6"/><circle cx="330" cy="176" r="1.6"/><circle cx="340" cy="66" r="1.6"/><circle cx="340" cy="76" r="1.6"/><circle cx="340" cy="86" r="1.6"/><circle cx="340" cy="96" r="1.6"/><circle cx="340" cy="106" r="1.6"/><circle cx="340" cy="136" r="1.6"/><circle cx="340" cy="146" r="1.6"/><circle cx="340" cy="156" r="1.6"/><circle cx="340" cy="166" r="1.6"/><circle cx="340" cy="176" r="1.6"/><circle cx="350" cy="66" r="1.6"/><circle cx="350" cy="76" r="1.6"/><circle cx="350" cy="86" r="1.6"/><circle cx="350" cy="96" r="1.6"/><circle cx="350" cy="106" r="1.6"/><circle cx="350" cy="136" r="1.6"/><circle cx="350" cy="146" r="1.6"/><circle cx="350" cy="156" r="1.6"/><circle cx="350" cy="166" r="1.6"/><circle cx="350" cy="176" r="1.6"/><circle cx="360" cy="66" r="1.6"/><circle cx="360" cy="76" r="1.6"/><circle cx="360" cy="86" r="1.6"/><circle cx="360" cy="96" r="1.6"/><circle cx="360" cy="106" r="1.6"/><circle cx="360" cy="136" r="1.6"/><circle cx="360" cy="146" r="1.6"/><circle cx="360" cy="156" r="1.6"/><circle cx="360" cy="166" r="1.6"/><circle cx="360" cy="176" r="1.6"/><circle cx="370" cy="66" r="1.6"/><circle cx="370" cy="76" r="1.6"/><circle cx="370" cy="86" r="1.6"/><circle cx="370" cy="96" r="1.6"/><circle cx="370" cy="106" r="1.6"/><circle cx="370" cy="136" r="1.6"/><circle cx="370" cy="146" r="1.6"/><circle cx="370" cy="156" r="1.6"/><circle cx="370" cy="166" r="1.6"/><circle cx="370" cy="176" r="1.6"/><circle cx="380" cy="66" r="1.6"/><circle cx="380" cy="76" r="1.6"/><circle cx="380" cy="86" r="1.6"/><circle cx="380" cy="96" r="1.6"/><circle cx="380" cy="106" r="1.6"/><circle cx="380" cy="136" r="1.6"/><circle cx="380" cy="146" r="1.6"/><circle cx="380" cy="156" r="1.6"/><circle cx="380" cy="166" r="1.6"/><circle cx="380" cy="176" r="1.6"/><circle cx="390" cy="66" r="1.6"/><circle cx="390" cy="76" r="1.6"/><circle cx="390" cy="86" r="1.6"/><circle cx="390" cy="96" r="1.6"/><circle cx="390" cy="106" r="1.6"/><circle cx="390" cy="136" r="1.6"/><circle cx="390" cy="146" r="1.6"/><circle cx="390" cy="156" r="1.6"/><circle cx="390" cy="166" r="1.6"/><circle cx="390" cy="176" r="1.6"/><circle cx="400" cy="66" r="1.6"/><circle cx="400" cy="76" r="1.6"/><circle cx="400" cy="86" r="1.6"/><circle cx="400" cy="96" r="1.6"/><circle cx="400" cy="106" r="1.6"/><circle cx="400" cy="136" r="1.6"/><circle cx="400" cy="146" r="1.6"/><circle cx="400" cy="156" r="1.6"/><circle cx="400" cy="166" r="1.6"/><circle cx="400" cy="176" r="1.6"/><circle cx="410" cy="66" r="1.6"/><circle cx="410" cy="76" r="1.6"/><circle cx="410" cy="86" r="1.6"/><circle cx="410" cy="96" r="1.6"/><circle cx="410" cy="106" r="1.6"/><circle cx="410" cy="136" r="1.6"/><circle cx="410" cy="146" r="1.6"/><circle cx="410" cy="156" r="1.6"/><circle cx="410" cy="166" r="1.6"/><circle cx="410" cy="176" r="1.6"/><circle cx="420" cy="66" r="1.6"/><circle cx="420" cy="76" r="1.6"/><circle cx="420" cy="86" r="1.6"/><circle cx="420" cy="96" r="1.6"/><circle cx="420" cy="106" r="1.6"/><circle cx="420" cy="136" r="1.6"/><circle cx="420" cy="146" r="1.6"/><circle cx="420" cy="156" r="1.6"/><circle cx="420" cy="166" r="1.6"/><circle cx="420" cy="176" r="1.6"/><circle cx="430" cy="66" r="1.6"/><circle cx="430" cy="76" r="1.6"/><circle cx="430" cy="86" r="1.6"/><circle cx="430" cy="96" r="1.6"/><circle cx="430" cy="106" r="1.6"/><circle cx="430" cy="136" r="1.6"/><circle cx="430" cy="146" r="1.6"/><circle cx="430" cy="156" r="1.6"/><circle cx="430" cy="166" r="1.6"/><circle cx="430" cy="176" r="1.6"/><circle cx="440" cy="66" r="1.6"/><circle cx="440" cy="76" r="1.6"/><circle cx="440" cy="86" r="1.6"/><circle cx="440" cy="96" r="1.6"/><circle cx="440" cy="106" r="1.6"/><circle cx="440" cy="136" r="1.6"/><circle cx="440" cy="146" r="1.6"/><circle cx="440" cy="156" r="1.6"/><circle cx="440" cy="166" r="1.6"/><circle cx="440" cy="176" r="1.6"/><circle cx="450" cy="66" r="1.6"/><circle cx="450" cy="76" r="1.6"/><circle cx="450" cy="86" r="1.6"/><circle cx="450" cy="96" r="1.6"/><circle cx="450" cy="106" r="1.6"/><circle cx="450" cy="136" r="1.6"/><circle cx="450" cy="146" r="1.6"/><circle cx="450" cy="156" r="1.6"/><circle cx="450" cy="166" r="1.6"/><circle cx="450" cy="176" r="1.6"/><circle cx="460" cy="66" r="1.6"/><circle cx="460" cy="76" r="1.6"/><circle cx="460" cy="86" r="1.6"/><circle cx="460" cy="96" r="1.6"/><circle cx="460" cy="106" r="1.6"/><circle cx="460" cy="136" r="1.6"/><circle cx="460" cy="146" r="1.6"/><circle cx="460" cy="156" r="1.6"/><circle cx="460" cy="166" r="1.6"/><circle cx="460" cy="176" r="1.6"/><circle cx="470" cy="66" r="1.6"/><circle cx="470" cy="76" r="1.6"/><circle cx="470" cy="86" r="1.6"/><circle cx="470" cy="96" r="1.6"/><circle cx="470" cy="106" r="1.6"/><circle cx="470" cy="136" r="1.6"/><circle cx="470" cy="146" r="1.6"/><circle cx="470" cy="156" r="1.6"/><circle cx="470" cy="166" r="1.6"/><circle cx="470" cy="176" r="1.6"/><circle cx="480" cy="66" r="1.6"/><circle cx="480" cy="76" r="1.6"/><circle cx="480" cy="86" r="1.6"/><circle cx="480" cy="96" r="1.6"/><circle cx="480" cy="106" r="1.6"/><circle cx="480" cy="136" r="1.6"/><circle cx="480" cy="146" r="1.6"/><circle cx="480" cy="156" r="1.6"/><circle cx="480" cy="166" r="1.6"/><circle cx="480" cy="176" r="1.6"/><circle cx="490" cy="66" r="1.6"/><circle cx="490" cy="76" r="1.6"/><circle cx="490" cy="86" r="1.6"/><circle cx="490" cy="96" r="1.6"/><circle cx="490" cy="106" r="1.6"/><circle cx="490" cy="136" r="1.6"/><circle cx="490" cy="146" r="1.6"/><circle cx="490" cy="156" r="1.6"/><circle cx="490" cy="166" r="1.6"/><circle cx="490" cy="176" r="1.6"/><circle cx="500" cy="66" r="1.6"/><circle cx="500" cy="76" r="1.6"/><circle cx="500" cy="86" r="1.6"/><circle cx="500" cy="96" r="1.6"/><circle cx="500" cy="106" r="1.6"/><circle cx="500" cy="136" r="1.6"/><circle cx="500" cy="146" r="1.6"/><circle cx="500" cy="156" r="1.6"/><circle cx="500" cy="166" r="1.6"/><circle cx="500" cy="176" r="1.6"/><circle cx="510" cy="66" r="1.6"/><circle cx="510" cy="76" r="1.6"/><circle cx="510" cy="86" r="1.6"/><circle cx="510" cy="96" r="1.6"/><circle cx="510" cy="106" r="1.6"/><circle cx="510" cy="136" r="1.6"/><circle cx="510" cy="146" r="1.6"/><circle cx="510" cy="156" r="1.6"/><circle cx="510" cy="166" r="1.6"/><circle cx="510" cy="176" r="1.6"/><circle cx="520" cy="66" r="1.6"/><circle cx="520" cy="76" r="1.6"/><circle cx="520" cy="86" r="1.6"/><circle cx="520" cy="96" r="1.6"/><circle cx="520" cy="106" r="1.6"/><circle cx="520" cy="136" r="1.6"/><circle cx="520" cy="146" r="1.6"/><circle cx="520" cy="156" r="1.6"/><circle cx="520" cy="166" r="1.6"/><circle cx="520" cy="176" r="1.6"/><circle cx="530" cy="66" r="1.6"/><circle cx="530" cy="76" r="1.6"/><circle cx="530" cy="86" r="1.6"/><circle cx="530" cy="96" r="1.6"/><circle cx="530" cy="106" r="1.6"/><circle cx="530" cy="136" r="1.6"/><circle cx="530" cy="146" r="1.6"/><circle cx="530" cy="156" r="1.6"/><circle cx="530" cy="166" r="1.6"/><circle cx="530" cy="176" r="1.6"/><circle cx="540" cy="66" r="1.6"/><circle cx="540" cy="76" r="1.6"/><circle cx="540" cy="86" r="1.6"/><circle cx="540" cy="96" r="1.6"/><circle cx="540" cy="106" r="1.6"/><circle cx="540" cy="136" r="1.6"/><circle cx="540" cy="146" r="1.6"/><circle cx="540" cy="156" r="1.6"/><circle cx="540" cy="166" r="1.6"/><circle cx="540" cy="176" r="1.6"/><circle cx="550" cy="66" r="1.6"/><circle cx="550" cy="76" r="1.6"/><circle cx="550" cy="86" r="1.6"/><circle cx="550" cy="96" r="1.6"/><circle cx="550" cy="106" r="1.6"/><circle cx="550" cy="136" r="1.6"/><circle cx="550" cy="146" r="1.6"/><circle cx="550" cy="156" r="1.6"/><circle cx="550" cy="166" r="1.6"/><circle cx="550" cy="176" r="1.6"/><circle cx="560" cy="66" r="1.6"/><circle cx="560" cy="76" r="1.6"/><circle cx="560" cy="86" r="1.6"/><circle cx="560" cy="96" r="1.6"/><circle cx="560" cy="106" r="1.6"/><circle cx="560" cy="136" r="1.6"/><circle cx="560" cy="146" r="1.6"/><circle cx="560" cy="156" r="1.6"/><circle cx="560" cy="166" r="1.6"/><circle cx="560" cy="176" r="1.6"/><circle cx="570" cy="66" r="1.6"/><circle cx="570" cy="76" r="1.6"/><circle cx="570" cy="86" r="1.6"/><circle cx="570" cy="96" r="1.6"/><circle cx="570" cy="106" r="1.6"/><circle cx="570" cy="136" r="1.6"/><circle cx="570" cy="146" r="1.6"/><circle cx="570" cy="156" r="1.6"/><circle cx="570" cy="166" r="1.6"/><circle cx="570" cy="176" r="1.6"/><circle cx="580" cy="66" r="1.6"/><circle cx="580" cy="76" r="1.6"/><circle cx="580" cy="86" r="1.6"/><circle cx="580" cy="96" r="1.6"/><circle cx="580" cy="106" r="1.6"/><circle cx="580" cy="136" r="1.6"/><circle cx="580" cy="146" r="1.6"/><circle cx="580" cy="156" r="1.6"/><circle cx="580" cy="166" r="1.6"/><circle cx="580" cy="176" r="1.6"/><circle cx="590" cy="66" r="1.6"/><circle cx="590" cy="76" r="1.6"/><circle cx="590" cy="86" r="1.6"/><circle cx="590" cy="96" r="1.6"/><circle cx="590" cy="106" r="1.6"/><circle cx="590" cy="136" r="1.6"/><circle cx="590" cy="146" r="1.6"/><circle cx="590" cy="156" r="1.6"/><circle cx="590" cy="166" r="1.6"/><circle cx="590" cy="176" r="1.6"/><circle cx="600" cy="66" r="1.6"/><circle cx="600" cy="76" r="1.6"/><circle cx="600" cy="86" r="1.6"/><circle cx="600" cy="96" r="1.6"/><circle cx="600" cy="106" r="1.6"/><circle cx="600" cy="136" r="1.6"/><circle cx="600" cy="146" r="1.6"/><circle cx="600" cy="156" r="1.6"/><circle cx="600" cy="166" r="1.6"/><circle cx="600" cy="176" r="1.6"/><circle cx="610" cy="66" r="1.6"/><circle cx="610" cy="76" r="1.6"/><circle cx="610" cy="86" r="1.6"/><circle cx="610" cy="96" r="1.6"/><circle cx="610" cy="106" r="1.6"/><circle cx="610" cy="136" r="1.6"/><circle cx="610" cy="146" r="1.6"/><circle cx="610" cy="156" r="1.6"/><circle cx="610" cy="166" r="1.6"/><circle cx="610" cy="176" r="1.6"/><circle cx="620" cy="66" r="1.6"/><circle cx="620" cy="76" r="1.6"/><circle cx="620" cy="86" r="1.6"/><circle cx="620" cy="96" r="1.6"/><circle cx="620" cy="106" r="1.6"/><circle cx="620" cy="136" r="1.6"/><circle cx="620" cy="146" r="1.6"/><circle cx="620" cy="156" r="1.6"/><circle cx="620" cy="166" r="1.6"/><circle cx="620" cy="176" r="1.6"/><circle cx="630" cy="66" r="1.6"/><circle cx="630" cy="76" r="1.6"/><circle cx="630" cy="86" r="1.6"/><circle cx="630" cy="96" r="1.6"/><circle cx="630" cy="106" r="1.6"/><circle cx="630" cy="136" r="1.6"/><circle cx="630" cy="146" r="1.6"/><circle cx="630" cy="156" r="1.6"/><circle cx="630" cy="166" r="1.6"/><circle cx="630" cy="176" r="1.6"/></g>
<path d="M35 121H645" stroke="currentColor" stroke-dasharray="2 4" opacity="0.4"/>
<rect x="236" y="58" width="29" height="126" fill="currentColor" opacity="0.12"/>
<g fill="none" stroke="currentColor" stroke-width="1.5"><rect x="34" y="80" width="202" height="82" rx="3"/><rect x="18" y="110" width="16" height="22"/></g>
<g fill="currentColor"><circle cx="40" cy="86" r="2.6"/><circle cx="40" cy="156" r="2.6"/><circle cx="50" cy="86" r="2.6"/><circle cx="50" cy="156" r="2.6"/><circle cx="60" cy="86" r="2.6"/><circle cx="60" cy="156" r="2.6"/><circle cx="70" cy="86" r="2.6"/><circle cx="70" cy="156" r="2.6"/><circle cx="80" cy="86" r="2.6"/><circle cx="80" cy="156" r="2.6"/><circle cx="90" cy="86" r="2.6"/><circle cx="90" cy="156" r="2.6"/><circle cx="100" cy="86" r="2.6"/><circle cx="100" cy="156" r="2.6"/><circle cx="110" cy="86" r="2.6"/><circle cx="110" cy="156" r="2.6"/><circle cx="120" cy="86" r="2.6"/><circle cx="120" cy="156" r="2.6"/><circle cx="130" cy="86" r="2.6"/><circle cx="130" cy="156" r="2.6"/><circle cx="140" cy="86" r="2.6"/><circle cx="140" cy="156" r="2.6"/><circle cx="150" cy="86" r="2.6"/><circle cx="150" cy="156" r="2.6"/><circle cx="160" cy="86" r="2.6"/><circle cx="160" cy="156" r="2.6"/><circle cx="170" cy="86" r="2.6"/><circle cx="170" cy="156" r="2.6"/><circle cx="180" cy="86" r="2.6"/><circle cx="180" cy="156" r="2.6"/><circle cx="190" cy="86" r="2.6"/><circle cx="190" cy="156" r="2.6"/><circle cx="200" cy="86" r="2.6"/><circle cx="200" cy="156" r="2.6"/><circle cx="210" cy="86" r="2.6"/><circle cx="210" cy="156" r="2.6"/><circle cx="220" cy="86" r="2.6"/><circle cx="220" cy="156" r="2.6"/><circle cx="230" cy="86" r="2.6"/><circle cx="230" cy="156" r="2.6"/></g>
<rect x="273" y="128" width="94" height="56" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
<g fill="currentColor"><circle cx="280" cy="156" r="2.6"/><circle cx="290" cy="156" r="2.6"/><circle cx="300" cy="156" r="2.6"/><circle cx="310" cy="156" r="2.6"/><circle cx="320" cy="156" r="2.6"/><circle cx="330" cy="156" r="2.6"/><circle cx="340" cy="156" r="2.6"/><circle cx="350" cy="156" r="2.6"/><circle cx="360" cy="156" r="2.6"/></g>
<path d="M40 176V190H330V176M50 176V190M70 176V190M80 176V190M300 176V190M310 176V190M320 176V190" fill="none" stroke="#2e9d5b" stroke-width="2.5"/>
<path d="M280 166V212" stroke="#d0312d" stroke-width="2.5"/><path d="M290 166V200" stroke="currentColor" stroke-width="2.5"/>
<circle cx="280" cy="212" r="3" fill="#d0312d"/><circle cx="290" cy="200" r="3" fill="currentColor"/>
<path d="M120 66V52H400V66" fill="none" stroke="#2e9d5b" stroke-width="2.5"/>
<g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M400 76L370 42"/><rect x="376.0" y="55.0" width="18" height="8" fill="var(--bg,white)" fill-opacity="0" transform="rotate(-131.4 385.0 59.0)"/><path d="M400 86L430 30"/><circle cx="415.0" cy="58.0" r="5"/><path d="M400 96L440 96"/><rect x="411.0" y="92.0" width="18" height="8" fill="var(--bg,white)" fill-opacity="0" transform="rotate(0.0 420.0 96.0)"/></g>
<circle cx="370" cy="42" r="3" fill="#d0312d"/><circle cx="430" cy="30" r="3" fill="currentColor"/>
<g fill="currentColor" font-family="sans-serif" text-anchor="middle"><text x="340" y="62" font-size="9">R3</text><text x="438" y="58" font-size="9">C1</text><text x="420" y="112" font-size="9">R4</text></g>
<rect x="436" y="100" width="28" height="42" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="450" cy="121" r="7" fill="none" stroke="currentColor"/>
<g fill="currentColor"><circle cx="440" cy="106" r="2.6"/><circle cx="440" cy="136" r="2.6"/><circle cx="460" cy="106" r="2.6"/><circle cx="460" cy="136" r="2.6"/></g>
<path d="M460 146V200" stroke="currentColor" stroke-width="2.5"/><circle cx="460" cy="200" r="3" fill="currentColor"/>
<rect x="485" y="58" width="150" height="126" rx="3" fill="none" stroke="currentColor" stroke-dasharray="4 3" opacity="0.6"/>
<g fill="currentColor" font-family="sans-serif" font-size="11" text-anchor="middle">
<text x="40" y="248" font-size="9" opacity="0.7">1</text>
<text x="80" y="248" font-size="9" opacity="0.7">5</text>
<text x="130" y="248" font-size="9" opacity="0.7">10</text>
<text x="180" y="248" font-size="9" opacity="0.7">15</text>
<text x="230" y="248" font-size="9" opacity="0.7">20</text>
<text x="280" y="248" font-size="9" opacity="0.7">25</text>
<text x="330" y="248" font-size="9" opacity="0.7">30</text>
<text x="380" y="248" font-size="9" opacity="0.7">35</text>
<text x="430" y="248" font-size="9" opacity="0.7">40</text>
<text x="480" y="248" font-size="9" opacity="0.7">45</text>
<text x="530" y="248" font-size="9" opacity="0.7">50</text>
<text x="580" y="248" font-size="9" opacity="0.7">55</text>
<text x="630" y="248" font-size="9" opacity="0.7">60</text>
<text x="135" y="126">Pico (A1)</text>
<text x="26" y="104" font-size="9">USB</text>
<text x="250" y="268" font-size="10">antenna:</text><text x="250" y="280" font-size="10">keep clear</text>
<text x="320" y="140" font-size="10">microSD</text>
<text x="450" y="160" font-size="10">SW1</text>
<text x="560" y="126" opacity="0.7">audio, stage 9</text>
<text x="120" y="74" font-size="9" text-anchor="start" dx="4">32</text>
<text x="60" y="150" font-size="9">1-5</text>
<text x="40" y="290" font-size="10" text-anchor="start">green: Pico 1, 2, 4, 5 to SD 3-6</text>
<text x="260" y="48" font-size="10" text-anchor="start">Pico 32 (GP27)</text>
</g>
</svg>
</div>

- **Columns 21-23: nothing.** The Pico's Wi-Fi antenna is at this end.
- **The microSD breakout** on the same side of the centre gap as Pico pins
  1-5, which it connects to, in nine neighbouring columns (here 25-33), so
  each of its pins has a row of its own. Turn it so you can reach the card
  slot. Run its four green wires low along the board's edge rather than
  over the antenna end.
- **The reset button** straddles the centre gap a little further on (here
  columns 41-43), the way a chip does.
- **R3, C1 and R4** share one column on the Pico 32 side (here 37), next to
  the button. A green wire brings Pico 32 (GP27) there; R3 reaches the +
  rail, C1 the GND rail, and R4 the button's column.
- **Columns 46-60** stay free for the audio stage (stage 9).

Any free columns past the antenna work; only the connections matter.

### Reset button

MIA watches its GP27 (Pico 32) for a reset request. R3 holds it high, C1
debounces the button, and R4 limits the current when the button discharges
C1.

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 250" width="100%" style="max-width:600px" role="img" aria-label="Reset button schematic. R3, 10 kilohm, runs from 3.3 V down to a node that goes to Pico 32 (GP27). From the node, C1, 1 microfarad, goes down to GND, and R4, 100 ohm, goes right to the reset button SW1, whose other side goes to GND. Wire colours: red for 3.3 V, black for GND, green for the GP27 node and for the link from R4 to SW1.">
<g fill="none" stroke-width="2.5"><path d="M220 30V50" stroke="#d0312d"/><path d="M220 100V130" stroke="#2e9d5b"/><path d="M90 130H330M220 130V150" stroke="#2e9d5b"/><path d="M380 130H420" stroke="#2e9d5b"/>
<path d="M220 162V200M420 160V200M200 200H240M206 208H234M213 216H227M400 200H440M406 208H434M413 216H427" stroke="currentColor"/></g>
<g fill="none" stroke="#d0312d" stroke-width="2.5"><path d="M200 30H240"/></g>
<g fill="none" stroke="currentColor" stroke-width="2"><rect x="210" y="50" width="20" height="50"/><path d="M200 150H240M200 162H240"/><rect x="330" y="122" width="50" height="16"/><path d="M420 130V140M420 160V150"/><path d="M420 140L432 155" /><circle cx="420" cy="140" r="2.5" fill="currentColor"/><circle cx="420" cy="160" r="2.5" fill="currentColor"/><path d="M432 140h10M437 140v-8"/></g>
<circle cx="220" cy="130" r="4" fill="#2e9d5b"/><circle cx="90" cy="130" r="4" fill="#2e9d5b"/>
<g fill="currentColor" font-family="sans-serif" font-size="12">
<text x="250" y="34">3.3 V</text><text x="240" y="80">R3 10 kΩ</text><text x="250" y="160">C1 1 µF</text><text x="330" y="112">R4 100 Ω</text><text x="446" y="152">SW1</text>
<text x="90" y="118" text-anchor="middle">Pico 32 (GP27)</text><text x="220" y="236" text-anchor="middle">GND</text><text x="420" y="236" text-anchor="middle">GND</text>
<text x="20" y="200" font-size="11"><tspan fill="#d0312d">red</tspan> 3.3 V</text><text x="20" y="216" font-size="11">black GND</text><text x="20" y="232" font-size="11"><tspan fill="#2e9d5b">green</tspan> the rest</text>
</g>
</svg>
</div>

While the button is up, R3 keeps C1 charged and Pico 32 at 3.3 V. Pressing
it empties C1 through R4 at once, so Pico 32 goes low. When you let go, R3
refills C1 slowly (10 kΩ × 1 µF = 10 ms), so the contacts' bouncing can't
pull Pico 32 back up and down: MIA sees one clean press.

| Part | Value | First leg | Second leg | Notes |
| --- | --- | --- | --- | --- |
| R3 | 10 kΩ | 3.3 V | Pico 32 (GP27) | Pull-up |
| C1 | 1 µF | Pico 32 (GP27) | GND | Debounce; ceramic, either way round |
| R4 | 100 Ω | Pico 32 (GP27) | SW1 | |
| SW1 | reset button | R4 | GND | |

A 6 × 6 mm switch has four legs in two pairs that are always joined. Use two
legs that are diagonally opposite each other: those are always on opposite
sides of the switch.

Most of these legs go straight into their rows and rails. Where a leg
doesn't reach and you need a wire, the colours follow the drawing above:
red to 3.3 V, black to GND, and green for everything on the Pico 32 node
and for the link from R4 to the button.

### microSD breakout

The Adafruit 4682 has its own pull-ups and capacitors. Its pins, left to
right with the card slot facing you, are 3V, GND, CLK, SO, SI, CS, DAT1,
DAT2 and DET; the tables call them `SD 1` to `SD 9`.

| From | To | Signal | Wire | Notes |
| --- | --- | --- | --- | --- |
| SD 1 | 3.3 V | 3.3 V | red | `3V` |
| SD 2 | GND | GND | black | |
| SD 3 | Pico 4 (GP2) | SD_SCK | green | `CLK` |
| SD 4 | Pico 1 (GP0) | SD_MISO | green | `SO` |
| SD 5 | Pico 5 (GP3) | SD_MOSI | green | `SI` |
| SD 6 | Pico 2 (GP1) | SD_CS | green | `CS` |

Leave SD 7, 8 and 9 (DAT1, DAT2, card detect) unconnected.

## Check

**Before you plug in**, run the
[power-up checks](../breadboard.md#before-you-power-up) on what you just
added.

1. Before plugging in, beep SD 1 against GND: silent.
2. Put the SD card in and plug in the USB cable. MIA reads `WIFI.CFG` and
   joins the network only at power-on, so the card must be in first.
3. Open the console and type `status`. The `SD:` line says `ready` and
   names the card type, for example `SD:     ready  card:SDHC/SDXC
   fs:unmounted`. `fs:unmounted` is right: MIA mounts the card at power-on
   only long enough to read `WIFI.CFG`, and mounts it again when the
   kernel first uses it.

   The `Status:` line lists `SD` among its flags: the card initialized.
4. Type `status wifi`. `config:` says `WIFI.CFG`, `mode:` says `sta`, and
   `ip:` is MIA's address on your network. Write it down: the video client
   needs it from stage 6.
5. Measure Pico 31 (GP26, the CPU's reset line, RESB): 3.3 V. Hold the
   button down: it drops to 0 V, because MIA holds the CPU in reset while
   the button is down. Let go and it goes back to 3.3 V.
6. Measure Pico 32: 3.3 V with the button up, about 0.03 V held down (R4 and
   R3 divide the 3.3 V).
7. See the button reset MIA. Type `exec pause`: `status` shows
   `Exec:   Paused (PHI2 stopped low)`, and Pico 27 (PHI2) reads 0 V. Press
   the button: `status` shows `Exec:   Running` again, and Pico 27 is back
   to about 1.65 V.

What the button resets: MIA holds the CPU in reset and puts itself back in
`Bootloader` mode. Its registers are cleared and its loader rebuilt, a
paused clock runs again, audio stops, open files close, and the error
queue empties. The clock speed, Wi-Fi, the console and MIA's RAM stay as
they are; keeping the speed is on purpose, so stage 5 can slow the clock
and then press RESET to watch the loader.

Without a meter, an LED on Pico 31 (the "high" way, see
[How to wire an LED](../breadboard.md#how-to-wire-an-led-for-a-check)) goes
out while you hold the button.

## With a scope

Put the scope on Pico 32 and trigger on a falling edge, then press the
button. The edge falls fast (C1 discharges through 100 Ω) and climbs back
slowly as R3 charges C1, with a time constant of 10 ms. Put the second
channel on Pico 31: RESB falls soon after Pico 32 crosses the Pico's input
threshold, and rises again once Pico 32 has climbed back past it after you
let go.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| `SD: not ready`, `card:none` | Card not seated; SD 1/SD 2 not powered; an SD wire on the wrong Pico pin |
| `SD: ready` but `config: build` | The card isn't FAT32, there's no `WIFI.CFG` in its top folder, or the file breaks a rule; MIA prints the reason at power-on |
| `Exec:` stays `Paused` after the button | MIA didn't see the press: check Pico 32 drops to 0 V |
| `(no IP)` | Wrong SSID or password; the network is 5 GHz only (the Pico 2 W uses 2.4 GHz) |
| RESB stays at 3.3 V with the button held | The switch legs used are one joined pair; use diagonal legs |
| Pico 32 sits near 0 V all the time | C1 or the switch shorted to GND |
