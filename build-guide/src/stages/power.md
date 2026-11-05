# Stage 1: Power and MIA

The Pico comes first because it is the one part that works on its own, and
everything later uses it: it powers the board, makes the clock, and gives
you a console to ask what is going on.

## Parts

| Part | Qty | On the schematic | Notes |
| --- | --- | --- | --- |
| Raspberry Pi Pico 2 WH | 1 | MIA | Header pins already soldered |
| 22 µF electrolytic capacitor | 1 | C14 | Bulk capacitor at the Pico |
| USB cable for the Pico | 1 |  | Power and console |

## What you add

The Pico on board 1, straddling the centre gap with its USB end at the
board's edge, and C14, the 22 µF bulk capacitor next to its 3.3 V pin.

| From | To | Signal | Wire | Notes |
| --- | --- | --- | --- | --- |
| Pico 36 (3V3) | 3.3 V | 3.3 V | red | Feeds the whole build |
| Pico 3 | GND | GND | black | |
| Pico 8 | GND | GND | black | |
| Pico 13 | GND | GND | black | |
| Pico 18 | GND | GND | black | |
| Pico 23 | GND | GND | black | |
| Pico 28 | GND | GND | black | |
| Pico 33 (AGND) | GND | GND | black | The schematic ties the analog ground to GND too |
| Pico 38 | GND | GND | black | |

| Part | Value | First leg (+) | Second leg | Notes |
| --- | --- | --- | --- | --- |
| C14 | 22 µF | 3.3 V | GND | Right next to Pico 36; long leg (+) to 3.3 V |

C14 bridges the two rails right where 3.3 V enters the boards, as a
reservoir for the moments when every chip switches at once:

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 270" width="100%" style="max-width:640px" role="img" aria-label="Close-up of the Pico's USB end on board 1. A red wire runs from the row of Pico pin 36 (3V3) to the + rail, and a black wire from the row of pin 38 (GND) to the GND rail. C14, the 22 microfarad electrolytic capacitor, sits just below the red wire with its long leg (+) in the + rail and its striped short leg (minus) in the GND rail.">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="40" y="40" width="110" height="215" rx="4"/><rect x="80" y="26" width="30" height="16"/>
</g>
<g fill="none" stroke="#d0312d" stroke-width="4" opacity="0.4"><path d="M420 20V260"/></g>
<g fill="none" stroke="currentColor" stroke-width="4" opacity="0.4"><path d="M320 20V260"/></g>
<g fill="currentColor" opacity="0.45">
<circle cx="170" cy="60" r="2.5"/><circle cx="190" cy="60" r="2.5"/><circle cx="210" cy="60" r="2.5"/><circle cx="230" cy="60" r="2.5"/><circle cx="250" cy="60" r="2.5"/><circle cx="170" cy="80" r="2.5"/><circle cx="190" cy="80" r="2.5"/><circle cx="210" cy="80" r="2.5"/><circle cx="230" cy="80" r="2.5"/><circle cx="250" cy="80" r="2.5"/><circle cx="170" cy="100" r="2.5"/><circle cx="190" cy="100" r="2.5"/><circle cx="210" cy="100" r="2.5"/><circle cx="230" cy="100" r="2.5"/><circle cx="250" cy="100" r="2.5"/><circle cx="170" cy="120" r="2.5"/><circle cx="190" cy="120" r="2.5"/><circle cx="210" cy="120" r="2.5"/><circle cx="230" cy="120" r="2.5"/><circle cx="250" cy="120" r="2.5"/><circle cx="170" cy="140" r="2.5"/><circle cx="190" cy="140" r="2.5"/><circle cx="210" cy="140" r="2.5"/><circle cx="230" cy="140" r="2.5"/><circle cx="250" cy="140" r="2.5"/>
</g>
<g fill="currentColor">
<circle cx="150" cy="60" r="3.5"/><circle cx="150" cy="80" r="3.5"/><circle cx="150" cy="100" r="3.5"/><circle cx="150" cy="120" r="3.5"/><circle cx="150" cy="140" r="3.5"/>
</g>
<g fill="none" stroke-width="2.5">
<path d="M250 140H420" stroke="#d0312d"/><path d="M250 100H320" stroke="currentColor"/>
</g>
<circle cx="420" cy="140" r="3.5" fill="#d0312d"/><circle cx="320" cy="100" r="3.5" fill="currentColor"/>
<g fill="none" stroke="currentColor" stroke-width="2">
<path d="M320 190H345M395 190H420"/><rect x="345" y="175" width="50" height="30" rx="8"/>
</g>
<rect x="347" y="177" width="12" height="26" fill="currentColor" opacity="0.6"/>
<circle cx="320" cy="190" r="3.5" fill="currentColor"/><circle cx="420" cy="190" r="3.5" fill="#d0312d"/>
<g fill="currentColor" font-family="sans-serif" font-size="12">
<text x="95" y="20" text-anchor="middle" font-size="10">USB</text>
<text x="95" y="200" text-anchor="middle">Pico (A1)</text>
<text x="140" y="64" text-anchor="end" font-size="10">40</text><text x="140" y="84" text-anchor="end" font-size="10">39</text>
<text x="140" y="104" text-anchor="end" font-size="10">GND 38</text><text x="140" y="124" text-anchor="end" font-size="10">37</text>
<text x="140" y="144" text-anchor="end" font-size="10">3V3 36</text>
<text x="200" y="168" text-anchor="middle" font-size="10" opacity="0.8">pin rows</text>
<text x="320" y="14" text-anchor="middle">GND rail</text><text x="420" y="14" text-anchor="middle">+ rail</text>
<text x="370" y="228" text-anchor="middle">C14, 22 µF</text>
<text x="300" y="186" text-anchor="end" font-size="10">stripe, short leg (−)</text>
<text x="432" y="186" font-size="10">long leg (+)</text>
<text x="432" y="144" font-size="10">red wire</text><text x="268" y="94" font-size="10">black wire</text>
</g>
</svg>
</div>

- **The red wire** from pin 36's row lands on the + rail. Put C14's **long
  leg (+)** in the + rail a hole or two from it.
- Put its **short leg (−)**, on the side with the stripe printed on the can,
  in the GND rail right beside it. Nothing else connects to C14.
- **Check the stripe before you power up.** C14 is an electrolytic
  capacitor and only works one way round: put in backwards, it heats up and
  can fail.

The drawing shows only pins 36 to 40; the GND wires from the Pico's other
GND pins (the table above) go to the GND rail the same way.

Leave these Pico pins unconnected, as on the PCB: 30 (RUN), 34 (GP28),
35 (ADC_VREF), 37 (3V3_EN), 39 (VSYS) and 40 (VBUS).

## Flash the firmware

1. Before plugging in, run the
   [power-up checks](../breadboard.md#before-you-power-up). On this first
   power-up, checks 1 and 2 matter most: + must not beep to GND, and Pico 39
   and 40 must not beep to +.
2. Hold down the Pico's **BOOTSEL** button, plug the USB cable into your
   computer, and let go. A drive called `RP2350` appears. Measure + against
   GND right away: 3.2-3.4 V. Unplug at once if it's much lower or the Pico
   gets warm.
3. Copy `build/mia.uf2` onto it. The Pico restarts with MIA's firmware.
4. Open the Pico's serial port in your terminal: `/dev/ttyACM0` on Linux,
   `/dev/tty.usbmodem…` on macOS, a `COM` port on Windows. For example,
   `screen /dev/ttyACM0 115200`. Press RETURN to get MIA's `>` prompt.

From now on you only need BOOTSEL to change the firmware; plugging in the
USB cable starts MIA.

## Check

- Type `help`. MIA lists its commands: `status`, `errors`, `speed`, `wifi`,
  `input`, `audio`, `sd`, `exec`, `monitor` and `quit`.
- Type `status speed`. The first line is `applied:   1200000 Hz`: MIA is
  already making a 1.2 MHz clock, with no CPU to feed yet.
- Measure the + rail at the far end of every board: 3.25-3.35 V.
- Measure Pico 27 (GP21, PHI2) with the multimeter on DC volts: about 1.65 V.
  That is a 0-3.3 V square wave averaged by the meter, so the clock is
  running. Type `exec pause`: it drops to 0 V. Type `exec resume`: back to
  about 1.65 V.

There is no SD card yet, so `status wifi` shows `config:     build`: MIA
found no `WIFI.CFG` and fell back to the settings built into the firmware,
which normally leave Wi-Fi off (`mode:       off`). That is expected.

## With a scope

- **PHI2.** Probe Pico 27: a 1.2 MHz square wave from 0 to 3.3 V, high and
  low for the same time (MIA's PIO program holds it 16 cycles each way). Try
  `speed 100000` and `speed 4000000` and watch the period follow; put it back
  with `speed 1200000`.
- **The rail.** AC-couple the scope on the + rail at the far end of board 3.
  You should see a few tens of millivolts of noise at most. Much more points
  at a poor rail link or a missing GND link between boards.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| The Pico doesn't appear as `RP2350` | BOOTSEL not held while plugging in; a charge-only USB cable |
| The Pico drops off USB or resets when plugged in | A short between 3.3 V and GND: unplug, beep the rails |
| No console port | The firmware didn't flash; copy `mia.uf2` again |
| The far rail reads low | A rail split not bridged, or a loose rail link |
