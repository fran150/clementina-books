# Stage 1: Power and MIA

The Pico comes first because it is the one part that works on its own, and
everything later uses it: it powers the board, makes the clock, and gives
you a console to ask what is going on.

## What you add

The Pico on board 1, straddling the centre gap with its USB end at the
board's edge, and C14, the 22 µF bulk capacitor next to its 3.3 V pin.

| From | To | Signal | Notes |
| --- | --- | --- | --- |
| Pico 36 (3V3) | 3.3 V | 3.3 V | Feeds the whole build |
| Pico 3 | GND | GND | |
| Pico 8 | GND | GND | |
| Pico 13 | GND | GND | |
| Pico 18 | GND | GND | |
| Pico 23 | GND | GND | |
| Pico 28 | GND | GND | |
| Pico 33 (AGND) | GND | GND | The schematic ties the analog ground to GND too |
| Pico 38 | GND | GND | |

| Part | Value | First leg (+) | Second leg | Notes |
| --- | --- | --- | --- | --- |
| C14 | 22 µF | 3.3 V | GND | Right next to Pico 36; long leg (+) to 3.3 V |

Leave these Pico pins unconnected, as on the PCB: 30 (RUN), 34 (GP28),
35 (ADC_VREF), 37 (3V3_EN), 39 (VSYS) and 40 (VBUS).

## Flash the firmware

1. Before plugging in, beep the + rail against the GND rail: silent.
2. Hold down the Pico's **BOOTSEL** button, plug the USB cable into your
   computer, and let go. A drive called `RP2350` appears.
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
