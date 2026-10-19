# The Clementina Library

Books documenting the Clementina 6502 computer, in the spirit of the
Commodore 64 manuals:

1. **Clementina User's Manual**: setting up the machine and the video client,
   first steps in BASIC.
2. **Clementina Programmer's Reference Guide**: BASIC, 65C02 machine language
   and programming MIA.
3. **Mapping Clementina**: every address in the 6502's 64 KiB and in MIA's
   256 KiB RAM, plus the index, command and configuration spaces.
4. **Clementina SDK & Studio Guide**: the SDK, Studio and the emulator.
5. **Clementina Hardware & MIA Technical Reference**: the board, the bus and
   the MIA firmware.

## Sources

The books follow `main` of every Clementina repository. `manifest.json` pins,
per repository, the commit the books were last reviewed against. To
regenerate, review `git log` and the diff from each pinned commit to `main`,
update the affected chapters, regenerate the appendices, then advance the
pins.

Reference tables (registers, commands, errors, memory maps, kernel ABI, BASIC
keywords) are generated from `clementina-sdk/specs/*.json` at the pinned SDK
commit, never written by hand: `node tools/generate-tables.mjs` writes them to
[tables/](tables/README.md), reading the SDK checkout next to this one (or
`--sdk DIR`).

## Building

Each book is an [mdBook](https://rust-lang.github.io/mdBook/) project; the
same sources render as a website and as a printable PDF.

| Book | Folder | State |
| --- | --- | --- |
| Mapping Clementina | [mapping/](mapping/src/SUMMARY.md) | First draft |
| Programmer's Reference Guide | [programmers-reference/](programmers-reference/src/SUMMARY.md) | First draft |
| Clementina SDK & Studio Guide | [sdk-studio/](sdk-studio/src/SUMMARY.md) | First draft |

With [mdBook](https://rust-lang.github.io/mdBook/guide/installation.html)
installed, `mdbook build mapping` writes the website to `mapping/book/`, and
`mdbook serve mapping` previews it while you edit.

## Checking the books

- `node tools/generate-tables.mjs --check` checks the generated tables against
  the SDK.
- `node tools/check-dictionary.mjs` checks that the Programmer's Reference
  dictionary has an entry for every BASIC keyword, with the spec's syntax.
- `tools/run-examples.py programmers-reference/src` runs every example in the
  book in the emulator (a `clementina-6502` checkout next to this one, Go,
  and cc65 for the assembly examples) and checks the output printed in the
  book.

## License

The books are licensed under
[Creative Commons Attribution-ShareAlike 4.0 International](LICENSE)
(CC BY-SA 4.0). Code samples and generators in this repository are GPLv3,
like the rest of Clementina.

The books quote and describe third-party material under its own license:
Clementina's BASIC is a fork of [mist64/msbasic](https://github.com/mist64/msbasic)
(2-clause BSD; originally Microsoft BASIC for 6502), and the alternative
`openroms` character set comes from the MEGA65 open-roms project.
