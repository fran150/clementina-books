# About this book

*Mapping Clementina* walks through every address in the Clementina computer,
in order, the way *Mapping the Commodore 64* did for the C64. It is for
anyone who PEEKs and POKEs from BASIC or writes machine language: when you
want to know what lives at an address, who owns it, and whether you may
change it, look it up here.

Clementina has two memories, and the book maps both:

- **Part I** covers the 65C02's own 64 KiB, `$0000-$FFFF`: RAM, the banked
  window, the I/O slots and MIA's registers.
- **Part II** covers MIA's 256 KiB of RAM, `$00000-$3FFFF`. The 6502 never
  sees it directly; it reaches it through MIA's index windows.
- **Part III** covers MIA's other numbered spaces: the 256 index
  descriptors, the configuration fields, the commands, and the status, IRQ
  and error codes.

## Conventions

- Addresses and values are hexadecimal, written with `$`, unless they are
  marked as decimal. BASIC takes decimal, so the first address of a region
  also appears in decimal where you are likely to `PEEK` or `POKE` it:
  `$C000` (49152).
- A 6502 address has four hex digits (`$FFE0`); a MIA RAM address has five
  (`$14000`).
- A range includes both ends: `$8000-$BFFF` is 16,384 bytes.
- A name in `CODE` is the label the kernel, BASIC or MIA's firmware uses for
  that address, so you can find it in their sources and in the SDK's include
  files.
- KiB is 1,024 bytes.

The book describes the machine as it is built from `main` of every
Clementina repository on the date in the repository's `manifest.json`.
