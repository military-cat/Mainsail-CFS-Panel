# Languages

| Code | Language | Installer menu |
|---|---|---|
| en | English | English |
| ko | Korean | 한국어 |
| ja | Japanese | 日本語 |
| zh | Simplified Chinese | 简体中文 |
| es | Spanish | Español |

Language is selected before installation prompts and stored in the script tag's `data-lang` attribute. It applies to the CFSail panel; it does not change Mainsail's own language preference or the printer touchscreen language. The selected value is stored with frontend files, never in `printer.cfg` or `moonraker.conf`.

The catalogs separate full sentences from machine values. Placeholder values such as a slot label, temperature, filename or error code are inserted after translation. Generic material names, device identifiers and printer-provided error details remain unchanged. Chinese currently uses Simplified Chinese. Spanish uses neutral forms that work across regions.

Translate the JSON catalogs under `locales/installer` and `locales/panel`. Preserve every key and placeholder name. Build the panel again after catalog changes; the browser bundle contains the five languages and needs no translation server. External-spool tabs and names stay `Ext.` in every language; surrounding descriptions and controls are translated. Do not translate protocol payload fields, preset identifiers, `CFS`, `Ext.`, `PLA`, `PETG`, `RFID` or measurement units.

Automated checks validate catalog completeness, placeholders and protocol behavior. The first release also has browser checks in the five languages. These checks do not claim professional native-speaker certification; community wording improvements are welcome.
