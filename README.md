![CFSail — CFS management for Mainsail](docs/images/cfsail-banner.png)

# CFSail

**Mainsail-CFS-Panel** adds Creality CFS and external-spool filament management to Mainsail. The interface is called **CFSail**.

**v0.1.3 — beta.** Adds localized CFS error guidance and a manual recovery button. The new recovery flow has been checked with a local simulated printer, not on physical hardware. Compatibility depends on the printer's Creality WebSocket interface and the installed Mainsail build; this is not a universal MMU plugin.

[한국어 안내](README.ko.md) · [Installation](docs/INSTALLATION.md) · [Compatibility](docs/COMPATIBILITY.md) · [Languages](docs/TRANSLATIONS.md)

Select a detected CFS from the header tabs to view filament types, colors, the reported loaded filament and enclosure temperature/humidity. A green outline identifies filament reported as loaded into the extruder. Select a slot to open Load, Unload or Edit; unavailable actions show a reason. Status messages reflect the printer's reported activity, including operations started from its touchscreen.

On a connected printer, CFSail displays the **actual CFS internal temperature (°C) and relative humidity (% RH)** reported by the CFS through the printer, and refreshes those readings while connected.

The external spool's tab and name are always **Ext.**, in every language. Editable filaments can be assigned a printer-provided Generic material and color. A save is confirmed against the printer's response. External-spool loading/unloading remains on the printer touchscreen.

### What has been checked?

| Printer | Verified on the inspected installation | Remaining hardware checks |
| --- | --- | --- |
| K2 Plus + 1 CFS | Legacy-panel replacement, native Dashboard integration, live slot metadata and enclosure readings, language synchronization; original-panel material writes were previously confirmed and restored | Physical load/unload with this beta distribution |
| Creality Hi, external spool only | Install/remove/reinstall, exact frontend restoration, external material type/color save and restoration | CFS slots, enclosure readings and transport with a connected CFS |

The published tests use synthetic data. No physical motion or heating was triggered while validating this distribution. See [compatibility and test scope](docs/COMPATIBILITY.md).

The installer and panel support **English, 한국어, 日本語, 简体中文 and Español**. The Language menu defaults to Follow Mainsail. A manual language choice overrides synchronization until Follow Mainsail is selected again. The mode is saved in this browser per printer address. Mainsail and touchscreen languages are unchanged. The installer changes Mainsail web files only. It creates no printer cfg, daemon or credentials file and does not restart services, reboot the printer or move filament.

## Error guidance and manual recovery

CFSail describes **33 current Creality OS CFS error codes** in all five panel languages, showing the reported condition, suggested checks, exact code and original printer report. Unknown and legacy codes keep their original report without an inferred diagnosis. Meanings are based on the [Creality error index](https://wiki.creality.com/en/printers-general-documents).

For recognized recoverable filament-path errors, **Retry CFS recovery** sends exactly `BOX_ERROR_RESUME_PROCESS` through the same-origin Moonraker API after checking printer state. Resolve the physical jam or other cause first; recovery can heat the nozzle or move filament. An active print must be paused. CFSail sends no additional `RESUME` command and never retries automatically. A request being accepted is not completion: the panel waits for a cleared error, idle feed state and fresh connected CFS slot data. Uncertain results block another request until completion is confirmed.

This feature requires the existing Moonraker API and firmware command. It adds no printer macros or cfg entries. Local tests cover success, rejection, disconnects, timeouts and active-print blocking; physical recovery remains unverified. See [test scope](docs/TESTING.md).

## Usage examples

| CFS overview | Filament actions |
| --- | --- |
| <img src="docs/screenshots/cfs-overview.png" width="480" alt="CFS overview showing four filament slots, temperature and humidity"> | <img src="docs/screenshots/filament-actions.png" width="480" alt="Filament menu with Load, Unload and Edit type and color"> |
| View slot types and colors, actual CFS internal temperature (°C), relative humidity (% RH) and printer status. | Select a slot to load, unload or edit it; unavailable actions explain why. |

| Type and color editor | External spool |
| --- | --- |
| <img src="docs/screenshots/filament-editor.png" width="420" alt="Filament editor with material type and color selection"> | <img src="docs/screenshots/external-spool.png" width="480" alt="Ext. tab showing an unset external spool and its edit button"> |
| Choose a material type and color, then save using the printer's Generic preset. | The **Ext.** tab shows printer-reported external spool information and provides type/color editing. |

| Multiple CFS units | Language menu |
| --- | --- |
| <img src="docs/screenshots/multiple-cfs.png" width="300" alt="Tabs for CFS 1, CFS 2, CFS 3 and Ext."> | <img src="docs/screenshots/language-menu.png" width="204" alt="Language menu with Follow Mainsail and five manual languages"> |
| Switch between detected CFS units. This screenshot shows the three-unit demo. | Follow Mainsail's language or choose one of five languages manually. |

### During an actual print

| Loaded filament and live status | Actions blocked while printing |
| --- | --- |
| <img src="docs/screenshots/printing-loaded-slot.png" width="480" alt="CFSail during printing with slot 1A outlined in green and live nozzle temperatures"> | <img src="docs/screenshots/printing-actions-blocked.png" width="423" alt="Filament 1C menu with Load, Unload and Edit disabled while printing"> |
| Slot **1A** is reported as loaded into the extruder and highlighted in green. The footer shows printing status and current/target nozzle temperatures. | During printing, **Load**, **Unload** and **Edit type and color** are disabled, with an explanation below each action. |

## Install

Download [**Mainsail-CFS-Panel-v0.1.3.zip**](https://github.com/military-cat/Mainsail-CFS-Panel/releases/download/v0.1.3/Mainsail-CFS-Panel-v0.1.3.zip) from the [**v0.1.3 release**](https://github.com/military-cat/Mainsail-CFS-Panel/releases/tag/v0.1.3). This is the versioned installation package, including the prebuilt panel and translations.

Requirements: Python 3.8+, an existing locally hosted Mainsail frontend and the printer's Creality WebSocket service on port 9999. The SSH download commands also require `wget` and `unzip`. No Node.js installation is required on the printer.

From your computer, connect using your existing SSH account. Replace `PRINTER_IP` with the printer's address; the example uses `root`:

```sh
ssh root@PRINTER_IP
```

Then run these commands **in the printer's SSH shell**. They download the v0.1.3 installation ZIP, extract it into a separate staging directory and start the interactive installer. The `&&` operators stop the sequence if a step fails:

```sh
mkdir -p /mnt/UDISK/cfsail-install-v0.1.3 &&
cd /mnt/UDISK/cfsail-install-v0.1.3 &&
wget -O Mainsail-CFS-Panel-v0.1.3.zip https://github.com/military-cat/Mainsail-CFS-Panel/releases/download/v0.1.3/Mainsail-CFS-Panel-v0.1.3.zip &&
unzip -o Mainsail-CFS-Panel-v0.1.3.zip &&
cd Mainsail-CFS-Panel &&
sh install.sh
```

If `wget` is unavailable but `curl` is installed, replace `wget -O` with `curl -fL -o` in the sequence above, keeping the URL and trailing `&&`.

If direct download or `unzip` is unavailable, download the installation ZIP on your computer, extract it and copy the entire `Mainsail-CFS-Panel` folder to the printer using SCP/SFTP. Open that folder in the printer's SSH shell and run:

```sh
sh install.sh
```

Choose a language, inspect the displayed web-root/layout/file plan, then confirm. On a recognized K2 web root, backups are stored outside the web root under `/mnt/UDISK/cfsail-backups`. If automatic discovery is ambiguous, specify the actual frontend path and a separate backup directory.

To inspect a K2 installation plan without writing files:

```sh
sh install.sh --lang en --web-root /usr/share/mainsail --dry-run
```

To update CFSail or change the installer's/fallback language, use the same web root and backup location. The panel language can be changed in its own menu:

```sh
sh install.sh update --lang ja --web-root /usr/share/mainsail
```

To uninstall and restore the pre-CFSail frontend:

```sh
sh install.sh uninstall --lang en --web-root /usr/share/mainsail
```

Keep the external backup. An edited managed file or corrupted backup causes refusal rather than silent replacement. For custom paths, use the same explicit `--backup-dir` for install, update and removal. A migration from the older panel keeps its assets for rollback; uninstall restores the frontend that existed before CFSail.

The inspected Hi serves Mainsail from a different path:

```sh
sh install.sh --lang en --web-root /mnt/UDISK/mainsail-v2.18.2 --backup-dir /mnt/UDISK/cfsail-backups
```

Use your actual frontend path; a directory name does not prove the running Mainsail version. [Full installation and recovery instructions](docs/INSTALLATION.md).

## Layout modes

`--layout auto` uses native Dashboard placement only when a verified integration is possible. Otherwise it reports standalone placement. `--layout native` refuses unsupported builds without changes. `--layout standalone` avoids adding new native module patches; an already installed legacy native host is preserved.

Native integration is limited to the inspected Mainsail 2.19.0 build anchors and matching static module structure. This is not a universal Mainsail plugin API. The installer verifies module references and preserves backups. Mainsail updates may replace these integrations; see [compatibility](docs/COMPATIBILITY.md).

## Local demo

The demo simulates three CFS units and an external spool. It never forwards requests to a printer. Node.js 22+ is required for this development tool, not for installation on the printer.

```sh
node demo/server.cjs
```

Open `http://127.0.0.1:8788/` and choose a language. Type/color editing and CFS load/unload affect only simulated data.

## Development

```sh
python3 tools/build.py
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.test.cjs
node --check assets/cfs-panel.js
python3 tools/package.py
```

The build bundles all five panel catalogs into a deterministic browser script. Tests cover translation placeholders, protocol invariance, blocked operations, browser DOM/WebSocket boundaries and installer backup/update/restore behavior. No credentials or live printer traces are included. [Verification scope](docs/TESTING.md).

## License

Code: GPL-3.0-only. See [NOTICE.md](NOTICE.md) for attribution and the supplied product image.
