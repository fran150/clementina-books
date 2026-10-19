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

## Address entries

These are MIA RAM addresses reached through the SD indexes, not direct CPU
`PEEK` addresses. Decimal comes first, then five-digit hexadecimal and the
field name. Multi-byte numbers are little-endian.

### 77824　　$13000　　SD_VERSION

The layout version of the SD and file-system control block. Read it before
assuming the remaining offsets have the form described here. MIA writes
the version; a program should not alter it.

### 77825　　$13001　　SD_STATUS

Flags for card presence, driver initialization, FAT mount, a busy command,
an open file or directory, end of file and an error. A program can test a
particular bit before issuing the next operation. This byte reports MIA's
state; command ids, not writes here, start card and file operations.

### 77826　　$13002　　SD_LAST_ERROR

The latest SD or file-system error code, or zero when there is none. Unlike
the general MIA error queue at CPU address `$FFEC`, reading this field does
not remove a queued item. Check it with `SD_STATUS` when a file command
does not finish as expected.

### 77827　　$13003　　SD_CARD_TYPE

Identifies the initialized card: 0 none, 1 standard-capacity SD v1, 2
standard-capacity SD v2, or 3 a high-capacity SDHC/SDXC card using block
addressing. MIA supplies the value after card initialization. It is a
report, not a selection register.

### 77828–77831　　$13004–$13007　　SD_LBA

The 32-bit sector number for raw SD read and write commands, low byte
first. One sector is 512 bytes; its data is exchanged through the raw
sector buffer at `$13040-$1323F`. File-system commands normally manage
sector numbers themselves, so this field is mainly for direct card access.

### 77832–77833　　$13008–$13009　　SD_REQUEST_LEN

The byte count requested for file reads and writes, or the maximum a
whole-file load to MIA RAM should take. A program sets this little-endian
count before the command. Afterward it reads `SD_RESULT_LEN` to learn how
many bytes were actually transferred, which may be fewer at end of file.

### 77834–77835　　$1300A–$1300B　　SD_RESULT_LEN

The number of bytes the last transfer produced, written by MIA. It is
separate from the requested count at `$13008-$13009`: a short read can be
normal at end of file. Read it after the command completes, not while the
SD busy flag still reports work in progress.

### 77836–77838　　$1300C–$1300E　　SD_DEST_ADDR

A 24-bit MIA RAM address, low byte first. Whole-file load, whole-file save
and partial-load commands use it as the destination or source of their
direct MIA RAM transfer. A program must choose an area it owns, commonly
`$14000-$3FFFF`, or deliberately target video memory for an asset load.

### 77839　　$1300F　　SD_FILE_HANDLE

Reports 1 when the file slot selected at `$1302E` is open, otherwise 0.
MIA supports 16 slots, numbered 0-15, and this field describes only the
currently selected one. It does not itself select or open a file.

### 77840　　$13010　　SD_OPEN_MODE

Set before `FS_OPEN` to choose how the selected file is opened: 0 read, 1
create or truncate for writing, 2 append, or 3 read/write updates. The
chosen mode applies to the handle at `$1302E`. Creating or truncating can
change file contents, so a program should set this deliberately.

### 77841　　$13011　　SD_EOF

Nonzero when the selected open file has reached its end. With no file open
in the selected slot, it can describe the end of a directory read or a
whole-file load/save job instead. Check which operation just completed
before interpreting the byte.

### 77842　　$13012　　SD_FATFS_RESULT

The FatFs result code from the most recent file-system operation. It gives
lower-level detail than the general MIA error code when a file command
fails. Its meaning belongs to the file-system operation that produced it;
a later operation can replace it.

### 77843　　$13013　　SD_FLAGS

Reserved in the current control block. Write zero when preparing a whole
control record, and do not use this byte as program storage. Future
firmware can assign additional request flags here.

### 77844–77847　　$13014–$13017　　SD_CARD_SECTORS

Card capacity as a count of 512-byte sectors, low byte first, when MIA
knows it. Multiplying by 512 gives the approximate byte capacity visible
to raw sector commands. This is a read-only report and may be unavailable
before card initialization.

### 77848–77851　　$13018–$1301B　　SD_FILE_SIZE

The size in bytes of the open file in the currently selected handle.
MIA supplies this 32-bit value after opening or updating the file. A
program uses it to bound reads, but should still check the actual result
length and EOF status after each transfer.

### 77852–77855　　$1301C–$1301F　　SD_FILE_POS

The current position in the selected file, low byte first. A program
writes a new position before `FS_SEEK`; normal reads and writes move it as
the file advances. After `FS_LOAD_TO_MIA_RAM`, the field instead reports
the number of bytes loaded, so interpret it in the context of the command.

### 77856–77859　　$13020–$13023　　SD_FREE_CLUSTERS

The number of free FAT clusters reported after `FS_GET_FREE`. A cluster is
a group of sectors, so multiply this count by the sectors per cluster at
`$13028-$13029` and then by 512 for free bytes. The value is a snapshot
of the file system and can change as files are written.

### 77860–77863　　$13024–$13027　　SD_TOTAL_CLUSTERS

The total usable FAT cluster count from `FS_GET_FREE`, low byte first.
Together with free clusters it lets a program estimate how full the
mounted file system is. It describes the mounted volume rather than the
physical card's entire sector capacity.

### 77864–77865　　$13028–$13029　　SD_CLUSTER_SECTORS

The number of 512-byte sectors in one FAT cluster, reported by
`FS_GET_FREE`. Use it with the free and total cluster counts above to
convert their units into sectors or bytes. It is a read-only property of
the mounted file system.

### 77866–77869　　$1302A–$1302D　　SD_TRANSFER_LEN

For saving from MIA RAM to a file, this 32-bit value is the byte count to
write. For `FS_LOAD_PART`, it is the number of bytes in each row. It has a
different meaning from the two-byte request length at `$13008`, so choose
the field named by the command being issued.

### 77870　　$1302E　　SD_HANDLE_SELECT

Selects file slot 0-15 for open, read, write, seek, sync and close
commands. BASIC file number `#n` corresponds to slot `n-1`; the kernel
temporarily uses slot 14 for loads. Selecting a slot does not itself open
it, and a program must coordinate slot use with BASIC.

### 77871　　$1302F　　Control reserved

No current control field occupies this byte. Leave it unchanged or write
zero when constructing a complete request. It is not a spare byte for
program data inside the live file-system control block.

### 77872–77875　　$13030–$13033　　SD_PART_OFFSET

The starting byte offset in a file for `FS_LOAD_PART`, low byte first.
The command can load a rectangle or repeated rows without reading all
earlier file data into CPU RAM. This offset identifies the first source
byte, while the stride fields below describe later rows.

### 77876–77877　　$13034–$13035　　SD_PART_ROWS

The number of rows for `FS_LOAD_PART`. A value of zero requests one
contiguous run instead of a row-by-row copy. For a multi-row load, pair it
with transfer length and the file and RAM strides so each row lands where
the program intends.

### 77878–77881　　$13036–$13039　　SD_PART_FILE_STRIDE

The byte distance from the start of one source row to the next in the
file, low byte first. It lets a partial load skip padding or unrelated
data between rows. The destination spacing is configured separately in
`SD_PART_RAM_STRIDE`.

### 77882–77884　　$1303A–$1303C　　SD_PART_RAM_STRIDE

The 24-bit distance from one destination row to the next in MIA RAM.
For example, a program can load a narrow rectangle into rows of a wider
tile map by using a stride larger than the row's transfer length. Keep
every destination row inside the intended MIA RAM region.

### 77885–77887　　$1303D–$1303F　　Control reserved

The final three bytes of the 64-byte control block have no current field.
They belong to MIA's SD layout and are not program storage. The raw sector
buffer begins immediately afterward at `$13040`.

### 77888–78399　　$13040–$1323F　　SD_SECTOR_BUFFER

A 512-byte buffer for one raw card sector. Raw sector read fills it; raw
sector write takes its data from it. These operations work below the FAT
file system, so a program using them must understand the card's on-disk
layout and avoid corrupting its files.

### 78400–78655　　$13240–$1333F　　SD_PATH_BUFFER

The zero-terminated file or directory path for commands that need a name.
Write the bytes and a terminating zero before triggering the command.
MIA reads this live buffer, so do not replace the path until the command
has finished using it.

### 78656–78911　　$13340–$1343F　　SD_DIR_ENTRY

The result of a directory read or file query. The first byte holds FAT
attributes; the next gives name length; offsets 4-7 hold file size,
8-11 hold packed date and time, and offset 12 begins a zero-terminated
name. A name length of zero with EOF set means no more directory entries.
The next directory operation replaces this record.

### 78912–80895　　$13440–$13BFF　　SD_TRANSFER_BUFFER

A 1,984-byte staging area for file data. Reads place bytes here and
writes take bytes from here; `SD_RESULT_LEN` says how much a completed
transfer actually produced. This is MIA's live buffer, not free MIA RAM.
The second path buffer for rename operations overlaps its first 256 bytes.

### 78912–79167　　$13440–$1353F　　SD_SECOND_PATH_BUFFER

During a rename, these same 256 bytes carry the second path. They are an
alias of the beginning of `SD_TRANSFER_BUFFER`, not extra memory. Do not
prepare transfer data and a rename destination there at the same time;
the operation using the buffer determines its meaning.

## Compact status and file-format tables

{{#include ../../../tables/mia-storage.md}}
