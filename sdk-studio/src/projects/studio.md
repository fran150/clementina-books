# Making assets in Studio

Clementina Studio is a desktop editor for every kind of asset in the
previous chapter. It previews everything the way MIA draws and plays it.
This chapter shows how Studio works with an SDK project, then walks through
its editors.

## Studio and the project folder

Studio can keep a project in two kinds of file:

- **A project folder**: an SDK project's `clementina.yaml` and its asset
  files. This is the one the rest of the book uses.
- **A `.cstudio` file**: Studio's own single-file format, holding every
  asset in one JSON document. It suits sketching before there is a project.

To work on an SDK project, make the project with the SDK first (`clementina new`,
as in Part I), then open it in Studio:

1. **File ▸ Open Project…** (Ctrl/Cmd+O) and choose the project's
   `clementina.yaml`.
2. Studio loads every asset the manifest lists into its editors. The
   window's title names the project.
3. Edit, add and delete assets.
4. **File ▸ Save Project** (Ctrl/Cmd+S) writes them back into the folder.

Before saving, Studio validates the project. If validation fails, it does
not write the changes. A successful save writes existing assets to their
listed paths and new ones to `assets/<kind>/<id>.json`. It updates the
manifest's asset lists too.

Your source files and the manifest's `program` and `build` settings stay as
they were.

Two things to know about saving:

- **Studio writes only the assets it holds.** If the manifest lists an asset
  Studio doesn't have (you deleted it in Studio, or added it to the folder
  while Studio was open), saving asks before taking it out of
  `clementina.yaml`. Cancel is the default. The file itself stays in the
  folder either way.
- **Studio changes only what changed in the manifest**, so your comments and
  hex addresses stay ([The project folder](project-folder.md#editing-the-manifest)).

**Save Project As…** always writes a `.cstudio` file, and the window stops
being connected to the folder. **New Project** starts an empty `.cstudio`
project.

To turn a `.cstudio` sketch into a project folder, import it with the SDK:

```sh
clementina project import sketch.cstudio my-game --name "My Game"
```

This writes a new project with assembly: each asset in its own file under
`assets/`, the session's Builder settings as `build.assets`, and a starter
`src/main.s` and `link.cfg`. It never overwrites a file. The name defaults to
the session file's name. Open the new `clementina.yaml` in Studio as above.

If Studio quits without saving, it keeps a recovery snapshot, and offers to
recover the unsaved work the next time it starts.

## The layout

The tabs along the top open the editors: Palettes, Tilesets, Overlays,
Backgrounds, Shapes, Animations, Sounds and Music. Ctrl/Cmd+1 to 9 switch
between tabs.

Beside them, the **Config picker** chooses the palette config used for
preview. Switching it recolors the previews without changing the project.

Every editor is laid out the same way:

- **A left rail** of panel toggles and tools, with Copy, Paste, Undo and
  Redo at the bottom.
- **Left docks** with what you pick from: the asset library, a tile picker.
- **The canvas** in the middle.
- **A right rail** with the selection's transforms (flips, rotation,
  priority, arrangement, delete) and the toggle for its panel.
- **A right dock** with the selection's properties.

Docks sit beside the canvas and never cover it. An editor with nothing to
edit says what is missing and offers the button that makes it.

### Navigating a canvas

| Action | How |
| --- | --- |
| Pan | the wheel or a two-finger swipe; Shift+wheel sideways; Space-drag, the middle button, or the Pan tool (H) |
| Zoom around the pointer | a pinch, or Ctrl/Cmd+wheel |
| Zoom in, out, to fit, to 100% | Ctrl/Cmd+=, Ctrl/Cmd+−, Ctrl/Cmd+0, Ctrl/Cmd+Alt+0, or the cluster at the top of the canvas |

Zoom steps are whole numbers above 1× (1, 2, 3, 4, 6, 8, 12, 16, 24, 32),
so every art pixel stays the same size on screen.

### Tools and keys

Painting tools have the same letter in every editor:

| Key | Tool |
| --- | --- |
| B | pencil |
| E | eraser |
| G | fill |
| I | pick (eyedropper) |
| R | rectangle |
| S | select |
| H | pan |
| L | line (tilesets, sounds) |
| O | ellipse (tilesets) |
| V | select and move (shapes) |

With a painting tool, the right button paints color 0, which erases. With
another tool, it opens the edit menu. Shift+H and Shift+V flip the selection.

Ctrl/Cmd+C, X and V copy, cut and paste. The clipboard holds one kind of
item at a time, such as pixels, cells, sprites, frames or notes. Paste is
available where that item fits. Ctrl/Cmd+D duplicates sprites and frames.

One undo history covers the whole project. Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z
(or Ctrl/Cmd+Y) step through edits across all editors. The Undo and Redo
buttons show the name of the next step. You can undo deletions.

**?**, Ctrl/Cmd+/ or **Help ▸ Keyboard Shortcuts** lists every key that
works everywhere and in the editor on screen.

## Palettes

The palette library is on the left, the selected palette's eight colors in
the middle, and palette configs on the right. Each config shows its sixteen
banks with a palette picker for each one.

If you delete a palette used by a config, Studio asks which palette should
replace it in those banks. You can also leave the banks empty.

Make one config for every palette RAM layout the game loads, and pick the
one to preview with in the Config picker.

## Tilesets

The editor shows a 16×16 map of the tileset's tiles. Select part of the map
to edit it on a zoomable pixel canvas. The color picker shows palette RAM
as the active config arranges it.

When you paint, Studio records the selected color's palette bank on the
tile. That becomes the tile's default bank when you place it. A 1 bpp
tileset has three pages, selected with the plane picker, and offers only
colors 0 and 1.

The **Objects** list holds named selections of tiles (a 2×2 tree, a 4×4
house), the tileset's compositions. The background and overlay editors list
them too, to pick the whole group as one stamp.

### Importing artwork

**Import image** brings a PNG, BMP or GIF (up to 20 MB) into the tileset:

1. **Crop** the part of the image to use, and optionally resize it (nearest
   neighbor, up to 128×128 pixels).
2. **Colors**: match the image's colors to the existing palettes, or create
   palettes where none fits. Pixels below the alpha cutoff become color 0.
3. **Place at tile**: the column and row of the tileset where the image's
   top-left tile goes, and whether to make an Object of it.

The dialog previews the source, the converted image and its destination in
the tileset. It changes nothing until you choose **Import image**.

Raw tile data (`.CHR`, `.BIN` or `.PRG` files of CHR bytes) imports into a
new tileset.

## Overlays

The overlay editor shows the fixed 40×25 grid and its primary and alternate
tilesets. The tile picker on the left shows either tileset. Click a tile to
make it the stamp, or drag to select a rectangle of tiles.

The pencil places the stamp. Fill, rectangle and eraser work one tile at a
time. The palette dock chooses the stamp's bank.

Use the **Placeholder** tool to draw a placeholder. The Placeholders panel
lists them by name; the panel on the right edits the selected one's position
and size. Placeholders cannot overlap or leave the grid. Their dashed
outlines do not block painting.

## Backgrounds

Like the overlay editor, on a map of any size. **Resize** keeps the cells
anchored at the top left.

Two rectangles over the map preview the hardware, each with its own handle:

- **White**: the plane of the chosen `BGMODE`, what would be loaded into the
  background tables.
- **Yellow**: the 320×200 screen, placed in the plane by the scroll
  position. It wraps at the plane's edges, as the hardware does.

The **Status** panel explains the rectangles and shows `BGMODE`, `BGSET`,
the plane's origin, `SCROLL_X`, `SCROLL_Y` and the tables touched by the
screen. Use it to plan a scrolling level.

**Toggle overlay** draws an overlay over the screen rectangle so you can
check the level with its HUD. These preview settings are not saved in the
background.

## Shapes

Create a shape and choose its tileset. Pick tiles from the map, then place
them around the origin with the Place tiles tool. Drag sprites to move them,
or use the arrow keys to nudge them one pixel.

The right rail flips and reorders selected sprites. You can move them one
OAM record at a time or send them to the front or back. Later sprites in
the list draw on top.

Each sprite's palette bank starts as its tile's bank; change it per sprite.
A shape's tileset can be switched at any time; the sprites keep their tile
numbers and show those tiles of the new tileset.

## Animations

Select shapes in the library with Ctrl/Cmd-click or Shift-click, then append
them as frames. The editor offers only shapes on the animation's tileset.

Drag frames in the strip to reorder them, or use Alt+←/→. The Frame panel
edits a frame's shape, duration and offset. You can also drag the preview
to move the pose. Shift+H and Shift+V flip it; ↔ and ↕ mark flipped frames.

Space plays and pauses, the arrows step frames. The preview is the native
320×200 screen at 60 ticks a second, and it loops.

## Sounds

A library of sound effects on the left. The frames run across five lanes:
pitch (on a log scale that snaps to semitones while Snap is on), volume,
pulse width (dimmed on frames that aren't pulse waves), waveform and gate.

The pencil (B) draws values. The line tool (L) makes an even ramp, such as a
pitch sweep or fade. The eraser (E) writes 0. Select (S) picks frames to
copy, cut, paste, duplicate or delete.

The right rail can reverse frames (Shift+H), invert pitch (Shift+V), or
transpose with ↑ and ↓ (hold Shift for an octave). These actions work on the
selection or the whole sound.

The **Sound** panel holds the envelope with its curve, the pan, the length,
and the **Generate** buttons: blip, coin, jump, laser, explosion, hit,
power-up and random. Each click is a new take.

## Music

Songs and instruments are libraries on the left. The main area holds a voice
strip (pick the voice to draw on, 1 to 4, and mute voices in the preview), a
piano roll where the other voices show dimmed, and a transport.

The pencil adds a note of the last length; drag to size it. Drag a note to
move it, or drag its end to resize it. Right-click erases. Placing a note
over another on the same voice cuts the existing note, since a voice plays
one at a time.

With Select (S), ← and → move notes by a step, and ↑ and ↓ transpose them
(hold Shift for an octave). Shift+H reverses time, Shift+V inverts pitch, and
L makes notes legato. Click an instrument to assign it to selected notes.

The ruler sets where playing and pasting start. Right-click it to play from
that position or set the loop.

The **Song** panel holds the tempo, steps per beat, meter, length, loop and
pan for each voice. It also shows how much MIA RAM each voice's track uses.
The **Instrument** panel holds the waveform, pulse width, volume and
envelope. Click the piano roll's keyboard to hear it.

Space plays and stops when tapped, and pans while held.

## How faithful the previews are

- **Graphics** are drawn the way the video client draws them: the same layer
  order, color 0 transparent on sprites and the overlay and a real color on
  the background, and palettes from the active config.
- **Sound** uses the same audio samples as MIA's firmware. The board's output
  stage can change how they sound through speakers or headphones.

Studio previews each asset. To see a background, sprites and an overlay
together, including their priority, run the project in the emulator.
