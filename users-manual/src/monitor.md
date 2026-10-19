# The machine-language monitor

BASIC hides the machine underneath it. The **monitor** shows it: the bytes
in the 65C02's memory, in hexadecimal, which you can read, change and run as
machine code. Clementina's monitor is **WozMon**, the one Steve Wozniak
wrote for the Apple-1 in 1976, adapted to Clementina's screen and keyboard.

You don't need the monitor to use Clementina. It is here for the curious,
and for typing in short machine-code programs from a book or magazine. The
*Programmer's Reference Guide* teaches machine language, and
*Mapping Clementina* tells you what lives at each address.

## Going in and coming out

Type `MON` at the `READY.` prompt. WozMon prints a backslash and waits on
the next line:

```text
MON
\
```

Type `Q` and RETURN to go back to BASIC. Your BASIC program and its
variables are still there: WozMon uses memory of its own.

## Looking at memory

Everything is in hexadecimal, without the `$`. Type an address and RETURN
to see the byte there:

```text
280
0280: 00
```

Two addresses with a dot between them show everything from the first to
the second, eight bytes to a line:

```text
280.28F
0280: 00 00 00 00 00 00 00 00
0288: 00 00 00 00 00 00 00 00
```

## Changing memory

An address, a colon and some bytes stores those bytes from that address
on. WozMon answers with the old value at the address:

```text
280: A9 41 20 06 04 60
0280: 00
```

Look again with `280.285` to see the new bytes.

Be careful where you write. Addresses `$0280` to `$02F7` are free for your
own use, which is why these examples use them; writing over the kernel or
BASIC (from `$0400` up) can crash the machine until you press RESET.

## Running code

The six bytes above are a tiny machine-code program. In 65C02 assembly
language they read:

```text
LDA #$41      A9 41      put the code of "A" in the A register
JSR $0406     20 06 04   call the kernel's "print a character"
RTS           60         return to whoever called
```

`RTS` returns to BASIC, so run it from BASIC: type `Q`, then

```basic
SYS 640
```

`SYS` calls machine code at an address (640 is `$0280` in decimal), and the
program prints an `A` and comes back.

WozMon can run code too: an address followed by `R` jumps there. Code run
that way should end by jumping back into WozMon rather than with `RTS`. Put
`4C 24 04` (`JMP $0424`, the kernel's way into WozMon) at the end instead of
`60`:

```text
280: A9 41 20 06 04 4C 24 04
280R
```

WozMon shows the first byte, the program prints `A`, and WozMon's `\`
prompt comes back.

## Typing in WozMon

WozMon is older than the Backspace key: Backspace doesn't remove a
character from what WozMon reads, even though it vanishes from the screen.
To fix a mistake, press ESC, which abandons the line (WozMon prints `\`),
and type it again. The Apple-1 way also works: `_` rubs out the last
character, although the screen still shows it.

Upper and lowercase are the same: `q` quits too.

## MIA's monitor

MIA has a monitor of its own on its USB console, for MIA's 256 KiB of RAM
rather than the 65C02's memory. It is a tool for checking graphics and
sound data; [WIFI.CFG and the USB console](appendix/wifi-console.md) lists
its commands.
