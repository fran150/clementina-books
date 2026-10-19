# Troubleshooting

## No picture

The video client's window stays black, or never shows `READY.`.

**With the emulator:**

- Check that the emulator is running in its own terminal and shows the
  debugger screen.
- Start the client with no `--server`, or with the same port the emulator
  uses (6502 unless you changed `--video-udp`).
- If the client runs on another computer, the emulator must listen on every
  interface: `--video-udp 0.0.0.0:6502 --input-udp 0.0.0.0:6503`.

**With the board:**

- Check that MIA is on the network. On the USB console, `status wifi`
  should show your network's name and an `ip:` address. If it doesn't:
  - `config: build` instead of `config: WIFI.CFG` means MIA didn't use your
    file. The console printed why when MIA started: no card, no file, or a
    rule broken (see [WIFI.CFG and the USB console](appendix/wifi-console.md)).
    One unknown word or a line without `=` makes MIA ignore the whole file.
  - A wrong password or a network out of reach shows as a failed
    connection. Move the board nearer the router, check the password, and
    switch off and on again: MIA only reads the file at power-on.
  - MIA joins 2.4 GHz networks; a 5 GHz-only network won't work.
- Check that `--server` is MIA's address with `:6502` after it.
- Check that the computer running the client is on the same network. Guest
  networks often keep devices apart.
- With MIA's own network (`mode = ap`), your computer needs a fixed address
  such as `192.168.4.2`; MIA doesn't hand them out.

To try without the router, the console can join another network or start
MIA's own until the next power-off: `wifi connect NAME PASSWORD` or
`wifi ap NAME PASSWORD`.

## A picture, but the keyboard does nothing

- Click inside the client window: it only reads the keyboard while it has
  focus.
- If the client is in control mode (it shows status text over the picture),
  press `F1`.
- After a reset the client reconnects by itself within a few seconds.
  `Ctrl+M`, `F12`, `F1` reconnects at once.
- If a program is running, it may simply not be reading the keyboard.
  `Ctrl+C` stops a BASIC program.
- A program may have switched input away from the video client with
  `INPUTMODE`. RESET puts it back.

The mouse only reaches Clementina while it is captured (`Ctrl+M`, `F5`,
`F1`).

## Text arrives with letters missing

A long paste can overflow Clementina's 64-character keyboard buffer while a
program is busy. Start the client with a lower `--paste-rate`, such as 20.

## The SD card isn't found

`?FILE I/O ERROR` on every file statement means BASIC can't read the card,
or the file isn't there.

- Check the name with `DIR`. In the emulator on Linux, case matters:
  `demo.bas` is not `DEMO.BAS`.
- Check the current folder: `CD "/"` goes back to the top.
- On the board, check that the card is pushed fully into its slot and is
  formatted FAT32. The USB console's `sd status` shows whether MIA sees a
  card.
- In the emulator, check that it was started with `--sd` and an existing
  folder.

## A BASIC error

When BASIC can't do what a line asks, it prints an error such as
`?SYNTAX ERROR IN 20`: the problem and the line it happened on. LIST that
line and look for the mistake. [Error messages](appendix/errors.md) lists
every error and what usually causes it. The most common ones:

| Error | Usual cause |
| --- | --- |
| `?SYNTAX ERROR` | A typing mistake: a misspelled keyword, a missing quote or bracket, or a variable name that contains a keyword. |
| `?ILLEGAL QUANTITY ERROR` | A number out of range, such as `COLOR 16` or `NOTE 0,96`. |
| `?TYPE MISMATCH ERROR` | Text where a number is needed, or the other way round: `A="HELLO"` instead of `A$="HELLO"`. |
| `?UNDEF'D STATEMENT ERROR` | `GOTO` or `GOSUB` to a line number that doesn't exist. |
| `?OUT OF DATA ERROR` | `READ` ran out of `DATA` items. |
| `?FILE I/O ERROR` | See "The SD card isn't found" above. |

## The machine seems stuck

1. Press `Ctrl+C`. That stops any BASIC program, except one waiting in
   `GET` or `INPUT`, which takes `Ctrl+C` as typing; for `INPUT`, press
   RETURN on an empty line instead.
2. If nothing answers, the machine may be running machine code, or MIA may
   have paused it. On the board's USB console, `exec status` says whether
   the processor's clock is running, and `exec resume` restarts a paused
   one.
3. Press RESET. On the board, that is the RESET button; in the emulator,
   the debugger's emulation menu (`E`). The program in memory is lost, but
   the files on the SD card are safe.
4. On the board, as a last resort, unplug the USB cable and plug it back
   in. That restarts MIA too, and it reads `WIFI.CFG` again.

## MIA's error codes

MIA keeps a list of the last problems it ran into. On the USB console,
`errors list` shows them with their names, and `errors clear` empties the
list. The ones a user is most likely to see:

| Code | Name | What it means |
| --- | --- | --- |
| `30` | `ERROR_WIFI_INIT_FAILED` | The Pico's Wi-Fi chip didn't start. Make sure the Pico is a Pico 2 **W**. |
| `31` | `ERROR_WIFI_CONNECT_FAILED` | MIA couldn't join the network: check `WIFI.CFG`. |
| `71` | `ERROR_SD_INIT_FAILED` | The SD card didn't answer: check that it is in, and try another card. |
| `78` | `ERROR_FS_MOUNT_FAILED` | The card answered but isn't FAT32: format it on your computer. |
| `79` | `ERROR_FS_OPEN_FAILED` | A file wasn't found, or couldn't be created. |
| `7F` | `ERROR_FS_WRITE_FAILED` | Writing failed: the card may be full or write-protected. |

The *Programmer's Reference Guide* lists every code.
