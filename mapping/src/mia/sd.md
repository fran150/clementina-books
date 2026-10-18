# SD and file system

MIA RAM `$13000-$13BFF` (77824-80895)

The microSD card is wired to MIA, which reads the FAT file system on it.
The CPU asks for files through commands and passes names and data through
this 3 KiB block: a control block, a raw sector buffer, the path buffers, a
directory entry and a transfer buffer.

| Range | Size | Holds | Index |
| --- | --- | --- | --- |
| `$13000-$1303F` | 64 | Control block | `$E0` |
| `$13040-$1323F` | 512 | Raw sector buffer | `$E1` |
| `$13240-$1333F` | 256 | Path buffer | `$E2` |
| `$13340-$1343F` | 256 | Directory entry | `$E3` |
| `$13440-$13BFF` | 1,984 | Transfer buffer | `$E4` |
| `$13440-$1353F` | 256 | Second path buffer, over the start of the transfer buffer | `$E5` |

{{#include ../../../tables/mia-storage.md}}

## How the buffers are used

- **The path buffer** takes the name of the file or directory a command acts
  on, as a zero-terminated string. Renaming also uses the **second path
  buffer**, which shares its bytes with the start of the transfer buffer.
- **The transfer buffer** carries file data in both directions: reads land
  there and writes are taken from there, up to 1,984 bytes at a time.
- **The directory entry** receives one entry for each directory read, and
  the result of a file query: attributes, name length, size, date, time and
  the name.
- **The sector buffer** is for raw 512-byte sector reads and writes, which
  bypass the file system.
- **The control block** holds everything else: the status, the open mode,
  the lengths and addresses of requests, the current file's size and
  position, and the card's details.

## File handles

MIA can have 16 files open at once. `MIA_SD_CONTROL_HANDLE_SELECT` in the control block
picks the handle, 0-15, that open, read, write, seek, sync and close act on;
there is no allocator, so the program chooses. The system uses them like
this:

| Handle | Used by |
| --- | --- |
| 0-15 | BASIC's file numbers `#1`-`#16`, one to one: `OPEN ... AS #n` uses handle `n-1`. |
| 14 | `KERN_LOAD`, and so `BLOAD` and `BRUN`, while it reads a file. |
| 15 | BASIC's `LOAD` and `SAVE`, while they stream a program. |

The directory listing has one cursor of its own, and loading or saving a
whole file between the card and MIA RAM uses its own file internally, so
neither disturbs an open handle.

## Loading straight into MIA RAM

Command `$7E` (`FS_LOAD_TO_MIA_RAM`) copies a whole file from the card to
any MIA RAM address, and `$87` saves from MIA RAM to a file; `$8A` loads
part of a file. These are how graphics, sound and data reach MIA RAM
without passing through the CPU, and they are what BASIC's `MIALOAD` and
`MIASAVE` use. A load into video memory marks the pages it writes, so the
client receives them.

This block is live state. A load or a sequencer track placed over
`$13000-$13BFF` overwrites the file system's own buffers.
