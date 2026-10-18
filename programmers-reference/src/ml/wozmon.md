# WozMon

**WozMon** is the machine-code monitor Steve Wozniak wrote for the Apple-1 in
1976: 256 bytes that let you look at memory, change it and run code, typing
addresses and bytes in hex. Clementina carries a copy, adapted to its screen
and keyboard, so a few bytes of machine code can be tried without assembling
a file.

## Entering and leaving

`MON` in BASIC starts WozMon. It answers with a backslash and waits for a
line. `Q` leaves it and returns to BASIC's `READY.`, with the program and its
variables untouched: WozMon keeps its own variables at `$E8-$EF`, out of
BASIC's way. Machine code can enter it with `JMP KERN_WOZMON` (`$0424`).

Type addresses and bytes in hex, with **capital** letters: WozMon does not
read `a`-`f` as hex digits, and a lowercase letter ends the address early, so
`2f0: 1` would write to address `$0002`. Each line ends with Return. `_` rubs
out the last character and Esc cancels the line.

## Commands

| Typed | Effect |
| --- | --- |
| `addr` | Show the byte at *addr*. |
| `addr.addr` | Show the bytes from the first address to the second, eight a line. |
| `addr: byte byte ...` | Store the bytes from *addr* on. |
| `: byte byte ...` | Store more bytes after the last ones stored. |
| `addr R` | Run the code at *addr*. |
| `R` | Run the code at the last address shown. |
| `Q` | Return to BASIC. |

Several commands can share a line: `280: A9 41 280.281` stores two bytes and
shows them again.

## A session

This session stores a small program at `$0280`, looks at it, and runs it. The
program prints an `A` with the kernel's `CHROUT` and jumps back into WozMon.

```wozmon
MON
280: A9 41 20 06 04 4C 24 04
280.287
280R
Q
```

```text
280: A9 41 20 06 04 4C 24 04

0280: 00
280.287

0280: A9 41 20 06 04 4C 24 04
280R

0280: A9A\
```

A store answers with the address and the byte that was there before, here
`00`. When `R` runs the program, WozMon first shows the address and the byte there
(`0280: A9`), the program prints its `A`, and the jump back to `$0424`
restarts WozMon, which prints its backslash.

A program started with `R` should end the same way, with `JMP KERN_WOZMON`
(`4C 24 04`), or with `JMP KERN_WARMSTART` (`4C 03 04`) to go to BASIC.
WozMon reaches it with a `JMP`, not a `JSR`, so an `RTS` at its end returns to
whatever happens to be on the stack.

## Looking at the system

WozMon reads any address, which makes it handy for looking around. `300.30F`
shows the kernel's cursor and pen at the start of page 3:

```wozmon
MON
300.30F
Q
```

The first two bytes are the cursor's column and row. Reading MIA's registers
at `$FFE0-$FFFF` this way is not harmless: some of them change when read,
such as `$FFF0`, which clears MIA's interrupt flags, and `$FFF3`, which takes
a key from the keyboard queue.

## WozMon and the input line

WozMon reads its line one key at a time, not through the screen editor, so
the cursor keys do not edit a line in WozMon, and a line ends at 127
characters. It uses the same input buffer as BASIC, at `$0200`, so code stored
there is overwritten by the next line typed. `$0280-$02F7` is safe, as are
the places in [Mixing BASIC and machine language](mixing.md).
