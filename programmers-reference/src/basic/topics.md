# BASIC by topic

The chapters in this section introduce Clementina BASIC's statements by what
they do, with a working program in each. They are short on purpose: every
statement has a full entry in [the BASIC dictionary](../dictionary/index.md),
and Part III explains the same hardware from machine language.

- [Text and the screen](text.md): printing, the cursor, the backdrop and the
  overlay layer.
- [Graphics](graphics.md): tiles, the scrolling background, sprites and
  palettes.
- [Sound](sound.md): the four voices and the background music sequencer.
- [Input](input.md): keys, the mouse and gamepads.
- [Files and the SD card](files.md): programs, data files, directories and
  binary loads.
- [MIA memory](mia-memory.md): MIA's 256 KiB of RAM from BASIC.
- [Time](time.md): the clocks and waiting.

Almost everything here happens in MIA, not in the 6502. A statement such as
`SPRX 0,100` takes its arguments, writes a few bytes into MIA's memory through
MIA's registers, and returns; MIA and the video client do the rest. That is why
Clementina BASIC can move sprites, play music and load files at a speed that
a 1.2 MHz 6502 could not reach on its own.
