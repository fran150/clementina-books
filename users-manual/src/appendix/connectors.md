# F. Connectors at a glance

The rev 1 board's connectors, from its schematic. Pin by pin details are in
the *Hardware & MIA Technical Reference*.

| Connector | Where | What it is for |
| --- | --- | --- |
| MIA's USB port | top edge, on the Pico | Power for the whole board (5 V from a charger or a computer), MIA's USB console, and new firmware. |
| microSD slot | left edge, on the breakout | The SD card, FAT32. |
| Audio jack | left edge | 3.5 mm stereo line out, about 1 V peak to peak. There is no amplifier: use headphones or powered speakers. |
| RESET button | left edge | Restarts the 65C02 and the VIA through MIA. |
| User port (J3) | right edge | A 2 × 10 header with the VIA's port B and its CA and CB control lines, for your own circuits. The pins connect straight to the VIA, with nothing to limit the current, so treat them with care. |
| Expansion headers (J1, J2) | bottom edge | Two 2 × 20 headers carrying the processor's buses and seven chip-select lines, for add-on cards. |

There is no video, keyboard or joystick connector: the picture, keyboard,
mouse and gamepads all travel over Wi-Fi through the video client.
