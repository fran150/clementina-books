# Installing

## With Homebrew

On macOS, and on Linux with [Homebrew](https://brew.sh), one command per
tool installs everything:

```text
$ brew install fran150/clementina/clementina
$ brew install fran150/clementina/clementina-emulator
$ brew install fran150/clementina/clementina-video-client
$ brew install --cask fran150/clementina/clementina-studio
```

- `clementina` is the `clementina` command. It installs cc65 with it.
- `clementina-emulator` installs `clementina-emulator`, the interactive
  emulator you play and debug in, and `clementina-automation`, the headless
  one that `clementina run` and the debugger start on their own. Its sample
  SD card is in `$(brew --prefix)/share/clementina-emulator/SD`.
- `clementina-video-client` installs `clementina-video-client`, which shows
  Clementina's screen, and `clementina-render`, which turns a saved screen
  into a PNG.
- `clementina-studio` installs Clementina Studio (macOS only).

`brew upgrade` updates them. The VS Code extension isn't in Homebrew: install
it as in [The VS Code extension](#the-vs-code-extension) below. Then skip to
[Checking the installation](#checking-the-installation).

## From the releases pages

On Windows, and on Linux without Homebrew, download the tools instead.
Every tool comes as a ready-made download from its repository's GitHub
releases page. Clementina is in alpha, so these are *prereleases*: GitHub
lists them under **Releases** with a "Pre-release" label. Each release has a
`SHA256SUMS` file to check the downloads against.

| What | Release | Download |
| --- | --- | --- |
| The `clementina` command | [clementina-sdk](https://github.com/fran150/clementina-sdk/releases) | `clementina-<os>-<arch>` |
| The VS Code extension | [clementina-sdk](https://github.com/fran150/clementina-sdk/releases) | `clementina-<version>.vsix` |
| The emulator | [clementina-6502](https://github.com/fran150/clementina-6502/releases) | `clementina-emulator-<version>-<os>-<arch>.tar.gz` (`.zip` on Windows) |
| The video client | [clementina-video-client](https://github.com/fran150/clementina-video-client/releases) | `clementina-video-client-<version>-<os>-<arch>.tar.gz` (`.zip` on Windows) |
| Clementina Studio | [clementina-studio](https://github.com/fran150/clementina-studio/releases) | `.dmg` on macOS, `.AppImage` on Linux, `.exe` on Windows |

`<os>-<arch>` is `darwin-arm64` for an Apple Silicon Mac, `darwin-amd64` for
an Intel Mac, `linux-amd64` or `linux-arm64` for Linux, and
`windows-amd64` for Windows.

You also need **cc65** to build assembly code, and **VS Code** if you want
the debugger.

### The command-line tools

The `clementina` command, the emulator and the video client are plain
executables. Put them all in one folder on your `PATH`, such as
`~/.local/bin` on macOS and Linux:

1. Download `clementina-<os>-<arch>` from the SDK release and rename it to
   `clementina` (`clementina.exe` on Windows). It needs nothing else
   installed, not even Node.js.
2. Unpack the emulator archive. It holds `clementina-emulator`, the
   interactive emulator you play and debug in, and `clementina-automation`,
   the headless one that `clementina run`, the debugger and the MCP server
   start on their own.
3. Unpack the video client archive. It holds `clementina-video-client`,
   which shows Clementina's screen, and `clementina-render`, which turns a
   saved screen into a PNG.

On macOS and Linux, make them executable with `chmod +x`. The downloads
aren't signed, so macOS refuses to open them at first. Clear that once for
each file:

```text
$ xattr -d com.apple.quarantine ~/.local/bin/clementina*
```

On Linux the emulator's sound needs the ALSA library (`libasound2` on
Debian, Ubuntu and Raspberry Pi OS), which most desktops already have.

If `clementina-automation` isn't on your `PATH`, tell the SDK where it is
with the `CLEMENTINA_EMULATOR` environment variable or the `--emulator`
option.

### cc65

Install cc65 with your system's package manager (`brew install cc65` on
macOS, `apt install cc65` on Debian and Ubuntu), or from
[cc65.github.io](https://cc65.github.io) on Windows. The SDK runs `ca65`,
`ld65` and `ar65` from your `PATH` whenever a project has assembly.

### Studio

Open the `.dmg` and drag Clementina Studio to Applications on macOS, run
the `.AppImage` on Linux, or run the installer on Windows. Studio isn't
signed either: on macOS clear the quarantine flag once,

```text
$ xattr -d com.apple.quarantine "/Applications/Clementina Studio.app"
```

and on Windows choose **More info** and then **Run anyway** when SmartScreen
warns about it.

Studio runs and previews projects with `clementina-automation` and
`clementina-render`, which it finds on your `PATH`. If you keep them
elsewhere, it lets you choose each one yourself.

## The VS Code extension

Download the `.vsix` from the SDK release and install it:

```text
$ code --install-extension clementina-0.3.0-alpha.1.vsix
```

or use **Extensions: Install from VSIX…** in VS Code's command palette. The
extension isn't on the Marketplace, which doesn't take prerelease
versions. It carries its own copy of the SDK's debugger and BASIC language
server, so it needs nothing else from the SDK; debugging still needs the
emulator. To update it, install the newer `.vsix` the same way.

The extension covers both languages. `.bas` files get BASIC
highlighting and the language server, and `.s` and `.inc` files get
Clementina Assembly highlighting (65C02 and ca65). You can set breakpoints
from the gutter in both, so you don't need a third-party assembly extension.

## The MCP server

The MCP server, which lets an AI agent use the SDK, is part of the
`clementina` command. An agent host starts it with:

```text
clementina mcp
```

[Automation and AI agents](../running/automation.md#the-mcp-server) shows how to add it to a host.

## Checking the installation

`clementina doctor` prints its own version, then looks for each external
tool:

```text
$ clementina doctor
clementina 0.3.0-alpha.1
ca65: ready, /opt/homebrew/bin/ca65 (ca65 V2.19)
ld65: ready, /opt/homebrew/bin/ld65 (ld65 V2.19)
ar65: ready, /opt/homebrew/bin/ar65 (ar65 V2.19)
emulator: ready, /Users/you/.local/bin/clementina-automation (clementina-automation v0.4.0-alpha.1 (commit abc1234))
```

A missing tool is a warning, and `doctor` still succeeds, because a BASIC
project needs neither cc65 nor the emulator to build. `doctor --strict`
fails unless all four are there. `doctor --emulator PATH` checks a
particular `clementina-automation` executable.
