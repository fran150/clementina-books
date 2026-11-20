# On the real machine

Everything in this book runs in the emulator. This chapter says how to take
a project to the board, what differs there, and how to look inside MIA when
something goes wrong.

## Taking a project to the board

The build's output is what the card needs. Nothing else has to change.

1. Use a FAT32 card, as for any Clementina program.
2. Copy the **contents** of `build/sd` into any folder of the card.
3. Put the card in MIA's slot and power on.
4. Connect the video client to MIA, as in the *User's Manual*,
   [The Clementina board](../../../users-manual/src/setup/board.md).
5. In BASIC, change to that folder and type `RUN "BOOT.BAS"`, as in the
   emulator.

FAT doesn't care about case, so `RUN "boot.bas"` finds `BOOT.BAS` on the card, as
it wouldn't in the emulator on Linux. Long file names work. Keep names to
plain ASCII.

## What differs from the emulator

**Time.** MIA commands, copies and card loads finish immediately in the
emulator. On the board they take time. The kernel and Clementina library
wait when needed. If your own code starts a command, check that it has
finished before using its result. A level that loads instantly in the
emulator may pause briefly on the board.

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

## Looking inside MIA

When a program misbehaves on the board, MIA's USB console can show its
current state while the program runs:

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

Add a file name to save a dump on the SD card. For example,
`dump ram 14000 100 LEVEL.BIN` saves those bytes, while `dump all SNAP.BIN`
saves a full snapshot for inspection on your computer. A relative name goes
in BASIC's current folder. MIA reports `SD busy` if the program is using
the card. The snapshot format is in [MIA's diagnostic
guide](https://github.com/fran150/clementina-mia/blob/main/docs/diagnostics.md).

### The bus trace

MIA's diagnostic firmware can record the last 64 register accesses. After
an error, `trace` lists those reads and writes in order; `trace clear`
starts a new recording. See [MIA's diagnostic
guide](https://github.com/fran150/clementina-mia/blob/main/docs/diagnostics.md)
for using that firmware.

The emulator has the same commands. There the trace is always on,
`status pio` only says that the emulator has no state machines, and
`status sys` shows only the uptime
([The emulator](emulator.md#mias-console)).
