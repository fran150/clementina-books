# Breadboard basics and layout

## Ground rules

These hold for every stage:

- **Unplug the USB cable before you add or move any wire.** The Pico's USB
  is the only power source, so unplugged means off.
- **Run the [power-up checks](#before-you-power-up) before you plug in**,
  every time you have added or moved something. A minute with the meter
  catches the short that would otherwise burn a chip.
- **3.3 V only.** The Pico's pin 39 (VSYS) and pin 40 (VBUS, the USB's 5 V)
  stay unconnected for the whole build. Put tape over the free holes in
  their rows so nothing lands there by accident.
- **Every chip gets a 100 nF capacitor across its power pins**, in the same
  step you place the chip, with short legs, as close to the pins as the
  board allows. These are the eight decoupling capacitors (C6-C13 on the
  PCB); the wiring tables don't list them one by one.
- **Mark pin 1 on every chip** before it goes in (a dot of paint, or a
  printed pin label stuck on top), so a chip never goes in backwards.
- **Keep wires short and flat**, and use the colour the wiring table gives
  each wire (see [Wire colours](#wire-colours)).

## Wire colours

The whole guide uses six colours, the ones a basic box of hookup wire comes
with. Every wiring table has a **Wire** column with the colour of each wire,
so you never have to choose one:

| Colour | For |
| --- | --- |
| Red | 3.3 V |
| Black | GND |
| Yellow | The address bus, A0-A15 |
| Blue | The data bus, D0-D7 |
| White | The clock, PHI2, alone so you can find it when probing |
| Green | Everything else: RWB, reset, interrupts, chip selects, the VIA's ports, SD and audio |

A "-" in the Wire column means that pin needs no wire in that step: it stays
unconnected, its wire comes in a later stage, or a part's leg goes straight
into its row. When a resistor or capacitor leg can't reach, extend it with a
wire of the colour of the signal it goes to (red when it goes to 3.3 V).

The wires you add only for a check, such as the jumpers that hold the glue
logic's inputs high or low in stage 3 and the LEDs' links, can be any
colour: they come out again once the check is done.

## Before you power up

A short between 3.3 V and GND, 5 V reaching the 3.3 V rail, or a chip in
backwards are the mistakes that damage parts, and the multimeter finds all
of them before any power is on. With the USB cable unplugged and the meter
on its continuity (beep) setting:

1. **+ against GND, on every board: silent.** This is the most important
   check. The Pico joins all its GND pins inside it, so even one GND wire
   pushed into a + rail by mistake connects the two rails and makes the
   meter beep. A capacitor across the rails can give a short chirp as it
   charges; that's fine. A steady beep is a short: find it before you go on.
2. **Pico 39 (VSYS) and Pico 40 (VBUS) against the + rail: silent.** These
   carry the USB's 5 V. If either reaches the 3.3 V rail, every chip on the
   board gets 5 V.
3. **Every chip you just added: its power pin beeps to +, its ground pin to
   GND.** A chip in backwards puts its power pins on the wrong rails and
   heats up as soon as power comes on. The power pins are the rows whose
   signal is 3.3 V or GND in the chip's wiring table.
4. **Every wire you just added, end to end: beeps.** Touch the two rows it
   joins. This finds a wire end that isn't pushed fully in, or that landed
   one hole off.
5. **Neighbouring rows: silent.** Touch the row of each new pin against the
   rows on either side. This finds a bent leg or a stray strand bridging two
   rows.
6. **Look over the board** for clipped legs or bits of wire lying on it.

Then plug in, and watch the first few seconds:

- Measure DC volts between + and GND: 3.2-3.4 V.
- If the reading is much lower, anything gets warm, or the computer warns
  about the USB port, **unplug at once**. The USB port and the Pico's
  regulator both limit the current, so a short caught within a few seconds
  rarely damages anything.

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

Each breadboard has two rails down each long side, a + rail and a GND rail.
The aim is to make all six + rails one 3.3 V net and all six GND rails one
GND net, so every chip can take power from the rail beside it. You make the
links in stage 0, before any chip goes in, and stage 1 feeds them from the
Pico's pin 36 (3.3 V) and its GND pins.

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" style="max-width:720px" role="img" aria-label="Three breadboards side by side, each with a + rail and a GND rail down both long sides. On every board a red wire joins the two + rails across the top end and a black wire joins the two GND rails across the bottom end. Between each pair of neighbouring boards a red wire joins + to +, and two black wires join GND to GND, one near the top and one near the bottom. Where a rail is split in the middle, a short wire of the same colour bridges the split.">
<g fill="none" stroke="currentColor" stroke-width="1.5"><rect x="20" y="40" width="160" height="290" rx="6"/><rect x="220" y="40" width="160" height="290" rx="6"/><rect x="420" y="40" width="160" height="290" rx="6"/></g>
<g fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity="0.5"><path d="M100 60v250"/><path d="M300 60v250"/><path d="M500 60v250"/></g>
<g fill="none" stroke="#d0312d" stroke-width="4" opacity="0.4"><path d="M32 56V160M32 210V314"/><path d="M168 56V160M168 210V314"/><path d="M232 56V160M232 210V314"/><path d="M368 56V160M368 210V314"/><path d="M432 56V160M432 210V314"/><path d="M568 56V160M568 210V314"/></g>
<g fill="none" stroke="currentColor" stroke-width="4" opacity="0.4"><path d="M46 56V160M46 210V314"/><path d="M154 56V160M154 210V314"/><path d="M246 56V160M246 210V314"/><path d="M354 56V160M354 210V314"/><path d="M446 56V160M446 210V314"/><path d="M554 56V160M554 210V314"/></g>
<g fill="none" stroke="#d0312d" stroke-width="2.5"><path d="M32 58V28H168V58"/><path d="M32 156c10 8 10 50 0 58"/><path d="M168 156c10 8 10 50 0 58"/><path d="M232 58V28H368V58"/><path d="M232 156c10 8 10 50 0 58"/><path d="M368 156c10 8 10 50 0 58"/><path d="M432 58V28H568V58"/><path d="M432 156c10 8 10 50 0 58"/><path d="M568 156c10 8 10 50 0 58"/><path d="M168 90H232"/><path d="M368 90H432"/></g>
<g fill="none" stroke="currentColor" stroke-width="2.5"><path d="M46 312V346H154V312"/><path d="M46 156c10 8 10 50 0 58"/><path d="M154 156c10 8 10 50 0 58"/><path d="M246 312V346H354V312"/><path d="M246 156c10 8 10 50 0 58"/><path d="M354 156c10 8 10 50 0 58"/><path d="M446 312V346H554V312"/><path d="M446 156c10 8 10 50 0 58"/><path d="M554 156c10 8 10 50 0 58"/><path d="M154 118H246M154 280H246"/><path d="M354 118H446M354 280H446"/></g>
<g fill="#d0312d"><circle cx="32" cy="58" r="3"/><circle cx="232" cy="58" r="3"/><circle cx="432" cy="58" r="3"/><circle cx="168" cy="58" r="3"/><circle cx="368" cy="58" r="3"/><circle cx="568" cy="58" r="3"/><circle cx="168" cy="90" r="3"/><circle cx="368" cy="90" r="3"/><circle cx="232" cy="90" r="3"/><circle cx="432" cy="90" r="3"/></g>
<g fill="currentColor"><circle cx="46" cy="312" r="3"/><circle cx="246" cy="312" r="3"/><circle cx="446" cy="312" r="3"/><circle cx="154" cy="312" r="3"/><circle cx="354" cy="312" r="3"/><circle cx="554" cy="312" r="3"/><circle cx="154" cy="118" r="3"/><circle cx="154" cy="280" r="3"/><circle cx="354" cy="118" r="3"/><circle cx="354" cy="280" r="3"/><circle cx="246" cy="118" r="3"/><circle cx="246" cy="280" r="3"/><circle cx="446" cy="118" r="3"/><circle cx="446" cy="280" r="3"/></g>
<g fill="currentColor" font-family="sans-serif" font-size="12" text-anchor="middle">
<text x="100" y="14">Board 1: MIA</text>
<text x="300" y="14">Board 2: CPU and memory</text>
<text x="500" y="14">Board 3: glue logic and VIA</text>
<text x="32" y="189" font-size="10">+</text>
<text x="46" y="189" font-size="10">G</text>
<text x="154" y="189" font-size="10">G</text>
<text x="168" y="189" font-size="10">+</text>
<text x="100" y="185" font-size="10" opacity="0.7">chips</text>
<text x="232" y="189" font-size="10">+</text>
<text x="246" y="189" font-size="10">G</text>
<text x="354" y="189" font-size="10">G</text>
<text x="368" y="189" font-size="10">+</text>
<text x="300" y="185" font-size="10" opacity="0.7">chips</text>
<text x="432" y="189" font-size="10">+</text>
<text x="446" y="189" font-size="10">G</text>
<text x="554" y="189" font-size="10">G</text>
<text x="568" y="189" font-size="10">+</text>
<text x="500" y="185" font-size="10" opacity="0.7">chips</text>
<text x="300" y="372" font-size="11">red: + to + · black: GND to GND (G) · the short loops bridge split rails</text>
</g>
</svg>
</div>

1. **Across each board.** A red wire joins the board's two + rails at one
   end, and a black wire joins its two GND rails at the other end.
2. **Between neighbours.** Where two boards meet, a red wire joins the + rail
   on one side of the seam to the + rail on the other, and a black wire does
   the same for GND.
3. **A second GND link** between each pair of neighbours, at the other end
   of the seam. Every signal returns through GND, and two short paths keep
   the ground the same on every board once the clock is fast.
4. **Split rails.** Many breadboards cut each rail in the middle (the line
   printed along the rail has a gap there). Bridge each cut with a short wire
   of the rail's colour. Stage 0 has you find them with the meter.

Which rail is + depends on your board: follow its printed red (+) and blue
(GND) lines rather than the order in the drawing. A wire may cross over the
other rail; that's fine, wires are insulated.

In the wiring tables, `3.3 V` and `GND` mean the nearest rail.
