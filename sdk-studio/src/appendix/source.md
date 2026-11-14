# Appendix G: A development install

This appendix is for working on the tools themselves: changing the SDK,
Studio, the emulator or the video client and trying the change before it is
released. To make projects, install the released tools as in
[Installing](../start/installing.md) instead.

A development install sits beside the released tools; it doesn't replace
them. Your own builds go into one folder, `~/.clementina/dev/bin`, and a
shell switch puts that folder ahead of the released tools on your `PATH`, one
terminal at a time. The SDK's
[docs/dev-install.md](https://github.com/fran150/clementina-sdk/blob/main/docs/dev-install.md)
has the full details.

## The checkouts

Put the checkouts side by side in one folder; Studio expects the SDK next
to it:

```text
$ git clone https://github.com/fran150/clementina-sdk.git
$ git clone https://github.com/fran150/clementina-studio.git
$ git clone https://github.com/fran150/clementina-6502.git
$ git clone https://github.com/fran150/clementina-video-client.git
```

You need:

| What | For | Version |
| --- | --- | --- |
| Node.js | the SDK, Studio, the VS Code extension | 20 or later |
| Go | the emulator and the video client | 1.23 or later |
| cc65 | assembly code | any recent release; the SDK needs ld65's debug format 2 |

On Linux, the emulator's sound needs a C compiler and the ALSA headers
(`libasound2-dev` on Debian, Ubuntu and Raspberry Pi OS), and the video
client needs the X11 and OpenGL development packages that
[Ebitengine](https://ebitengine.org)'s install guide lists. macOS and
Windows need nothing extra.

## Building into the dev folder

```text
$ cd clementina-sdk && npm ci && npm run dev:install
$ cd ../clementina-6502 && make dev-install
$ cd ../clementina-video-client && make dev-install
```

- The SDK's `dev:install` builds every package and writes `clementina` and
  `clementina-mcp` launchers that run your checkout. After that, a plain
  `npm run build` is enough: the launchers pick up the change.
- The emulator's `make dev-install` builds `clementina-emulator` and
  `clementina-automation`; the video client's builds
  `clementina-video-client` and `clementina-render`. Run it again after each
  change.

`CLEMENTINA_DEV_BIN` picks another folder. On Windows the launchers are
`.cmd` files, and you add the folder to your `PATH` yourself.

## Switching between dev and released tools

`dev:install` also copies a shell switch to
`~/.clementina/dev/clementina-dev.sh`. Load it from your shell's startup file
(bash or zsh):

```text
. ~/.clementina/dev/clementina-dev.sh
```

Then, in any terminal:

```text
$ clementina-dev on
$ clementina-dev status
clementina: dev, /Users/you/.clementina/dev/bin/clementina
clementina-automation: dev, /Users/you/.clementina/dev/bin/clementina-automation
...
$ clementina-dev off
```

`on` affects only that terminal, so one terminal can run your builds while
another runs the released tools. `clementina run`, the debugger and the MCP
server find `clementina-automation` on the `PATH`, so they use whichever
copy is switched on.

## Knowing which copy you're running

Every tool says where it came from:

```text
$ clementina --version
clementina 0.3.0-alpha.1 (dev build, commit 9071659, /Users/you/clementina/clementina-sdk)
$ clementina-automation --version
clementina-automation dev (commit c8147de)
```

A released tool prints its version instead, such as `clementina
0.3.0-alpha.1` or `clementina-automation v0.4.0-alpha.1 (commit abc1234)`,
and "with local changes" marks a dev build with uncommitted edits.
`clementina doctor` prints the same line for itself and the path and version
of every tool it finds.

## Studio

In the Studio checkout, `npm start` builds Studio and opens it. It uses the
SDK checkout next to it, so it always runs your SDK changes. The installed
Studio stays separate.

## The VS Code extension

To try a change, open `clementina-sdk/packages/vscode-extension` in VS Code
and press `F5`: a second VS Code window opens with your build of the
extension. To install your build instead:

```text
$ cd clementina-sdk/packages/vscode-extension
$ npm run package
$ code --install-extension --force clementina-*.vsix
```

Installing the release `.vsix` again goes back to the released extension.
