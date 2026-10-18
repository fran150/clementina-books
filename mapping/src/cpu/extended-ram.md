# Extended RAM

`$8000-$BFFF` (32768-49151)

Clementina has 512 KiB of RAM besides the 32 KiB of base RAM, and the CPU
sees it 16 KiB at a time through the window at `$8000-$BFFF`. The window
shows one of 32 banks, numbered 0 to 31, and the VIA's Port A picks which:
its lines PA0-PA4 drive the top five address lines of the 512 KiB chip.

Byte `$8000 + n` of bank `b` is byte `b × 16384 + n` of the chip:

| Bank | Chip addresses | Use |
| --- | --- | --- |
| 0 | `$00000-$03FFF` | The top of BASIC's workspace. |
| 1-31 | `$04000-$7FFFF` | Free for programs. |

## Bank 0 belongs to BASIC

BASIC's workspace runs up to `$BFFF`, so its top 16 KiB is bank 0: program
text, variables, arrays and strings land there once they grow past `$7FFF`,
and strings start there, since they grow down from `$BFFF`. Bank 0 must stay
mapped while BASIC runs. Mapping another bank would pull part of BASIC's
memory out from under it.

The system keeps it that way. Reset and warm start map bank 0, and so does
every BASIC error before it prints its message. BASIC's own bank statements
never leave another bank mapped (below).

Bank 0 above a lowered `MEMSIZ` is free for programs, like any memory
reserved that way ([BASIC's workspace](basic-workspace.md#reserving-ram)).

## Banks 1-31: 496 KiB for programs

Nothing in the system uses banks 1 to 31. They suit anything too big for
base RAM: machine code, data tables, level maps, a RAM disk.

From BASIC, `BANK n` picks a bank, 0-31, for the statements that work with
CPU memory: `BLOAD`, `BRUN`, `BSAVE`, `PEEK`, `POKE` and `SYS`. `BANK` maps
nothing itself. It stores `n` in `DATA_BANK` (`$0306`), and each of those
statements maps the bank only while it works on an address in `$8000-$BFFF`,
then maps bank 0 again:

```basic
10 BANK 3
20 POKE 32768,42:PRINT PEEK(32768):REM BANK 3, $8000
30 BLOAD "TABLES.BIN",32768:REM INTO BANK 3
40 BANK 0
```

`SYS` to an address in the window maps the bank before the call and bank 0
after it, so machine code can live in a bank and be called from BASIC.
Cold start and warm start set `DATA_BANK` back to 0.

A file loaded past `$BFFF` doesn't spill into the I/O area: `KERN_LOAD`
continues it at `$8000` of the next bank. That lets one file fill several
banks in a row.

## Switching banks in machine code

Write the bank number to the VIA's `ORA` (`$C001`). PA5-PA7 aren't
connected, so the whole byte can go there; the kernel and BASIC write it the
same way.

```asm
VIA_ORA = $C001

        lda #5
        sta VIA_ORA             ; bank 5 at $8000-$BFFF
        lda $8000               ; ... read and write the bank ...
        stz VIA_ORA             ; bank 0 again before returning to BASIC
        rts
```

Two things to know:

- Code running inside the window must not switch away from its own bank:
  the next instruction would come from the new bank.
- The kernel's interrupt handler and everything it touches sit below
  `$8000`, so an interrupt can arrive while any bank is mapped. There is no
  need for `SEI` around a bank switch.

Reset sets `DDRA` to `%00011111`, making PA0-PA4 outputs, and maps bank 0.
