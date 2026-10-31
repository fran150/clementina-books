# Stage 6: Base RAM

With 32 KB of RAM at `$0000-$7FFF`, the loader's copies land somewhere, and
the kernel can run. This is the stage where Clementina first says
`READY.`

## What you add

The base RAM (U4) on board 2, next to the CPU, with its 100 nF capacitor.
Run each address and data line as a chain from chip to chip: the VIA and the
extended RAM tap the same chains later.

| U4 pin | Signal | Connects to | Notes |
| --- | --- | --- | --- |
| 1 | A14 | U1.24 | |
| 2 | A12 | U1.22 | |
| 3 | A7 | U1.16 | |
| 4 | A6 | U1.15 | |
| 5 | A5 | U1.14 | |
| 6 | A4 | U1.13 | |
| 7 | A3 | U1.12 | |
| 8 | A2 | U1.11 | |
| 9 | A1 | U1.10 | |
| 10 | A0 | U1.9 | |
| 11 | D0 | U1.33 | `DQ0` |
| 12 | D1 | U1.32 | `DQ1` |
| 13 | D2 | U1.31 | `DQ2` |
| 14 | GND | GND | |
| 15 | D3 | U1.30 | `DQ3` |
| 16 | D4 | U1.29 | `DQ4` |
| 17 | D5 | U1.28 | `DQ5` |
| 18 | D6 | U1.27 | `DQ6` |
| 19 | D7 | U1.26 | `DQ7` |
| 20 | A15 | U1.25 | `~CE`: the RAM is selected whenever A15 is low |
| 21 | A10 | U1.19 | |
| 22 | ~OE | U9.3 | |
| 23 | A11 | U1.20 | |
| 24 | A9 | U1.18 | |
| 25 | A8 | U1.17 | |
| 26 | A13 | U1.23 | |
| 27 | ~WE | U9.6 | |
| 28 | 3.3 V | 3.3 V | `VCC` |

The address pins are scattered: A0-A7 run down one side in reverse order,
and A8-A14 are split between both sides. Tick each row off as you wire it.

## Check

### READY.

1. Plug in the USB cable (with the SD card in, so MIA joins Wi-Fi).
2. On your computer, start the video client with MIA's address from stage 2:

   ```bash
   cd clementina-video-client
   go run ./cmd/clementina-video-client --server 192.168.1.50:6502
   ```

3. Press RESET. The screen shows:

   ```text
   **** CLEMENTINA V1.0 BASIC V2 ****
   (C) 2026 PACHISOFT, 1977 MICROSOFT



    23647 BYTES FREE


   COPYRIGHT 1977 BY MICROSOFT CO.

   READY.
   ```

The kernel, WozMon and BASIC now sit in RAM from `$0400` to about `$6400`,
copied there by the loader, and the kernel runs from them. The cursor
doesn't blink yet: the VIA makes the blink, in stage 7.

Hold off on BASIC for now. BASIC already counts `$8000-$BFFF`, the
extended RAM's window, as its own, and keeps its strings at the top of it.
Until stage 8, anything with a string (even `PRINT "HELLO"`) may print
garbage or crash. Numbers and `POKE` are fine.

### Data and address lines

The memory test runs in WozMon, the machine-language monitor. Type `MON` at
the `READY.` prompt; WozMon answers with `\`. You can type with the video
client's keyboard, or from MIA's console after `input console` (`Ctrl+Q`
leaves it).

In WozMon, an address shows the byte there, `ADDR: BYTES` stores bytes from
that address on, and `FROM.TO` shows a range. Everything is hex, without `$`.

**Data lines.** Type:

```text
7000: 01 02 04 08 10 20 40 80 FF 00
7000.7009
```

The ten bytes read back exactly. A wrong bit in every byte names the data
line: `01` tests D0, `02` D1, and so on.

**Address lines.** Write each line of this table, in order, one per line
(`6000: 00`, then `6001: 01`, and so on):

| Address | Write | Tests |
| --- | --- | --- |
| `6000` | `00` | The reference |
| `6001` | `01` | A0 |
| `6002` | `02` | A1 |
| `6004` | `03` | A2 |
| `6008` | `04` | A3 |
| `6010` | `05` | A4 |
| `6020` | `06` | A5 |
| `6040` | `07` | A6 |
| `6080` | `08` | A7 |
| `6100` | `09` | A8 |
| `6200` | `0A` | A9 |
| `6400` | `0B` | A10 |
| `6800` | `0C` | A11 |
| `7000` | `0D` | A12 |
| `4000` | `0E` | A13 |
| `2000` | `0F` | A14 |

Each address differs from `6000` in one address line. Now read `6000`: it
must still be `00`. If it reads a value N, the line in row N is open, stuck
or shorted to a neighbour, so that write landed on `6000` too. Finally, read
each address in the table and check its value.

Every address in the test is above `$1600`, where the kernel and WozMon end,
so the test never touches what is running. It does write over parts of
BASIC, so press **RESET** when you are done: every reset makes MIA load a
fresh copy, and `READY.` comes back.

## With a scope

The write strobe is the one signal on this board whose timing matters at
every speed. The W65C02S only holds its address and data for about 10 ns
after PHI2 falls, and the RAM needs both held until `~WE` rises.

Put channel 1 on PHI2 (U1.37) and channel 2 on `~WE` (U4.27). Run a loop
that writes all the time, to a free byte at `$0280` (640), and `RUN` it:

<!-- example: skip -->
```basic
10 POKE 640,0:GOTO 10
```

(A `POKE` uses no strings, so it's safe at this stage.) Trigger on the
rising edge of channel 2, at 10 ns per division. PHI2 falls, and `~WE` rises
a few nanoseconds after it. A 50 MHz scope shows the gap as about 7-10 ns,
so take this as a check that `~WE` follows PHI2 directly through one gate,
not as a measurement. Stage 10 comes
back to it.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| `Normal` on the console, but no banner | Wi-Fi or the video client: check `status wifi` and the client's address first |
| A blank or garbled screen after RESET | The RAM isn't answering: probe U4.22 (`~OE`) and U4.27 (`~WE`), check U4.20 is on A15 |
| WozMon writes don't stick | `~WE` not reaching U4.27, or RWB not reaching U9.1 |
| A value turns up at two addresses | An address line open at the RAM: the address test names it |
| Every byte has the same wrong bit | A data line open or swapped at the RAM |
