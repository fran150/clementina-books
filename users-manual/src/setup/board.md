# The Clementina board

Setting up the board takes five steps: put the parts in, put MIA's firmware
on the Pico, tell MIA about your Wi-Fi, switch on, and point the video client
at MIA.

## 1. Put the parts in

Every chip on the board sits in a socket. Each chip has a notch or a dot at
one end that marks pin 1; match it to the notch printed on the board before
pressing the chip in, and check that no leg is bent under. Then plug in the
two modules:

- the **Pico 2 WH** in MIA's place at the top left, USB port towards the top
  edge;
- the **microSD breakout** on the left edge, card slot facing out.

The *Hardware & MIA Technical Reference* lists every part and how to build
the board from scratch.

## 2. Put MIA's firmware on the Pico

MIA's firmware is a single file, `mia.uf2`, built from the
[clementina-mia](https://github.com/fran150/clementina-mia) repository. The
kernel, BASIC, the character set and the colors are all inside it, so this
is also how Clementina gets a new version of BASIC.

To build it you need the Raspberry Pi Pico SDK 2.2.0, the Arm GNU toolchain
and CMake; the repository's `setup_dev.sh` checks for them, and the
*Hardware & MIA Technical Reference* explains them. With those installed:

```bash
git clone https://github.com/fran150/clementina-mia.git
cd clementina-mia
export PICO_SDK_PATH=/path/to/pico-sdk
make build
```

The firmware is now in `build/mia.uf2`. To copy it onto the Pico:

1. Hold down the **BOOTSEL** button on the Pico.
2. Plug the Pico's USB cable into your computer, then let go of the button.
3. A drive called `RP2350` appears. Copy `mia.uf2` onto it.

The Pico restarts by itself with the new firmware. Next time, `make flash`
does the copy for you if you have the `picotool` program.

## 3. Tell MIA about your Wi-Fi

MIA reads its Wi-Fi settings from a file called `WIFI.CFG` in the top
folder of the SD card. Put the card in your computer and make a plain text
file with any text editor:

```ini
# Clementina Wi-Fi settings
ssid = your-network
password = your-password
```

Put in your network's name and password, save it as `WIFI.CFG`, and put the
card in Clementina's slot. A network with no password needs no `password`
line.

**No Wi-Fi network?** MIA can make its own. Add `mode = ap`, and MIA
starts a network named by `ssid` (with `password`, if you give one of 8
characters or more). MIA's address on that network is always
`192.168.4.1`. It doesn't hand out addresses, so give your computer a fixed
address such as `192.168.4.2`, mask `255.255.255.0`, in its network
settings.

All the rules for this file are in
[WIFI.CFG and the USB console](../appendix/wifi-console.md).

## 4. Switch on

Plug the Pico's USB cable into a USB charger or a computer. The USB port
powers the whole board.

MIA starts first. It reads `WIFI.CFG`, joins the network, loads the kernel
and BASIC into the 65C02's memory, and then starts the processor. Joining
the network takes a few seconds; MIA does it only at power-on, so after you
change `WIFI.CFG`, switch off and on again (the RESET button is not enough:
it restarts the 65C02, not MIA).

## 5. Find MIA and connect

The video client needs MIA's address on your network. The easiest place to
find it is MIA's **USB console**. With the Pico plugged into your computer,
open its serial port with a terminal program:

| Computer | Port | Example |
| --- | --- | --- |
| Linux | `/dev/ttyACM0` | `screen /dev/ttyACM0 115200` |
| macOS | `/dev/tty.usbmodem…` | `screen /dev/tty.usbmodem1101 115200` |
| Windows | a `COM` port in Device Manager | PuTTY, connection type Serial |

The speed setting doesn't matter over USB. Press RETURN, and at the `>`
prompt type:

```text
status wifi
```

The `ip:` line is MIA's address, for example `192.168.1.50`. MIA also
prints it while it starts (`Wi-Fi: connected at 192.168.1.50`), and your
router's list of connected devices shows it too.

Now start the video client on any computer on the same network, giving it
that address and the video port, 6502:

```bash
cd clementina-video-client
go run ./cmd/clementina-video-client --server 192.168.1.50:6502
```

Clementina's blue screen and `READY.` appear in the window. The client finds
MIA's input port (6503) by itself.

If nothing appears, see [Troubleshooting](../troubleshooting.md).
