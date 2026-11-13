# The toolchain at a glance

A Clementina game is a folder on your computer. You edit what is in it, the
SDK builds it into files Clementina can load, and you run those files in
the emulator or on the machine:

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 575 200" width="100%" style="max-width:640px" role="img" aria-label="Four steps from left to right. 1, Edit: in Studio, a text editor or an agent. 2, Project: the my-game folder with the manifest, source and assets. 3, Build: clementina build writes my-game/build. 4, Run: in the emulator or from an SD card in the machine. Under Run, a note says you see it on the video client.">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<rect x="10" y="20" width="120" height="110" rx="6"/>
<rect x="155" y="20" width="120" height="110" rx="6"/>
<rect x="300" y="20" width="120" height="110" rx="6"/>
<rect x="445" y="20" width="120" height="110" rx="6"/>
<path d="M132 75H151"/><path d="M146 70L152 75L146 80"/>
<path d="M277 75H296"/><path d="M291 70L297 75L291 80"/>
<path d="M422 75H441"/><path d="M436 70L442 75L436 80"/>
<path d="M505 132V152" stroke-dasharray="3 3"/>
</g>
<g fill="currentColor" font-family="sans-serif" font-size="12" text-anchor="middle">
<text x="70" y="46" font-size="14" font-weight="bold">1. Edit</text>
<text x="70" y="76">Studio,</text>
<text x="70" y="94">a text editor</text>
<text x="70" y="112">or an agent</text>
<text x="215" y="46" font-size="14" font-weight="bold">2. Project</text>
<text x="215" y="76" font-family="monospace" font-size="11">my-game/</text>
<text x="215" y="94">manifest, source</text>
<text x="215" y="112">and assets</text>
<text x="360" y="46" font-size="14" font-weight="bold">3. Build</text>
<text x="360" y="76" font-family="monospace" font-size="11">clementina build</text>
<text x="360" y="94">writes</text>
<text x="360" y="112" font-family="monospace" font-size="11">my-game/build/</text>
<text x="505" y="46" font-size="14" font-weight="bold">4. Run</text>
<text x="505" y="76">the emulator</text>
<text x="505" y="94">or an SD card</text>
<text x="505" y="112">in the machine</text>
<text x="505" y="170">you see and play it</text>
<text x="505" y="186">on the video client</text>
</g>
</svg>
</div>

[The project folder](../projects/project-folder.md) shows what is inside
`my-game/`. Both ways of running show the screen through the same video
client, as [the section below](#clementina-has-no-screen-of-its-own)
explains.

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
