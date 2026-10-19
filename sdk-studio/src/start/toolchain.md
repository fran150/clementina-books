# The toolchain at a glance

A Clementina game is a folder on your computer. The tools read it, turn it
into files Clementina can load, and run those files, in the emulator or on
the machine.

```text
  Studio  ─────┐  palettes, tilesets, backgrounds, overlays,
  (or a text   │  shapes, animations, instruments, sounds, songs
  editor, or   ▼
  an agent)   my-game/
               ├── clementina.yaml     the manifest
               ├── src/                BASIC or assembly source
               └── assets/             one JSON file per asset
                    │
                    ▼   clementina build
               my-game/build/          program, asset files, load plan
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
   the emulator             SD card for the
                            real machine
          │                    │
          └──── video client ──┘   the screen, keyboard, mouse, gamepads
```

## The pieces

| Tool | Repository | What it does |
| --- | --- | --- |
| The `clementina` CLI | `clementina-sdk` | Validates a project, builds it and runs it in the headless emulator. |
| The SDK packages | `clementina-sdk` | The same work as libraries (`@clementina/project`, `@clementina/build` and the rest) for Studio, the debugger, the MCP server and your own scripts. |
| The asset runtime | `clementina-sdk` | ca65 routines a game links to load and use its assets. |
| cc65 | [cc65.github.io](https://cc65.github.io) | The `ca65` assembler, `ld65` linker and `ar65` archiver, for assembly programs. |
| Clementina Studio | `clementina-studio` | A desktop editor for every kind of asset. |
| The emulator | `clementina-6502` | `clementina-emulator`, the interactive emulator, and `clementina-automation`, the headless one the SDK drives. |
| The video client | `clementina-video-client` | Clementina's screen and input devices, on your computer. |
| The VS Code extension | `clementina-sdk` | Syntax, a language server for BASIC, and the debugger. |
| The MCP server | `clementina-sdk` | The SDK as tools for an AI agent. |

## Clementina has no screen of its own

Clementina has no video connector and no keyboard port. MIA, the
co-processor that runs Clementina's video, sound, input and SD card, keeps
the screen as tiles, sprites and palettes in its RAM and sends that state
over Wi-Fi to the **video client**, a program on your computer that draws it
in a window. The keyboard, mouse and gamepads plugged into your computer go
back to MIA the same way.

The emulator does the same: its emulated MIA serves video and input on two
UDP ports of your computer, and the same video client connects to it. So the
screen looks the same in the emulator and on the machine, and you need the
video client for both.

## What the SDK decides and what you decide

The SDK is a set of tools, not an engine. It checks that the assets are
valid and fit the hardware, encodes them in the formats MIA loads, compiles
or assembles the program, and writes the BASIC commands that load it all.
It never decides *when* something happens. When to load a level, which
palette to show, which sprite goes where: that is the program's code.

Two kinds of program are supported, and they get different help from the
build:

| | BASIC | Assembly |
| --- | --- | --- |
| Source | numbered BASIC text, `.bas` | ca65 source, `.s` |
| The build makes | a tokenized BASIC file | a PRG file, linked by ld65 |
| Assets the build loads before the program | one palette config and up to eight tilesets | the same |
| Other assets | the program loads them with BASIC statements | the build writes them to the card, and the program loads them with the asset runtime |
| Debugging | line breakpoints, stepping, variables | source breakpoints, stepping, registers, call stack |

A project that mixes BASIC and assembly is planned (`program.kind: mixed`)
but not built yet: the SDK rejects it.
