# Compatibility and scope

The panel uses the Creality `boxsInfo`, `modifyMaterial` and `feedInOrOut` protocol through the printer's existing WebSocket service on port 9999. K2 Plus protocol behavior and an inspected Creality Hi installation have been checked, with the Hi test scope below. This is not a generic MMU implementation. A custom firmware without that interface, HTTPS mixed-content restrictions or a reverse proxy serving a different hostname may require an explicitly configured WebSocket URL and is not covered by the default installer.

The default installer assumes Mainsail is served at the origin URL root, such as `http://printer-host:port/`. URL-prefix hosting such as `/mainsail/` is not supported by the default absolute `/cfsail/` script URL. The physical filesystem web-root path can still vary and is explicitly validated.

Native Mainsail Dashboard layout support is verified against the inspected Mainsail 2.19.0 compiled integration anchors. The installer does not assume that matching a version string alone is sufficient. It validates the root and complete static module references before patching, computes the reverse dependency closure and emits cache-safe module names.

Supported module trees have flat `assets/*.js` modules and local static references that the installer can analyze. Missing modules, traversal/symlinks, unsupported reference layouts and unknown existing panel integrations are rejected. Auto layout reports standalone placement if native anchors are not supported. Native-only mode refuses that fallback.

An existing verified legacy native host is preserved. Migration recognizes the known legacy `/noyeah-cfs/cfs-panel.js` integration without deleting its original asset files. Uninstall can therefore return to the prior panel.

The installer never modifies `printer.cfg`, `moonraker.conf`, nginx configuration, Klipper code, serial/CAN settings or printer firmware. It does not add a service or restart an existing one. The panel executes in the browser; Python is needed only for installation. Node.js is needed only for the optional PC demo/development tests.

Mainsail updates can replace index/native integration and invalidate a previous installed-file hash. CFSail then refuses silent replacement. Keep backups and inspect the rebuilt frontend before reinstalling with a separate backup baseline. This release has temporary-root installer tests, browser language checks and the specific Hi test below; installation on arbitrary printers is not claimed.

## Creality Hi live check (2026-10-13)

The inspected Hi runs Python 3.9.12 and serves Mainsail from `/mnt/UDISK/mainsail-v2.18.2`. A directory name alone does not establish the running Mainsail version. Its compiled module tree passed native integration validation, and the CFS entry appeared in the Dashboard layout settings. Installation and removal were executed on the printer; removal restored all 197 original frontend files byte-for-byte. All 35 files exposed through the printer's configuration root retained their original hashes.

Only an external spool was present in `boxsInfo`; no CFS enclosure was connected. External-spool type and color were changed through the live panel from Generic PLA/white to Generic PETG/blue, confirmed through an independent WebSocket connection and a browser reload, then restored to the exact original material metadata. No motion or heating commands were sent. CFS slot selection, enclosure temperature/humidity, load/unload and loaded-slot highlighting remain unverified on Hi until a CFS is physically connected.

Use an explicit web root and a separate backup base for this installation:

```sh
sh install.sh --lang ko --web-root /mnt/UDISK/mainsail-v2.18.2 --backup-dir /mnt/UDISK/cfsail-backups
```
