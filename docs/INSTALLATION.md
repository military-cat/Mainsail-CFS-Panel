# Installation and recovery

Run the installer on the printer in the fully extracted release directory. Requirements: Python 3.8+, an existing writable Mainsail frontend and, for the live panel, the existing Creality WebSocket service on port 9999. No package downloads are performed. The installer does not ask for SSH credentials; connect using your existing access method first.

## Interactive install

```sh
sh install.sh
```

The first menu lists English, Korean, Japanese, Simplified Chinese and Spanish. The selected language is used for subsequent messages and the panel. Unknown language aliases fall back to English. The plan lists the selected web root, external backup, layout and every frontend file to change. Confirmation defaults to No.

`--lang` skips the language menu. `--yes` explicitly confirms a plan for unattended use. Without `--yes`, noninteractive execution refuses writes. `--dry-run` can be used noninteractively and writes no frontend files or backups.

```sh
python3 install.py install --lang ko --web-root /usr/share/mainsail --dry-run
```

## Paths

On the inspected K2 installation, Mainsail is served from `/usr/share/mainsail`. Other installations may use a different web root. The installer validates the frontend rather than assuming every directory is Mainsail. Auto discovery refuses ambiguity.

The new panel is stored under `<web-root>/cfsail/`. The existing index gets a `data-cfsail="true"` script tag with language and a content-hash cache version. Native mode additionally creates rewritten JS modules under `<web-root>/assets/` and updates the entry reference. Existing original modules are retained for restoration.

On recognized K2 paths with `/mnt/UDISK`, the default backup base is `/mnt/UDISK/cfsail-backups`. Each web root gets a separate journal directory. For custom roots, provide a backup base outside the web root:

```sh
sh install.sh --lang en --web-root /actual/mainsail --backup-dir /separate/cfsail-backups --dry-run
```

The journal records original and installed SHA-256 values. It contains frontend originals, not printer configurations. Keep this backup base and specify the same location for updates/removal.

## Update and language change

```sh
sh install.sh update --lang es --web-root /usr/share/mainsail
```

The Language selector defaults to Follow Mainsail. It reads Mainsail's GUI language and follows changes during the normal three-second status refresh. Unsupported languages use English. A manual language choice overrides synchronization until Follow Mainsail is selected again. The mode is saved in this browser per printer origin; older preferences from versions without automatic mode do not override the new default. Without Mainsail (for example, the standalone demo), automatic mode uses the installation/demo default. Changes are deferred while an editor is open or a panel command awaits confirmation. CFSail never writes Mainsail's language or printer configurations.

Install can also update an existing managed installation. Original pre-CFSail backups remain the restoration baseline. `update --lang` changes the installation default, not an existing browser preference. Changing the default alters only the panel script tag and managed frontend assets. Refresh Mainsail in the browser afterward; if cached content persists, use a hard refresh. An active PWA service worker can continue serving an older navigation page; if a hard refresh still shows that page, clear the site's cached data in the browser and reopen Mainsail. CFSail does not modify the classic service worker or automatically clear browser data.

## Uninstall / restore

```sh
sh install.sh uninstall --lang en --web-root /usr/share/mainsail
sh install.sh restore --lang en --web-root /usr/share/mainsail
```

Both return the frontend to its original state and remove only CFSail-created files recorded in the journal. Unrelated files are retained. A migration from the earlier legacy panel restores that earlier integration because it was present before CFSail installation.

## Interrupted installation

Ordinary errors trigger rollback to the state immediately before the transaction. An unexpectedly terminated process can leave a pending journal. The installer uses an operating-system-held lock, which is released when the process exits; a remaining lock file is not an active lock and must not be deleted to bypass a running installer. Use `restore` with the same web-root/backup arguments to recover a pending transaction. Keep the backup journal and original files.

Process-interruption recovery is tested. Filesystem damage or lost directory entries after a sudden power failure are not covered by that test; backup integrity checks still apply and may require manual recovery.

If a managed file has been edited since installation or a backup is corrupt, the installer refuses replacement. Preserve the edited file and inspect the difference. Do not discard the original backup to bypass a conflict. After a Mainsail rebuild/update, a newly inspected installation may require a new, separate backup base; see COMPATIBILITY.md.
