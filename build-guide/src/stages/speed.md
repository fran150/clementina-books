# Stage 10: Speed

Everything so far ran at MIA's default 1.2 MHz. MIA can clock the CPU up to
8 MHz. How fast your breadboard runs depends on the glue logic's delays,
which don't change, and on the wiring, which on a breadboard adds
capacitance and ringing the PCB won't have. This stage finds your build's
limit.

Nothing new goes on the board.

## How far it should go

The glue logic is 74AC because 74HC is too slow at 3.3 V. With 74AC parts,
the chip-select paths meet the datasheets up to about 6.5 MHz with
worst-case parts, and typical parts reach 8 MHz. Two places set the limit:

- **The chip selects.** The VIA (and any expansion card) needs its select
  about 10 ns before PHI2 rises. The CPU's address appears some time after
  PHI2 falls, and the select comes one or two gate delays later; as the
  clock gets faster, PHI2's low half gets shorter, and the margin shrinks.
- **The write strobe.** `~WE` must rise within about 10 ns of PHI2 falling,
  because the CPU holds its address and data only that long. This doesn't
  depend on the clock speed, so slowing down never fixes it; it depends only
  on one 74AC00 gate and on the PHI2 and `~WE` wires.

| PHI2 | What to expect on a breadboard |
| --- | --- |
| 1.2 MHz | The default; must be solid |
| 2 MHz | Solid on a tidy breadboard |
| 4 MHz | Likely on a tidy breadboard |
| 6.5 MHz | The worst-case limit of the 74AC chip selects; breadboard wiring may stop short of it |
| 8 MHz | Typical parts reach it on the PCB; a breadboard pass is a bonus |

These are estimates, not measurements: this stage is where you measure.

## Check

Raise the clock from MIA's console in steps:

```text
speed 2000000
status speed
```

`status speed` shows the `applied:` value. Above 4.6875 MHz (the Pico's
150 MHz divided by 32), MIA also raises the Pico's own clock to 256 MHz to
make the faster PHI2; that is normal.

At each step:

1. Press RESET: the banner and `READY.` come up, and the cursor blinks
   faster in proportion (the blink counts clock cycles).
2. Run the stage 6 address test and the stage 8 bank test in WozMon, then
   RESET.
3. Run the stage 8 string test in BASIC: `DONE`, no `BAD`.
4. Leave BASIC idling at `READY.` for 10 minutes, then type something.

Record the highest speed that passes every check. Then go one step below
it for everyday use, and set that speed after each power-on (MIA starts at
1.2 MHz every time it powers up; RESET keeps the current speed).

If it fails early, before 4 MHz:

- shorten the PHI2 and `~WE` wires, and keep them away from the data bus;
- add GND links between the boards;
- check every chip's 100 nF capacitor sits right at its power pins;
- check that U9 really is a 74**AC**00.

## With a scope

- **The chip-select margin.** Run the counting program from stage 7, put
  channel 1 on PHI2 (U3.25) and channel 2 on `~IOCS0` (U3.23), and trigger
  on `~IOCS0` falling. Measure from `~IOCS0` falling to PHI2 rising at each
  speed. At 1.2 MHz the gap is hundreds of nanoseconds; it shrinks as PHI2's
  low half shrinks (62.5 ns at 8 MHz). When it gets near 10 ns, the VIA is
  at its limit. That is about the smallest gap a 50 MHz scope can measure,
  so treat the last few nanoseconds as an estimate.
- **The write strobe.** Run `10 POKE 640,0:GOTO 10`, put channel 1 on PHI2
  (U1.37) and channel 2 on `~WE` (U4.27), and trigger on `~WE` rising. `~WE`
  must rise within about 10 ns of PHI2 falling at every speed. The scope
  shows about 7-10 ns even when the real gap is smaller: if it shows much
  more, look for a long `~WE` wire or a slow (74HC) gate.
- **Edges.** At the top speed, look at PHI2 and `~WE` at the far end of
  their wires. Both edges should be clean, without overshoot or ringing
  that crosses back through the middle of the swing. A 50 MHz scope rounds
  the fastest edges, so a little softness is the scope, not the board.

## The Wi-Fi signal (optional)

The PCB puts the Pico's antenna inside the board, which costs a few dB of
Wi-Fi signal; the hardware README's rule is that more than about 6 dB
against a bare Pico means the antenna should move to the board edge in
rev 2. The breadboard has different surroundings, but the same comparison
tells you whether the wiring around the antenna hurts it.

MIA's console doesn't report signal strength, so use a phone Wi-Fi analyzer
app and MIA's own network: set `mode = ap` in `WIFI.CFG` (see stage 0). From
one fixed spot, read MIA's signal with the Pico in the build, then pull the
Pico out, power it alone from the same USB cable at the same place, and read
it again. Put `WIFI.CFG` back the way it was afterwards.
