# E. Colors and the default palette

The 16 colors that `COLOR`, `BCOLOR`, the ESC `0` to ESC `F` keys and the
sprite and background palette numbers use, as Clementina starts:

| Number | ESC key | Color | Number | ESC key | Color |
| --- | --- | --- | --- | --- | --- |
| 0 | `0` | white | 8 | `8` | magenta |
| 1 | `1` | red | 9 | `9` | black |
| 2 | `2` | orange | 10 | `A` | gray |
| 3 | `3` | yellow | 11 | `B` | light gray |
| 4 | `4` | green | 12 | `C` | brown |
| 5 | `5` | cyan | 13 | `D` | dark green |
| 6 | `6` | blue, the background's color | 14 | `E` | light blue |
| 7 | `7` | violet | 15 | `F` | white |

Each number is really a **palette** of eight colors. Text and one-color
tiles use color 1 of the palette, which is the color in the table above.
Tiles drawn with more colors (in Clementina Studio, for example) use the
other seven. A program can change any of the 128 colors with `PALETTE`;
the *Programmer's Reference Guide* shows how.

The full palette, with each color's value:

{{#include ../../../tables/mia-video-palette.md}}
