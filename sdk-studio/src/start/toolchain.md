# The toolchain at a glance

A Clementina project is a folder on your computer.
[The project folder](../projects/project-folder.md) shows what a typical one
contains. You write the code in an editor such as VS Code, with the
Clementina extension, and make the assets in Clementina Studio. The SDK's
then builds the project into files Clementina can run.

## The tools

| Tool | Repository | What you use it for |
| --- | --- | --- |
| The `clementina` CLI | [clementina-sdk](https://github.com/fran150/clementina-sdk) | Checking, building and running a project from the terminal. |
| Clementina Studio | [clementina-studio](https://github.com/fran150/clementina-studio) | Drawing graphics, composing music and editing every other kind of asset. |
| The VS Code extension | [clementina-sdk](https://github.com/fran150/clementina-sdk) | Writing BASIC and assembly with highlighting (and error checks for BASIC), and debugging both. |
| The MCP server | [clementina-sdk](https://github.com/fran150/clementina-sdk) | Letting an AI agent check, build and run projects. |
| The emulator | [clementina-6502](https://github.com/fran150/clementina-6502) | Running a program without the hardware. `clementina-emulator` is the interactive one; `clementina-automation` is a headless one the other tools drive. |
| The video client | [clementina-video-client](https://github.com/fran150/clementina-video-client) | Seeing Clementina's screen and using its keyboard, mouse and gamepads, from the emulator or the real machine. |
| cc65 | [cc65](https://github.com/cc65/cc65) | Assembling and linking a project's assembly code (`ca65`, `ld65`, `ar65`). |

### The Clementina library

The SDK comes with the [Clementina library](../building/runtime.md), 6502
routines your assembly can call to load and use assets, play sound, keep
time and read input. Every project with assembly links it, and the program gets only the
routines it calls. Its chapter and Appendix D list what it has.
