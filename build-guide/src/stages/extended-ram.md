# Stage 8: Extended RAM

The AS6C4008 holds 512 KB, seen by the CPU through a 16 KB window at
`$8000-$BFFF`. The VIA's PA0-PA4 pick which of its 32 banks shows in the
window. BASIC uses bank 0 as the top of its workspace, which is where it
keeps its strings, so this stage is the one that makes BASIC complete.

## What you add

The extended RAM (U2) on board 2, after the base RAM, with its 100 nF
capacitor. Its low address and data lines tap the same chains as U4. Its
top five address lines come from the VIA's port A instead, and they sit on
scattered pins: watch those rows.

| U2 pin | Signal | Connects to | Notes |
| --- | --- | --- | --- |
| 1 | PA4 | U3.6 | `A18`, bank bit 4 |
| 2 | PA2 | U3.4 | `A16`, bank bit 2 |
| 3 | PA0 | U3.2 | `A14`, bank bit 0 |
| 4 | A12 | U1.22 | |
| 5 | A7 | U1.16 | |
| 6 | A6 | U1.15 | |
| 7 | A5 | U1.14 | |
| 8 | A4 | U1.13 | |
| 9 | A3 | U1.12 | |
| 10 | A2 | U1.11 | |
| 11 | A1 | U1.10 | |
| 12 | A0 | U1.9 | |
| 13 | D0 | U1.33 | `DQ0` |
| 14 | D1 | U1.32 | `DQ1` |
| 15 | D2 | U1.31 | `DQ2` |
| 16 | GND | GND | `VSS` |
| 17 | D3 | U1.30 | `DQ3` |
| 18 | D4 | U1.29 | `DQ4` |
| 19 | D5 | U1.28 | `DQ5` |
| 20 | D6 | U1.27 | `DQ6` |
| 21 | D7 | U1.26 | `DQ7` |
| 22 | ~EXRAMCS | U7.3 | `~CE`: selected for `$8000-$BFFF` |
| 23 | A10 | U1.19 | |
| 24 | ~OE | U9.3 | |
| 25 | A11 | U1.20 | |
| 26 | A9 | U1.18 | |
| 27 | A8 | U1.17 | |
| 28 | A13 | U1.23 | |
| 29 | ~WE | U9.6 | |
| 30 | PA3 | U3.5 | `A17`, bank bit 3 |
| 31 | PA1 | U3.3 | `A15`, bank bit 1 |
| 32 | 3.3 V | 3.3 V | `VCC` |

The CPU's A14 and A15 don't go to U2: the window is 16 KB, so the chip sees
A0-A13 from the CPU, and its own A14-A18 are the bank number.

After power-up the VIA's port A pins float until the kernel sets them. The
kernel does that first thing at every reset, selecting bank 0, and the
loader only writes below `$8000`, so they need no pull-downs.

## Check

### BASIC

1. Plug in, start the video client, and press RESET. `23647 BYTES FREE` is
   the same as in stage 6: BASIC counted bank 0 from the start, it just
   couldn't use it until now.
2. Now strings work. `PRINT "HELLO"` prints `HELLO`, and:

   ```basic
   A$="CLEMEN"+"TINA":PRINT A$
   ```

   ```text
   CLEMENTINA
   ```

   The joined string is built at the top of bank 0, just under `$C000`.
3. Fill the window with strings and check them all. Type this program,
   then `RUN` (it takes a few seconds):

   <!-- example: cycles=80000000 -->
   ```basic
   10 B$="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
   20 B$=B$+B$+B$+B$:DIM A$(69)
   30 FOR I=0 TO 69:A$(I)=B$+STR$(I):NEXT
   40 FOR I=0 TO 69
   50 IF A$(I)<>B$+STR$(I) THEN PRINT "BAD";I
   60 NEXT:PRINT "DONE"
   ```

   ```text
   DONE
   ```

   It prints `DONE` and no `BAD` line. Clementina's strings keep a display
   attribute with every character, two bytes each, so the 70 strings of 108
   characters fill some 15 KB, from `$C000` down: nearly all of bank 0.

### Every bank line

The kernel already set `$C003` (port A's direction) to `1F`, PA0-PA4 as
outputs, and selected bank 0 in `$C001`. In WozMon (`MON`), store a different
value at `8000` in the banks that each turn on one bank line:

```text
C001: 00
8000: 11
C001: 01
8000: 22
C001: 02
8000: 33
C001: 04
8000: 44
C001: 08
8000: 55
C001: 10
8000: 66
```

Now go back through the same six banks and read `8000` in each (`C001: 00`,
then `8000`; `C001: 01`, then `8000`; and so on). They read `11`, `22`,
`33`, `44`, `55` and `66`. If two banks show the same value, the PA line
that tells them apart is open or on the wrong U2 pin.

Then test the window's own A13 in bank 0: `C001: 00`, `8000: 00`,
`A000: 0E`, then read `8000`: still `00`.

Press RESET to go back to BASIC, which needs bank 0 selected.

## With a scope

Run the string test above and put channel 1 on `~EXRAMCS` (U2.22) and
channel 2 on `~WE` (U2.29). `~WE` pulses while `~EXRAMCS` is low as BASIC
writes its strings into bank 0. Compare a `~WE` pulse here with the one at
U4.27 in stage 6: the same gate drives both, so they should look alike.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| `PRINT "HELLO"` still prints garbage | U2 not selected: probe U2.22 for `~EXRAMCS` pulses, check U7.3 |
| Strings break only in the big test | An address line open at U2 (the base RAM test doesn't cover U2's pins) |
| Every bank shows the same value | PA0-PA4 on the wrong U2 pins: re-check rows 1, 2, 3, 30 and 31 |
| Banks pair up (`01` reads as `00`) | That one PA line is open |
