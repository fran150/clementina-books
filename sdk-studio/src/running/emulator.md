# The emulator

The emulator, `clementina-emulator`, runs the whole machine on your computer: the
65C02, its RAM and VIA, and MIA with its video, input, sound and SD card. It
is cycle-accurate for the CPU, and it boots the same kernel and BASIC the
board does. With the video client it is the way to play a game before the
board exists, and the one this book uses throughout.

## Starting it

```text
$ clementina-emulator --sd ~/games/catch
$ clementina-video-client
```

Start each in its own terminal. The emulator's terminal shows its debugger.
The video client's window shows Clementina's screen and sends it the
keyboard, the mouse and gamepads. Both default to the same addresses
(`127.0.0.1:6502` for video, `127.0.0.1:6503` for input), so they find each
other with no options, and either can start first.

## The SD card

`--sd` mounts a folder of your computer as MIA's SD card. Without it the
slot is empty. Which folder to give it:

| Project | Folder |
| --- | --- |
| BASIC | The project folder: the load plan's paths start with `build/`. |
| Assembly without assets | The project folder, likewise. |
| Assembly with assets | `build/sd`, which holds `BOOT.BAS`, the program and `ASSETS/`. |

The emulator reads and writes the folder directly, so a `clementina build`
in another terminal changes the card at once: load the program again and
the new build runs. `SAVE` and the other BASIC file statements write into
the folder too.

File names match exactly as your computer stores them. On Linux they are
case-sensitive, unlike on a FAT card, so `LOAD "boot.bas"` won't find
`BOOT.BAS`. On macOS and Windows case doesn't matter.

## Typing into it

Click the video client's window so it gets the keyboard. Every key goes to
Clementina, except the client's own keys:

| Key | Does |
| --- | --- |
| Ctrl+V (Cmd+V on macOS) | Pastes the clipboard, typed in at 40 characters a second. |
| Ctrl+M | Switches between normal and control mode. |
| F1 | Back to normal mode from control mode. |

Pasting is the quick way to enter a load plan: copy its lines, paste them,
and they arrive as if typed. Only printable ASCII is sent, and a line break
is Return.

In control mode, Escape quits, F11 toggles full screen, F3 shows the
client's connection and frame rate, and F5 captures the mouse (a program
only sees the mouse while it is captured).

The client asks for a new frame 25 times a second; `--fps` changes that,
from 5 to 30. `--scale` sets the window's size in multiples of 320×200
(4 by default). The client's README has its other options.

## Resetting

A reset is the way back to BASIC from a game that took over the machine. In
the emulator's terminal, press `E` for the Emulation menu, then Reset. MIA
then loads the kernel and BASIC into RAM again, exactly as at power-on.
MIA RAM above `$14000` survives a reset, as it does on the board.

The video client notices the reset and reconnects on its own.

## Speed

`-s` sets the CPU's clock in MHz. The default is 1.2, MIA's default
`PHI2`, the speed the board starts at; MIA keeps it between 1 Hz and 8 MHz,
so `-s 8` is the fastest the board can be asked for. The Emulation menu's
Speed entries raise and lower it while it runs, and a program that changes
`PHI2` through MIA changes the emulator's speed too.

Your computer may not keep up with a high setting. When the emulator quits
it prints how many cycles it ran and the speed it reached.

Two consequences for games:

- Measure time with MIA's clock (`KERN_RDTIM`), never by counting cycles or
  loops: the speed isn't fixed, here or on the board.
- What a game can do per frame depends on the speed. [Performance](performance.md)
  works out the budget.

## The terminal debugger

The emulator's terminal shows the machine's state: the CPU's registers, the
code around the program counter, memory, the VIA and the buses. The menu at
the bottom:

| Key | Menu |
| --- | --- |
| `E` | Emulation: reset, pause, resume, single-step, breakpoints at an address, speed. |
| `V` | View: pick a window. `F1` to `F5` show the CPU, the VIA, base RAM, extended RAM and the buses. |
| `Q` | Quit. |

Memory windows scroll with the arrow keys and Page Up and Page Down, and `G`
goes to an address. `-f` sets how often the terminal redraws (15 times a
second by default); lowering it leaves more of your computer for the
emulation.

This debugger knows addresses, not source lines. To stop at a line of your
program and see its variables, use VS Code ([Debugging in VS
Code](debugging.md)).

## Sound

The emulator plays MIA's four voices through your computer's sound output.
On Linux that needs the ALSA headers when the emulator is built
([Installing](../start/installing.md#the-emulator)); built with
`CGO_ENABLED=0` instead, it runs silently.

## MIA's console

On the board, MIA has a USB console with commands to inspect and control it
(`status`, `speed`, `exec pause` and the rest). `-p` connects the emulated
MIA's console to a serial port. Without hardware, `socat` makes a pair of
linked virtual ports:

```text
$ socat -d -d pty,raw,echo=0,link=/tmp/ttyComputer pty,raw,echo=0,link=/tmp/ttyTerminal
$ clementina-emulator --sd ~/games/catch -p /tmp/ttyComputer
```

Then open `/tmp/ttyTerminal` with any terminal program, at 115200 baud. The
commands are in MIA's README.

## Other options

| Option | Default | Meaning |
| --- | --- | --- |
| `--video-udp` | `127.0.0.1:6502` | Where the video service listens. `0.0.0.0:6502` lets a video client on another computer connect; empty turns it off. |
| `--input-udp` | `127.0.0.1:6503` | Where the input service listens. |
| `--charset` | `clascii` | The character set MIA loads at boot: `clascii` or `openroms`. |
| `--palette` | `clementina-text` | The palette MIA loads at boot. It is the only one. |

The video and input services have no authentication, as on the real MIA, so
only open them on a network you trust. To run the client on another
computer, point it at the emulator's: `clementina-video-client --server
192.168.1.50:6502`.

## Other machines

`-m` picks the machine. `clementina` is the default and the only one this
book uses. Two others exist:

- `clementina-gpio` runs the 65C02, RAM and VIA on a Raspberry Pi 5 wired
  to a real MIA (a Pico 2 W running MIA's firmware). It tests MIA's
  firmware against a 6502 before the board exists; video, input, sound and
  the SD card come from the real MIA.
- `beneater` emulates Ben Eater's breadboard computer, the project
  Clementina grew from.

## The headless emulator

`clementina-automation` is the same machine with no terminal, no video
service, no sound and no serial port. It is controlled through an HTTP
endpoint on your computer, and it is what `clementina run`, the VS Code
debugger, the agent workflows and the MCP server start.

```text
$ clementina run
Running at http://127.0.0.1:38695/v1. Press Ctrl-C to stop.
```

Since it has no video service, the video client can't show what it runs.
The automation interface can read MIA's video state instead, and
`clementina-render` draws that as an image ([Automation and AI
agents](automation.md)).
