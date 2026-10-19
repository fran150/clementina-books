# Appendix F: Troubleshooting

Problems you are likely to meet, what causes them, and what to do. A
message in `code` style is what the SDK prints; the code after `error` or
`warning` is the diagnostic's code.

## Installing

**`clementina build` starts the emulator, or `clementina --sd` says it
doesn't know the command.** The SDK's command and the emulator's
`make build` output are both called `clementina`. Build the emulator as
`clementina-emulator` ([Installing](../start/installing.md#the-emulator)).

**`clementina doctor` warns that `ca65` is missing.** cc65 isn't installed,
or isn't on the `PATH`. BASIC projects build without it; assembly projects
don't.

**The emulator won't build on Linux: `Package alsa was not found`.**
Install the ALSA headers (`libasound2-dev`), or build with `CGO_ENABLED=0`
for an emulator without sound.

**`clementina run` can't find the emulator.** Put `clementina-automation`
on the `PATH`, set `CLEMENTINA_EMULATOR` to its path, or pass `--emulator`.

## Validating and building

**`project.build.kind: Mixed-project composition is not defined yet`.**
`program.kind: mixed` is reserved. Use `basic` or `assembly`.

**`project.build.assets.kind`.** `build.assets` is only for assembly
projects. A BASIC program gets its palettes and tilesets from
`build.video`, and the rest through BASIC's own statements.

**`assembler.image.placement: Segment CODE starts at $1800, but binary
offset $0 requires $1900`.** `build.assembly.loadAddress` and the linker
configuration disagree about where the program starts. Make them the same.

**`assembler.entry-symbol: Symbol … is absent from ld65 debug data`.** The
entry symbol isn't exported. Add `.export game_start` (or your symbol's
name) to the source that defines it.

**ca65: `Range error (… not in [-128..127])`** on a branch after a runtime
macro. The macros assemble to many bytes, and a branch reaches only 127.
Jump instead: `bcc :+` then `jmp fail` ([The asset
runtime](../building/runtime.md#walker) has an `Ok` macro for it).

**`build.assets.slot.size`.** An asset is bigger than its slot. Make the
slot bigger, or give the asset its own. Only a background may be bigger than
its slot (`build.assets.slot.partial`, a warning), and then only partial
loads can use it.

**`build.assets.song.bank`.** A song's default slot is in a CPU bank. The
sequencer reads only MIA RAM: `Relocate` the song into MIA RAM before
`PlaySong`, or give it a MIA slot.

**`load.mia.reserved`.** A `build.video` load lands on `$13000-$13BFF`, where
MIA keeps the SD card's own state. Something else in the plan has gone wrong;
check the tileset banks.

**An edit to `clementina.yaml` lost its comments.** Studio rewrote it when it
saved. Keep notes elsewhere ([The project
folder](../projects/project-folder.md#editing-the-manifest)).

## Running

**The video client's window stays black.**

- Is the interactive emulator running? `clementina run`, the debugger and
  the workflow scripts use the headless one, which has no picture.
- Do the client's `--server` and the emulator's `--video-udp` agree? Both
  default to `127.0.0.1:6502`.
- On another computer, the emulator must listen on `0.0.0.0`, not
  `127.0.0.1`.

**Keys do nothing.** Click the video client's window. If it is in control
mode, Ctrl+M or F1 goes back to normal mode.

**`?FILE NOT FOUND` (or a load fails) in the emulator on Linux.** File names
on the emulated card are case-sensitive. Type them as they are on disk:
`BOOT.BAS`, not `boot.bas`.

**The game's assets fail to load (`rt_error` 3).** The runtime loads from
the current folder. Start the game from its own folder (`build/sd` in the
emulator), and copy the contents of `build/sd`, not the folder, to the card.

**An assembly program crashes when it ends.** A program at `$1800` has
overwritten BASIC, so it can't return to it with `RTS` or
`KERN_WARMSTART`. End in a loop, and reset to get BASIC back.

**Variables have random values at the start.** `BRUN` doesn't clear `BSS`.
Clear it first ([Programming in assembly with the
SDK](../building/assembly.md#a-program-that-owns-the-machine)).

**The program misbehaves after a few runs, or the cursor freezes.** The game
uses zero page from `$E0`, which is the system's. Keep it below `$E0`.

**Nothing is drawn, or the wrong tiles are.**

- `rt_error` 1: drawing an asset that isn't loaded. Load it first.
- The layer is off: `SetLayers` bit 0 for the background, 1 for the overlay,
  2 for sprites.
- The layer reads another CHR bank: `SetChrBanks`.
- The colors are wrong: the palette config isn't loaded into `palettes`, or
  `UsePalettes` wasn't called.

**Sprites don't appear.** Check the sprite layer is on (`SetLayers`), the
sprites' CHR bank (`SetChrBanks`), and that the animation was started.

**A frame is skipped and `rt_error` is 5.** A shape the animation uses isn't
loaded. `LoadAnimationShapes` loads them.

**BASIC's text is garbage after a game ran.** The game loaded tiles into
CHR banks 0 or 1, where the console font lives. Reset to get it back.

**No sound in the emulator.** On Linux, it was built without ALSA. Rebuild
it with the headers installed.

**Timing differs between computers, or from Studio's preview.** The game
counts loops or cycles. Time it with MIA's clock (`KERN_RDTIM`), and tick
animations and sounds 60 times a second.

## Debugging

**A breakpoint is grey with a message.** Its line made no code (a comment,
a label alone, a constant, `.res`). Move it to a line with an instruction.

**Clicking the margin of a `.s` file sets no breakpoint.** Turn on VS Code's
`debug.allowBreakpointsEverywhere` setting.

**The program waits for a key and the session can't give one.** The headless
emulator has no window. Give the launch configuration a fixed `port` and
send the key to the endpoint ([Debugging in VS
Code](../running/debugging.md#typing-into-a-session)).

**Step Over goes into a subroutine.** Only `JSR` counts as a call. A
subroutine reached by `JMP`, or an interrupt, is stepped into.
