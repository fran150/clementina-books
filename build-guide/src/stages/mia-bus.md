# Stage 5: MIA on the bus

Now MIA answers the CPU. At every reset it puts its loader program at
`$FFE0` and a reset vector pointing at it, and the CPU runs the loader to
copy the kernel into RAM. There is no RAM yet, so the copies land nowhere,
but that doesn't matter for this check: the loader runs entirely out of
MIA's registers, so the CPU has to read and write MIA correctly about 24,000
times in a row to finish it. When it does, MIA switches to normal mode, and
the console tells you.

## What you add

1. Unplug the USB cable.
2. Take off the eight `$EA` resistors. From now on MIA and the RAM drive the
   data bus.
3. Take out the jumper from Pico 9 to GND.
4. Wire MIA's chip select and its interrupt diode:

| From | To | Signal | Notes |
| --- | --- | --- | --- |
| U9.8 | Pico 9 (GP6) | MIACS | High while the CPU is in `$E000-$FFFF` |

| Part | Value | First leg (band) | Second leg | Notes |
| --- | --- | --- | --- | --- |
| D1 | BAT85 | Pico 29 (GP22) | U1.4 | The band (cathode) faces the Pico |

MIA and the VIA share the CPU's `~IRQB` line. Each pulls it low through its
own diode and nothing ever drives it high, so R2 pulls it back up when
neither is asking.

## How the loader works

The loader is four instructions that MIA serves from `$FFE0`:

```text
FFE0  LDA #xx      ; xx is the next kernel byte, put there by MIA
FFE2  STA $0400    ; MIA steps this address by one after each byte
FFE5  STA $FFF1    ; tells MIA "next byte, please"
FFE8  BRA $FFE0
```

Each time the CPU writes `$FFF1`, MIA changes the `LDA` operand to the next
byte and adds one to the `STA` address. After the last byte, MIA holds the
CPU in reset, switches to normal mode and lets it go: now the reset vector
points into the kernel, in RAM. With no RAM the CPU then runs off into
whatever the floating bus reads. That's fine; the next stage gives it RAM.

Each byte takes 13 clock cycles, and the image is about 24 KB, so loading
takes about 0.27 s at 1.2 MHz.

## Check

1. Plug in the USB cable and open the console. Type `status`. The second
   line, `Mode:`, says `Normal`, and the `Status:` line includes `NORMAL`:
   the CPU ran the whole loader after power-on.
2. Now watch it happen slowly. Type `speed 20000` and press RESET. Right away
   type `status`: `Mode:` says `Bootloader`. About 16 seconds later, `status`
   says `Normal` again.
3. Type `speed 1200000`.

If `status` stays in `Bootloader`, the CPU couldn't finish the loader. The
fault is in the lines MIA and the CPU share: D0-D7, A0-A4, RWB, `MIACS` and
PHI2. Check them with the stage 4 tables, and try a slow `speed 20000` with
an LED on `MIACS` (the "high" way): it glows while the loader runs.

## With a scope

At 1.2 MHz, put channel 1 on `MIACS` (U9.8) and channel 2 on RWB (U1.34).
Set the trigger to single, on a falling edge of `MIACS`, and press RESET.

The loader's 13-cycle loop repeats every 10.8 µs. In each loop `MIACS` drops
for exactly one cycle: the one where `STA $0400` writes the byte to RAM
(an address below `$8000`). RWB goes low twice per loop, once for that RAM
write and once for `STA $FFF1`. Zoom in on one MIA write and check that RWB
is already low when PHI2 rises, and that `MIACS` and RWB are both stable
until after PHI2 falls.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| `Bootloader` forever | A D, A0-A4, RWB, `MIACS` or PHI2 line between the CPU and the Pico is open or swapped |
| Sometimes `Normal`, sometimes not | A loose wire on one of those lines, or a missing GND link between boards 1 and 2 |
| `status` shows a growing error count | Read them with `errors list` |
