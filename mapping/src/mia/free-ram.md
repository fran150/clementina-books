# Free MIA RAM

MIA's 256 KiB of RAM splits at `$14000` (81920). Everything below belongs to
MIA's firmware; everything from there to the top, 176 KiB, belongs to
programs.

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

## Address entries

The entries follow MIA's entire 256 KiB in address order. Decimal addresses
come first, then five-digit hexadecimal and the owner. A reserved gap is
not program RAM even when it currently reads as zero.

### 0–68943　　$00000–$10D4F　　Video

The local control page, render controls, palettes, tile graphics,
background and overlay tables, and 256 sprite records occupy this block.
Programs may change documented video fields to draw, but MIA and the
video client depend on their layout. The [video chapter](video.md) gives
individual fields and address formulas.

### 68944–69631　　$10D50–$10FFF　　Firmware reserved

This gap follows sprite memory and precedes input state. It is kept for
future firmware data, so a program should not place assets or tracks here.
Its current lack of assigned fields does not make it stable free memory.

### 69632–69759　　$11000–$1107F　　Input and clock

MIA maintains held-key bitmaps, mouse counters, gamepad records and a
latched clock snapshot here. Most bytes are read-only state from a
program's point of view; the event masks and acknowledgements are the
documented writable exceptions. See [Input state](input.md) for each
field and its update behavior.

### 69760–73727　　$11080–$11FFF　　Firmware reserved

This gap leaves room for input state to grow without moving the audio
block. No current user allocator owns it. Use `$14000-$3FFFF` for data
that must remain valid across firmware revisions.

### 73728–73807　　$12000–$1204F　　Audio

The audio header and four 16-byte voice records live here. Writing their
documented controls changes MIA's sound engine; the sequencer can also
update voice fields while playing tracks. [Audio registers](audio.md)
explains each field and the shared record layout.

### 73808–77823　　$12050–$12FFF　　Firmware reserved

This unassigned area separates audio from SD and file-system state. It
remains MIA-owned so future audio firmware can expand its state without
taking program RAM. A sequencer track should be placed in the program
area instead.

### 77824–80895　　$13000–$13BFF　　SD and file system

MIA's card control block, sector buffer, path and directory buffers, and
file transfer area occupy these 3 KiB. Commands may read or write them
while operating, so program data placed here can be overwritten by normal
file work. The [SD chapter](sd.md) names each field and buffer.

### 80896–81919　　$13C00–$13FFF　　Firmware reserved

The final gap before program RAM belongs to MIA. It currently has no
documented application fields, but that is not a promise that the bytes
survive a firmware update. Program-owned memory begins at `$14000`.

### 81920–262143　　$14000–$3FFFF　　Program RAM

This 176 KiB block belongs to programs, with no built-in allocator or
automatic clearing on CPU reset. A program chooses addresses for assets,
data and sequencer tracks, then accesses them through index windows, MIA
copy commands or file transfers. BASIC's default `TRACK` addresses use
the first 16 KiB, so programs using background music should plan around
that convention.
