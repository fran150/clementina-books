# H. File formats

Clementina's files are ordinary files on a FAT card, readable on any
computer. Three kinds have a format of their own; every other file BASIC or
MIA writes is plain bytes with no header.

## PRG files: machine code

`BSAVE` writes, and `BLOAD`, `BRUN` and the kernel's `KERN_LOAD` read, the
same format as the Commodore 64's program files:

| Bytes | Hold |
| --- | --- |
| 0-1 | The load address, low byte first. |
| 2 on | The bytes to load there. |

A PRG file does not record a bank: `BLOAD` puts code meant for `$8000-$BFFF`
in the bank `BANK` chose. The SDK's linker and the example runner in this
book's repository write this format
([Mixing BASIC and machine language](../ml/mixing.md)).

## Saved BASIC programs

`SAVE` writes the program exactly as it is stored in memory, from its first
line to its end, with no header. Each line is:

| Bytes | Hold |
| --- | --- |
| 0-1 | The address of the next line in memory, low byte first. |
| 2-3 | The line number, low byte first. |
| 4 on | The line, with keywords as tokens ([Appendix A](keywords.md)), ending in a zero byte. |

A line that has colored text in its strings is followed by a **style
sidecar**: `$CE $FF`, its length, and a record of the attributes of each
string ([Styled strings](../basic/styled-strings.md)). Two zero bytes, a next
address of 0, end the program.

`LOAD` reads the bytes back to the start of BASIC's program memory and then
works the next-line addresses out again, so the addresses in the file do not
matter. Because the file is the tokenized program, it is not text: `LIST`
shows it, and a text editor on another computer does not. Token numbers belong
to this version of BASIC.

## Data files

Files opened with `OPEN` hold whatever bytes the program writes with `BPUT#`,
and `BGET#` reads them back one at a time. There is no record or line
structure: a program that stores text or numbers decides how to lay them out
([Files and the SD card](../basic/files.md)).

## Graphics and sound tables

`CHRSAVE`, `PALSAVE`, `NTSAVE`, `ATRSAVE`, `OAMSAVE` and `MIASAVE` write a
copy of MIA memory, with no header, and their `LOAD` counterparts read it
back. The bytes are laid out as MIA keeps them:

| File of | Holds |
| --- | --- |
| A CHR bank | Three planes of 2,048 bytes ([Graphics](../basic/graphics.md)). |
| Palettes | Two bytes per color, RGB565, low byte first. |
| A background table | 1,000 tile numbers or attributes, row by row. |
| Sprites | Five bytes per sprite ([Graphics](../mia/graphics.md)). |

A program on another computer can make these files for Clementina with any
tool that writes raw bytes.
