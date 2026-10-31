# A. Pin tables

Every pin of every chip and module on the breadboard, with the signal on it
and every other pin on the breadboard that it connects to. The tables are
generated from the rev 1 netlist by `tools/check-wiring.mjs`, so they are
the board, not a retyped copy of it.

"Also goes to" leaves out the PCB-only parts: the J1 and J2 expansion
headers, the J3 user port header, and the decoupling capacitors. Passive
parts appear by their leg: `R1.2` is leg 2 of R1, and for a diode or an
electrolytic capacitor, leg 1 is the band or the + leg.

{{#include ../../generated/pins.md:U1}}
{{#include ../../generated/pins.md:U2}}
{{#include ../../generated/pins.md:U3}}
{{#include ../../generated/pins.md:U4}}
{{#include ../../generated/pins.md:U6}}
{{#include ../../generated/pins.md:U7}}
{{#include ../../generated/pins.md:U8}}
{{#include ../../generated/pins.md:U9}}
{{#include ../../generated/pins.md:A1}}
{{#include ../../generated/pins.md:J5}}
