# Stage 0: Prepare

Before any chip goes in, make sure the boards themselves are sound and that
the software is ready on your computer.

## The breadboards

1. On each breadboard, beep every power rail from one end to the other with
   the multimeter's continuity setting. Many boards split each rail in the
   middle; where yours does, bridge the gap with a short wire.
2. Beep each + rail against its GND rail. It must stay silent.
3. Place the boards side by side in the order of the
   [layout](../breadboard.md#the-layout), and link their rails: + to + and GND
   to GND, on both sides, with at least two GND links between neighbouring
   boards.
4. Mark pin 1 on every chip.

## MIA's firmware

MIA's firmware is one file, `mia.uf2`, built from the
[clementina-mia](https://github.com/fran150/clementina-mia) repository. The
kernel, WozMon and BASIC are inside it. You need the Raspberry Pi Pico SDK
2.2.0, the Arm GNU toolchain and CMake; the repository's `setup_dev.sh`
checks for them. Then:

```bash
git clone https://github.com/fran150/clementina-mia.git
cd clementina-mia
export PICO_SDK_PATH=/path/to/pico-sdk
make build
```

The firmware is now in `build/mia.uf2`. You flash it in stage 1.

## The SD card

Format the microSD card as FAT32 and put a plain text file called `WIFI.CFG`
in its top folder, with your network's name and password:

```ini
# Clementina Wi-Fi settings
ssid = your-network
password = your-password
```

MIA reads it once, at power-on, and joins that network. The *User's Manual*
(appendix G) has every rule for this file, including how to make MIA start
its own network when there is no Wi-Fi to join.

## The video client and a terminal

On the computer you will build on, get:

- a **serial terminal**: `screen` or `minicom` on Linux and macOS, PuTTY on
  Windows. MIA's USB console is a USB serial port; its speed setting doesn't
  matter.
- the **video client**, from
  [clementina-video-client](https://github.com/fran150/clementina-video-client).
  It shows Clementina's screen and sends your keyboard over Wi-Fi. You first
  need it in stage 6.

## Check

- Every rail beeps from end to end, across all the boards.
- No + rail beeps to a GND rail.
- `build/mia.uf2` exists, the card holds `WIFI.CFG`, and every part in
  [Parts and tools](../parts-and-tools.md) is on the bench.
