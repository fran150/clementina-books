# Setting up

Every Clementina setup has two parts: the computer itself (the board or the
emulator) and the **video client**, which shows its screen and passes it
your keyboard, mouse and gamepads. Pick a path, follow its section, then read
[The video client](video-client.md).

## What you need

**For the emulator:**

- A computer running Linux, macOS or Windows.
- On Linux, the ALSA sound library (`libasound2` on Debian, Ubuntu and
  Raspberry Pi OS), which most desktops already have.
- A terminal window at least 80 × 24 characters, for the emulator's
  debugger screen.

**For the board:**

- The Clementina board with its chips in their sockets. Building the board
  is covered in the *Hardware & MIA Technical Reference*.
- A Raspberry Pi Pico 2 WH (the W with headers) for MIA.
- The Adafruit 4682 microSD breakout and a microSD card formatted FAT32,
  like most cards come.
- A USB cable for the Pico and a power source for it: a computer's USB port
  or a phone charger.
- Headphones or powered speakers with a 3.5 mm plug.
- A Wi-Fi network, or none: MIA can make its own (see
  [The Clementina board](board.md)).
- A computer for the video client, as in the emulator list, on the same
  network as MIA.
- A computer to copy MIA's firmware to the Pico once (it can be the same
  one).

Everything you install comes from the **Releases** page of its GitHub
repository, which the next two sections walk through.

| Repository | What it is |
| --- | --- |
| [clementina-6502](https://github.com/fran150/clementina-6502) | The emulator |
| [clementina-video-client](https://github.com/fran150/clementina-video-client) | The video client |
| [clementina-mia](https://github.com/fran150/clementina-mia) | MIA's firmware, with the kernel and BASIC inside |
