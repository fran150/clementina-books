# G. WIFI.CFG and the USB console

## WIFI.CFG

MIA reads its Wi-Fi settings from `WIFI.CFG` in the top folder of the SD
card, once, when the Pico powers up. It keeps them in memory afterwards, so
`wifi connect` (or `wifi ap`) typed on the console with no name uses them
again.

```ini
# Clementina Wi-Fi settings
ssid = your-network
password = your-password
mode = sta
```

| Key | Value |
| --- | --- |
| `ssid` | The network's name, 1 to 32 characters. With `mode = ap`, the name of the network MIA makes. |
| `password` | 8 to 63 characters. Leave it out for a network with no password. |
| `mode` | `sta` joins the network `ssid` (the default if there is no `mode` line). `ap` makes a network of MIA's own, with MIA at `192.168.4.1`; computers joining it need a fixed address from `192.168.4.2` to `192.168.4.254`. `off` leaves Wi-Fi off at power-up; an `ssid` line with it names the network a bare `wifi connect` joins later. |

The rules:

- One `key = value` per line. Keys may be in any case. Blank lines and lines
  starting with `#` are ignored.
- Spaces around keys and values are dropped, so a name or password can't
  start or end with a space.
- The file may be at most 512 bytes. Windows line endings are fine.
- An unknown key, or a line without `=`, makes MIA ignore the whole file.

When there is no card, no file, or the file breaks a rule, MIA prints the
reason on its USB console (never the password) and uses the settings built
into its firmware, which are usually none: Wi-Fi off.

Joining a network can fail the first time right after power-up, while the
Pico's radio and the router settle. MIA tries up to three times, 30 seconds
each, and prints `Wi-Fi: attempt 2 of 3...` before each retry. A wrong
password stops at once, since trying again can't fix it. The processor
starts only after the last attempt, so with no network in reach Clementina
takes about a minute and a half to start.

## The USB console

MIA's USB port is also a text console. Open it from your computer with a
terminal program (see [The Clementina board](../setup/board.md#5-find-mia-and-connect));
the speed setting doesn't matter. MIA prints `MIA ready. Type 'help' for
commands.` and a `>` prompt. Commands are lowercase.

The commands a user needs:

| Command | What it does |
| --- | --- |
| `help` | List every command. |
| `status` | A summary of everything. |
| `status wifi` | The network, MIA's address (`ip:`), and whether the settings came from `WIFI.CFG` or the firmware. |
| `wifi connect` | Join the network from `WIFI.CFG` again (the copy MIA read at power-up), for example after a failed join. |
| `wifi connect NAME PASSWORD` | Join a network until the next power-off, without changing `WIFI.CFG`. |
| `wifi ap` | Start MIA's own network from `WIFI.CFG` again, when it says `mode = ap`. |
| `wifi ap NAME PASSWORD` | Start MIA's own network until the next power-off. |
| `wifi off` | Turn Wi-Fi off until the next power-off. |
| `sd status` | Whether MIA sees an SD card. |
| `errors list` | MIA's recent errors, with names. `errors clear` empties the list. |
| `speed` | The processor's clock speed. |
| `exec status` | Whether the processor is running or paused. `exec pause` and `exec resume` stop and restart it. |
| `input console` | Type into Clementina from this terminal instead of the video client, until `Ctrl+Q`. |
| `input wifi` | Hand the keyboard back to the video client. |
| `monitor` | MIA's own monitor, for MIA's RAM (below). |
| `quit` | Restart the Pico ready for new firmware (BOOTSEL mode). |

A network name or password typed on the console can't contain spaces.
`wifi connect` and `wifi ap` try up to three times, like the join at
power-up. A bare `wifi connect` or `wifi ap` uses the settings MIA read when
it powered up: a `WIFI.CFG` edited since then counts only after the next
power-on.

### MIA's monitor

`monitor` changes the prompt to `MON>`. It works on MIA's 256 KiB of RAM,
addresses `00000` to `3FFFF`, not on the 65C02's memory. Numbers are hex.

| Command | What it does |
| --- | --- |
| `m ADDRESS LENGTH` | Show memory as hex and characters (128 bytes if you leave out the length). |
| `u ADDRESS COUNT` | Show memory as 65C02 instructions. |
| `e ADDRESS BYTE...` | Change memory. A change to video memory shows on the screen at once. |
| `quit` | Back to the `>` prompt. |

*Mapping Clementina* shows what lives where in MIA's RAM.
