# CFSail

**Mainsail-CFS-Panel** adds Creality CFS and external-spool filament management to Mainsail. The interface is called **CFSail**.

**v0.1.0 — beta.** Installed and checked on a K2 Plus and a Creality Hi. Compatibility depends on the printer's Creality WebSocket interface and the installed Mainsail build; this is not a universal MMU plugin.

[한국어 안내](README.ko.md) · [Installation](docs/INSTALLATION.md) · [Compatibility](docs/COMPATIBILITY.md) · [Languages](docs/TRANSLATIONS.md)

Select a detected CFS from the header tabs to view filament types, colors, the reported loaded filament and enclosure temperature/humidity. A green outline identifies filament reported as loaded into the extruder. Select a slot to open Load, Unload or Edit; unavailable actions show a reason. Status messages reflect the printer's reported activity, including operations started from its touchscreen.

The external spool's tab and name are always **Ext.**, in every language. Editable filaments can be assigned a printer-provided Generic material and color. A save is confirmed against the printer's response. External-spool loading/unloading remains on the printer touchscreen.

### What has been checked

| Printer | Verified on the inspected installation | Remaining hardware checks |
| --- | --- | --- |
| K2 Plus + one CFS | Legacy-panel replacement, native Dashboard integration, live slot metadata and enclosure readings, language synchronization; original-panel material writes were previously confirmed and restored | Physical load/unload with this beta distribution |
| Creality Hi, external spool only | Install/remove/reinstall, exact frontend restoration, external material type/color save and restoration | CFS slots, enclosure readings and transport with a connected CFS |

The published tests use synthetic data. No physical motion or heating was triggered while validating this distribution. See [compatibility and test scope](docs/COMPATIBILITY.md).

The installer and panel support **English, 한국어, 日本語, 简体中文 and Español**. The Language menu defaults to Follow Mainsail. A manual language choice overrides synchronization until Follow Mainsail is selected again. The mode is saved in this browser per printer address. Mainsail and touchscreen languages are unchanged. The installer changes Mainsail web files only. It creates no printer cfg, daemon or credentials file and does not restart services, reboot the printer or move filament.

## Install

On this repository, choose **Code → Download ZIP**, extract it, and copy the entire project directory to the printer using your existing SSH/SCP access. Open a shell in that directory. Requirements: Python 3.8+, an existing locally hosted Mainsail frontend and the printer's Creality WebSocket service on port 9999. No Node.js installation is required on the printer.

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

Code: GPL-3.0-only. Derived from [swilsonnc/K2-plus-cfs-panel](https://github.com/swilsonnc/K2-plus-cfs-panel). See [NOTICE.md](NOTICE.md) for attribution and the supplied product image.
