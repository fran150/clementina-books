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

## Field entries

These numbers are configuration-field ids, not CPU or MIA RAM addresses.
Write an id to `CFG_SELECT` at `$FFE2`, then read or write its value through
`CFG_PORT` at `$FFE3`. Decimal id comes first, followed by hexadecimal
and the field name. Multi-byte addresses are little-endian.

### 0–2　　$00–$02　　CFG_IDXA_ADDR_L / M / H

The current 24-bit MIA RAM address of the descriptor bound to window A.
Low, middle and high bytes are separate fields. Window A's data port at
`$FFE0` accesses the byte at this address; if stepping is enabled, a port
access changes the current address afterward. Writing any address byte
reloads the port from the new position.

### 3–5　　$03–$05　　CFG_IDXA_DEF_L / M / H

The default address of window A's bound descriptor. A reset-index command
returns the descriptor's current address here, and forward wrapping also
lands here. Set this to the first byte of a region when building a
streaming index; it is a boundary value, not the current cursor itself.

### 6–8　　$06–$08　　CFG_IDXA_LIM_L / M / H

One byte past the end of window A's intended range. With wrapping
enabled, a forward step that reaches this limit returns to the default
address. A block from `$14000` through `$140FF`, for example, has a
limit of `$14100`. The limit is exclusive even though address ranges in
the prose of this book normally include both endpoints.

### 9–10　　$09–$0A　　CFG_IDXA_STP_L / H

The 16-bit amount by which window A's current address moves after an
eligible port access. A step of 1 streams consecutive bytes; larger steps
can visit one field of repeated records. The flags at `$0B` decide whether
reads, writes or both cause a step and whether it runs forward or backward.

### 11　　$0B　　CFG_IDXA_FLAGS

Bit 0 steps after a read, bit 1 after a write, bit 2 chooses backward
instead of forward, bit 3 enables wrapping, and bit 4 requests a wrap
interrupt. These flags act on the descriptor currently bound to window A.
A program can leave both step-enable bits clear when it wants to revisit
one byte repeatedly without moving the address.

### 12–15　　$0C–$0F　　Window A reserved

These four ids have no current configuration fields. They are reserved
between the A and B groups so the layout can grow. Writing one as a field
selector does not make it program-owned storage.

### 16–18　　$10–$12　　CFG_IDXB_ADDR_L / M / H

The current MIA RAM address for window B's bound descriptor, low byte
first. Its data port is `$FFE4`. Window B is independent of window A, so
one can point at a source block while the other points at a destination;
writing one of these bytes reloads B's port.

### 19–21　　$13–$15　　CFG_IDXB_DEF_L / M / H

Window B's default address. Resetting its bound index or wrapping forward
returns the current address here. It is useful for a repeated destination
range, such as a ring buffer, when B's wrap flag is enabled.

### 22–24　　$16–$18　　CFG_IDXB_LIM_L / M / H

The exclusive upper limit of window B's range. Forward wrapping compares
the current address against this value; backward wrapping returns to one
byte below it after crossing the default address. Configure it together
with B's default address rather than treating it as a byte count.

### 25–26　　$19–$1A　　CFG_IDXB_STP_L / H

Window B's 16-bit step magnitude. It controls how far the destination or
source cursor moves when B's flags permit a step. A step of zero keeps the
same address even if stepping is enabled; a step of one visits adjacent
bytes.

### 27　　$1B　　CFG_IDXB_FLAGS

The same flag layout as window A: read step, write step, direction, wrap
and wrap IRQ in bits 0-4. These bits belong to B's currently selected
descriptor. Changing them does not alter A's descriptor or its cursor.

### 28–31　　$1C–$1F　　Window B reserved

Four unassigned ids after B's descriptor fields. Programs should not rely
on values read from them; later firmware can define more configuration
fields here without changing the existing ids.

### 32–34　　$20–$22　　CFG_SPEED_L / M / H

The requested or applied CPU PHI2 frequency in hertz, as a 24-bit value
stored low byte first. Write low and middle bytes, then write the high
byte to commit the request. MIA applies a value within 1 Hz to 8 MHz and
reports the transition through `MIA_STAT_SPEED_CHANGING` and
`IRQ_SPEED_CHANGED`. Reading the fields returns the speed currently in
use; the default 1.2 MHz is `$124F80`.
