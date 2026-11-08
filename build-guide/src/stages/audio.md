# Stage 9: Audio

MIA makes sound itself: it mixes four voices at 48 kHz and plays them as
PWM on GP4 (left) and GP5 (right). Each channel goes through the same small
stage to the jack: a divider and filter that turn the PWM into a line-level
signal of about 1 V peak to peak, and a capacitor that blocks the DC.

## Parts

| Part | Qty | On the schematic | Notes |
| --- | --- | --- | --- |
| 220 Ω resistor | 2 | R6, R9 |  |
| 100 Ω resistor | 2 | R7, R10 |  |
| 100 nF ceramic capacitor | 2 | C2, C4 | Filter |
| 47 µF electrolytic capacitor | 2 | C3, C5 | DC block |
| 1.8 kΩ resistor | 2 | R8, R11 |  |
| 3.5 mm stereo jack | 1 |  | On a breakout, or with short wires soldered on |
| Headphones | 1 |  | For the check |

## What you add

The audio stage and the jack on board 1. Both channels are the same: build
the left one, test it, then copy it for the right. The parts of one channel
meet at a single row, the filter node; the tables call the left one
`filter L` and the right one `filter R`.

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 170" width="100%" style="max-width:640px" role="img" aria-label="One audio channel: Pico GP4 through 220 ohm R6 to the filter node; from the node, 100 ohm R7 and 100 nF C2 to GND, and 47 microfarad C3 with plus on the node to the jack tip; 1.8 kilohm R8 from the tip to GND.">
<g fill="none" stroke="currentColor" stroke-width="1.5">
<path d="M20 40h40M60 32h50v16h-50zM110 40h120"/>
<circle cx="170" cy="40" r="3" fill="currentColor"/>
<path d="M150 40v30M142 70h16v40h-16zM150 110v30"/>
<path d="M200 40v40M188 80h24M188 88h24M200 88v52"/>
<path d="M230 40h40M270 30v20M278 30v20M278 40h102"/>
<circle cx="330" cy="40" r="3" fill="currentColor"/>
<path d="M330 40v30M322 70h16v40h-16zM330 110v30"/>
<path d="M120 140h240M380 40h40"/>
</g>
<g fill="currentColor" font-family="sans-serif" font-size="12">
<text x="10" y="28">GP4</text><text x="62" y="25">R6 220 Ω</text><text x="125" y="20">filter L</text>
<text x="100" y="95">R7 100 Ω</text><text x="210" y="100">C2 100 nF</text>
<text x="244" y="25">C3 47 µF</text><text x="262" y="62" font-size="10">+</text>
<text x="340" y="95">R8 1.8 kΩ</text><text x="400" y="30">jack tip</text>
<text x="230" y="160">GND</text>
</g>
</svg>
</div>

### Left channel

| Part | Value | First leg | Second leg | Notes |
| --- | --- | --- | --- | --- |
| R6 | 220 Ω | Pico 6 (GP4) | R7, C2 | Into `filter L` |
| R7 | 100 Ω | R6, C2 | GND | |
| C2 | 100 nF | R6, R7 | GND | Ceramic, either way round |
| C3 | 47 µF | R6, R7, C2 | jack tip | Electrolytic: the + leg on `filter L` |
| R8 | 1.8 kΩ | jack tip | GND | Bleeds the capacitor's charge |

### Right channel

| Part | Value | First leg | Second leg | Notes |
| --- | --- | --- | --- | --- |
| R9 | 220 Ω | Pico 7 (GP5) | R10, C4 | Into `filter R` |
| R10 | 100 Ω | R9, C4 | GND | |
| C4 | 100 nF | R9, R10 | GND | |
| C5 | 47 µF | R9, R10, C4 | jack ring | Electrolytic: the + leg on `filter R` |
| R11 | 1.8 kΩ | jack ring | GND | |

| From | To | Signal | Wire | Notes |
| --- | --- | --- | --- | --- |
| jack sleeve | GND | GND | black | |

### Where things go

<div class="diagram">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 685 231" width="100%" style="max-width:745px" role="img" aria-label="Board 1 from above, column 1 at the left. Two green wires leave Pico pins 6 and 7 on the far side and run below the board to column 45. The left channel sits in the lower half: R6 from column 45 to the filter node in column 48, R7 and C2 from the node to the GND rail, C3 with its plus leg on the node and its other leg in column 51, the tip strip, and R8 from there to GND. A green wire takes the tip to the jack's T pin. The right channel is the same in the upper half with R9, R10, C4, C5 and R11, and a green wire crosses the centre gap to the jack's R pin. The jack's S pin goes to the GND rail.">
<rect x="15.3" y="26" width="664.4000000000001" height="169" rx="6" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.8"/>
<g stroke-width="2.5" opacity="0.32"><path d="M21.3 34H673.7M21.3 176H673.7" stroke="currentColor"/><path d="M21.3 43H673.7M21.3 185H673.7" stroke="#d0312d"/></g>
<g fill="currentColor" opacity="0.2"><circle cx="23" cy="54" r="1.3"/><circle cx="23" cy="65" r="1.3"/><circle cx="23" cy="76" r="1.3"/><circle cx="23" cy="87" r="1.3"/><circle cx="23" cy="98" r="1.3"/><circle cx="23" cy="120" r="1.3"/><circle cx="23" cy="131" r="1.3"/><circle cx="23" cy="142" r="1.3"/><circle cx="23" cy="153" r="1.3"/><circle cx="23" cy="164" r="1.3"/><circle cx="34" cy="54" r="1.3"/><circle cx="34" cy="65" r="1.3"/><circle cx="34" cy="76" r="1.3"/><circle cx="34" cy="87" r="1.3"/><circle cx="34" cy="98" r="1.3"/><circle cx="34" cy="120" r="1.3"/><circle cx="34" cy="131" r="1.3"/><circle cx="34" cy="142" r="1.3"/><circle cx="34" cy="153" r="1.3"/><circle cx="34" cy="164" r="1.3"/><circle cx="45" cy="54" r="1.3"/><circle cx="45" cy="65" r="1.3"/><circle cx="45" cy="76" r="1.3"/><circle cx="45" cy="87" r="1.3"/><circle cx="45" cy="98" r="1.3"/><circle cx="45" cy="120" r="1.3"/><circle cx="45" cy="131" r="1.3"/><circle cx="45" cy="142" r="1.3"/><circle cx="45" cy="153" r="1.3"/><circle cx="45" cy="164" r="1.3"/><circle cx="56" cy="54" r="1.3"/><circle cx="56" cy="65" r="1.3"/><circle cx="56" cy="76" r="1.3"/><circle cx="56" cy="87" r="1.3"/><circle cx="56" cy="98" r="1.3"/><circle cx="56" cy="120" r="1.3"/><circle cx="56" cy="131" r="1.3"/><circle cx="56" cy="142" r="1.3"/><circle cx="56" cy="153" r="1.3"/><circle cx="56" cy="164" r="1.3"/><circle cx="67" cy="54" r="1.3"/><circle cx="67" cy="65" r="1.3"/><circle cx="67" cy="76" r="1.3"/><circle cx="67" cy="87" r="1.3"/><circle cx="67" cy="98" r="1.3"/><circle cx="67" cy="120" r="1.3"/><circle cx="67" cy="131" r="1.3"/><circle cx="67" cy="142" r="1.3"/><circle cx="67" cy="153" r="1.3"/><circle cx="67" cy="164" r="1.3"/><circle cx="78" cy="54" r="1.3"/><circle cx="78" cy="65" r="1.3"/><circle cx="78" cy="76" r="1.3"/><circle cx="78" cy="87" r="1.3"/><circle cx="78" cy="98" r="1.3"/><circle cx="78" cy="120" r="1.3"/><circle cx="78" cy="131" r="1.3"/><circle cx="78" cy="142" r="1.3"/><circle cx="78" cy="153" r="1.3"/><circle cx="78" cy="164" r="1.3"/><circle cx="89" cy="54" r="1.3"/><circle cx="89" cy="65" r="1.3"/><circle cx="89" cy="76" r="1.3"/><circle cx="89" cy="87" r="1.3"/><circle cx="89" cy="98" r="1.3"/><circle cx="89" cy="120" r="1.3"/><circle cx="89" cy="131" r="1.3"/><circle cx="89" cy="142" r="1.3"/><circle cx="89" cy="153" r="1.3"/><circle cx="89" cy="164" r="1.3"/><circle cx="100" cy="54" r="1.3"/><circle cx="100" cy="65" r="1.3"/><circle cx="100" cy="76" r="1.3"/><circle cx="100" cy="87" r="1.3"/><circle cx="100" cy="98" r="1.3"/><circle cx="100" cy="120" r="1.3"/><circle cx="100" cy="131" r="1.3"/><circle cx="100" cy="142" r="1.3"/><circle cx="100" cy="153" r="1.3"/><circle cx="100" cy="164" r="1.3"/><circle cx="111" cy="54" r="1.3"/><circle cx="111" cy="65" r="1.3"/><circle cx="111" cy="76" r="1.3"/><circle cx="111" cy="87" r="1.3"/><circle cx="111" cy="98" r="1.3"/><circle cx="111" cy="120" r="1.3"/><circle cx="111" cy="131" r="1.3"/><circle cx="111" cy="142" r="1.3"/><circle cx="111" cy="153" r="1.3"/><circle cx="111" cy="164" r="1.3"/><circle cx="122" cy="54" r="1.3"/><circle cx="122" cy="65" r="1.3"/><circle cx="122" cy="76" r="1.3"/><circle cx="122" cy="87" r="1.3"/><circle cx="122" cy="98" r="1.3"/><circle cx="122" cy="120" r="1.3"/><circle cx="122" cy="131" r="1.3"/><circle cx="122" cy="142" r="1.3"/><circle cx="122" cy="153" r="1.3"/><circle cx="122" cy="164" r="1.3"/><circle cx="133" cy="54" r="1.3"/><circle cx="133" cy="65" r="1.3"/><circle cx="133" cy="76" r="1.3"/><circle cx="133" cy="87" r="1.3"/><circle cx="133" cy="98" r="1.3"/><circle cx="133" cy="120" r="1.3"/><circle cx="133" cy="131" r="1.3"/><circle cx="133" cy="142" r="1.3"/><circle cx="133" cy="153" r="1.3"/><circle cx="133" cy="164" r="1.3"/><circle cx="144" cy="54" r="1.3"/><circle cx="144" cy="65" r="1.3"/><circle cx="144" cy="76" r="1.3"/><circle cx="144" cy="87" r="1.3"/><circle cx="144" cy="98" r="1.3"/><circle cx="144" cy="120" r="1.3"/><circle cx="144" cy="131" r="1.3"/><circle cx="144" cy="142" r="1.3"/><circle cx="144" cy="153" r="1.3"/><circle cx="144" cy="164" r="1.3"/><circle cx="155" cy="54" r="1.3"/><circle cx="155" cy="65" r="1.3"/><circle cx="155" cy="76" r="1.3"/><circle cx="155" cy="87" r="1.3"/><circle cx="155" cy="98" r="1.3"/><circle cx="155" cy="120" r="1.3"/><circle cx="155" cy="131" r="1.3"/><circle cx="155" cy="142" r="1.3"/><circle cx="155" cy="153" r="1.3"/><circle cx="155" cy="164" r="1.3"/><circle cx="166" cy="54" r="1.3"/><circle cx="166" cy="65" r="1.3"/><circle cx="166" cy="76" r="1.3"/><circle cx="166" cy="87" r="1.3"/><circle cx="166" cy="98" r="1.3"/><circle cx="166" cy="120" r="1.3"/><circle cx="166" cy="131" r="1.3"/><circle cx="166" cy="142" r="1.3"/><circle cx="166" cy="153" r="1.3"/><circle cx="166" cy="164" r="1.3"/><circle cx="177" cy="54" r="1.3"/><circle cx="177" cy="65" r="1.3"/><circle cx="177" cy="76" r="1.3"/><circle cx="177" cy="87" r="1.3"/><circle cx="177" cy="98" r="1.3"/><circle cx="177" cy="120" r="1.3"/><circle cx="177" cy="131" r="1.3"/><circle cx="177" cy="142" r="1.3"/><circle cx="177" cy="153" r="1.3"/><circle cx="177" cy="164" r="1.3"/><circle cx="188" cy="54" r="1.3"/><circle cx="188" cy="65" r="1.3"/><circle cx="188" cy="76" r="1.3"/><circle cx="188" cy="87" r="1.3"/><circle cx="188" cy="98" r="1.3"/><circle cx="188" cy="120" r="1.3"/><circle cx="188" cy="131" r="1.3"/><circle cx="188" cy="142" r="1.3"/><circle cx="188" cy="153" r="1.3"/><circle cx="188" cy="164" r="1.3"/><circle cx="199" cy="54" r="1.3"/><circle cx="199" cy="65" r="1.3"/><circle cx="199" cy="76" r="1.3"/><circle cx="199" cy="87" r="1.3"/><circle cx="199" cy="98" r="1.3"/><circle cx="199" cy="120" r="1.3"/><circle cx="199" cy="131" r="1.3"/><circle cx="199" cy="142" r="1.3"/><circle cx="199" cy="153" r="1.3"/><circle cx="199" cy="164" r="1.3"/><circle cx="210" cy="54" r="1.3"/><circle cx="210" cy="65" r="1.3"/><circle cx="210" cy="76" r="1.3"/><circle cx="210" cy="87" r="1.3"/><circle cx="210" cy="98" r="1.3"/><circle cx="210" cy="120" r="1.3"/><circle cx="210" cy="131" r="1.3"/><circle cx="210" cy="142" r="1.3"/><circle cx="210" cy="153" r="1.3"/><circle cx="210" cy="164" r="1.3"/><circle cx="221" cy="54" r="1.3"/><circle cx="221" cy="65" r="1.3"/><circle cx="221" cy="76" r="1.3"/><circle cx="221" cy="87" r="1.3"/><circle cx="221" cy="98" r="1.3"/><circle cx="221" cy="120" r="1.3"/><circle cx="221" cy="131" r="1.3"/><circle cx="221" cy="142" r="1.3"/><circle cx="221" cy="153" r="1.3"/><circle cx="221" cy="164" r="1.3"/><circle cx="232" cy="54" r="1.3"/><circle cx="232" cy="65" r="1.3"/><circle cx="232" cy="76" r="1.3"/><circle cx="232" cy="87" r="1.3"/><circle cx="232" cy="98" r="1.3"/><circle cx="232" cy="120" r="1.3"/><circle cx="232" cy="131" r="1.3"/><circle cx="232" cy="142" r="1.3"/><circle cx="232" cy="153" r="1.3"/><circle cx="232" cy="164" r="1.3"/><circle cx="243" cy="54" r="1.3"/><circle cx="243" cy="65" r="1.3"/><circle cx="243" cy="76" r="1.3"/><circle cx="243" cy="87" r="1.3"/><circle cx="243" cy="98" r="1.3"/><circle cx="243" cy="120" r="1.3"/><circle cx="243" cy="131" r="1.3"/><circle cx="243" cy="142" r="1.3"/><circle cx="243" cy="153" r="1.3"/><circle cx="243" cy="164" r="1.3"/><circle cx="254" cy="54" r="1.3"/><circle cx="254" cy="65" r="1.3"/><circle cx="254" cy="76" r="1.3"/><circle cx="254" cy="87" r="1.3"/><circle cx="254" cy="98" r="1.3"/><circle cx="254" cy="120" r="1.3"/><circle cx="254" cy="131" r="1.3"/><circle cx="254" cy="142" r="1.3"/><circle cx="254" cy="153" r="1.3"/><circle cx="254" cy="164" r="1.3"/><circle cx="265" cy="54" r="1.3"/><circle cx="265" cy="65" r="1.3"/><circle cx="265" cy="76" r="1.3"/><circle cx="265" cy="87" r="1.3"/><circle cx="265" cy="98" r="1.3"/><circle cx="265" cy="120" r="1.3"/><circle cx="265" cy="131" r="1.3"/><circle cx="265" cy="142" r="1.3"/><circle cx="265" cy="153" r="1.3"/><circle cx="265" cy="164" r="1.3"/><circle cx="276" cy="54" r="1.3"/><circle cx="276" cy="65" r="1.3"/><circle cx="276" cy="76" r="1.3"/><circle cx="276" cy="87" r="1.3"/><circle cx="276" cy="98" r="1.3"/><circle cx="276" cy="120" r="1.3"/><circle cx="276" cy="131" r="1.3"/><circle cx="276" cy="142" r="1.3"/><circle cx="276" cy="153" r="1.3"/><circle cx="276" cy="164" r="1.3"/><circle cx="287" cy="54" r="1.3"/><circle cx="287" cy="65" r="1.3"/><circle cx="287" cy="76" r="1.3"/><circle cx="287" cy="87" r="1.3"/><circle cx="287" cy="98" r="1.3"/><circle cx="287" cy="120" r="1.3"/><circle cx="287" cy="131" r="1.3"/><circle cx="287" cy="142" r="1.3"/><circle cx="287" cy="153" r="1.3"/><circle cx="287" cy="164" r="1.3"/><circle cx="298" cy="54" r="1.3"/><circle cx="298" cy="65" r="1.3"/><circle cx="298" cy="76" r="1.3"/><circle cx="298" cy="87" r="1.3"/><circle cx="298" cy="98" r="1.3"/><circle cx="298" cy="120" r="1.3"/><circle cx="298" cy="131" r="1.3"/><circle cx="298" cy="142" r="1.3"/><circle cx="298" cy="153" r="1.3"/><circle cx="298" cy="164" r="1.3"/><circle cx="309" cy="54" r="1.3"/><circle cx="309" cy="65" r="1.3"/><circle cx="309" cy="76" r="1.3"/><circle cx="309" cy="87" r="1.3"/><circle cx="309" cy="98" r="1.3"/><circle cx="309" cy="120" r="1.3"/><circle cx="309" cy="131" r="1.3"/><circle cx="309" cy="142" r="1.3"/><circle cx="309" cy="153" r="1.3"/><circle cx="309" cy="164" r="1.3"/><circle cx="320" cy="54" r="1.3"/><circle cx="320" cy="65" r="1.3"/><circle cx="320" cy="76" r="1.3"/><circle cx="320" cy="87" r="1.3"/><circle cx="320" cy="98" r="1.3"/><circle cx="320" cy="120" r="1.3"/><circle cx="320" cy="131" r="1.3"/><circle cx="320" cy="142" r="1.3"/><circle cx="320" cy="153" r="1.3"/><circle cx="320" cy="164" r="1.3"/><circle cx="331" cy="54" r="1.3"/><circle cx="331" cy="65" r="1.3"/><circle cx="331" cy="76" r="1.3"/><circle cx="331" cy="87" r="1.3"/><circle cx="331" cy="98" r="1.3"/><circle cx="331" cy="120" r="1.3"/><circle cx="331" cy="131" r="1.3"/><circle cx="331" cy="142" r="1.3"/><circle cx="331" cy="153" r="1.3"/><circle cx="331" cy="164" r="1.3"/><circle cx="342" cy="54" r="1.3"/><circle cx="342" cy="65" r="1.3"/><circle cx="342" cy="76" r="1.3"/><circle cx="342" cy="87" r="1.3"/><circle cx="342" cy="98" r="1.3"/><circle cx="342" cy="120" r="1.3"/><circle cx="342" cy="131" r="1.3"/><circle cx="342" cy="142" r="1.3"/><circle cx="342" cy="153" r="1.3"/><circle cx="342" cy="164" r="1.3"/><circle cx="353" cy="54" r="1.3"/><circle cx="353" cy="65" r="1.3"/><circle cx="353" cy="76" r="1.3"/><circle cx="353" cy="87" r="1.3"/><circle cx="353" cy="98" r="1.3"/><circle cx="353" cy="120" r="1.3"/><circle cx="353" cy="131" r="1.3"/><circle cx="353" cy="142" r="1.3"/><circle cx="353" cy="153" r="1.3"/><circle cx="353" cy="164" r="1.3"/><circle cx="364" cy="54" r="1.3"/><circle cx="364" cy="65" r="1.3"/><circle cx="364" cy="76" r="1.3"/><circle cx="364" cy="87" r="1.3"/><circle cx="364" cy="98" r="1.3"/><circle cx="364" cy="120" r="1.3"/><circle cx="364" cy="131" r="1.3"/><circle cx="364" cy="142" r="1.3"/><circle cx="364" cy="153" r="1.3"/><circle cx="364" cy="164" r="1.3"/><circle cx="375" cy="54" r="1.3"/><circle cx="375" cy="65" r="1.3"/><circle cx="375" cy="76" r="1.3"/><circle cx="375" cy="87" r="1.3"/><circle cx="375" cy="98" r="1.3"/><circle cx="375" cy="120" r="1.3"/><circle cx="375" cy="131" r="1.3"/><circle cx="375" cy="142" r="1.3"/><circle cx="375" cy="153" r="1.3"/><circle cx="375" cy="164" r="1.3"/><circle cx="386" cy="54" r="1.3"/><circle cx="386" cy="65" r="1.3"/><circle cx="386" cy="76" r="1.3"/><circle cx="386" cy="87" r="1.3"/><circle cx="386" cy="98" r="1.3"/><circle cx="386" cy="120" r="1.3"/><circle cx="386" cy="131" r="1.3"/><circle cx="386" cy="142" r="1.3"/><circle cx="386" cy="153" r="1.3"/><circle cx="386" cy="164" r="1.3"/><circle cx="397" cy="54" r="1.3"/><circle cx="397" cy="65" r="1.3"/><circle cx="397" cy="76" r="1.3"/><circle cx="397" cy="87" r="1.3"/><circle cx="397" cy="98" r="1.3"/><circle cx="397" cy="120" r="1.3"/><circle cx="397" cy="131" r="1.3"/><circle cx="397" cy="142" r="1.3"/><circle cx="397" cy="153" r="1.3"/><circle cx="397" cy="164" r="1.3"/><circle cx="408" cy="54" r="1.3"/><circle cx="408" cy="65" r="1.3"/><circle cx="408" cy="76" r="1.3"/><circle cx="408" cy="87" r="1.3"/><circle cx="408" cy="98" r="1.3"/><circle cx="408" cy="120" r="1.3"/><circle cx="408" cy="131" r="1.3"/><circle cx="408" cy="142" r="1.3"/><circle cx="408" cy="153" r="1.3"/><circle cx="408" cy="164" r="1.3"/><circle cx="419" cy="54" r="1.3"/><circle cx="419" cy="65" r="1.3"/><circle cx="419" cy="76" r="1.3"/><circle cx="419" cy="87" r="1.3"/><circle cx="419" cy="98" r="1.3"/><circle cx="419" cy="120" r="1.3"/><circle cx="419" cy="131" r="1.3"/><circle cx="419" cy="142" r="1.3"/><circle cx="419" cy="153" r="1.3"/><circle cx="419" cy="164" r="1.3"/><circle cx="430" cy="54" r="1.3"/><circle cx="430" cy="65" r="1.3"/><circle cx="430" cy="76" r="1.3"/><circle cx="430" cy="87" r="1.3"/><circle cx="430" cy="98" r="1.3"/><circle cx="430" cy="120" r="1.3"/><circle cx="430" cy="131" r="1.3"/><circle cx="430" cy="142" r="1.3"/><circle cx="430" cy="153" r="1.3"/><circle cx="430" cy="164" r="1.3"/><circle cx="441" cy="54" r="1.3"/><circle cx="441" cy="65" r="1.3"/><circle cx="441" cy="76" r="1.3"/><circle cx="441" cy="87" r="1.3"/><circle cx="441" cy="98" r="1.3"/><circle cx="441" cy="120" r="1.3"/><circle cx="441" cy="131" r="1.3"/><circle cx="441" cy="142" r="1.3"/><circle cx="441" cy="153" r="1.3"/><circle cx="441" cy="164" r="1.3"/><circle cx="452" cy="54" r="1.3"/><circle cx="452" cy="65" r="1.3"/><circle cx="452" cy="76" r="1.3"/><circle cx="452" cy="87" r="1.3"/><circle cx="452" cy="98" r="1.3"/><circle cx="452" cy="120" r="1.3"/><circle cx="452" cy="131" r="1.3"/><circle cx="452" cy="142" r="1.3"/><circle cx="452" cy="153" r="1.3"/><circle cx="452" cy="164" r="1.3"/><circle cx="463" cy="54" r="1.3"/><circle cx="463" cy="65" r="1.3"/><circle cx="463" cy="76" r="1.3"/><circle cx="463" cy="87" r="1.3"/><circle cx="463" cy="98" r="1.3"/><circle cx="463" cy="120" r="1.3"/><circle cx="463" cy="131" r="1.3"/><circle cx="463" cy="142" r="1.3"/><circle cx="463" cy="153" r="1.3"/><circle cx="463" cy="164" r="1.3"/><circle cx="474" cy="54" r="1.3"/><circle cx="474" cy="65" r="1.3"/><circle cx="474" cy="76" r="1.3"/><circle cx="474" cy="87" r="1.3"/><circle cx="474" cy="98" r="1.3"/><circle cx="474" cy="120" r="1.3"/><circle cx="474" cy="131" r="1.3"/><circle cx="474" cy="142" r="1.3"/><circle cx="474" cy="153" r="1.3"/><circle cx="474" cy="164" r="1.3"/><circle cx="485" cy="54" r="1.3"/><circle cx="485" cy="65" r="1.3"/><circle cx="485" cy="76" r="1.3"/><circle cx="485" cy="87" r="1.3"/><circle cx="485" cy="98" r="1.3"/><circle cx="485" cy="120" r="1.3"/><circle cx="485" cy="131" r="1.3"/><circle cx="485" cy="142" r="1.3"/><circle cx="485" cy="153" r="1.3"/><circle cx="485" cy="164" r="1.3"/><circle cx="496" cy="54" r="1.3"/><circle cx="496" cy="65" r="1.3"/><circle cx="496" cy="76" r="1.3"/><circle cx="496" cy="87" r="1.3"/><circle cx="496" cy="98" r="1.3"/><circle cx="496" cy="120" r="1.3"/><circle cx="496" cy="131" r="1.3"/><circle cx="496" cy="142" r="1.3"/><circle cx="496" cy="153" r="1.3"/><circle cx="496" cy="164" r="1.3"/><circle cx="507" cy="54" r="1.3"/><circle cx="507" cy="65" r="1.3"/><circle cx="507" cy="76" r="1.3"/><circle cx="507" cy="87" r="1.3"/><circle cx="507" cy="98" r="1.3"/><circle cx="507" cy="120" r="1.3"/><circle cx="507" cy="131" r="1.3"/><circle cx="507" cy="142" r="1.3"/><circle cx="507" cy="153" r="1.3"/><circle cx="507" cy="164" r="1.3"/><circle cx="518" cy="54" r="1.3"/><circle cx="518" cy="65" r="1.3"/><circle cx="518" cy="76" r="1.3"/><circle cx="518" cy="87" r="1.3"/><circle cx="518" cy="98" r="1.3"/><circle cx="518" cy="120" r="1.3"/><circle cx="518" cy="131" r="1.3"/><circle cx="518" cy="142" r="1.3"/><circle cx="518" cy="153" r="1.3"/><circle cx="518" cy="164" r="1.3"/><circle cx="529" cy="54" r="1.3"/><circle cx="529" cy="65" r="1.3"/><circle cx="529" cy="76" r="1.3"/><circle cx="529" cy="87" r="1.3"/><circle cx="529" cy="98" r="1.3"/><circle cx="529" cy="120" r="1.3"/><circle cx="529" cy="131" r="1.3"/><circle cx="529" cy="142" r="1.3"/><circle cx="529" cy="153" r="1.3"/><circle cx="529" cy="164" r="1.3"/><circle cx="540" cy="54" r="1.3"/><circle cx="540" cy="65" r="1.3"/><circle cx="540" cy="76" r="1.3"/><circle cx="540" cy="87" r="1.3"/><circle cx="540" cy="98" r="1.3"/><circle cx="540" cy="120" r="1.3"/><circle cx="540" cy="131" r="1.3"/><circle cx="540" cy="142" r="1.3"/><circle cx="540" cy="153" r="1.3"/><circle cx="540" cy="164" r="1.3"/><circle cx="551" cy="54" r="1.3"/><circle cx="551" cy="65" r="1.3"/><circle cx="551" cy="76" r="1.3"/><circle cx="551" cy="87" r="1.3"/><circle cx="551" cy="98" r="1.3"/><circle cx="551" cy="120" r="1.3"/><circle cx="551" cy="131" r="1.3"/><circle cx="551" cy="142" r="1.3"/><circle cx="551" cy="153" r="1.3"/><circle cx="551" cy="164" r="1.3"/><circle cx="562" cy="54" r="1.3"/><circle cx="562" cy="65" r="1.3"/><circle cx="562" cy="76" r="1.3"/><circle cx="562" cy="87" r="1.3"/><circle cx="562" cy="98" r="1.3"/><circle cx="562" cy="120" r="1.3"/><circle cx="562" cy="131" r="1.3"/><circle cx="562" cy="142" r="1.3"/><circle cx="562" cy="153" r="1.3"/><circle cx="562" cy="164" r="1.3"/><circle cx="573" cy="54" r="1.3"/><circle cx="573" cy="65" r="1.3"/><circle cx="573" cy="76" r="1.3"/><circle cx="573" cy="87" r="1.3"/><circle cx="573" cy="98" r="1.3"/><circle cx="573" cy="120" r="1.3"/><circle cx="573" cy="131" r="1.3"/><circle cx="573" cy="142" r="1.3"/><circle cx="573" cy="153" r="1.3"/><circle cx="573" cy="164" r="1.3"/><circle cx="584" cy="54" r="1.3"/><circle cx="584" cy="65" r="1.3"/><circle cx="584" cy="76" r="1.3"/><circle cx="584" cy="87" r="1.3"/><circle cx="584" cy="98" r="1.3"/><circle cx="584" cy="120" r="1.3"/><circle cx="584" cy="131" r="1.3"/><circle cx="584" cy="142" r="1.3"/><circle cx="584" cy="153" r="1.3"/><circle cx="584" cy="164" r="1.3"/><circle cx="595" cy="54" r="1.3"/><circle cx="595" cy="65" r="1.3"/><circle cx="595" cy="76" r="1.3"/><circle cx="595" cy="87" r="1.3"/><circle cx="595" cy="98" r="1.3"/><circle cx="595" cy="120" r="1.3"/><circle cx="595" cy="131" r="1.3"/><circle cx="595" cy="142" r="1.3"/><circle cx="595" cy="153" r="1.3"/><circle cx="595" cy="164" r="1.3"/><circle cx="606" cy="54" r="1.3"/><circle cx="606" cy="65" r="1.3"/><circle cx="606" cy="76" r="1.3"/><circle cx="606" cy="87" r="1.3"/><circle cx="606" cy="98" r="1.3"/><circle cx="606" cy="120" r="1.3"/><circle cx="606" cy="131" r="1.3"/><circle cx="606" cy="142" r="1.3"/><circle cx="606" cy="153" r="1.3"/><circle cx="606" cy="164" r="1.3"/><circle cx="617" cy="54" r="1.3"/><circle cx="617" cy="65" r="1.3"/><circle cx="617" cy="76" r="1.3"/><circle cx="617" cy="87" r="1.3"/><circle cx="617" cy="98" r="1.3"/><circle cx="617" cy="120" r="1.3"/><circle cx="617" cy="131" r="1.3"/><circle cx="617" cy="142" r="1.3"/><circle cx="617" cy="153" r="1.3"/><circle cx="617" cy="164" r="1.3"/><circle cx="628" cy="54" r="1.3"/><circle cx="628" cy="65" r="1.3"/><circle cx="628" cy="76" r="1.3"/><circle cx="628" cy="87" r="1.3"/><circle cx="628" cy="98" r="1.3"/><circle cx="628" cy="120" r="1.3"/><circle cx="628" cy="131" r="1.3"/><circle cx="628" cy="142" r="1.3"/><circle cx="628" cy="153" r="1.3"/><circle cx="628" cy="164" r="1.3"/><circle cx="639" cy="54" r="1.3"/><circle cx="639" cy="65" r="1.3"/><circle cx="639" cy="76" r="1.3"/><circle cx="639" cy="87" r="1.3"/><circle cx="639" cy="98" r="1.3"/><circle cx="639" cy="120" r="1.3"/><circle cx="639" cy="131" r="1.3"/><circle cx="639" cy="142" r="1.3"/><circle cx="639" cy="153" r="1.3"/><circle cx="639" cy="164" r="1.3"/><circle cx="650" cy="54" r="1.3"/><circle cx="650" cy="65" r="1.3"/><circle cx="650" cy="76" r="1.3"/><circle cx="650" cy="87" r="1.3"/><circle cx="650" cy="98" r="1.3"/><circle cx="650" cy="120" r="1.3"/><circle cx="650" cy="131" r="1.3"/><circle cx="650" cy="142" r="1.3"/><circle cx="650" cy="153" r="1.3"/><circle cx="650" cy="164" r="1.3"/><circle cx="661" cy="54" r="1.3"/><circle cx="661" cy="65" r="1.3"/><circle cx="661" cy="76" r="1.3"/><circle cx="661" cy="87" r="1.3"/><circle cx="661" cy="98" r="1.3"/><circle cx="661" cy="120" r="1.3"/><circle cx="661" cy="131" r="1.3"/><circle cx="661" cy="142" r="1.3"/><circle cx="661" cy="153" r="1.3"/><circle cx="661" cy="164" r="1.3"/><circle cx="672" cy="54" r="1.3"/><circle cx="672" cy="65" r="1.3"/><circle cx="672" cy="76" r="1.3"/><circle cx="672" cy="87" r="1.3"/><circle cx="672" cy="98" r="1.3"/><circle cx="672" cy="120" r="1.3"/><circle cx="672" cy="131" r="1.3"/><circle cx="672" cy="142" r="1.3"/><circle cx="672" cy="153" r="1.3"/><circle cx="672" cy="164" r="1.3"/></g>
<path d="M21.3 109.0H673.7" stroke="currentColor" stroke-dasharray="2 4" opacity="0.35"/>
<text x="20.3" y="192" font-family="sans-serif" font-size="8" fill="currentColor" opacity="0.6">board 1</text>
<g><rect x="16.4" y="76" width="222.2" height="66" rx="3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M16.4 104.0a5 5 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.4"/><g fill="currentColor"><circle cx="23" cy="76" r="2.1"/><circle cx="23" cy="142" r="2.1"/><circle cx="34" cy="76" r="2.1"/><circle cx="34" cy="142" r="2.1"/><circle cx="45" cy="76" r="2.1"/><circle cx="45" cy="142" r="2.1"/><circle cx="56" cy="76" r="2.1"/><circle cx="56" cy="142" r="2.1"/><circle cx="67" cy="76" r="2.1"/><circle cx="67" cy="142" r="2.1"/><circle cx="78" cy="76" r="2.1"/><circle cx="78" cy="142" r="2.1"/><circle cx="89" cy="76" r="2.1"/><circle cx="89" cy="142" r="2.1"/><circle cx="100" cy="76" r="2.1"/><circle cx="100" cy="142" r="2.1"/><circle cx="111" cy="76" r="2.1"/><circle cx="111" cy="142" r="2.1"/><circle cx="122" cy="76" r="2.1"/><circle cx="122" cy="142" r="2.1"/><circle cx="133" cy="76" r="2.1"/><circle cx="133" cy="142" r="2.1"/><circle cx="144" cy="76" r="2.1"/><circle cx="144" cy="142" r="2.1"/><circle cx="155" cy="76" r="2.1"/><circle cx="155" cy="142" r="2.1"/><circle cx="166" cy="76" r="2.1"/><circle cx="166" cy="142" r="2.1"/><circle cx="177" cy="76" r="2.1"/><circle cx="177" cy="142" r="2.1"/><circle cx="188" cy="76" r="2.1"/><circle cx="188" cy="142" r="2.1"/><circle cx="199" cy="76" r="2.1"/><circle cx="199" cy="142" r="2.1"/><circle cx="210" cy="76" r="2.1"/><circle cx="210" cy="142" r="2.1"/><circle cx="221" cy="76" r="2.1"/><circle cx="221" cy="142" r="2.1"/><circle cx="232" cy="76" r="2.1"/><circle cx="232" cy="142" r="2.1"/></g><text x="127.5" y="108.0" text-anchor="middle" font-family="sans-serif" font-size="10" fill="currentColor">Pico 2 WH</text><text x="127.5" y="118.0" text-anchor="middle" font-family="sans-serif" font-size="7" fill="currentColor" opacity="0.8">MIA</text></g>
<g opacity="0.45"><rect x="281.5" y="125.5" width="99.0" height="44.0" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2"/><text x="331.0" y="150.5" font-family="sans-serif" font-size="8" fill="currentColor" text-anchor="middle">microSD</text></g>
<g opacity="0.45"><rect x="457.5" y="92.5" width="33.0" height="33.0" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2"/><text x="474.0" y="112.0" font-family="sans-serif" font-size="8" fill="currentColor" text-anchor="middle">RESET</text></g>
<g opacity="0.35"><rect x="233.10000000000002" y="59.5" width="41.799999999999955" height="99.0" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2"/><text x="254.0" y="112.0" font-family="sans-serif" font-size="8" fill="currentColor" text-anchor="middle">antenna</text></g>
<g opacity="0.6"><rect x="611.5" y="114.5" width="33.0" height="55.0" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2"/><text x="628.0" y="145.0" font-family="sans-serif" font-size="8" fill="currentColor" text-anchor="middle">jack</text></g>
<path d="M78.0 164.0 L78.0 208.0 L507.0 208.0 L507.0 164.0" fill="none" stroke="#2e9d5b" stroke-width="1.8" stroke-linejoin="round" opacity="1"/>
<circle cx="78.0" cy="164.0" r="2.4" fill="#2e9d5b" stroke="none"/>
<circle cx="507.0" cy="164.0" r="2.4" fill="#2e9d5b" stroke="none"/>
<path d="M89.0 153.0 L89.0 202.0 L501.5 202.0 L501.5 48.0 L507.0 48.0 L507.0 54.0" fill="none" stroke="#2e9d5b" stroke-width="1.8" stroke-linejoin="round" opacity="1"/>
<circle cx="89.0" cy="153.0" r="2.4" fill="#2e9d5b" stroke="none"/>
<circle cx="507.0" cy="54.0" r="2.4" fill="#2e9d5b" stroke="none"/>
<path d="M507.0 142.0 L540.0 142.0" fill="none" stroke="#888" stroke-width="1.5" stroke-linejoin="round" opacity="1"/>
<circle cx="507.0" cy="142.0" r="2.4" fill="#888" stroke="none"/>
<circle cx="540.0" cy="142.0" r="2.4" fill="#888" stroke="none"/>
<rect x="517.5" y="139.0" width="12" height="6" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.7"/>
<path d="M540.0 164.0 L540.0 176.0" fill="none" stroke="#888" stroke-width="1.5" stroke-linejoin="round" opacity="1"/>
<circle cx="540.0" cy="164.0" r="2.4" fill="#888" stroke="none"/>
<circle cx="540.0" cy="176.0" r="2.4" fill="#888" stroke="none"/>
<rect x="537.0" y="164.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.7"/>
<path d="M540.0 153.0 L556.5 176.0" fill="none" stroke="#4a7fd4" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="540.0" cy="153.0" r="2.4" fill="#4a7fd4" stroke="none"/>
<circle cx="556.5" cy="176.0" r="2.4" fill="#4a7fd4" stroke="none"/>
<rect x="544.25" y="160.5" width="8" height="8" fill="#4a7fd4"/>
<path d="M540.0 131.0 L573.0 131.0" fill="none" stroke="#888" stroke-width="1.5" stroke-linejoin="round" opacity="1"/>
<circle cx="540.0" cy="131.0" r="2.4" fill="#888" stroke="none"/>
<circle cx="573.0" cy="131.0" r="2.4" fill="#888" stroke="none"/>
<circle cx="556.5" cy="131.0" r="6" fill="#2d5aa0" stroke="currentColor" stroke-width="0.7"/>
<text x="548.25" y="128.0" font-family="sans-serif" font-size="8" fill="currentColor">+</text>
<path d="M573.0 164.0 L573.0 176.0" fill="none" stroke="#888" stroke-width="1.5" stroke-linejoin="round" opacity="1"/>
<circle cx="573.0" cy="164.0" r="2.4" fill="#888" stroke="none"/>
<circle cx="573.0" cy="176.0" r="2.4" fill="#888" stroke="none"/>
<rect x="570.0" y="164.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.7"/>
<path d="M573.0 142.0 L617.0 142.0" fill="none" stroke="#2e9d5b" stroke-width="1.8" stroke-linejoin="round" opacity="1"/>
<circle cx="573.0" cy="142.0" r="2.4" fill="#2e9d5b" stroke="none"/>
<circle cx="617.0" cy="142.0" r="2.4" fill="#2e9d5b" stroke="none"/>
<path d="M507.0 76.0 L540.0 76.0" fill="none" stroke="#888" stroke-width="1.5" stroke-linejoin="round" opacity="1"/>
<circle cx="507.0" cy="76.0" r="2.4" fill="#888" stroke="none"/>
<circle cx="540.0" cy="76.0" r="2.4" fill="#888" stroke="none"/>
<rect x="517.5" y="73.0" width="12" height="6" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.7"/>
<path d="M540.0 54.0 L540.0 34.0" fill="none" stroke="#888" stroke-width="1.5" stroke-linejoin="round" opacity="1"/>
<circle cx="540.0" cy="54.0" r="2.4" fill="#888" stroke="none"/>
<circle cx="540.0" cy="34.0" r="2.4" fill="#888" stroke="none"/>
<rect x="537.0" y="38.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.7"/>
<path d="M540.0 65.0 L556.5 34.0" fill="none" stroke="#4a7fd4" stroke-width="1.6" stroke-linejoin="round" opacity="1"/>
<circle cx="540.0" cy="65.0" r="2.4" fill="#4a7fd4" stroke="none"/>
<circle cx="556.5" cy="34.0" r="2.4" fill="#4a7fd4" stroke="none"/>
<rect x="544.25" y="45.5" width="8" height="8" fill="#4a7fd4"/>
<path d="M540.0 87.0 L573.0 87.0" fill="none" stroke="#888" stroke-width="1.5" stroke-linejoin="round" opacity="1"/>
<circle cx="540.0" cy="87.0" r="2.4" fill="#888" stroke="none"/>
<circle cx="573.0" cy="87.0" r="2.4" fill="#888" stroke="none"/>
<circle cx="556.5" cy="87.0" r="6" fill="#2d5aa0" stroke="currentColor" stroke-width="0.7"/>
<text x="548.25" y="84.0" font-family="sans-serif" font-size="8" fill="currentColor">+</text>
<path d="M573.0 54.0 L573.0 34.0" fill="none" stroke="#888" stroke-width="1.5" stroke-linejoin="round" opacity="1"/>
<circle cx="573.0" cy="54.0" r="2.4" fill="#888" stroke="none"/>
<circle cx="573.0" cy="34.0" r="2.4" fill="#888" stroke="none"/>
<rect x="570.0" y="38.0" width="6" height="12" rx="2" fill="#c9a86b" stroke="currentColor" stroke-width="0.7"/>
<path d="M573.0 76.0 L595.0 76.0 L595.0 131.0 L628.0 131.0" fill="none" stroke="#2e9d5b" stroke-width="1.8" stroke-linejoin="round" opacity="1"/>
<circle cx="573.0" cy="76.0" r="2.4" fill="#2e9d5b" stroke="none"/>
<circle cx="628.0" cy="131.0" r="2.4" fill="#2e9d5b" stroke="none"/>
<path d="M639.0 164.0 L639.0 176.0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" opacity="1"/>
<circle cx="639.0" cy="164.0" r="2.4" fill="currentColor" stroke="none"/>
<text x="505.0" y="138.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">R6</text>
<text x="523.5" y="134.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1"></text>
<text x="528.0" y="172.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">R7</text>
<text x="561.5" y="170.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">C2</text>
<text x="556.5" y="119.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">C3</text>
<text x="577.0" y="172.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">R8</text>
<text x="505.0" y="72.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">R9</text>
<text x="524.0" y="50.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">R10</text>
<text x="561.5" y="46.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">C4</text>
<text x="556.5" y="107.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">C5</text>
<text x="577.0" y="49.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">R11</text>
<text x="540.0" y="194.0" font-family="sans-serif" font-size="7" text-anchor="middle" fill="currentColor" opacity="0.8">filter L = column 48</text>
<text x="617.0" y="114.0" font-family="sans-serif" font-size="7" text-anchor="middle" fill="currentColor" opacity="1">T</text>
<text x="628.0" y="114.0" font-family="sans-serif" font-size="7" text-anchor="middle" fill="currentColor" opacity="1">R</text>
<text x="639.0" y="114.0" font-family="sans-serif" font-size="7" text-anchor="middle" fill="currentColor" opacity="1">S</text>
<text x="342.0" y="206.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1"></text>
<text x="111.0" y="212.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">Pico 6 (GP4) left</text>
<text x="111.0" y="200.0" font-family="sans-serif" font-size="7" text-anchor="start" fill="currentColor" opacity="1">Pico 7 (GP5) right</text>
</svg>
</div>

- **Board 1, columns 45-57**, to the right of the reset button. The left
  channel is in the lower half and the right channel in the upper half, as
  mirror images.
- **Each channel** is three strips: the input (column 45, with the green wire
  from the Pico and R6/R9), the filter node (column 48: R6/R9, R7/R10, C2/C4
  and the capacitor's + leg) and the output (column 51: the capacitor's other
  leg, R8/R11 and the wire to the jack).
- **R7, C2 and R8** (and R10, C4, R11) go from their strip to the GND rail
  on their side of the board.
- **The green wires** leave Pico 6 and 7 from the far side's free holes and
  run below board 1, outside the antenna end, to column 45.
- **The jack** sits at columns 55-57, T, R and S in order. S goes to GND.

On a stereo jack the tip is left, the ring right and the sleeve ground. If
yours is on a breakout board, its pins are usually marked T, R and S (or L,
R and G).

## Check

**Before you plug in**, run the
[power-up checks](../breadboard.md#before-you-power-up) on what you just
added.

The sound doesn't need the CPU: MIA can play its built-in test tune from the
console.

1. Plug in headphones, at low volume to start with.
2. On the console, type `audio seq test 0`. MIA plays a looping arpeggio
   (C, E, G) on voice 0. You should hear it in both ears; if one side is
   silent, that channel is miswired.
3. Type `audio seq stop 0`.
4. While it plays, the tip and ring read about 0 V DC to GND: the 47 µF
   capacitors block the DC level of about 0.5 V that sits on the filter
   nodes (the PWM's average of 1.65 V, divided by R6 and R7).
5. From BASIC (with the extended RAM in, BASIC is complete), play middle C
   for half a second, the first example in the *User's Manual*'s chapter
   "Sound and music". Type it, then `RUN`:

   ```basic
   10 SNDON
   20 WAVE 0,1:ADSR 0,0,8,12,6
   30 NOTE 0,48
   40 DELAY 500
   50 GATE 0,0
   ```

## With a scope

- **Before the filter.** Probe Pico 6 (GP4) while the test tune plays: a
  0-3.3 V PWM at about 146 kHz at the default speed (the Pico's 150 MHz
  clock divided by 1024). The duty cycle changes with the sound.
- **After the filter.** Probe `filter L` (the R6-R7-C2 row): the carrier is
  mostly gone and the tune shows as a waveform of up to about 1 V peak to
  peak, riding on about 0.5 V of DC.
- **At the jack.** Probe the tip: the same waveform, now centred on 0 V,
  about 1 V peak to peak.

## If it fails

| Symptom | Likely cause |
| --- | --- |
| Silence in both ears | Jack sleeve not on GND, or the jack's pins misidentified |
| One side silent | That channel's chain: R6/R9 to the right Pico pin, C3/C5 to the tip/ring |
| A loud hum or buzz | Headphones plugged in with the sleeve open |
| Very quiet and dull | The 47 µF capacitor in backwards |
| Left and right swapped | The two green wires from Pico 6 and 7 crossed |
