# Making assets in Studio

Clementina Studio is a desktop editor for every kind of asset in the
previous chapter. It speaks the hardware's vocabulary (palette banks, CHR
banks, OAM order) and previews everything the way MIA draws and plays it.
This chapter shows how Studio works with an SDK project, then walks through
its editors.

## Studio and the project folder

Studio can keep a project in two kinds of file:

- **A project folder**: an SDK project's `clementina.yaml` and its asset
  files. This is the one the rest of the book uses.
- **A `.cstudio` file**: Studio's own single-file format, holding every
  asset in one JSON document. It suits sketching before there is a project.

To work on an SDK project, make the project with the SDK first (a template,
as in Part I), then open it in Studio:

1. **File ▸ Open Project…** (Ctrl/Cmd+O) and choose the project's
   `clementina.yaml`.
2. Studio loads every asset the manifest lists into its editors. The
   window's title names the project.
3. Edit, add and delete assets.
4. **File ▸ Save Project** (Ctrl/Cmd+S) writes them back into the folder.

Saving writes each asset to the path the manifest already gives it, and a
new asset to `assets/<kind>/<id>.json`. It updates the manifest's asset
lists and leaves `program` and `build` as they were. It never touches your
source files. Saving checks the whole project first and refuses to write one
that wouldn't validate.

Two things to know about saving:

- **Studio writes only the assets it holds.** If the manifest lists an asset
  Studio doesn't have (you deleted it in Studio, or added it to the folder
  while Studio was open), saving asks before taking it out of
  `clementina.yaml`. Cancel is the default. The file itself stays in the
  folder either way.
- **The manifest is rewritten from scratch**, so comments and formatting
  in it are lost ([The project folder](project-folder.md#editing-the-manifest)).

**Save Project As…** always writes a `.cstudio` file, and the window stops
being connected to the folder. **New Project** starts an empty `.cstudio`
project.

If Studio quits without saving, it keeps a recovery snapshot, and offers to
recover the unsaved work the next time it starts.

## The layout

The tabs along the top are the editors, in the order a game is usually made:
Palettes, Tilesets, Overlays, Backgrounds, Shapes, Animations, Sounds,
Music. Ctrl/Cmd+1 to 9 switch between them. Beside the tabs is the **Config
picker**: the palette config every editor previews with. Switching it
recolors everything on screen and changes nothing in the project, so switch
freely.

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
any other tool it opens the edit menu. Shift+H and Shift+V flip the
selection. Ctrl/Cmd+C, X and V copy, cut and paste through one clipboard
that holds one kind of thing at a time (pixels, cells, sprites, frames, a
palette, a color, sound frames or notes), so a paste only lands where it
fits. Ctrl/Cmd+D duplicates sprites and frames.

One undo history covers the whole project: Ctrl/Cmd+Z and
Ctrl/Cmd+Shift+Z (or Ctrl/Cmd+Y) step through every edit in every editor,
and the Undo and Redo buttons name the step they would take. Deleting
anything undo can bring back asks no question.

**?**, Ctrl/Cmd+/ or **Help ▸ Keyboard Shortcuts** lists every key that
works everywhere and in the editor on screen.

## Palettes

The palette library on the left, the eight colors of the selected palette in
the middle, the palette configs on the right. A config shows all sixteen
banks, each with a picker for the palette it holds. Deleting a palette that
configs use asks which palette those banks should hold instead, or offers to
empty them.

Make one config for every palette RAM layout the game loads, and pick the
one to preview with in the Config picker.

## Tilesets

A 16×16 map of the tileset's tiles, a zoomable pixel canvas over the part of
the map you select, and palette RAM as the active config arranges it.

Painting records the selected color's palette bank on the tile: that is the
bank the tile defaults to when you place it later. A 1 bpp tileset shows a
plane selector for its three pages, and its color picker offers only colors
0 and 1.

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

The dialog previews the source, the converted image as Clementina would show
it, and where it lands in the tileset, and changes nothing until **Import
image**.

Raw tile data (`.CHR`, `.BIN` or `.PRG` files of CHR bytes) imports into a
new tileset.

## Overlays

The fixed 40×25 overlay, with a primary and an alternate tileset. The tile
picker on the left shows either tileset; clicking a tile sets the stamp's
tile and which tileset it reads in one go, and dragging picks a rectangle of
tiles. The pencil stamps; fill, rectangle and the eraser work one tile at a
time. The palette dock sets the stamp's bank.

The **Placeholder** tool drags out a placeholder; the Placeholders panel
lists them by name, and the Placeholder panel on the right edits the
selected one's column, row, width and height. Placeholders can't overlap or
leave the grid. They show as labeled dashed outlines that don't block
painting.

## Backgrounds

Like the overlay editor, on a map of any size. **Resize** keeps the cells
anchored at the top left.

Two rectangles over the map preview the hardware, each with its own handle:

- **White**: the plane of the chosen `BGMODE`, what would be loaded into the
  background tables.
- **Yellow**: the 320×200 screen, placed in the plane by the scroll
  position. It wraps at the plane's edges, as the hardware does.

The **Status** panel explains the two colors and shows the register-level
detail: `BGMODE`, `BGSET`, the plane's origin in the map, `SCROLL_X` and
`SCROLL_Y`, and which physical tables the screen touches. Use it to plan how
a level scrolls. **Toggle overlay** draws an overlay over the screen
rectangle, to check a level with its HUD. None of this is saved in the
background.

## Shapes

Create a shape, pick its tileset, then pick tiles in the tile map and place
them around the origin (the Place tiles tool). Drag to move sprites, arrows
nudge them a pixel, and the right rail flips and reorders the selected
sprites: up and down one OAM record, or to the front or the back. The list
order is OAM order, so a later sprite draws on top.

Each sprite's palette bank starts as its tile's bank; change it per sprite.
A shape's tileset can be switched at any time; the sprites keep their tile
numbers and show those tiles of the new tileset.

## Animations

Select shapes in the library (Ctrl/Cmd-click or Shift-click) and append them
as frames. The editor only offers shapes on the animation's tileset. The
frame strip reorders by dragging or Alt+←/→. The Frame panel on the right
edits the selected frame's shape, ticks and offset; dragging on the preview
offsets the pose too. Shift+H and Shift+V flip a frame; a flipped frame's
card is marked ↔ or ↕.

Space plays and pauses, the arrows step frames. The preview is the native
320×200 screen at 60 ticks a second, and it loops.

## Sounds

A library of sound effects on the left. The frames run across five lanes:
pitch (on a log scale that snaps to semitones while Snap is on), volume,
pulse width (dimmed on frames that aren't pulse waves), waveform and gate.

The pencil (B) draws values, the line (L) drags an even ramp (a pitch sweep,
a fade), and the eraser (E) writes 0. The Select tool (S) takes a range of
frames to copy, cut, paste, duplicate or delete. The right rail reverses
(Shift+H), inverts the pitch (Shift+V) and transposes (↑ and ↓, Shift for an
octave), on the selection or on the whole sound.

The **Sound** panel holds the envelope with its curve, the pan, the length,
and the **Generate** buttons: blip, coin, jump, laser, explosion, hit,
power-up and random. Each click is a new take.

## Music

Songs and instruments are libraries on the left. The main area holds a voice
strip (pick the voice to draw on, 1 to 4, and mute voices in the preview), a
piano roll where the other voices show dimmed, and a transport.

The pencil adds a note of the last length; drag to size it. Drag a note to
move it and its end to resize it; right-click erases. A note placed over
another on the same voice cuts it, since a voice plays one note at a time.
With the Select tool (S): ← and → move notes a step, ↑ and ↓ transpose
(Shift for an octave), Shift+H reverses them in time, Shift+V inverts them,
and L makes them legato. Clicking an instrument gives it to the selected
notes.

The ruler sets where playing and pasting start; its right-click menu plays
from there or sets the loop. The **Song** panel holds the tempo, steps per
beat, meter, length, loop, each voice's pan and how many bytes each voice's
track takes in MIA RAM. The **Instrument** panel holds the waveform, pulse
width, volume and envelope; click the roll's keyboard to hear it.

Space plays and stops when tapped, and pans while held.

## How faithful the previews are

- **Graphics** are drawn the way the video client draws them: the same layer
  order, color 0 transparent on sprites and the overlay and a real color on
  the background, and palettes from the active config.
- **Sound** plays on a port of MIA's own audio code that produces the same
  samples as the firmware, checked sample for sample against it. What it
  doesn't model is the board's output stage.

What Studio can't preview yet is a whole scene: a background, sprites and an
overlay together under one config, with sprite-against-background priority.
That is the program's job, and the emulator's to show.
