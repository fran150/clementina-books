# Configuration fields

Ids `$00-$22`

Configuration fields are a second, small address space behind two
registers: write a field's id to `CFG_SELECT` (`$FFE2`), and `CFG_PORT`
(`$FFE3`) reads or writes that field. Selecting a field loads its current
value into the port.

There are three groups:

| Ids | Group | Acts on |
| --- | --- | --- |
| `$00-$0B` | Window A | The descriptor bound to window A: its current, default and limit addresses, its step and its flags. |
| `$10-$1B` | Window B | The same fields for window B's descriptor. |
| `$20-$22` | Speed | The CPU's clock, PHI2, in Hz. |

`$0C-$0F` and `$1C-$1F` are reserved.

{{#include ../../../tables/mia-config.md}}

## Window fields

The window fields reach whatever descriptor is bound to the window at the
moment, so to set up a descriptor, bind it first and then write the fields.
Writing a current-address byte also reloads the window's data port from the
new address, so the next read of the port returns the new byte with no
further select. Addresses are three bytes, low first, and step is two.
[The MIA registers](../cpu/mia-registers.md#configuration-ffe2-ffe3) has a
worked example.

## Clock speed

`CFG_SPEED_L`, `_M` and `_H` hold a 24-bit frequency in Hz. Writes are staged
a byte at a time, and writing `CFG_SPEED_H` commits the request. MIA applies
it shortly after, clamped to 1 Hz-8 MHz; meanwhile `MIA_STAT_SPEED_CHANGING`
is set, and when it is done MIA raises `IRQ_SPEED_CHANGED`. Reading the
fields returns the speed in use. The default is 1.2 MHz (`$124F80`).

Three things change with the clock: how fast the CPU runs, the kernel's
Timer 1 tick (192 Hz at 1.2 MHz) and with it `KJIFFY` and the cursor blink.
MIA's own clocks, `TI` and key repeat do not. The board's glue logic is
rated for about 6.5 MHz with worst-case parts, so speeds above that are not
guaranteed on every board.
