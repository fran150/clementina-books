# On the real machine

Everything in this book runs in the emulator. This chapter says how to take
a game to the board, what differs there, and how to look inside MIA when
something goes wrong.

## Taking a game to the board

The build's output is what the card needs. Nothing else has to change.

1. Format the card as **FAT32** (FAT12 and FAT16 work too). MIA can't read
   exFAT, and cards of 64 GB and more usually come formatted that way.
2. Copy the files:
   - a BASIC game: the project's `build` folder, keeping its name;
   - an assembly game without assets: the same;
   - an assembly game with assets: the **contents** of `build/sd`, into any
     folder of the card.
3. Put the card in MIA's slot and power on.
4. Start the video client and point it at MIA (below).
5. In BASIC, change to the game's folder and type the load plan, as in the
   emulator: `LOAD "BOOT.BAS"` and `RUN` for an asset build.

FAT doesn't care about case, so `boot.bas` finds `BOOT.BAS` on the card, as
it wouldn't in the emulator on Linux. Long file names work. Keep names to
plain ASCII.

## The screen and the keyboard

Clementina has no video connector. MIA sends the screen over Wi-Fi to the
video client on your computer, and the client sends back the keyboard, the
mouse and gamepads: the same client as in the emulator, pointed at MIA
instead.

MIA joins a Wi-Fi network when it starts, with the settings in `WIFI.CFG`
at the root of the card:

```ini
# Clementina Wi-Fi settings
ssid = your-network
password = your-password
```

Then start the client with MIA's address:

```text
$ clementina-video-client --server 192.168.1.50:6502
```

MIA's USB console prints its address (`status wifi`). MIA can also start
its own network instead (`mode = ap`), at `192.168.4.1`. Its README has the
details.

## What differs from the emulator

**Time.** In the emulator, MIA's commands, its DMA copies and SD card loads
finish at once; on the board they take real time. A program that waits for
MIA properly (the runtime always does, and so does the kernel) works the
same. One that assumes a command is done without checking may work in the
emulator and fail on the board. Loads from the card run at a few hundred
KB/s at best, so a level that loads instantly in the emulator may take a
noticeable moment.

**Speed.** The emulator runs at the clock you ask for, if your computer
keeps up. On the board, MIA accepts any speed from 1 Hz to 8 MHz; above
4.6875 MHz it overclocks the Pico to get there. A game timed by MIA's clock
is unaffected by the speed; one timed by counting loops isn't.

**Picture.** The client draws the board's screen exactly as the emulator's,
but the picture travels over Wi-Fi, so a slow network delays it. That is
the client's frame rate, not the game's: the game keeps running at its own
pace.

**Sound.** The board's sound is PWM from MIA, through an output stage to
its stereo jack. The emulator plays the same samples, without that stage.

**Case of file names.** As above: case-sensitive in the emulator on Linux,
never on the card. Name files in the build the way they are on disk, and it
works in both.

## Testing on GPIO

The CPU side of Clementina can also run against a real MIA without the
board: the emulator's `clementina-gpio` model runs the 65C02, RAM and VIA on a
Raspberry Pi 5, wired through its GPIO header to a Pico 2 W running MIA's
firmware. Video, input, sound and the SD card are then the real MIA's, so
everything above about the screen, the card and time applies. It tests
MIA's firmware against a 6502; it says nothing about the board's speed.

## Looking inside MIA

When a program misbehaves on the board, MIA's USB console can show what MIA
holds right now, without changing how the program runs. These commands run
on the core that serves the console, not on the one that answers the 6502,
so they don't slow the bus:

| Command | Shows |
| --- | --- |
| `status ctx` | The `MIA_CTX` stack: how deep it is, and what each push saved. |
| `status pio` | The bus state machines' stall flags. A stall on the action machine means MIA missed bus events. `status pio clear` resets them. |
| `status sys` | What MIA has left and how busy it is: flash, RAM, stack peaks, temperature, where the console core's time goes, and how close the bus core came to missing events. `status sys clear` resets the peaks. |
| `dump regs` | The 32 registers at `$FFE0-$FFFF`, with their names. |
| `dump idx` | Every index in use; `dump idx 16` shows one. |
| `dump ram 14000 100` | MIA RAM as hex and ASCII, as the monitor's `m` does. Numbers are hex. |
| `dump all` | All of the above on one screen, plus the error queue. |

The program keeps running while you look, so a copy can catch MIA halfway
through a change. For an exact one, stop the processor first, look, and
start it again:

```text
> exec pause
> dump all
> exec resume
```

Add a file name to save to the SD card instead of the screen.
`dump ram 14000 100 LEVEL.BIN` writes those bytes raw. `dump all SNAP.BIN`
writes a snapshot of everything, all 256 KiB of MIA RAM included, to read
later on your computer. The format is in MIA's `docs/diagnostics.md`. A name
without a leading `/` goes in the folder BASIC's `CD` last changed to. MIA refuses with `SD busy`
while the program is loading or saving.

### The bus trace

Some bugs only show up as the order of things: what the program wrote to
MIA just before an error. MIA's diagnostic firmware also records the last
64 register accesses. It freezes them at the first `MIA_CTX` error, the
kind a broken interrupt handler causes. That costs the bus loop a little
time, so the normal firmware leaves it out. Build and flash the
diagnostic firmware from the MIA repository:

```text
$ make flash-diag
```

Run the program until it fails, then type `trace` on the console. It lists
the accesses oldest first, each one a read (`R`) or a write (`W`) of a
register, with its value. `trace clear` starts again. The diagnostic
firmware also adds a `busy` line to `status sys`: the share of time the bus
core spends on the program's register accesses. When you are done,
`make flash` puts the normal firmware back.

The emulator has the same commands. There the trace is always on,
`status pio` only says that the emulator has no state machines, and
`status sys` shows only the uptime
([The emulator](emulator.md#mias-console)).
