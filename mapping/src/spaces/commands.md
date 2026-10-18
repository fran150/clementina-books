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

{{#include ../../../tables/mia-commands.md}}

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
