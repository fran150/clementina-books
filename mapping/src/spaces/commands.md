# Commands

Ids `$00-$8A`

A command asks MIA to do something that takes more than one register write.
Write up to three parameters to `CMD_PARAM1-3` (`$FFE6-$FFE8`), then the
command's id to `CMD_TRIGGER` (`$FFE9`). MIA queues the command and runs it
on its other core while the CPU carries on. `MIA_STAT_CMD_RUNNING` is set
while commands run, and `IRQ_COMMAND` is raised when they finish; commands
that take longer, such as file and copy commands, raise their own completion
flags too. An id MIA doesn't know queues `ERROR_CMD_UNKNOWN` (`$21`).

The ids are grouped by subsystem, leaving room to grow in each group:

| Ids | Group |
| --- | --- |
| `$00-$07` | Index descriptors: reset, copy to default or limit, peek. |
| `$10-$11` | Copies inside MIA RAM: a block, or a rectangle. |
| `$30` | Pausing the CPU. |
| `$42-$43` | Video: force a full refresh, set the mode. |
| `$50-$56` | Input mode, probes, key repeat; the clock snapshot and setting `TI`. |
| `$60-$6B` | Audio: enable, stop, reset; the sequencer. |
| `$70-$73` | The SD card itself: initialize, read and write raw sectors, card details. |
| `$78-$8A` | The FAT file system: mount, directories, files, loads and saves to MIA RAM. |

## Index commands

These commands act on the 256 index descriptors used by MIA's two data
windows. A descriptor has a current address, a default address to reset to,
and a limit. `CMD_PARAM1` names the descriptor unless an entry says otherwise.

### 0  `$00`  RESET_INDEX_A

Moves the descriptor currently selected in window A back to its default
address. Selecting a descriptor alone does not rewind it, so use this before
reading a block from its beginning again. No parameter is needed.

### 1  `$01`  RESET_INDEX_B

Moves the descriptor selected in window B back to its default address. This
is the write-window counterpart of command 0 and takes no parameter.

### 2  `$02`  RESET_INDEX

Resets the descriptor whose id is in `CMD_PARAM1`, whether or not it is
selected in either window. Its next data-port access starts at its default
address.

### 3  `$03`  CURRENT_TO_DEFAULT

Copies the named descriptor's *current* address to its default address. It
changes where a later reset will return, without moving the current address
now. This is useful after seeking to the start of a new block.

### 4  `$04`  CURRENT_TO_LIMIT

Copies the named descriptor's current address to its limit. The limit is the
boundary used for wrapping and for copies whose length is determined from the
source descriptor. The current address itself does not move.

### 5  `$05`  RESET_ALL_INDEXES

Moves every descriptor back to its own default address. This affects indexes
used by system areas as well as program-defined indexes; no parameter is
needed.

### 6  `$06`  PEEK_INDEX_TO_A

Reads one byte through the descriptor named in `CMD_PARAM1` and places that
byte in window A's data register. It uses that descriptor's normal read and
step rules, so the read may advance its current address. It does not select
the descriptor in window A.

### 7  `$07`  PEEK_INDEX_TO_B

Performs the same indexed read as command 6, but places the result in window
B's data register. It leaves window B's selected descriptor unchanged.

## Copy and control commands

### 16  `$10`  COPY_INDEXES

Copies bytes inside MIA RAM from the descriptor in `CMD_PARAM1` to the one
in `CMD_PARAM2`. `CMD_PARAM3` is a byte count; zero means copy from the
source's current address up to its limit. Neither descriptor moves. The copy
runs in the background, so wait for `MIA_STAT_DMA_RUNNING` to clear before
using its result or changing the source and destination memory.

### 17  `$11`  COPY_RECT

Copies rows inside MIA RAM. `CMD_PARAM1` names the source descriptor,
`CMD_PARAM2` the destination and `CMD_PARAM3` the number of rows; zero means
256 rows. Each row is as long as the distance from the source's current
address to its limit. After each row, the source and destination positions
advance by their respective descriptor steps. Neither descriptor's stored
current address changes. A source step of zero repeats the same row, which
can fill a rectangular area.

### 48  `$30`  EXEC_PAUSE

Stops the CPU's PHI2 clock for debugging. `MIA_STAT_EXEC_PAUSED` reports the
paused state. Because the CPU cannot issue another command while stopped,
resume it through MIA's external execution control.

### 66  `$42`  VIDEO_FORCE_FULL_REFRESH

Marks every syncable video page dirty so the next client update sends a full
picture. Ordinary video writes already mark changed pages, so this is mainly
for recovering a client whose picture is out of step with MIA RAM.

### 67  `$43`  VIDEO_SET_MODE

Applies the video mode byte in `CMD_PARAM1` to MIA's render control. A mode
change can require a full refresh, since the same video RAM may be displayed
differently. See [Video RAM](../mia/video.md) for the mode bits.

## Input and clock commands

### 80  `$50`  INPUT_SET_MODE

Chooses the active input source: `CMD_PARAM1` is 0 for the USB console or 1
for Wi-Fi input from the video client. MIA reports
`ERROR_INPUT_MODE_UNAVAILABLE` if the requested mode cannot be used. The
source bits of `INPUT_STATUS` show which one is active.

### 81  `$51`  INPUT_SET_PROBE

Points one of 16 one-byte input probes at a bitmap byte. `CMD_PARAM1` is the
probe number: 0–7 read keyboard state, 8–15 read consumer-key state.
`CMD_PARAM2` is the byte within that 32-byte bitmap. Once positioned, the
probe's index returns that same byte on each read, which is convenient for
polling a few keys.

### 82  `$52`  INPUT_REPEAT_DELAY

Sets how long a held key waits before its first repeated character appears
in the text queue. The delay is a 16-bit millisecond count in `CMD_PARAM1`
and `CMD_PARAM2`, low byte first; zero disables repeat. Set `CMD_PARAM3` to
zero. The default is 400 ms.

### 83  `$53`  INPUT_REPEAT_INTERVAL

Sets the time between later repeated characters, in milliseconds. Put the
16-bit interval in `CMD_PARAM1-2`, low byte first, and zero in `CMD_PARAM3`.
The default is 60 ms. This changes text input, not the held-key bitmap.

### 84  `$54`  INPUT_REPEAT_KEY

Enables or disables repeat for one HID key code. Put the key code in
`CMD_PARAM1`, 1 to enable or 0 to disable in `CMD_PARAM2`, and zero in
`CMD_PARAM3`. The HID code identifies the physical key, independent of Shift.

### 85  `$55`  CLOCK_SNAPSHOT

Copies the current clock counters into their snapshot fields at one instant.
Read those fields afterward when a multi-byte time value must be consistent
even if the live clock advances between byte reads.

### 86  `$56`  CLOCK_SET_TI

Sets the 24-bit `TI` tick count. Put its low, middle and high bytes in
`CMD_PARAM1-3`. This is the clock BASIC uses for its time value; a snapshot
command is available when reading it back. MIA ignores values of 5,184,000
or greater, since that is one full day at 60 ticks per second.

## Audio commands

Sound has four voices, numbered 0–3. For commands `$63-$67`, bit *v* of
`CMD_PARAM1` selects voice *v*; `$0F` selects all four.

### 96  `$60`  AUDIO_ENABLE

Starts sound generation from the current bytes in the MIA audio block. After
reset, audio is stopped; changing voice bytes alone does not start it.

### 97  `$61`  AUDIO_STOP

Stops audio output while retaining the voice settings in MIA RAM. Use
`AUDIO_ENABLE` to start from those settings again.

### 98  `$62`  AUDIO_RESET

Stops audio and restores the audio block's default settings. Unlike
`AUDIO_STOP`, it discards the current voice setup.

### 99  `$63`  AUDIO_SEQ_LOAD

Returns the selected voices to the start of their tracks without starting
playback. Set each track's base address with `$68-$6B` first. The sequencer
reads those tracks from MIA RAM, independently of the CPU.

### 100  `$64`  AUDIO_SEQ_START

Starts the selected sequencer voices from their current track positions.
Audio generation must also be enabled with command `$60` for them to sound.

### 101  `$65`  AUDIO_SEQ_STOP

Stops the selected tracks where they are and releases their notes. Their
track positions remain available for a later start.

### 102  `$66`  AUDIO_VOICE_TAKE

Temporarily gives the selected voices to the program for direct voice-byte
writes. Their sequencer tracks stop advancing, but the voices are not
silenced merely by taking control.

### 103  `$67`  AUDIO_VOICE_RELEASE

Returns the selected voices to the sequencer. Each track catches up to where
it would be if it had kept playing, rather than restarting from its base.

### 104  `$68`  AUDIO_SEQ_SET_BASE0

Sets the start address of voice 0's track in MIA RAM. Put the 24-bit address
in `CMD_PARAM1-3`, low byte first; it is an address, not a voice mask.

### 105  `$69`  AUDIO_SEQ_SET_BASE1

Sets voice 1's track start address. The low, middle and high address bytes go
in `CMD_PARAM1-3`; use `AUDIO_SEQ_LOAD` to return playback to the start.

### 106  `$6A`  AUDIO_SEQ_SET_BASE2

Sets voice 2's track start address in MIA RAM, low byte first in the three
command parameters. The track is a sequence of audio events, not samples.

### 107  `$6B`  AUDIO_SEQ_SET_BASE3

Sets voice 3's track start address in MIA RAM. Supply all three address
bytes, then load and start the voice when the track is ready.

## SD card and file commands

These commands use fields in the [SD control block](../mia/sd.md), starting
at MIA address `$13000`; paths and data live in its buffers. `CMD_PARAM1-3`
do not carry the file arguments. Check `SD_LAST_ERROR` and the result fields
after the SD job finishes.

### 112  `$70`  SD_INIT

Initializes the SD card so raw sector operations can run. The
`MIA_STAT_SD_PRESENT` bit means initialization succeeded; it is not a
physical card-detect switch.

### 113  `$71`  SD_READ_SECTOR

Reads one 512-byte raw sector. Put its logical block address in the control
block's LBA field; MIA places the result in the sector buffer. This operates
below the FAT file system.

### 114  `$72`  SD_WRITE_SECTOR

Writes one 512-byte sector from the sector buffer to the LBA named in the
control block. Initialize the card first. Raw writes can change filesystem
structures, so use them only when the sector layout is known.

### 115  `$73`  SD_GET_INFO

Checks that the SD card was initialized. The control block's card type and
capacity fields describe the initialized card; this command does not mount
a FAT volume or read a file.

### 120  `$78`  FS_MOUNT

Mounts the FAT volume on the initialized SD card and establishes the root
directory. File and directory commands depend on a successful mount;
`MIA_STAT_FS_MOUNTED` reports it.

### 121  `$79`  FS_OPENDIR

Opens the directory named in the path buffer for sequential reading. Use
`FS_READDIR` to fetch its entries one at a time.

### 122  `$7A`  FS_READDIR

Reads the next entry from the open directory into the control block's
directory-entry fields. Repeating it walks the directory; inspect the result
to detect the end.

### 123  `$7B`  FS_OPEN

Opens the path in the path buffer on the selected file-handle slot. Set the
open mode in the control block first. Later read, write, seek, sync and close
commands use that handle.

### 124  `$7C`  FS_READ

Reads bytes from the selected open file into the transfer buffer. Put the
desired length in `SD_REQUEST_LEN` and inspect `SD_RESULT_LEN` for the actual
number read; it may be shorter at end of file.

### 125  `$7D`  FS_CLOSE

Closes the selected file handle and releases its slot. Close files after
writing so buffered data and filesystem state can be finished cleanly.

### 126  `$7E`  FS_LOAD_TO_MIA_RAM

Loads the path named in the path buffer directly into MIA RAM at the control
block's destination address. This avoids copying file data through CPU RAM;
check the result length and error afterward.

### 127  `$7F`  FS_WRITE

Writes bytes from the transfer buffer to the selected open file. Set
`SD_REQUEST_LEN` to the byte count, then check the result length to see how
much was accepted.

### 128  `$80`  FS_SYNC

Flushes pending writes for the selected open file to the FAT volume without
closing its handle. Use it when the program needs a saved file to be current
before continuing work.

### 129  `$81`  FS_SEEK

Moves the selected file handle to the offset in `SD_FILE_POS`. The next read
or write begins there. This changes a file position, not a MIA index address.

### 130  `$82`  FS_STAT

Looks up the path in the path buffer and returns its file metadata in the
control block. It can inspect a path without opening a file handle.

### 131  `$83`  FS_MKDIR

Creates the directory named in the path buffer. Its parent directory must
already exist; check `SD_LAST_ERROR` if creation fails.

### 132  `$84`  FS_DELETE

Deletes the file or empty directory named in the path buffer. A directory
with entries cannot be removed by this command.

### 133  `$85`  FS_RENAME

Renames or moves the source path in the main path buffer to the second path
supplied in the transfer area. Both paths must follow the SD block's
zero-terminated path format.

### 134  `$86`  FS_GET_FREE

Queries free space on the mounted FAT volume and writes the result into the
control block. The answer concerns the filesystem, not unused MIA RAM.

### 135  `$87`  FS_SAVE_FROM_MIA_RAM

Saves a range of MIA RAM directly to the path in the path buffer. Set the
source address and length in the control block; MIA performs the transfer
without staging the whole range in CPU RAM.

### 136  `$88`  FS_CHDIR

Changes the current FAT directory to the path in the path buffer. Later
relative paths are interpreted from that directory.

### 137  `$89`  FS_FILE_INFO

Returns information about the selected open file handle, including its
current position and size, through fields in the control block.

### 138  `$8A`  FS_LOAD_PART

Loads rows from a file directly to MIA RAM. The control block gives the
first file offset, destination address, bytes per row, row count, file
stride and RAM stride. It can load a rectangular asset whose rows are spaced
differently in the file and in memory.

## Parameters

The three parameter bytes mean something different for each command. The
pattern within each group:

- **Index commands** take an index id in `CMD_PARAM1` (`$00`, `$01` and
  `$05` take none: they act on window A's, window B's or every descriptor).
- **Copies** take the source index, the destination index and a byte count
  (a row count for a rectangle). The indexes don't move.
- **Audio commands** take a voice mask, bit `v` for voice `v`, except
  `AUDIO_SEQ_SET_BASE0-3`, which take a 24-bit MIA RAM address in all three.
- **`CLOCK_SET_TI`** takes a 24-bit count, low byte first.
- **SD and file commands** take their arguments from the SD control block
  and the path buffer instead ([SD and file system](../mia/sd.md)).

The Programmer's Reference documents each command in full.
