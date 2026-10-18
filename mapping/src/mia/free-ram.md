# Free MIA RAM

MIA's 256 KiB of RAM splits at `$14000` (81920). Everything below belongs to
MIA's firmware; everything from there to the top, 176 KiB, belongs to
programs.

{{#include ../../../tables/mia-ram-map.md}}

## Below `$14000`: the firmware's

The four blocks of the previous chapters fill most of it: video, input,
audio and SD. The gaps between them (`$10D50-$10FFF`, `$11080-$11FFF`,
`$12050-$12FFF` and `$13C00-$13FFF`) are the firmware's too, kept so new
firmware state can go there without moving anything programs use. Programs
write below `$14000` only through the documented video, input, audio and SD
layouts.

## `$14000-$3FFFF`: the programs'

The firmware writes here only where a program points it: through an index,
a MIA copy, a file load or a sequencer track. No reset clears it, so data
a program put there survives a reset of the CPU.

The block has no allocator, and the system doesn't divide it. These are the
users a program should know about:

| Who | Where | When |
| --- | --- | --- |
| BASIC's `TRACK` | `$14000 + v × $1000` for voice `v`, 4 KiB each, `$14000-$17FFF` for all four | When `TRACK` is given no address. A BASIC program with background music shares the start of the block with it. |
| BASIC's `MIALOAD`, `MPOKE`, `MCOPY`, `MFILL` | Wherever the program says | Always the program's choice. |
| The SDK's asset slots | Wherever the project's `clementina.yaml` places them | The SDK checks that each slot lies in `$14000-$3FFFF`. |
| MIA's serial console | `$3FC00-$3FFFF`, the top 1 KiB | Only the `audio seq test` debugging command, typed on MIA's console. |

Indexes `$00-$4F` are the programs' too, so a program has both the memory
and the windows to reach it ([Index descriptors](../spaces/indexes.md)).
