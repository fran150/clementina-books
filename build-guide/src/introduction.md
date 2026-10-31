# About this book

This book takes you through building a Clementina on breadboards, from bare
boards to a machine that boots BASIC, plays sound and runs at full speed.
The parts are the rev 1 board's own parts, so when the build works, they
move to the printed circuit board unchanged.

You don't need to have built a computer before. You do need to be able to
read a pin number off a chip, strip a wire, and use a multimeter.
[Breadboard basics and layout](breadboard.md) covers the rest.

## How the build works

The build has eleven stages. Each stage adds one block of the machine and
ends with a check that proves the block works before you go on. When a check
fails, the fault is almost always in what you just wired, which is a much
smaller place to look than the whole machine.

| Stage | What you add | It passes when |
| --- | --- | --- |
| 0 | Prepare: boards, rails, SD card, firmware | Every rail beeps end to end |
| 1 | Power and MIA (the Pico) | MIA's console answers; rails read 3.25-3.35 V |
| 2 | Reset button and microSD | RESB follows the button; the card mounts; Wi-Fi joins |
| 3 | Glue logic | The decoders give the right chip select for every address |
| 4 | The CPU, running free on NOPs | LEDs on the address lines count up |
| 5 | MIA on the bus | The CPU runs MIA's loader; the console says `Normal` |
| 6 | Base RAM | BASIC prints `READY.`; WozMon's memory tests pass |
| 7 | The VIA | The cursor blinks; LEDs follow port B |
| 8 | Extended RAM | BASIC's strings work; every bank keeps its own value |
| 9 | Audio | MIA's test tune plays in your headphones |
| 10 | Speed | Every check passes at each step up to the fastest stable speed |

Each stage chapter has the same parts:

- **What you add** and why it comes now.
- **Wiring tables**, chip pin by chip pin.
- **Check**: the test that proves the stage works. Every check needs only a
  multimeter, eight LEDs with resistors, MIA's USB console and the video
  client.
- **With a scope** (optional): what an oscilloscope adds, such as the shape
  of the clock, how chip selects line up with it, and the glue logic's
  delays. A 50 MHz, 2-channel scope is enough for everything in this book.
- **If it fails**: the likely causes for this stage. Chapter
  [Troubleshooting](troubleshooting.md) collects them all.

Nothing in the build needs a custom ROM, a single-step button or a logic
analyzer. MIA's own firmware does the work: it makes the CPU's clock at any
speed from 1 Hz to 8 MHz, holds and releases reset, and loads the kernel.

## How MIA runs the machine

Clementina has no ROM chip and no clock oscillator. The Raspberry Pi Pico 2
W, called **MIA**, does both jobs:

- **The clock.** MIA drives the CPU's PHI2 pin from its GP21. It starts at
  1.2 MHz, and the console command `speed` changes it. `exec pause` stops the
  clock with PHI2 held low, and `exec resume` starts it again.
- **Reset.** MIA drives the CPU's and the VIA's reset line from GP26. When
  you press the RESET button, MIA holds the CPU in reset and restarts its
  loader.
- **Booting.** At every reset MIA starts in loader mode. It answers the CPU
  at `$FFE0-$FFFF` with a ten-byte program and a reset vector pointing at
  it. The CPU runs that program to copy the kernel image (kernel, WozMon and
  BASIC, about 24 KB) into RAM from `$0400` up, one byte at a time, reading
  each byte from MIA. When the last byte is read, MIA switches to normal
  mode and resets the CPU into the kernel.
- **Everything else.** MIA is also the screen and keyboard (over Wi-Fi, to
  the video client on your computer), the sound, and the SD card.

That is why the build starts with the Pico alone: it is the one part that
works by itself, and every later check uses it.

## How to read the tables

`U1.37` means pin 37 of chip U1. `Pico 27` means pin 27 of the Pico, counted
the way the Pico's own pinout counts, and `Pico 27 (GP21)` adds the GPIO
name the firmware uses. `SD 3` is pin 3 of the microSD breakout. Signals
that are active low start with `~`, as in `~WE`.

The reference designators (U1, R3, C14...) are the ones printed on the
schematic and the PCB:

| Ref | Part |
| --- | --- |
| U1 | W65C02S CPU |
| U2 | AS6C4008 512 KB SRAM (extended RAM) |
| U3 | W65C22S VIA |
| U4 | AS6C62256 32 KB SRAM (base RAM) |
| U6 | 74AC138, I/O decoder |
| U7 | 74AC08, AND gates |
| U8 | 74AC138, memory decoder |
| U9 | 74AC00, NAND gates |
| A1 | Raspberry Pi Pico 2 WH (MIA) |

Every wiring table in this book is checked against the netlist of the rev 1
board in [clementina-hardware](https://github.com/fran150/clementina-hardware)
by `tools/check-wiring.mjs`, and [Appendix A](appendix/pins.md) lists every
pin of every chip, generated from the same netlist.

## The other books

- The *User's Manual* covers using the finished machine: the video client,
  BASIC, the SD card.
- *Mapping Clementina* lists every address the CPU and MIA can see.
- The *Hardware & MIA Technical Reference* explains why the board is
  designed the way it is. This book only says what to wire and how to prove
  it works.
