# The emulator

The emulator runs a whole Clementina on your computer: the 65C02, its RAM
and VIA, and MIA with its screen, sound, input and SD card. The kernel and
BASIC inside it are the same ones the board loads.

## Get the emulator and the video client

On a Mac, or on Linux with [Homebrew](https://brew.sh), install both with:

```bash
brew install fran150/clementina/clementina-emulator
brew install fran150/clementina/clementina-video-client
```

The emulator's sample SD card is then in
`$(brew --prefix)/share/clementina-emulator/SD`; start it below with
`clementina-emulator --sd "$(brew --prefix)/share/clementina-emulator/SD"`
and leave out the `./` in front of each program.

Otherwise, download both from their GitHub releases pages, picking the file for your
computer: `darwin-arm64` for an Apple Silicon Mac, `darwin-amd64` for an
Intel Mac, `linux-amd64` or `linux-arm64` for Linux, `windows-amd64` for
Windows.

| Program | Releases | File |
| --- | --- | --- |
| The emulator | [clementina-6502](https://github.com/fran150/clementina-6502/releases) | `clementina-emulator-<version>-<os>-<arch>.tar.gz` (`.zip` on Windows) |
| The video client | [clementina-video-client](https://github.com/fran150/clementina-video-client/releases) | `clementina-video-client-<version>-<os>-<arch>.tar.gz` (`.zip` on Windows) |

Unpack both into one folder. The emulator's archive also has an `SD` folder
with sample programs. On a Mac, the programs aren't signed, so macOS refuses
to open them at first; clear that once, in the folder:

```bash
xattr -d com.apple.quarantine clementina-emulator clementina-video-client
```

## Start Clementina

In that folder, start the emulator with its sample SD card:

```bash
./clementina-emulator --sd SD
```

The terminal shows the emulator's debugger: the processor's registers, memory and a menu at the
bottom. Leave it running.

In a second terminal, start the video client:

```bash
./clementina-video-client
```

A window opens with Clementina's blue screen and the `READY.` prompt. Click
the window and type. That's all: both programs default to the addresses
`127.0.0.1:6502` (video) and `127.0.0.1:6503` (input), so they find each
other with no options.

## The SD card is a folder

`--sd` turns a folder on your computer into Clementina's SD card. The `SD`
folder from the emulator's download has a few sample programs; type `DIR` to
list them and `LOAD "demo.bas"` to load one. You can make your own folder and
point `--sd` at it instead. Without `--sd`, the slot is empty.

On Linux, file names in that folder are case-sensitive: `LOAD "DEMO.BAS"`
does not find `demo.bas`. A real SD card doesn't care about case.

## Useful options

| Option | What it does |
| --- | --- |
| `--sd FOLDER` | Use a folder as the SD card. |
| `-s MHZ` | Run the processor at this speed in MHz. The default is 1.2, the real machine's starting speed; the most MIA allows is 8. |
| `--charset openroms` | Use the alternative character set from the MEGA65 Open ROMs project instead of Clementina's own. |
| `--video-udp 0.0.0.0:6502` and `--input-udp 0.0.0.0:6503` | Let a video client on another computer connect. Start that client with `--server` and this computer's address. |

The emulator has no password on its video and input, just like MIA, so only
open it to other computers on a network you trust.

## The debugger window

The emulator's terminal is a debugger for programmers. You need only a few
keys from its menu: `E` opens the emulation menu, which can reset the
computer (like the board's RESET button) or pause it, and `Q` quits. The
*SDK & Studio Guide* covers the rest.

## MIA's console in the emulator

The board's MIA has a USB console (see
[WIFI.CFG and the USB console](../appendix/wifi-console.md)). The emulator
can offer the same console on a serial port with `-p`. Most users never need
it. On Linux or macOS, the `socat` tool makes a pair of linked virtual ports:

```bash
socat -d -d pty,raw,echo=0,link=/tmp/ttyComputer pty,raw,echo=0,link=/tmp/ttyTerminal
./clementina-emulator --sd SD -p /tmp/ttyComputer
```

Then open `/tmp/ttyTerminal` with any terminal program, such as
`screen /tmp/ttyTerminal 115200`.
