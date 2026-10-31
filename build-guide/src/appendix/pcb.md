# C. From breadboard to PCB

The rev 1 PCB uses exactly the parts of this build: every chip sits in a
socket and the Pico plugs into two female headers, so the parts move over
once the breadboard works. The factory bill of materials lists what gets
soldered (passives, diodes, sockets, headers, the jack and the button);
with those in place, the board needs no more soldering.

What changes:

- **Gone:** the `$EA` resistors, the LEDs and the optional VIA pull-ups. The
  PCB leaves CA1, CA2, CB1 and CB2 to the user port.
- **New:** the J1 and J2 expansion headers (with `~IOCS1`-`~IOCS7`, the
  buses, and +5 V from the Pico's VBUS) and the J3 user port (port B,
  CA1, CA2, CB1, CB2). The rules for cards on them are in the
  clementina-hardware README.
- **The antenna.** On the PCB the Pico sits inside the board, with a copper
  keep-out under and past its antenna. The stage 10 Wi-Fi comparison is the
  check to repeat there.
- **Speed.** The PCB's short tracks and ground pour usually run faster than
  a breadboard. Repeat the stage 10 checks on it.

On the PCB every part goes in at once, so the quickest test of a new board
is to plug everything in and look for `READY.` If it doesn't come, the
checks that need no part taken out still narrow it down: the rails and the
console (stage 1), the button and the card (stage 2), `Mode: Normal`
(stage 5), and the memory, VIA and bank tests of stages 6 to 8. The NOP test
of stage 4 has no place on the PCB, because `MIACS` is wired straight to the
Pico there.
