# On the real machine

Everything in this book runs in the emulator. The board it emulates hasn't
been built yet, so nothing here has run on the real machine. This chapter
says what will differ there, how to take a game to it, and how the SDK
records evidence that the hardware behaves as the emulator does.

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
keeps up. The board's top speed isn't known until it is built: MIA allows
up to 8 MHz, but the glue logic is rated to about 6.5 MHz. A game timed by
MIA's clock is unaffected; one timed by counting loops isn't.

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

Before the board exists, the CPU side of Clementina can run against a real
MIA: the emulator's `clementina-gpio` model runs the 65C02, RAM and VIA on a
Raspberry Pi 5, wired through its GPIO header to a Pico 2 W running MIA's
firmware. Video, input, sound and the SD card are then the real MIA's, so
everything above about the screen, the card and time applies. It tests
MIA's firmware against a 6502; it says nothing about the board's speed.

## Recording what the hardware does

The SDK's `docs/hardware-verification.md` is a procedure for checking a
board against the emulator, with two test programs:

- **The runtime demo** (`examples/runtime-demo`) calls every runtime routine
  and checks each result. It writes the number of the last check it passed
  to `$0280`, the runtime's error to `$0281`, and `$A5` to `$0282` when it
  finishes. Build it, copy `build/sd` to the card, and run `BOOT.BAS`.
- **The audio test** (`examples/hardware-audio`) plays a 440 Hz tone on the
  left; `R` plays 880 Hz on the right, `L` goes back, `Q` stops. Record
  each state from the board's audio jack as a WAV file, and the SDK's
  `scripts/analyze-audio-capture.mjs` measures each channel's level and
  frequency.

The procedure asks for the commits of every piece of software, the board's
revision and hashes of the files, so a result says exactly what was tested.
A result is evidence about one board and one set of versions. Until one is
recorded, the emulator is the only evidence, and this book's claims about
the machine rest on it.
