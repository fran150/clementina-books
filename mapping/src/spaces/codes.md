# Status, IRQ and error codes

Three of MIA's registers are read as numbers whose meaning comes from a
table: the status bits, the interrupt bits and the error codes.

## Status: `$FFEA-$FFEB`

`STATUS_L` and `STATUS_H` report what MIA is doing right now. They are
levels: a bit is set while its condition holds and clears by itself.

### Bit 0  `$01` in STATUS_L  MIA_STAT_MASTER_MODE

Set in normal running mode; clear while MIA is running its startup loader.
The loader briefly uses the MIA register block to copy the resident image
into CPU RAM before the normal register meanings take over.

### Bit 1  `$02` in STATUS_L  MIA_STAT_ERRORS

Set while the error queue holds at least one code. Read `ERROR_L` repeatedly
until it returns zero to drain the queue; the bit then clears. The queue can
hold several failures, so one read may not be enough.

### Bit 2  `$04` in STATUS_L  MIA_STAT_CMD_RUNNING

Set while MIA's command handler is working through queued commands. Poll it
before using a result that a command produces. A background copy or SD
request has its own busy bit as well.

### Bit 3  `$08` in STATUS_L  MIA_STAT_DMA_RUNNING

Set while a MIA RAM copy is running. Commands `$10` and `$11` start these
copies; the CPU may continue executing, but the copied bytes are not ready
until this bit clears.

### Bit 4  `$10` in STATUS_L  MIA_STAT_SPEED_CHANGING

Set after a PHI2 clock-speed change is requested and before it takes effect.
The bit clears when the new speed is applied; `IRQ_SPEED_CHANGED` records
that event for interrupt-driven programs.

### Bit 5  `$20` in STATUS_L  MIA_STAT_VIDEO_FRAME_REQUESTED

Set once MIA accepts a video client's update request. It stays set while a
response is in progress and until the client acknowledges it; this is a
level describing the current exchange, not a count of frames.

### Bit 6  `$40` in STATUS_L  MIA_STAT_VIDEO_FRAME_SENT

Set after MIA finishes sending the initial response to a video update
request. The client's acknowledgement may still be pending, so this bit
alone does not mean the exchange is over.

### Bit 7  `$80` in STATUS_L  MIA_STAT_EXEC_PAUSED

Set when MIA's execution control has stopped the CPU's PHI2 clock. The CPU
cannot poll this bit while stopped; it is useful to MIA-side monitoring and
to understanding the state seen after execution resumes.

### Bit 8  `$01` in STATUS_H  MIA_STAT_AUDIO_ACTIVE

Set while MIA's audio interrupt is generating sound. After reset audio is
off; `AUDIO_ENABLE` starts it and `AUDIO_STOP` clears this bit.

### Bit 9  `$02` in STATUS_H  MIA_STAT_SD_PRESENT

Set when SD initialization succeeds. It confirms a usable initialized card,
not the state of a physical card-detect switch. Mounting a FAT volume is a
separate step.

### Bit 10  `$04` in STATUS_H  MIA_STAT_SD_BUSY

Set while an SD or file-system job is running. Wait for it to clear before
reading the job's result fields or starting another SD request.

### Bit 11  `$08` in STATUS_H  MIA_STAT_FS_MOUNTED

Set while a FAT volume is mounted. Raw sector commands can use an initialized
card without this bit, but file and directory commands need a mount.

Bits 12-15 of `STATUS_H` are unused.

## Interrupts: `$FFEE-$FFF1`

Each bit of `IRQ_STATUS_L`/`IRQ_STATUS_H` (`$FFF0-$FFF1`) records an event,
and the same bit of `IRQ_MASK_L`/`IRQ_MASK_H` (`$FFEE-$FFEF`) decides
whether that event pulls the CPU's IRQ line. Writing the mask takes effect
at once: if an event is already pending, the line goes low as soon as its
bit is enabled.

### Bit 0  `$01` in IRQ_STATUS_L  IRQ_ERROR

An error code entered MIA's error queue. Read `ERROR_L` until it returns
zero to learn all pending failures; reading IRQ status only acknowledges the
interrupt event, not the codes themselves.

### Bit 1  `$02` in IRQ_STATUS_L  IRQ_IDXA_WRAPPED

Window A's selected index crossed its limit and wrapped to its default
address while that descriptor's wrap-interrupt flag was enabled. The
descriptor's current address is already at the wrapped position.

### Bit 2  `$04` in IRQ_STATUS_L  IRQ_IDXB_WRAPPED

The same wrap event for window B's selected index. It can signal that a
write stream filled its configured range and started again at the default.

### Bit 3  `$08` in IRQ_STATUS_L  IRQ_COMMAND

MIA's command handler completed a command. A command that starts background
work can raise this flag again when that work actually finishes, so check
the relevant busy bit before using a copy or file result.

### Bit 4  `$10` in IRQ_STATUS_L  IRQ_SPEED_CHANGED

The requested PHI2 speed change took effect. The corresponding
`MIA_STAT_SPEED_CHANGING` level should now be clear.

### Bit 5  `$20` in IRQ_STATUS_L  IRQ_VIDEO_FRAME_REQUEST

The video client asked MIA for an update and MIA accepted the request. It
marks the start of a client frame exchange.

### Bit 6  `$40` in IRQ_STATUS_L  IRQ_VIDEO_FRAME_SENT

MIA completed the initial send of its video response. The client may still
need to acknowledge the response.

### Bit 7  `$80` in IRQ_STATUS_L  IRQ_VIDEO_FRAME_ACKED

The client acknowledged the video response. This completes the exchange
that began with `IRQ_VIDEO_FRAME_REQUEST`.

### Bit 8  `$01` in IRQ_STATUS_H  IRQ_INPUT_KEYBOARD

A keyboard, consumer-key or text-input event enabled for interrupts is
pending. Read the detailed input flags and state in MIA RAM to find which
key or text event caused it.

### Bit 9  `$02` in IRQ_STATUS_H  IRQ_INPUT_MOUSE

An enabled mouse event is pending. The mouse state contains button bits and
movement counters; compare the counters with an earlier sample for movement.

### Bit 10  `$04` in IRQ_STATUS_H  IRQ_INPUT_GAMEPAD

An enabled gamepad event is pending. The detailed gamepad state in MIA RAM
identifies the changed controls.

### Bit 11  `$08` in IRQ_STATUS_H  IRQ_SD_DONE

An SD or file-system job completed successfully. The SD control block has
the result values, such as how many bytes a file read returned.

### Bit 12  `$10` in IRQ_STATUS_H  IRQ_SD_ERROR

An SD or file-system job failed. Inspect `SD_LAST_ERROR` in the SD control
block, and drain `ERROR_L` for the queued error code.

### Bit 13  `$20` in IRQ_STATUS_H  IRQ_FS_EVENT

A filesystem command completed. This says the file operation ended; use its
result and error fields to determine what happened.

### Bit 14  `$40` in IRQ_STATUS_H  IRQ_AUDIO_SEQ_DONE

A sequenced voice's track finished. It can finish on an END event, an
unrecognized opcode, or a decode or catch-up budget limit. Check the voice's
sequencer status to identify the voice and its final position.

### Bit 15  `$80` in IRQ_STATUS_H  IRQ_TRIGGERED

MIA's aggregate flag says at least one pending IRQ bit is enabled by its
mask. Reading `IRQ_STATUS_L` acknowledges all the IRQ bits and releases the
CPU's IRQ line; capture the high byte first if those events matter.

Reading `IRQ_STATUS_L` clears every bit, `IRQ_TRIGGERED` included, and
releases the line. Read `IRQ_STATUS_H` first if the high bits matter. The
input bits come with their own detailed flags in MIA RAM, which stay set
until the program acknowledges them ([Input state](../mia/input.md)).

## Errors: `$FFEC`

MIA queues an error code each time something fails, and each read of
`ERROR_L` takes the oldest; `$00` means the queue is empty. While anything
is queued, `MIA_STAT_ERRORS` is set, and each new error raises `IRQ_ERROR`.
When the queue is full, a new error overwrites an unread one, and
MIA reports the loss with `ERROR_QUEUE_OVERFLOW` (`$02`). `ERROR_H` is unused.

The codes are grouped by subsystem in the high nibble: `$0x` the queue,
`$1x` copies, `$2x` commands and the context stack, `$3x` Wi-Fi, `$4x`
video, `$5x` input, `$6x` audio, `$7x-$8x` the SD card and file system.

### 1  `$01`  ERROR_MIA_CANNOT_ALLOCATE_RAM

Reserved for a startup RAM allocation failure. MIA RAM is currently
statically allocated, so ordinary programs should not encounter this code.

### 2  `$02`  ERROR_QUEUE_OVERFLOW

The error queue filled and a new failure replaced at least one unread code.
Some earlier diagnostic information has been lost. Drain `ERROR_L` more
often when investigating repeated failures.

### 16  `$10`  ERROR_DMA_SIZE_ZERO

A MIA RAM copy reached the DMA engine with zero bytes to move. Check the
explicit count or, for a limit-based copy, the source descriptor's current
address and limit.

### 17  `$11`  ERROR_DMA_SRC_WILL_OVERFLOW

The requested copy would read past the end of MIA's 256 KiB RAM. Check the
source descriptor's address and the copy length before issuing the command.

### 18  `$12`  ERROR_DMA_TGT_WILL_OVERFLOW

The copy would write beyond the end of MIA RAM. The destination descriptor
and the transfer length together must fit below `$40000`.

### 19  `$13`  ERROR_DMA_QUEUE_FULL

A copy could not be queued because eight copies were already waiting behind
the running one. Wait for `MIA_STAT_DMA_RUNNING` to clear before sending more.

### 32  `$20`  ERROR_CMD_QUEUE_FULL

MIA could not queue a write to `CMD_TRIGGER` for its command core. Wait for
`MIA_STAT_CMD_RUNNING` to clear, then issue the command again.

### 33  `$21`  ERROR_CMD_UNKNOWN

The byte written to `CMD_TRIGGER` is not an implemented command id. Check
the command number against the [command map](commands.md), including any
reserved gaps between groups.

### 34  `$22`  ERROR_CTX_OVERFLOW

A `MIA_CTX` push found all four context slots occupied. Nothing was saved;
pop an earlier context before trying to nest another save.

### 35  `$23`  ERROR_CTX_UNDERFLOW

A `MIA_CTX` pop found no saved context. No register state changed. Match each
context pop with an earlier successful push.

### 48  `$30`  ERROR_WIFI_INIT_FAILED

MIA could not initialize its CYW43 Wi-Fi chip. Video and Wi-Fi input cannot
connect until the chip is available; this is a MIA-side startup failure.

### 49  `$31`  ERROR_WIFI_CONNECT_FAILED

MIA could not join the configured Wi-Fi network as a station. Check its
network configuration and connection state before relying on the video
client or Wi-Fi input.

### 64  `$40`  ERROR_VIDEO_UDP_ALLOC_FAILED

MIA could not allocate the UDP control block used by the video service.
Video memory still exists, but the client cannot receive updates through
that service.

### 65  `$41`  ERROR_VIDEO_UDP_BIND_FAILED

The video service could not bind its UDP endpoint. Check MIA's networking
state and the endpoint configuration if a client sees no video updates.

### 80  `$50`  ERROR_INPUT_MODE_UNAVAILABLE

`INPUT_SET_MODE` requested an unknown, reserved or currently unavailable
source. Mode 0 selects the console and mode 1 Wi-Fi; mode 2 is reserved.
Wi-Fi also needs its listener to be running.

### 81  `$51`  ERROR_INPUT_PROBE_INVALID

`INPUT_SET_PROBE` named a probe outside 0–15. Probes 0–7 inspect keyboard
bitmap bytes and 8–15 inspect consumer-key bitmap bytes.

### 82  `$52`  ERROR_INPUT_UDP_ALLOC_FAILED

MIA could not allocate a UDP control block for Wi-Fi input. Console input
can still be used; Wi-Fi key and pointer events need that network endpoint.

### 83  `$53`  ERROR_INPUT_UDP_BIND_FAILED

MIA could not bind its Wi-Fi input UDP endpoint. Check the input listener's
network setup before selecting Wi-Fi input mode.

### 96  `$60`  ERROR_AUDIO_QUEUE_OVERFLOW

Live writes to audio voice bytes arrived faster than the audio interrupt
could process its change queue. MIA resynchronized from the audio block in
RAM, so inspect the current voice bytes if a transition sounded wrong.

### 112  `$70`  ERROR_SD_BUSY

An SD or filesystem request was sent while another was still running. Wait
for `MIA_STAT_SD_BUSY` to clear before changing control-block arguments or
starting the next request.

### 113  `$71`  ERROR_SD_INIT_FAILED

SD card initialization did not succeed. Raw sector and FAT operations need
a successfully initialized card; `MIA_STAT_SD_PRESENT` stays clear.

### 114  `$72`  ERROR_SD_NOT_READY

A raw SD command was issued before initialization. Run `SD_INIT` and check
that the card is ready before reading or writing sectors.

### 115  `$73`  ERROR_SD_READ_FAILED

A raw sector read failed for the LBA in the SD control block. The sector
buffer should not be treated as newly read data after this failure.

### 116  `$74`  ERROR_SD_WRITE_FAILED

A raw sector write failed. Check the LBA and the card state; do not assume
the sector buffer reached the card.

### 120  `$78`  ERROR_FS_MOUNT_FAILED

MIA could not mount a FAT volume on the SD card. File and directory commands
will not work until mounting succeeds, even if raw sectors can be read.

### 121  `$79`  ERROR_FS_OPEN_FAILED

`FS_OPEN` could not open the path with the requested mode. Check the path,
selected handle, and whether the mode permits the requested operation.

### 122  `$7A`  ERROR_FS_READ_FAILED

A FAT file read or direct file load failed. Inspect `SD_RESULT_LEN` to see
how much, if anything, was transferred before the failure.

### 123  `$7B`  ERROR_FS_CLOSE_FAILED

The filesystem could not close the selected open file. A write may still
need attention; check the file state before treating it as safely finished.

### 124  `$7C`  ERROR_FS_DIR_FAILED

A directory operation such as open or read failed. Check the directory path
and the result of the preceding `FS_OPENDIR` before continuing to read entries.

### 125  `$7D`  ERROR_FS_INVALID_REQUEST

The SD or file command's control-block arguments are invalid. Check lengths,
addresses, modes and paths for the specific command just sent.

### 126  `$7E`  ERROR_FS_NO_FILE_OPEN

A file operation needs an open file, but the selected handle has none. Open
the path on that handle before reading, writing, seeking or syncing it.

### 127  `$7F`  ERROR_FS_WRITE_FAILED

A FAT file write did not complete. Compare the requested and result lengths
and check the mounted volume's free space before retrying.

### 128  `$80`  ERROR_FS_SEEK_FAILED

The filesystem could not move the selected file's position to `SD_FILE_POS`.
Check that the handle is open and the requested offset is valid.

### 129  `$81`  ERROR_FS_SYNC_FAILED

`FS_SYNC` could not flush an open file's buffered changes. Do not assume its
latest writes are safely reflected in the volume.

### 130  `$82`  ERROR_FS_STAT_FAILED

`FS_STAT` could not obtain metadata for the requested path. Check that the
path exists and is accessible on the mounted volume.

### 131  `$83`  ERROR_FS_MKDIR_FAILED

The requested directory could not be created. Its parent must already
exist, and the new name must be valid in the FAT volume.

### 132  `$84`  ERROR_FS_DELETE_FAILED

The file or directory could not be removed. A directory must be empty, and
the path must refer to an item the filesystem can delete.

### 133  `$85`  ERROR_FS_RENAME_FAILED

The filesystem could not rename or move the item. Check both source and
destination paths, including the second path in the transfer area.

### 134  `$86`  ERROR_FS_FREE_FAILED

The free-space query failed. The control block's free-space result should
not be used until `FS_GET_FREE` completes successfully.

### 135  `$87`  ERROR_FS_HANDLE_ALREADY_OPEN

`FS_OPEN` targeted a handle slot that already holds a file. Close it first
or choose another slot; opening again does not silently replace the file.

### 136  `$88`  ERROR_FS_INVALID_HANDLE

`SD_HANDLE_SELECT` names a file slot outside the supported range. Choose a
valid slot before issuing a file-handle operation.
