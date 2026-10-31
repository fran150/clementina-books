# Stage 2: Reset button and microSD

Both hang off the Pico alone, so they can be proven before the CPU exists.
The SD card also brings `WIFI.CFG`, so from this stage on MIA joins your
network at power-on.

## What you add

The reset button SW1 with its debounce parts, and the microSD breakout.

### Reset button

MIA watches its GP27 (Pico 32) for a reset request. R3 holds it high, C1
debounces the button, and R4 limits the current when the button discharges
C1.

| Part | Value | First leg | Second leg | Notes |
| --- | --- | --- | --- | --- |
| R3 | 10 kΩ | 3.3 V | Pico 32 (GP27) | Pull-up |
| C1 | 1 µF | Pico 32 (GP27) | GND | Debounce; ceramic, either way round |
| R4 | 100 Ω | Pico 32 (GP27) | SW1 | |
| SW1 | reset button | R4 | GND | |

A 6 × 6 mm switch has four legs in two pairs that are always joined. Use two
legs that are diagonally opposite each other: those are always on opposite
sides of the switch.

### microSD breakout

The Adafruit 4682 has its own pull-ups and capacitors. Its pins, left to
right with the card slot facing you, are 3V, GND, CLK, SO, SI, CS, DAT1,
DAT2 and DET; the tables call them `SD 1` to `SD 9`.

| From | To | Signal | Notes |
| --- | --- | --- | --- |
| SD 1 | 3.3 V | 3.3 V | `3V` |
| SD 2 | GND | GND | |
| SD 3 | Pico 4 (GP2) | SD_SCK | `CLK` |
| SD 4 | Pico 1 (GP0) | SD_MISO | `SO` |
| SD 5 | Pico 5 (GP3) | SD_MOSI | `SI` |
| SD 6 | Pico 2 (GP1) | SD_CS | `CS` |

Leave SD 7, 8 and 9 (DAT1, DAT2, card detect) unconnected.

## Check

1. Before plugging in, beep SD 1 against GND: silent.
2. Put the SD card in and plug in the USB cable. MIA reads `WIFI.CFG` and
   joins the network only at power-on, so the card must be in first.
3. Open the console and type `status`. The `Status:` line lists `SD` and
   `FS` among its flags (card present, filesystem mounted), and the `SD:`
   line says `ready` and `fs:mounted`.
4. Type `status wifi`. `config:` says `WIFI.CFG`, `mode:` says `sta`, and
   `ip:` is MIA's address on your network. Write it down: the video client
   needs it from stage 6.
5. Measure Pico 31 (GP26, the CPU's reset line, RESB): 3.3 V. Hold the
   button down: it drops to 0 V, because MIA holds the CPU in reset while
   the button is down. Let go and it goes back to 3.3 V.
6. Measure Pico 32: 3.3 V with the button up, about 0.03 V held down (R4 and
   R3 divide the 3.3 V).

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
| No `SD` flag | Card not seated; SD 1/SD 2 not powered |
| `SD` but no `FS` | The card isn't FAT32 |
| `config: build` | No `WIFI.CFG` in the card's top folder, or the file breaks a rule; MIA prints the reason at power-on |
| `(no IP)` | Wrong SSID or password; the network is 5 GHz only (the Pico 2 W uses 2.4 GHz) |
| RESB stays at 3.3 V with the button held | The switch legs used are one joined pair; use diagonal legs |
| Pico 32 sits near 0 V all the time | C1 or the switch shorted to GND |
