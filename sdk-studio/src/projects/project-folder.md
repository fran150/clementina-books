# The project folder

A Clementina project is a folder with a `clementina.yaml` at its top. The
manifest names the program's source files and every asset file, and says how
to build them. Everything in it is *portable*: it means the same thing to the
CLI, to Studio, to the debugger and to an AI agent, on any computer.

## Layout

The SDK doesn't impose folder names beyond the manifest, but its templates
and Studio use this layout, and the book does too:

```text
my-game/
├── clementina.yaml
├── link.cfg                     (assembly only)
├── src/
│   └── main.bas  or  main.s
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

Every path in the manifest is relative to the project folder and uses `/`,
on Windows too. Absolute paths, `..`, empty path parts, backslashes and
symbolic links are rejected, so a project can't reach outside its folder.

## The manifest

```yaml
format: clementina-project
version: 1
name: Temple Explorer
description: Find the idol and get out.
target:
  machine: clementina-6502
program:
  kind: assembly
  entry: src/main.s
  sources:
    - src/player.s
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
    linkerConfig: link.cfg
    outputName: temple
    loadAddress: 0x1800
    entrySymbol: game_start
```

### `format`, `version`, `name`, `description`

`format` is always `clementina-project` and `version` is 1, the only
version so far. `name` (up to 80 characters) is the project's display name.
`description` (up to 500) is optional.

### `target`

`machine` is always `clementina-6502`. `phi2Hz`, the CPU clock, is optional
and defaults to 1,200,000 (1.2 MHz). The SDK can't yet start a program at
another speed, so validation rejects any other value; a program changes the
speed itself if it wants to.

### `program`

| Field | Meaning |
| --- | --- |
| `kind` | `basic` or `assembly`. `mixed` is reserved for BASIC programs that call assembly routines; it is rejected until the SDK can build it. |
| `entry` | The main source file: `src/main.bas` or `src/main.s`. |
| `sources` | Assembly only: more source files, assembled after `entry` and linked with it. A BASIC program is one file. |

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

`build` is optional for validation but needed to build. It always has an
`outputDirectory`, where everything the build makes goes, and exactly one
of `basic` or `assembly`:

| Section | For | Chapter |
| --- | --- | --- |
| `basic` | `kind: basic`: `outputName`, the compiled program's file name | [Programming in BASIC with the SDK](../building/basic.md) |
| `assembly` | `kind: assembly`: linker configuration, load address, entry symbol, bank, include folders, defines | [Programming in assembly with the SDK](../building/assembly.md) |
| `video` | Either kind: a palette config and tilesets the build loads before the program starts | [How a program reaches the machine](../building/loading.md) |
| `assets` | Assembly only: the assets the build writes to the SD card for the asset runtime, and where they go | [Assets in an assembly game](../building/asset-build.md) |

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
- `id` is how other assets and the build refer to it: a palette config names
  palettes by id, a shape names its tileset by id. Ids are case-sensitive and
  only need to be unique among assets of the same kind. The templates write
  them as `kind:name` (`palette:main`, `tileset:player`); Studio sometimes
  makes them random, like `e4f5a6b7-c8d9-4e0f-9a1b-2c3d4e5f6a7b`. Either is
  fine. Up to 64 characters: letters, digits, `.`, `_`, `:` and `-`.
- `name` is for people, and the asset build turns it into assembly labels
  and file names (`Level1` becomes `BG_LEVEL1` and `LEVEL1.BG`). Names must
  be unique among assets of a kind, ignoring case. A palette's or palette
  config's name is any text up to 64 characters; every other kind's starts
  with a letter and holds letters, digits and `_` (tilesets, backgrounds and
  overlays also allow `-`).

The file's own name doesn't matter to the SDK; the manifest lists it by
path. Studio names a file it creates after the asset's id.

## What is not in the project

The manifest is portable, so it holds nothing that depends on one computer:

- where `clementina-automation` is installed and which port it uses
  (`--emulator`, `--port`, `CLEMENTINA_EMULATOR`);
- the files the build makes;
- Studio's state: which palette config it previews with, zoom, selection,
  undo history.

## Validation

`clementina project validate [folder]` checks the whole project, without
writing anything:

- the manifest against its format;
- every listed asset against its format, then against the hardware's limits
  (Appendix C), then its references: every id an asset names must exist,
  every frame of an animation must come from one tileset, and so on;
- that every source file exists and is a regular file;
- the `build` section: the right settings for the program's kind, slots
  that fit and don't overlap, every included asset known.

A problem is printed as the file, the place in it as a JSON pointer, its
severity, a code and a message:

```text
clementina.yaml/build/assets: error project.build.assets.kind: Asset builds need an assembly program: the runtime library is ca65 code
```

The code is stable; the message is for people. The command exits with 0 when
the project is valid and 1 when it isn't, so scripts and CI can use it.
`--json` prints the same as one JSON object (Appendix A).

To check one file while editing it, `clementina asset validate FILE` checks
it against its format and its own rules. It can't see other files, so a
reference to a missing asset only shows up in `project validate`.

## Editing the manifest

`clementina.yaml` is a text file; edit it with any editor. Two tools also
write it:

- **Studio**, when you save a project you opened from its `clementina.yaml`
  ([Making assets in Studio](studio.md)).
- **The SDK's `saveProject`**, which Studio and other tools use.

Both write the manifest from scratch. YAML comments and your formatting are
not kept, and numbers come back in decimal. Keep notes about the project in
a README, not in comments in the manifest.
