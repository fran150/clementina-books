# The emulator

`clementina-emulator` runs Clementina on your computer. It boots the same
kernel and BASIC as the board, and models the CPU, memory, MIA and attached
devices. Use it with the video client to play and test a game before copying
it to a card.

## Starting it

```sh
clementina-emulator --sd ~/games/catch/build/sd
clementina-video-client
```

Start each command in its own terminal. The emulator's terminal shows its
debugger. The video client shows Clementina's screen and sends keyboard,
mouse and gamepad input. The two programs connect through their default
local addresses, so either can start first.

## The SD card

`--sd` mounts a folder of your computer as MIA's SD card. Without it the
slot is empty. For a project, give it `build/sd`, the card folder every
build writes, then type `RUN "BOOT.BAS"` ([How a program reaches the
machine](../building/loading.md)).

The emulator reads and writes the folder directly, so a `clementina build`
in another terminal changes the card at once: type `RUN "BOOT.BAS"` again and
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

To enter a program quickly, copy its lines and paste them into the video
client. They arrive as though typed. Only printable ASCII is sent, and each
line break becomes Return.

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

`-s` sets the CPU clock in MHz. The default is 1.2, the board's startup
speed. The allowed range is 1 Hz to 8 MHz, so `-s 8` requests the maximum.
You can also change the speed from the Emulation menu while the emulator
runs. A program that changes `PHI2` through MIA changes it too.

Your computer may not keep up with a high setting. When the emulator quits,
it prints the cycles run and the speed it reached. The terminal debugger
also uses CPU time; [headless mode](#without-the-terminal-screen) gives the
emulator more room to run.

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
On Linux that needs the ALSA library
([Installing](../start/installing.md#what-it-installs)).

## MIA's console

`-p` connects MIA's console to a serial port. For example, `socat` can make
a pair of linked virtual ports on your computer:

```sh
socat -d -d pty,raw,echo=0,link=/tmp/ttyComputer pty,raw,echo=0,link=/tmp/ttyTerminal
clementina-emulator --sd ~/games/catch/build/sd -p /tmp/ttyComputer
```

Open `/tmp/ttyTerminal` with a terminal program at 115200 baud. The console
commands for `dump`, `status ctx` and `trace` work as on the board
([Looking inside MIA](hardware.md#looking-inside-mia)). The emulator always
records the bus trace. Its `dump` files go to the `--sd` folder.

## Without the terminal screen

`--headless` runs the emulator with no terminal debugger and no output at
all, which makes it faster. The video client works the same.

```sh
clementina-emulator --headless --sd ~/games/catch/build/sd
```

`-s` sets the speed, and `-s 0` runs as fast as your computer can. Press
Ctrl-C to stop it. VS Code starts this mode and adds breakpoints, stepping,
restart and speed controls ([Debugging in VS Code](debugging.md)).

## Other options

| Option | Default | Meaning |
| --- | --- | --- |
| `--video-udp` | `127.0.0.1:6502` | Where the video service listens. `0.0.0.0:6502` lets a video client on another computer connect; empty turns it off. |
| `--input-udp` | `127.0.0.1:6503` | Where the input service listens. |
| `--charset` | `clascii` | The character set MIA loads at boot: `clascii` or `openroms`. |
| `--palette` | `clementina-text` | The palette MIA loads at boot. |

The video and input services have no authentication, as on the real MIA, so
only open them on a network you trust. To run the client on another
computer, point it at the emulator's: `clementina-video-client --server
192.168.1.50:6502`.

## The headless emulator

`clementina-automation` is the same machine with no terminal, no video
service, no sound and no serial port. It runs as fast as it can rather than
in real time. It is controlled through an HTTP endpoint on your computer,
and it is what `clementina run`, `clementina check`, the agent workflows and
the MCP server start.

```sh
clementina run
```

```text
Running at http://127.0.0.1:38695/v1. Press Ctrl-C to stop.
```

Since it has no video service, the video client can't show what it runs.
The automation interface can read MIA's video state instead, and
`clementina-render` draws that as an image ([Automation and AI
agents](automation.md)).
