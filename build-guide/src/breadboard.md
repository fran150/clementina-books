# Breadboard basics and layout

## Ground rules

These hold for every stage:

- **Unplug the USB cable before you add or move any wire.** The Pico's USB
  is the only power source, so unplugged means off.
- **3.3 V only.** The Pico's pin 39 (VSYS) and pin 40 (VBUS, the USB's 5 V)
  stay unconnected for the whole build. Put tape over the free holes in
  their rows so nothing lands there by accident.
- **Every chip gets a 100 nF capacitor across its power pins**, in the same
  step you place the chip, with short legs, as close to the pins as the
  board allows. These are the eight decoupling capacitors (C6-C13 on the
  PCB); the wiring tables don't list them one by one.
- **Mark pin 1 on every chip** before it goes in (a dot of paint, or a
  printed pin label stuck on top), so a chip never goes in backwards.
- **Keep wires short and flat**, and give each group of signals its own
  colour. One suggestion: red for 3.3 V, black for GND, yellow for address,
  blue for data, green for control, white for the clock.

## Reading a chip's pins

Hold a DIP chip with its notch or dot at the top. Pin 1 is at the top left,
the pins count down the left side, and continue from the bottom of the right
side back up to the top. On a 40-pin chip, pin 20 is bottom left, pin 21
bottom right, and pin 40 top right.

A chip straddles the breadboard's centre gap, so each pin gets its own row
of five holes. That leaves four free holes per pin on each side: plan one
wire per hole.

The Pico straddles the gap the same way. Its pins count like a DIP chip's,
with pin 1 next to the USB connector.

## How to wire an LED for a check

The checks use the LEDs two ways:

- **To see a signal that is high**, put the 1 kΩ resistor from the signal to
  the LED's long leg (anode), and the LED's short leg (cathode) to GND. The
  LED lights while the signal is high.
- **To see an active-low signal** such as a chip select, put the LED's long
  leg to 3.3 V through the 1 kΩ resistor and its short leg on the signal. The
  LED lights while the signal is low, that is, while the chip is selected.

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 170" width="100%" style="max-width:620px" role="img" aria-label="Left: signal, 1 kilohm resistor, LED, GND; the LED lights while the signal is high. Right: 3.3 V, 1 kilohm resistor, LED, signal; the LED lights while the signal is low.">
<g fill="none" stroke="currentColor" stroke-width="2">
<path d="M30 40h40M70 30h50v20h-50zM120 40h40"/>
<path d="M160 25v30l30-15z"/><path d="M190 25v30"/><path d="M190 40h30v50"/><path d="M205 100h30M210 108h20M215 116h10"/>
<path d="M290 40h40M330 30h50v20h-50zM380 40h40"/>
<path d="M420 25v30l30-15z"/><path d="M450 25v30"/><path d="M450 40h40"/>
</g>
<g fill="currentColor" font-family="sans-serif" font-size="13">
<text x="20" y="25">signal</text><text x="78" y="72">1 kΩ</text><text x="150" y="80">LED</text><text x="232" y="96">GND</text>
<text x="20" y="150">Lights while the signal is high</text>
<text x="285" y="25">3.3 V</text><text x="338" y="72">1 kΩ</text><text x="410" y="80">LED</text><text x="458" y="25">signal</text>
<text x="285" y="150">Lights while the signal is low</text>
<text x="146" y="20" font-size="11">long leg</text><text x="406" y="20" font-size="11">long leg</text>
</g>
</svg>
</div>

Each LED draws about 1.3 mA, which every output in Clementina drives without
trouble. Take the LEDs off when a check is done, unless the chapter says to
leave them.

## The layout

The build fits on three breadboards of about 15 × 5.5 cm (roughly 60 rows each),
following the PCB's left-to-right order:

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 330" width="100%" style="max-width:720px" role="img" aria-label="Three breadboards side by side. Board 1: Pico with USB at the outer edge and an antenna keep-out at its inner end, microSD breakout, reset button, audio stage. Board 2: CPU U1, base RAM U4, extended RAM U2. Board 3: glue logic U8, U7, U9, U6 and the VIA U3 with port B LEDs.">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="10" y="20" width="180" height="290" rx="6"/><rect x="210" y="20" width="180" height="290" rx="6"/><rect x="410" y="20" width="180" height="290" rx="6"/>
<rect x="60" y="40" width="80" height="110"/><rect x="88" y="28" width="24" height="14"/>
<rect x="45" y="150" width="110" height="18" stroke-dasharray="4 3"/>
<rect x="60" y="180" width="80" height="30"/><rect x="85" y="222" width="30" height="20"/><rect x="40" y="255" width="120" height="40"/>
<rect x="260" y="40" width="80" height="90"/><rect x="250" y="140" width="100" height="65"/><rect x="250" y="215" width="100" height="80"/>
<rect x="465" y="35" width="70" height="35"/><rect x="465" y="75" width="70" height="30"/><rect x="465" y="110" width="70" height="30"/><rect x="465" y="145" width="70" height="35"/>
<rect x="460" y="190" width="80" height="90"/>
<path d="M565 195v80" stroke-dasharray="2 6" stroke-width="5"/>
</g>
<g fill="currentColor" font-family="sans-serif" font-size="12" text-anchor="middle">
<text x="100" y="14">Board 1: MIA</text><text x="300" y="14">Board 2: CPU and memory</text><text x="500" y="14">Board 3: glue logic and VIA</text>
<text x="100" y="38" font-size="9">USB</text><text x="100" y="100">Pico (A1)</text><text x="100" y="163" font-size="9">antenna: keep clear</text>
<text x="100" y="199">microSD</text><text x="100" y="236" font-size="9">SW1</text><text x="100" y="279">audio stage, jack</text>
<text x="300" y="89">CPU U1</text><text x="300" y="177">base RAM U4</text><text x="300" y="259">ext. RAM U2</text>
<text x="500" y="57">U8 '138</text><text x="500" y="94">U7 '08</text><text x="500" y="129">U9 '00</text><text x="500" y="167">U6 '138</text>
<text x="500" y="239">VIA U3</text><text x="565" y="292" font-size="9">LEDs</text>
</g>
</svg>
</div>

- **Board 1: MIA.** The Pico at one end, with its USB end at the board's
  edge, then the microSD breakout, the reset button and the audio stage. Keep
  about 6 mm past the Pico's antenna end (the end away from USB) free of
  wires: the Wi-Fi antenna is there.
- **Board 2: CPU and memory.** The CPU (U1), base RAM (U4) and extended RAM
  (U2) side by side. They share about 30 address and data lines, so keeping
  them together keeps those wires short.
- **Board 3: glue logic and VIA.** U8, U7, U9 and U6, then the VIA (U3),
  with the port B LEDs along the board's edge.

Signals run between neighbours: MIA feeds the CPU from board 1, the address
and data lines run along board 2, and the chip selects go to board 3.

Boards 2 and 3 are tight: about 50 rows of chips plus a row or two between
them. If your boards are shorter, or the wiring gets too dense to follow,
add a fourth board and give the VIA its own.

### Power rails

Bring 3.3 V from the Pico's pin 36 and GND to board 1's rails (stage 1 does
this). Then link the rails of every board, on both sides, with short wires,
and join the GND rails of neighbouring boards in at least two places. Many
breadboards split each rail in the middle: stage 0 finds and bridges those
splits.

In the wiring tables, `3.3 V` and `GND` mean the nearest rail.
