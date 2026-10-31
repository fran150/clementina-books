# Troubleshooting

The first rule: a check that fails points at the stage you just built. Go
back to that stage's tables and check every row against the board, with the
power off and the multimeter on continuity, before suspecting anything
older.

The second rule: when something gets warm, unplug at once. A chip in
backwards, or with its power pins swapped, is the most common way to lose a
part, and the quickest to catch.

## By symptom

| Symptom | Stage | Likely cause | What to check |
| --- | --- | --- | --- |
| The Pico drops off USB or resets when you plug in | Any | A short between 3.3 V and GND | Unplug; beep the rails; pull chips one by one |
| A chip gets hot | Any | Seated backwards, or VCC and GND swapped | Pin 1 and the power pins |
| A far rail reads under 3.25 V | 1 | A rail split not bridged, a loose rail link | Beep the rails end to end |
| No `SD` flag in `status` | 2 | Card not seated, breakout unpowered | SD 1 and SD 2 |
| `status wifi` shows `config: build` | 2 | No valid `WIFI.CFG` | The file's name and rules (*User's Manual*, appendix G) |
| RESB doesn't follow the button | 2 | Switch legs on one joined pair | Use diagonal legs |
| A glue output reads about 1.5 V | 3 | A floating input | Every unused gate input on GND, every test jumper in |
| No LED moves in the NOP test | 4 | RESB low, no PHI2, RDY low, BE low | U1.40, U1.37, U1.2, U1.36 |
| The NOP count starts somewhere other than `1110 1010` | 4 | A data line off its `$EA` level | The eight 4.7 kΩ resistors |
| The count skips or repeats | 4 | Two address lines swapped or shorted | A0-A7 rows; neighbouring rows |
| `status` stays in `Bootloader` | 5 | The CPU can't run MIA's loader | D0-D7, A0-A4, RWB, `MIACS` and PHI2 between U1 and the Pico |
| `Normal`, but no banner | 6 | Wi-Fi or the video client; or the base RAM | `status wifi`; the client's `--server`; U4.20, U4.22, U4.27 |
| WozMon writes don't stick | 6 | `~WE` not reaching the RAM, RWB not reaching U9 | U9.6 pulses low while writing |
| A value turns up at two addresses | 6 | An address line open at the RAM | The stage 6 table names it |
| `PRINT "HELLO"` prints garbage | 6-7 | Expected until the extended RAM is in | Stage 8 |
| No cursor blink | 7 | VIA not selected, or D2 reversed | U3.24 at 3.3 V, U3.23 on `~IOCS0`, D2's band at U3.21 |
| Port B LEDs stay dark | 7 | RS lines swapped, LEDs reversed | RS0 is U3.38, RS3 is U3.35 |
| Strings still print garbage | 8 | Extended RAM not selected | U2.22 for `~EXRAMCS` pulses |
| Every bank shows the same value | 8 | PA lines on the wrong U2 pins | U2 pins 1, 2, 3, 30, 31 |
| One ear silent | 9 | That channel's chain | R6/R9 on the right Pico pin; C3/C5 to tip/ring |
| Random crashes, worse at speed | 10 | Missing decoupling, long PHI2 or `~WE` wires, weak ground | Add GND links, shorten those wires, lower the speed |

## The console is your best tool

MIA's console works from stage 1 to the end, and needs nothing on the
board:

| Command | Tells you |
| --- | --- |
| `status` | Everything at once: `Mode:` (`Bootloader` or `Normal`), PHI2, the status flags, Wi-Fi, SD |
| `status speed` | The applied PHI2 speed |
| `status wifi` | Where the Wi-Fi settings came from, and MIA's address |
| `speed HZ` | Set PHI2, from 1 Hz to 8 MHz |
| `exec pause`, `exec resume` | Stop PHI2 (held low) and start it again |
| `errors list` | MIA's queued errors |
| `input console` | Type into Clementina from the console, without the video client; `Ctrl+Q` leaves |

A slow clock makes every signal on the board easy to follow, with a
multimeter, an LED or a scope: `speed 10` and an LED shows a line's state,
and `exec pause` freezes the CPU mid-instruction so you can measure every
pin at leisure. `speed 1200000` puts it back.
