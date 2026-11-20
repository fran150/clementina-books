# The project folder

A Clementina project is a folder with a `clementina.yaml` at its top. The
manifest names the program's source files and every asset file, and says how
to build them.

## Layout

The manifest can name files in any folders inside the project. `clementina
new`, Studio and this book use this layout:

```text
my-game/
├── clementina.yaml
├── link.cfg                     (assembly only)
├── src/
│   └── main.cbas  or  main.s
├── assets/
│   ├── palettes/
│   ├── palette-configs/
│   ├── tilesets/
│   ├── backgrounds/
│   ├── overlays/
│   ├── shapes/
│   ├── animations/
│   ├── instruments/
│   ├── sounds/
│   └── songs/
├── checks/                      (automated checks; not part of the manifest)
└── build/                       (output; made by the build)
```

Paths in the manifest start at the project folder and use `/`, even on
Windows. They cannot point outside the project. The SDK rejects absolute
paths, `..`, empty path parts, backslashes and symbolic links.

## The manifest

```yaml
format: clementina-project
version: 1
name: Temple Explorer
description: Find the idol and get out.
target:
  machine: clementina-6502
assets:
  palettes:
    - assets/palettes/main.palette.json
  paletteConfigs:
    - assets/palette-configs/main.palette-config.json
  tilesets:
    - assets/tilesets/player.tileset.json
  backgrounds:
    - assets/backgrounds/level1.background.json
  overlays:
    - assets/overlays/hud.overlay.json
  shapes:
    - assets/shapes/player_idle.shape.json
  animations:
    - assets/animations/player_idle.animation.json
  instruments:
    - assets/instruments/lead.instrument.json
  sounds:
    - assets/sounds/jump.sound.json
  songs:
    - assets/songs/theme.song.json
build:
  outputDirectory: build
  assembly:
    sources:
      - src/main.s
      - src/player.s
    linkerConfig: link.cfg
    outputName: temple
    loadAddress: $1800
    entrySymbol: game_start
```

### `format`, `version`, `name`, `description`

`format` is always `clementina-project`, and `version` is 1. `name` is the
display name, up to 80 characters. `description` is optional and can hold up
to 500 characters.

### `target`

`machine` is always `clementina-6502`. The optional `phi2Hz` sets the CPU
clock in hertz, from 1 to 8,000,000. The default is 1,200,000 (1.2 MHz),
the board's startup speed.

If you set another speed, the build puts commands at the start of
`BOOT.BAS` to change it before loading the program:

```yaml
target:
  machine: clementina-6502
  phi2Hz: 2000000
```

```basic
10 REM SET CPU SPEED
20 POKE $FFE2,$20:POKE $FFE3,$80:POKE $FFE2,$21:POKE $FFE3,$84
30 POKE $FFE2,$22:POKE $FFE3,$1E
```

The program runs at this speed on the board and in the emulator. A VS Code
debug session uses it too. Changing the CPU speed affects the 6502, BASIC,
the kernel's tick and `KJIFFY`. MIA's millisecond clock (`TI`), sound and
key repeat keep their usual pace. The program can also change the speed
while it runs.

### `program`

`program.entry` names the project's BASIC program, such as `src/main.cbas`.
It is one file. A project with only assembly leaves `program` out; its
sources are listed under `build.assembly`, as in the example above.

A project has a BASIC program, assembly, or both:

| Parts | How it starts |
| --- | --- |
| BASIC only | The program is loaded and run. |
| Assembly only | A generated BASIC loader runs the assembly with `BRUN`, and it takes over the machine. |
| BASIC and assembly | The loader loads the assembly with `BLOAD`, then loads and runs the BASIC program, which calls the assembly with `SYS`. |

[How a program reaches the machine](../building/loading.md) shows each one.

### `assets`

One list of file paths per kind of asset. The ten lists are `palettes`,
`paletteConfigs`, `tilesets`, `backgrounds`, `overlays`, `shapes`,
`animations`, `instruments`, `sounds` and `songs`. The first seven must be
present, empty or not; the three audio lists may be left out. A path may
appear only once across all the lists.

Listing an asset makes it part of the project: it is validated, Studio
opens it, and the build can use it. Listing it does not put it in the
program. What reaches the SD card is decided by the `build` section.

### `build`

You can validate a project without `build`, but you need it to make a card.
`outputDirectory` names the folder for generated files. Add a section for
each part of the project:

| Section | For | Chapter |
| --- | --- | --- |
| `basic` | The BASIC program's output name and memory limit. | [Programming in BASIC with the SDK](../building/basic.md) |
| `assembly` | Sources, linker settings and load address. | [Programming in assembly with the SDK](../building/assembly.md) |
| `video` | Palettes and tilesets to load before the program. | [How a program reaches the machine](../building/loading.md) |
| `assets` | Asset files and their placement for programs using the Clementina library. Requires `assembly`. | [The asset build](../building/asset-build.md) |

Addresses and sizes accept hex (`$1800` or `0x1800`) or decimal (`6144`).
These three examples mean the same thing, and neither hex form needs quotes.
An invalid value produces an error naming the field:

```text
clementina.yaml/build/assembly/loadAddress: error schema.maximum: $C000 (49152) must be at most $BFFF (49151)
```

The build writes `memory-layout.json`, a map of every part in CPU memory
and MIA RAM, and warns about each overlap.

Appendix B lists every field with its type and range.

## Assets are files with identities

Every asset is one JSON file that says what it is:

```json
{
  "format": "clementina-palette",
  "version": 1,
  "id": "palette:main",
  "name": "Main",
  "colors": [0, 65535, 63488, 2016, 31, 65504, 63519, 2047]
}
```

- `format` and `version` name the file format, so a file can be checked on
  its own.
- `id` is how other assets and the build refer to the file. A palette config
  names palettes by id; a shape names its tileset by id. Ids are
  case-sensitive and unique within each asset kind. They can use letters,
  digits, `.`, `_`, `:` and `-`, up to 64 characters. Both `palette:main` and
  a Studio-generated ID such as `e4f5a6b7-c8d9-4e0f-9a1b-2c3d4e5f6a7b`
  work.
- `name` is for people and also becomes part of assembly labels and built
  file names: `Level1` becomes `BG_LEVEL1` and `LEVEL1.BG`. Names are unique
  within each kind, ignoring case. Palette and palette-config names can be
  any text up to 64 characters. Other names start with a letter and use
  letters, digits and `_`; tilesets, backgrounds and overlays also allow `-`.

The file's own name doesn't matter to the SDK; the manifest lists it by
path. Studio names a file it creates after the asset's id.

## Local settings

Keep settings tied to your computer outside the manifest:

- where `clementina-automation` is installed and which port it uses
  (`--emulator`, `--port`, `CLEMENTINA_EMULATOR`);
- the files the build makes;
- Studio's state: which palette config it previews with, zoom, selection,
  undo history.

## Validation

`clementina project validate [folder]` checks the whole project, without
writing anything:

- the manifest against its format;
- each listed asset's format, [limits](../appendix/limits.md) and references
  to other assets;
- that every source file exists and is a regular file;
- the `build` settings, including asset placement and included assets.
  Overlapping slots produce a warning.

A problem is printed as the file, the place in it as a JSON pointer, its
severity, a code and a message:

```text
clementina.yaml/build/assets: error project.build.assets.assembly: Asset builds need build.assembly: the Clementina library is ca65 code
```

The code is stable; the message is for people. The command exits with 0 when
the project is valid and 1 when it isn't, so scripts and CI can use it.
`--json` prints the same as one JSON object (Appendix A).

To check one file while editing it, `clementina asset validate FILE` checks
it against its format and its own rules. It can't see other files, so a
reference to a missing asset only shows up in `project validate`.

## Editing the manifest

`clementina.yaml` is a text file; edit it with any editor. In VS Code, the
Clementina extension helps while you type, so you rarely need this chapter
open:

- **Completion.** The editor offers fields that fit where you are typing.
  For a path, it offers suitable project files: `.palette.json` files under
  `palettes:`, `.s` files under `sources:`, and `.cbas` files for `entry:`.
- **Hover.** Point at a field to see what it is for and the values it takes,
  such as `memoryTop`'s `$1600`-`$C000`.
- **Problems as you type.** The editor underlines invalid fields and values.
  It also reports missing files, broken asset references and invalid memory
  placement. The same problems appear in the **Problems** panel.

The field help and completion come from Red Hat's YAML extension, which VS
Code installs with the Clementina extension, reading the project format the
SDK publishes.

Two tools also write the manifest:

- **Studio**, when you save a project you opened from its `clementina.yaml`
  ([Making assets in Studio](studio.md)).
- **The SDK's `saveProject`**, which Studio and other tools use.

Both change only the values that changed. Your comments stay, and so do
addresses you wrote in hex; an address they add is written in hex too, such as
`$7000` or `$14000`. The spacing around a changed value may be tidied, such as
the spaces before a `#` comment.
