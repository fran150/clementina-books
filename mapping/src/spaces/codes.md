# Status, IRQ and error codes

Three of MIA's registers are read as numbers whose meaning comes from a
table: the status bits, the interrupt bits and the error codes.

## Status: `$FFEA-$FFEB`

`STATUS_L` and `STATUS_H` report what MIA is doing right now. They are
levels: a bit is set while its condition holds and clears by itself.

{{#include ../../../tables/mia-status.md}}

Bits 12-15 of `STATUS_H` are unused.

## Interrupts: `$FFEE-$FFF1`

Each bit of `IRQ_STATUS_L`/`IRQ_STATUS_H` (`$FFF0-$FFF1`) records an event,
and the same bit of `IRQ_MASK_L`/`IRQ_MASK_H` (`$FFEE-$FFEF`) decides
whether that event pulls the CPU's IRQ line. Writing the mask takes effect
at once: if an event is already pending, the line goes low as soon as its
bit is enabled.

{{#include ../../../tables/mia-irq.md}}

Reading `IRQ_STATUS_L` clears every bit, `IRQ_TRIGGERED` included, and
releases the line. Read `IRQ_STATUS_H` first if the high bits matter. The
input bits come with their own detailed flags in MIA RAM, which stay set
until the program acknowledges them ([Input state](../mia/input.md)).

## Errors: `$FFEC`

MIA queues an error code each time something fails, and each read of
`ERROR_L` takes the oldest; `$00` means the queue is empty. While anything
is queued, `MIA_STAT_ERRORS` is set, and each new error raises `IRQ_ERROR`.
When the queue is full, a new error overwrites an unread one, and
MIA reports the loss with `ERROR_QUEUE_OVERFLOW` (`$02`). `ERROR_H` is unused.

The codes are grouped by subsystem in the high nibble: `$0x` the queue,
`$1x` copies, `$2x` commands and the context stack, `$3x` Wi-Fi, `$4x`
video, `$5x` input, `$6x` audio, `$7x-$8x` the SD card and file system.

{{#include ../../../tables/mia-errors.md}}
