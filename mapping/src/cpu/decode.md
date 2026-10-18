# The address decode

The 65C02 has sixteen address lines and sees 64 KiB. Clementina's board cuts
that space into four regions, and everything else in Part I happens inside
one of them:

```text
$0000 ┌──────────────────────────────┐      0
      │ Base RAM               32 KiB│
      │ zero page, stack, system     │
      │ pages, kernel, BASIC         │
$8000 ├──────────────────────────────┤  32768
      │ Extended RAM window    16 KiB│
      │ one of 32 banks of 512 KiB   │
$C000 ├──────────────────────────────┤  49152
      │ I/O                     8 KiB│
      │ eight 1 KiB slots, VIA in 0  │
$E000 ├──────────────────────────────┤  57344
      │ MIA                     8 KiB│
      │ 32 registers, repeated       │
$FFFF └──────────────────────────────┘  65535
```

There is no ROM anywhere in this map. Every byte the CPU runs is in RAM, put
there by MIA when the machine starts (see [Where the code comes
from](#where-the-code-comes-from) below).

## How the board decodes

Four small chips do the decoding: two 74AC138 3-to-8 decoders, a 74AC08 and
two gates of a 74AC00. They sit on the "CS Logic" sheet of the schematic in
[clementina-hardware](https://github.com/fran150/clementina-hardware).

- **A15 low: base RAM.** A15 goes straight to the chip select of the
  32 KiB RAM (U4), so any address below `$8000` selects it. The RAM gets
  A0-A14 and sees each address once.
- **A15 high: U8 splits the top half.** U8, the first 74AC138, is enabled
  only while A15 is high and decodes A13 and A14 into four 8 KiB blocks:

  | U8 output | Block | Goes to |
  | --- | --- | --- |
  | `~Y0` | `$8000-$9FFF` | Extended RAM, through U7A |
  | `~Y1` | `$A000-$BFFF` | Extended RAM, through U7A |
  | `~Y2` | `$C000-$DFFF` | Nothing: U6 decodes this block by itself |
  | `~Y3` | `$E000-$FFFF` | MIA, inverted by U9C |

  U7A ANDs `~Y0` and `~Y1`, so the extended RAM is selected for the whole
  16 KiB from `$8000` to `$BFFF`. MIA's chip select is active high, so a
  NAND gate wired as an inverter turns `~Y3` into it.
- **I/O: U6 splits `$C000-$DFFF` into slots.** U6, the second 74AC138, is
  enabled straight from the address (A15 high, A14 high, A13 low) rather
  than from U8's `~Y2`. Skipping that decoder level gives the VIA and the
  expansion cards their chip select sooner, which they need at higher clock
  speeds. U6 decodes A10-A12 into eight 1 KiB slots, `~IOCS0` to `~IOCS7`.

The emulator in clementina-6502 builds the same circuit gate by gate
(`pkg/computers/clementina/modules/cs_logic.go`), so a program sees the same
map there as on the board.

## What each chip sees

A chip only sees the address lines wired to it. When it has fewer lines than
its region is wide, it answers the same way at more than one address in the
region. Those extra addresses are **mirrors**.

| Region | Chip | Address lines it sees | Copies in its region |
| --- | --- | --- | --- |
| `$0000-$7FFF` | 32 KiB RAM (AS6C62256) | A0-A14 | 1 |
| `$8000-$BFFF` | 512 KiB RAM (AS6C4008) | A0-A13, plus VIA PA0-PA4 as A14-A18 | 1 per bank |
| `$C000-$C3FF` | VIA (W65C22S) | A0-A3 | 64 |
| `$C400-$DFFF` | expansion cards | up to the card | up to the card |
| `$E000-$FFFF` | MIA | A0-A4 | 256 |

**Extended RAM** has 19 address lines but only 14 come from the CPU. The
other five come from the VIA's Port A, PA0-PA4, so the bank number written
there picks which 16 KiB of the 512 KiB shows at `$8000-$BFFF`. Byte `$8000+n`
of bank `b` is byte `b × $4000 + n` of the chip. Reset and warm start map
bank 0, and BASIC needs bank 0 mapped while it runs. [Extended RAM](extended-ram.md)
shows how to switch banks.

**The VIA** has sixteen registers on A0-A3, so its block repeats every 16
bytes through slot 0: `$C010` is the same register as `$C000`. Use
`$C000-$C00F`.

**MIA** is wired to A0-A4 only, so its 32 registers repeat every 32 bytes
through the whole 8 KiB block. Its real home is `$FFE0-$FFFF`, which puts the
6502's NMI, RESET and IRQ vectors (`$FFFA-$FFFF`) inside MIA's register
block. A mirror is the same register in every way: reading `$E010` clears
MIA's pending interrupts just as reading `$FFF0` does, and writing `$E009`
starts a command just as writing `$FFE9` does. So `$E000-$FFDF` is not RAM
and not free; never read or write it. Programs use `$FFE0-$FFFF` only.

**Slots 1-7** (`$C400-$DFFF`) go to the expansion headers as `~IOCS1` to
`~IOCS7`. A card claims a slot by jumpering one of those lines and decodes
as many of A0-A9 as it needs. With no card in a slot, nothing answers there:
a write goes nowhere and a read returns no defined value.

## The regions at a glance

| Range | Decimal | Size | Region | Chapter |
| --- | --- | --- | --- | --- |
| `$0000-$7FFF` | 0-32767 | 32 KiB | Base RAM | [Zero page](zero-page.md) to [BASIC's workspace](basic-workspace.md) |
| `$8000-$BFFF` | 32768-49151 | 16 KiB | Extended RAM window | [Extended RAM](extended-ram.md) |
| `$C000-$C3FF` | 49152-50175 | 1 KiB | Slot 0: the VIA | [I/O and the VIA](io.md) |
| `$C400-$DFFF` | 50176-57343 | 7 KiB | Slots 1-7: expansion | [I/O and the VIA](io.md) |
| `$E000-$FFDF` | 57344-65503 | 8 KiB less 32 bytes | MIA mirrors, never used | [The MIA registers](mia-registers.md) |
| `$FFE0-$FFFF` | 65504-65535 | 32 bytes | MIA registers and vectors | [The MIA registers](mia-registers.md) |

Base RAM is RAM all the way through, but the system claims most of it. Its
own chapters, in address order, say who owns each part: zero page and the
stack, the line buffers and system pages at `$0200-$03FF`, the kernel image
from `$0400`, and BASIC's workspace above it, which continues into extended
RAM bank 0 and ends at `$BFFF`.

## Where the code comes from

At power-on MIA holds the CPU and the VIA in reset. It places a small loader
program in its own register block and points the reset vector at it, then
lets the CPU run. The loader copies the system image, which holds the
kernel, WozMon and BASIC, into base RAM from `$0400` up. When the copy is
done, MIA switches its registers to their normal meaning and points the
reset, NMI and IRQ vectors at `$0400`, the kernel's cold start. [The resident
image](image.md) follows the boot step by step.

Two things follow for the map. Everything below `$C000` is RAM a program can
overwrite, the system included, so the map's rules say what is safe to
change rather than what is possible. And the 6502's vectors are MIA registers
that the kernel writes, not ROM bytes: a program can point the IRQ vector at
its own handler with two stores.
