# Meet Clementina

Clementina is a small home computer in the spirit of the Commodore 64. You
turn it on, it says `READY.`, and you type BASIC. Its processor is a WDC
W65C02S, a modern version of the 6502 that powered the Apple II, the
Commodore 64 and the NES.

Next to the processor sits **MIA**, the Multifunction Interface Adapter: a
Raspberry Pi Pico 2 W running Clementina's own firmware. MIA does the jobs
that whole chips did in an 1980s computer. It makes the processor's clock,
loads the kernel and BASIC into memory when you switch on, and handles the
screen, the sound, the keyboard, mouse and gamepads, and the SD card.

## What it can do

| | |
| --- | --- |
| Processor | W65C02S at 1.2 MHz when it starts; programs can run it faster |
| Memory | 32 KiB of main RAM, 512 KiB of extended RAM in 32 banks, and 256 KiB of RAM inside MIA for graphics, sound and files |
| Screen | 320 × 200 pixels; a 40 × 25 text screen on top of a scrolling tile background and 256 sprites |
| Colors | 16 palettes of 8 colors each, every color picked from 65,536 |
| Sound | 4 voices, each sine, pulse, sawtooth, triangle or noise, with an envelope and stereo position; music plays in the background on its own |
| Input | keyboard, mouse and up to four gamepads |
| Storage | a microSD card, with files and folders your computer can read too |
| Language | Clementina BASIC: Microsoft BASIC with more than 100 extra keywords for graphics, sound, input and files |
| Monitor | WozMon, for looking at memory and running machine code |

When BASIC starts it has 23,647 bytes free for your program and its
variables. Graphics and music live in MIA's own memory, so they don't take
from that.

## Where the picture comes from

Clementina has no video connector and no keyboard connector. The screen and
the keyboard live on another computer: MIA joins your Wi-Fi network and
sends the picture to the **video client**, a program on your PC, Mac or
Linux computer, which draws it in a window and sends your keyboard, mouse
and gamepads back. Chapter 2 sets this up.

This is also why the emulator feels just like the real machine: it runs the
same kernel and BASIC, and it talks to the same video client.

## A tour of the board

> The first board has not been built yet, so this tour describes the rev 1
> design from its schematic. Photos will replace this note once a board
> exists.

The rev 1 board measures 172.7 × 108.6 mm. Holding it with the text the
right way up:

- **MIA** sits at the top left: the Pico 2 W, with its USB port on the top
  edge. That USB port powers the whole computer, and it is also MIA's
  console (see [WIFI.CFG and the USB console](appendix/wifi-console.md)).
- **The microSD slot** is on the left edge, on a small breakout board.
- **The audio jack** and **the RESET button** are also on the left edge.
  The jack is a 3.5 mm stereo socket for headphones or powered speakers.
- **The chips** run in a row across the middle: the 65C02 processor, the
  32 KiB main RAM, the 512 KiB extended RAM and the VIA, a chip with
  general-purpose input and output pins and timers. Every chip sits in a
  socket.
- **The user port** is on the right edge: pins from the VIA for your own
  projects.
- **The expansion headers** run along the bottom edge, for add-on cards.

[Connectors at a glance](appendix/connectors.md) lists every connector. The
*Hardware & MIA Technical Reference* has the pinouts and the schematic.

> **Planned for a later board.** Rev 1 has no screen or keyboard connector,
> and the Pico's USB port is its power input. A later board is planned with
> a separate power input, so a USB keyboard can plug into the Pico, and with
> local video output (likely from a second Pico). Nothing in this manual
> depends on either.
