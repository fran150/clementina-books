# Your first BASIC program

This chapter takes the SDK's BASIC template, a tiny game called *Catch the
Star*, from a new folder to the screen.

## Make the project

`clementina new` makes a project from one of the SDK's two templates,
`basic` and `assembly`. BASIC is the default:

```text
$ clementina new ~/games/catch --name "Catch the Star"
Created /home/you/games/catch from the basic template.
```

It copies the template to a new folder and puts your name in the manifest.
The folder holds:

```text
catch/
├── clementina.yaml
├── README.md
├── src/
│   └── main.bas
├── assets/
│   ├── palettes/main.palette.json
│   └── palette-configs/main.palette-config.json
└── checks/
    └── smoke.json
```

## The manifest

`clementina.yaml` says what the project is and how to build it:

```yaml
format: clementina-project
version: 1
name: Catch the Star
target:
  machine: clementina-6502
program:
  entry: src/main.bas
assets:
  palettes:
    - assets/palettes/main.palette.json
  paletteConfigs:
    - assets/palette-configs/main.palette-config.json
  tilesets: []
  backgrounds: []
  overlays: []
  shapes: []
  animations: []
build:
  outputDirectory: build
  basic:
    outputName: game
  video:
    paletteConfigId: palette-config:main
```

- `program` names the BASIC program's source. The project has no assembly,
  so there is no `build.assembly`.
- `assets` lists every asset file. This one has a palette (eight colors) and
  a palette config (which palette goes in each of the sixteen palette banks).
- `build` says where the output goes, what to call the program, and, under
  `video`, which palette config to load into palette RAM before the program
  starts.

[The project folder](../projects/project-folder.md) explains every field.

## The program

`src/main.bas` is ordinary Clementina BASIC, typed with line numbers:

```basic
10 CLS
20 PRINT "CATCH THE STAR"
30 PRINT "PRESS A TO CATCH IT"
40 GET A$
50 IF A$="" THEN 40
60 IF A$="A" THEN 80
70 GOTO 40
80 PRINT "CAUGHT! SCORE 1"
90 PRINT "PRESS R TO RESTART"
100 GET A$
110 IF A$="R" THEN 10
120 GOTO 100
```

## Validate and build

From the project folder:

```text
$ cd ~/games/catch
$ clementina project validate
Validation passed.
$ clementina build
Built build/game.bas and build/load-plan.json. SD card: ..
```

`project validate` reads the manifest, checks every asset against its format
and against the others (the palette config names a palette that must exist),
and checks that the source file is there. `build` validates too, then writes
the output:

| File | What it is |
| --- | --- |
| `build/game.bas` | The program, tokenized the way BASIC's `SAVE` writes it. `LOAD` reads it. |
| `build/asset-palette.bin` | The palette config: 256 bytes, all sixteen banks, ready for palette RAM. |
| `build/load-plan.json` | The steps that load the program: the palette into MIA RAM at `$00100`, then the program. |
| `build/bootstrap.bas` | The same steps as a numbered BASIC program, for starting the project from a card. |
| `build/memory-layout.json` | Where each part sits in CPU memory and MIA RAM. |

Nothing in `build/` is meant to be edited. Delete it whenever you like; the
next build makes it again.

## Play it

Start the emulator with the project folder as its SD card, then the video
client, each in its own terminal:

```text
$ clementina-emulator --sd ~/games/catch
```

```text
$ clementina-video-client
```

The emulator's terminal shows its debugger; the video client's window shows
Clementina's screen, with BASIC's `READY.` prompt. Click the window so it
gets your keystrokes, and type the steps of the load plan:

```basic
MIALOAD "build/asset-palette.bin",256
LOAD "build/game.bas"
RUN
```

`MIALOAD` copies the palette file into MIA RAM at 256 (`$00100`), which is
palette RAM. `LOAD` reads the program and `RUN` starts it. Press `A` to
catch the star and `R` to play again.

The SD card is the folder you gave `--sd`, so the program's paths are
relative to the project folder. On Linux, file names on the emulated card
are case-sensitive, as they are on your disk.

## Run it headless

`clementina run` builds the project, starts the headless emulator with the
project folder as its card, types the same load plan for you, and leaves the
program running:

```text
$ clementina run
Running at http://127.0.0.1:38695/v1. Press Ctrl-C to stop.
```

The headless emulator has no screen; the address it prints is for the
debugger and for automated checks (Part IV). To *see* a program, use the
interactive emulator as above.

## Check it automatically

`checks/smoke.json` says what the game should do:

```json
{
  "settleCycles": 3000000,
  "beforeText": "PRESS A TO CATCH IT",
  "input": "A",
  "afterText": "CAUGHT! SCORE 1"
}
```

`clementina check` builds the game, runs it headless, looks for the first
text on the screen, types `A`, and looks for the second:

```text
$ clementina check
Checks passed for /home/you/games/catch.
CPU: PC=$...., cycles=...
Screen:
  CATCH THE STAR
  PRESS A TO CATCH IT
After input:
  CAUGHT! SCORE 1
  PRESS R TO RESTART
Report: /home/you/games/catch/build/inspection/report.json
```

It fails if either text is missing. [Automation and AI
agents](../running/automation.md) covers these checks.

## Change it

Edit `src/main.bas`, for example to print a different message, then
`clementina build` again. In the emulator, `LOAD "build/game.bas"` and `RUN`
pick up the new program; the palette is still in palette RAM.

Two things differ from typing a program into Clementina:

- The source is text, so any editor works. Lines can come in any order and
  the build sorts them, as BASIC does when you type them. VS Code with the
  Clementina extension adds keyword help and error checking as you type
  ([Programming in BASIC with the SDK](../building/basic.md)).
- A source line may be up to 80 characters long, line number included.
