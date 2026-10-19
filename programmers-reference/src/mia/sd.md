# SD card and files

MIA reads and writes the SD card for the 6502, like a disk drive with its own
processor. It knows the FAT filesystem, so a program names files by their
paths and never sees a sector unless it asks for one. BASIC's file statements
([Files and the SD card](../basic/files.md)) and the kernel's `LOAD` are built
on what this chapter describes.

## How a file command works

Every file command follows the same four steps:

1. Write what the command needs, a path, a length, an address, into MIA's
   **SD control block** and buffers, through indexes.
2. Write the command's number to `CMD_TRIGGER`. The command parameters
   `CMD_PARAM1-3` are not used.
3. Wait until the status bit `MIA_STAT_SD_BUSY` clears: bit 10, so bit 2 of
   `STATUS_H`.
4. Read the result from the control block: the error code, the bytes read,
   and so on.

```asm
sd_wait:
        lda STATUS_H
        and #>MIA_STAT_SD_BUSY
        bne sd_wait
        rts
```

A command that would take long, loading a big file, runs in pieces of 512
bytes, and the 6502 can do other things meanwhile. It must not start another
SD command until the bit clears: MIA refuses it with error `$70`,
`ERROR_SD_BUSY`. Instead of polling, a program can enable `IRQ_SD_DONE` and
`IRQ_SD_ERROR`, bits 11 and 12 of the interrupt mask.

## The SD area of MIA RAM

| Index | `mia.inc` name | Address | Holds |
| --- | --- | --- | --- |
| `$E0` | `MIA_SD_INDEX_CONTROL` | `$13000-$1303F` | The control block. |
| `$E1` | `MIA_SD_INDEX_SECTOR` | `$13040-$1323F` | One 512-byte sector, for raw sector commands. |
| `$E2` | `MIA_FS_INDEX_PATH` | `$13240-$1333F` | The path, ending in a zero byte. |
| `$E3` | `MIA_FS_INDEX_DIR_ENTRY` | `$13340-$1343F` | One directory entry. |
| `$E4` | `MIA_FS_INDEX_TRANSFER` | `$13440-$13BFF` | The transfer buffer, 1,984 bytes, for reading and writing files. |
| `$E5` | `MIA_FS_INDEX_PATH2` | `$13440-$1353F` | A second path, for renaming. It shares the transfer buffer's start. |

{{#include ../../../tables/mia-storage.md}}

### Reaching a field

A command uses only a few fields of the control block, scattered through its
64 bytes. Rather than stepping the control index through the fields before
the one it wants, a program moves the index straight to the field, by writing
its current address through the configuration port. The kernel does it this
way, and so does the example below:

```asm
; Points the control index, in window A, at field X.
field:  lda #MIA_SD_INDEX_CONTROL
        sta IDXA_SELECT
        lda #CFG_IDXA_ADDR_H
        sta CFG_SELECT
        lda #^MIA_SD_CONTROL_OFFSET
        sta CFG_PORT
        lda #CFG_IDXA_ADDR_M
        sta CFG_SELECT
        lda #>MIA_SD_CONTROL_OFFSET
        sta CFG_PORT
        lda #CFG_IDXA_ADDR_L
        sta CFG_SELECT
        stx CFG_PORT            ; the control block starts at $13000
        rts
```

The control index steps one byte on each access, so after `field` the next
reads and writes run through the fields that follow. The same goes for the
path and transfer indexes: reset them with `MIA_CMD_RESET_INDEX` before
writing a path or reading a transfer from the start.

## The card and the filesystem

Programs start with the filesystem unmounted. The first file command mounts
it, so a program need not; command `$78`, `MIA_CMD_FS_MOUNT`, does it
explicitly, starting the card if needed and mounting its first FAT volume, and
takes the current directory back to the root. The status bits `MIA_STAT_SD_PRESENT` (bit 9)
and `MIA_STAT_FS_MOUNTED` (bit 11) say how far it got. They describe the last
time MIA tried, not the card slot: a card can be swapped between commands, and
the next command notices, mounts the new card, and forgets the files that were
open on the old one.

## Reading a file

MIA has 16 **file slots**, 0-15, each able to hold an open file. The program
chooses the slot: it writes its number to `HANDLE_SELECT`, field `$2E`, and
the open, read, write, seek and close commands then act on that slot. All
slots start closed, and slot 0 is selected after reset.

To read a file a program:

1. writes the path through index `$E2`;
2. writes the slot to `HANDLE_SELECT` and `MIA_FS_OPEN_READ` (0) to
   `OPEN_MODE`, field `$10`;
3. sends `MIA_CMD_FS_OPEN`, `$7B`;
4. writes how many bytes it wants to `REQUEST_LEN`, field `$08`, up to 1,984,
   or 0 for a full buffer, and sends `MIA_CMD_FS_READ`, `$7C`;
5. reads `RESULT_LEN`, field `$0A`, for how many bytes came, and those bytes
   through the transfer index `$E4`;
6. repeats 4 and 5 until `EOF`, field `$11`, is nonzero;
7. sends `MIA_CMD_FS_CLOSE`, `$7D`.

This routine reads up to 64 bytes of `GREETING.TXT` and prints them:

<!-- example: org=$B000 prg=TYPE.PRG files=GREETING.TXT:48454c4c4f2046524f4d204d49410d run="POKE 63,0: POKE 64,176: CLEAR|BLOAD \"TYPE.PRG\"|SYS 45056" -->
```asm
.include "clementina.inc"
BUF = $0280                     ; 64 bytes in the free page-2 area

        lda #MIA_CMD_FS_MOUNT
        jsr command
        lda #MIA_FS_INDEX_PATH
        sta CMD_PARAM1
        lda #MIA_CMD_RESET_INDEX
        jsr command
        lda #MIA_FS_INDEX_PATH
        sta IDXA_SELECT
        ldx #0
path:   lda name,x
        sta IDXA_PORT
        inx
        cmp #0
        bne path

        ldx #MIA_SD_CONTROL_HANDLE_SELECT
        jsr field
        stz IDXA_PORT           ; slot 0
        ldx #MIA_SD_CONTROL_OPEN_MODE
        jsr field
        lda #MIA_FS_OPEN_READ
        sta IDXA_PORT
        lda #MIA_CMD_FS_OPEN
        jsr command
        ldx #MIA_SD_CONTROL_LAST_ERROR
        jsr field
        lda IDXA_PORT
        bne failed

        ldx #MIA_SD_CONTROL_REQUEST_LEN_L
        jsr field
        lda #64
        sta IDXA_PORT           ; REQUEST_LEN_L
        stz IDXA_PORT           ; REQUEST_LEN_H
        lda #MIA_CMD_FS_READ
        jsr command
        ldx #MIA_SD_CONTROL_RESULT_LEN_L
        jsr field
        lda IDXA_PORT
        sta count
        lda #MIA_FS_INDEX_TRANSFER
        sta CMD_PARAM1
        lda #MIA_CMD_RESET_INDEX
        jsr command
        lda #MIA_FS_INDEX_TRANSFER
        sta IDXA_SELECT
        ldx #0
copy:   cpx count
        beq close
        lda IDXA_PORT
        sta BUF,x
        inx
        bra copy
close:  lda #MIA_CMD_FS_CLOSE
        jsr command
        ldx #0
print:  cpx count               ; print only after the last read from MIA
        beq done
        lda BUF,x
        jsr KERN_CHROUT
        inx
        bra print
failed: jsr KERN_PRBYTE         ; the error code
done:   rts

; Sends command A and waits for it, and for the card, to finish.
command:
        sta CMD_TRIGGER
@cmd:   lda STATUS_L
        and #MIA_STAT_CMD_RUNNING
        bne @cmd
@sd:    lda STATUS_H
        and #>MIA_STAT_SD_BUSY
        bne @sd
        rts

; Points the control index, in window A, at field X.
field:  lda #MIA_SD_INDEX_CONTROL
        sta IDXA_SELECT
        lda #CFG_IDXA_ADDR_H
        sta CFG_SELECT
        lda #^MIA_SD_CONTROL_OFFSET
        sta CFG_PORT
        lda #CFG_IDXA_ADDR_M
        sta CFG_SELECT
        lda #>MIA_SD_CONTROL_OFFSET
        sta CFG_PORT
        lda #CFG_IDXA_ADDR_L
        sta CFG_SELECT
        stx CFG_PORT
        rts

count:  .byte 0
name:   .byte "GREETING.TXT", 0
```

```text
SYS 45056
HELLO FROM MIA
```

The routine copies the bytes into the 6502's RAM before printing them: the
kernel's `CHROUT` writes the screen through window A, and would move the
window away from the transfer buffer between two reads. The same applies to
any routine that touches MIA while a program walks through one of its
buffers.

Up to 16 files can be open at once, each in its own slot. `SIZE`, field
`$18`, and `POS`, field `$1C`, both 4 bytes, give the selected slot's file
size and position; `EOF` turns nonzero after the read that reaches the end.
These fields describe the selected slot only after a command on that slot.
Opening a slot that is already open fails with error `$87`; close it first.

## Writing a file

Writing is the same in the other direction: open with `OPEN_MODE` 1,
`MIA_FS_OPEN_WRITE_CREATE`, which creates the file or empties it; copy up to
1,984 bytes into the transfer buffer; put their count in `REQUEST_LEN`; send
`MIA_CMD_FS_WRITE`, `$7F`, as many times as needed; then close. Closing
writes everything to the card. `MIA_CMD_FS_SYNC`, `$80`, does the same
without closing, for a file that stays open a long time.

The other open modes are 2, `MIA_FS_OPEN_WRITE_APPEND`, which adds to the end
of the file, for logs, and 3, `MIA_FS_OPEN_READ_WRITE`, which keeps the file
and lets a program read and change it in place. `MIA_CMD_FS_SEEK`, `$81`,
moves the selected slot's position to the value written in `POS`.

## Loading and saving whole files in MIA RAM

Two commands move a whole file between the card and MIA RAM with no help from
the 6502, which is how BASIC's `MIALOAD`, `MIASAVE`, `CHRLOAD` and the other
graphics loaders work:

| Command | Number | Uses |
| --- | --- | --- |
| `MIA_CMD_FS_LOAD_TO_MIA_RAM` | `$7E` | The path; `DEST_ADDR` (`$0C`, 3 bytes), where to put it; `REQUEST_LEN`, the most bytes to load, or 0 for all of it. |
| `MIA_CMD_FS_SAVE_FROM_MIA_RAM` | `$87` | The path; `DEST_ADDR`, where the bytes are; `TRANSFER_LEN` (`$2A`, 4 bytes), how many; `OPEN_MODE`, how to open the file. |

Neither uses a file slot. After a load, `POS` holds the number of bytes
loaded. `MIA_CMD_FS_LOAD_PART`, `$8A`, loads part of a file: a run of bytes
from an offset, or a rectangle, rows of the same length a fixed distance apart
in the file and in MIA RAM. It uses the `PART_*` fields and `TRANSFER_LEN` as
the length of a row.

The kernel's `KERN_LOAD` builds on the first: it loads a PRG file into MIA RAM
and copies it to the 6502's memory ([The kernel](../ml/kernel.md)).

## Directories and file management

| Command | Number | Does |
| --- | --- | --- |
| `MIA_CMD_FS_OPENDIR` | `$79` | Starts listing the directory in the path; `/` is the root. |
| `MIA_CMD_FS_READDIR` | `$7A` | Puts the next entry in the directory entry buffer. A name length of 0 means the list has ended. |
| `MIA_CMD_FS_STAT` | `$82` | Puts the entry for the path in the directory entry buffer. |
| `MIA_CMD_FS_FILE_INFO` | `$89` | Same, for the file open in the selected slot. |
| `MIA_CMD_FS_MKDIR` | `$83` | Makes a directory. Its parent must exist. |
| `MIA_CMD_FS_DELETE` | `$84` | Deletes a file or an empty directory. |
| `MIA_CMD_FS_RENAME` | `$85` | Renames the path to the second path, written through index `$E5`. |
| `MIA_CMD_FS_CHDIR` | `$88` | Makes the path the current directory. Mounting goes back to the root. |
| `MIA_CMD_FS_GET_FREE` | `$86` | Fills the cluster fields: free bytes are free clusters times sectors per cluster times 512. |

Only one directory listing can be going on at a time, separately from the
file slots. Paths use `/` between names; a path that does not start with `/`
starts from the current directory. Stick to plain ASCII names.

## Errors

When a command fails, MIA puts the code in `LAST_ERROR`, field `$02`, and in
the error queue, raises `IRQ_SD_ERROR`, and the next command clears
`LAST_ERROR`. The codes are `$70-$88`, listed in
[Appendix D](../appendix/mia.md). `FATFS_RESULT`, field `$12`, adds the
FAT library's own reason, which is often more precise: no such file, disk
full, and so on.

## Raw sectors

A program that needs the card's sectors themselves, a disk image tool for
example, uses `MIA_CMD_SD_INIT` (`$70`), then `MIA_CMD_SD_READ_SECTOR`
(`$71`) and `MIA_CMD_SD_WRITE_SECTOR` (`$72`), with the sector number in
`LBA`, field `$04`, and the 512 bytes in the sector buffer, index `$E1`.
Writing raw sectors on a card with a filesystem can destroy it; normal
programs use files.

## Where this is in Mapping Clementina

The SD area byte by byte is in *Mapping Clementina*,
[SD card](../../../mapping/src/mia/sd.md).
