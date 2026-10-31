# Stage 9: Audio

MIA makes sound itself: it mixes four voices at 48 kHz and plays them as
PWM on GP4 (left) and GP5 (right). Each channel goes through the same small
stage to the jack: a divider and filter that turn the PWM into a line-level
signal of about 1 V peak to peak, and a capacitor that blocks the DC.

## What you add

The audio stage and the jack on board 1. Both channels are the same: build
the left one, test it, then copy it for the right. The parts of one channel
meet at a single row, the filter node; the tables call the left one
`filter L` and the right one `filter R`.

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 170" width="100%" style="max-width:640px" role="img" aria-label="One audio channel: Pico GP4 through 220 ohm R6 to the filter node; from the node, 100 ohm R7 and 100 nF C2 to GND, and 47 microfarad C3 with plus on the node to the jack tip; 1.8 kilohm R8 from the tip to GND.">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<path d="M20 40h40M60 32h50v16h-50zM110 40h120"/>
<circle cx="170" cy="40" r="3" fill="currentColor"/>
<path d="M150 40v30M142 70h16v40h-16zM150 110v30"/>
<path d="M200 40v40M188 80h24M188 88h24M200 88v52"/>
<path d="M230 40h40M270 30v20M278 30v20M278 40h102"/>
<circle cx="330" cy="40" r="3" fill="currentColor"/>
<path d="M330 40v30M322 70h16v40h-16zM330 110v30"/>
<path d="M120 140h240M380 40h40"/>
</g>
<g fill="currentColor" font-family="sans-serif" font-size="12">
<text x="10" y="28">GP4</text><text x="62" y="25">R6 220 Ω</text><text x="125" y="20">filter L</text>
<text x="100" y="95">R7 100 Ω</text><text x="210" y="100">C2 100 nF</text>
<text x="244" y="25">C3 47 µF</text><text x="262" y="62" font-size="10">+</text>
<text x="340" y="95">R8 1.8 kΩ</text><text x="400" y="30">jack tip</text>
<text x="230" y="160">GND</text>
</g>
</svg>
</div>

### Left channel

| Part | Value | First leg | Second leg | Notes |
| --- | --- | --- | --- | --- |
| R6 | 220 Ω | Pico 6 (GP4) | R7, C2 | Into `filter L` |
| R7 | 100 Ω | R6, C2 | GND | |
| C2 | 100 nF | R6, R7 | GND | Ceramic, either way round |
| C3 | 47 µF | R6, R7, C2 | jack tip | Electrolytic: the + leg on `filter L` |
| R8 | 1.8 kΩ | jack tip | GND | Bleeds the capacitor's charge |

### Right channel

| Part | Value | First leg | Second leg | Notes |
| --- | --- | --- | --- | --- |
| R9 | 220 Ω | Pico 7 (GP5) | R10, C4 | Into `filter R` |
| R10 | 100 Ω | R9, C4 | GND | |
| C4 | 100 nF | R9, R10 | GND | |
| C5 | 47 µF | R9, R10, C4 | jack ring | Electrolytic: the + leg on `filter R` |
| R11 | 1.8 kΩ | jack ring | GND | |

| From | To | Signal | Notes |
| --- | --- | --- | --- |
| jack sleeve | GND | GND | |

On a stereo jack the tip is left, the ring right and the sleeve ground. If
yours is on a breakout board, its pins are usually marked T, R and S (or L,
R and G).

## Check

The sound doesn't need the CPU: MIA can play its built-in test tune from the
console.

1. Plug in headphones, at low volume to start with.
2. On the console, type `audio seq test 0`. MIA plays a looping arpeggio
   (C, E, G) on voice 0. You should hear it in both ears; if one side is
   silent, that channel is miswired.
3. Type `audio seq stop 0`.
4. While it plays, the tip and ring read about 0 V DC to GND: the 47 µF
   capacitors block the DC level of about 0.5 V that sits on the filter
   nodes (the PWM's average of 1.65 V, divided by R6 and R7).
5. From BASIC (with the extended RAM in, BASIC is complete), play middle C
   for half a second, the first example in the *User's Manual*'s chapter
   "Sound and music". Type it, then `RUN`:

   ```basic
   10 SNDON
   20 WAVE 0,1:ADSR 0,0,8,12,6
   30 NOTE 0,48
   40 DELAY 500
   50 GATE 0,0
   ```

## With a scope

- **Before the filter.** Probe Pico 6 (GP4) while the test tune plays: a
  0-3.3 V PWM at about 146 kHz at the default speed (the Pico's 150 MHz
  clock divided by 1024). The duty cycle changes with the sound.
- **After the filter.** Probe `filter L` (the R6-R7-C2 row): the carrier is
  mostly gone and the tune shows as a waveform of up to about 1 V peak to
  peak, riding on about 0.5 V of DC.
- **At the jack.** Probe the tip: the same waveform, now centred on 0 V,
  about 1 V peak to peak.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| Silence in both ears | Jack sleeve not on GND, or the jack's pins misidentified |
| One side silent | That channel's chain: R6/R9 to the right Pico pin, C3/C5 to the tip/ring |
| A loud hum or buzz | Headphones plugged in with the sleeve open |
| Very quiet and dull | The 47 µF capacitor in backwards |
