# Verification

Run from the release directory:

```sh
python3 tools/build.py
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.test.cjs
node --check assets/cfs-panel.js
node --check demo/server.cjs
```

The panel tests use synthesized printer data. They preserve the original edit/transport/status guard behavior, check all five language catalogs and interpolation arguments, exercise real bundled DOM/WebSocket boundaries and ensure language cannot change wire payloads. The builder checks catalog completeness and produces deterministic output.

Installer tests create temporary synthetic Mainsail roots and separate backup directories. They cover dry-run, installation, language update, legacy migration, uninstall, native reverse module graph rewriting, corrupt backups, file conflicts, unsafe paths, edited preimages, rollback and pending recovery. A real symlink filesystem test may be skipped on Windows without symlink privileges; separate path-safety tests still run. The distribution's shell launcher needs a POSIX shell.

The local demo binds only to loopback and uses fake printer data. Browser verification covers English, Korean, Japanese, Simplified Chinese and Spanish, along with localized menus and external-spool view. No demo command is forwarded to real hardware.

The original panel's external spool edit was verified on a real K2 Plus and restored. This distribution was subsequently installed on the K2 Plus and Creality Hi. The K2 legacy loader was replaced with one CFSail loader while its native Dashboard host was preserved. The Hi passed install/remove/reinstall, including exact restoration of 197 original frontend files. Its external-spool type/color write was checked using independent readback and a page reload, then all original material metadata was restored. K2 configuration files (15), Hi configuration files (35), K2 nginx and filament metadata retained their baseline values during the final updates. These counts describe the inspected machines, not a guarantee about other installations. Physical loading/unloading/heating is not part of these distribution tests.

The panel's default language mode reads Mainsail's GUI language. Browser tests cover automatic updates, a persistent manual override, returning to automatic mode, invalid/blocked storage and unsupported-language fallback. An actual K2 page followed Mainsail's English setting, switched manually to Korean, and returned to English in automatic mode without changing Mainsail's setting. Ext. remains fixed across all five languages.

The inspected real Mainsail module tree was also copied to a PC fixture using HTTP reads only. Migration on the existing native build and a reconstructed original build both passed install, Japanese-to-Spanish language update and exact byte-for-byte frontend restoration. The tree contained 143 reachable modules; native integration generated 33 rewritten modules in the original-build fixture. These private copies are excluded from the public package.

`tools/package.py` packages an explicit allowlist and scans for private address/credential-file patterns. Original printer configs, SSH known-host files, live recordings and personal backups are not included in the release archive.

## Local CFS recovery simulation (v0.1.3 beta)

Run `node demo/server.cjs 8788` on the development computer and open `http://127.0.0.1:8788/?lang=ko`. Choose a recovery-test scenario, click **CFS 오류 만들기**, then use the panel's recovery button. The simulator listens only on loopback and never forwards requests to a printer. **데모 초기화** resets only synthetic state.

The unreleased panel recognizes known filament-path errors (legacy keys 835, 836, 837, 838, 839, 841, 846, 852, 854, 855, 856, 857, 864, 865, and the corresponding keys with 2000 added). Unknown printer faults do not expose this action. It first queries same-origin Moonraker status and refuses an unready host or an actively printing job. It then sends only `BOX_ERROR_RESUME_PROCESS`, once per manual attempt. It does not append `RESUME`. A web server must proxy the standard `/printer/` Moonraker routes; no real-printer validation of this new path is claimed.

A successful API reply is displayed as accepted, not completed. Completion needs post-command error-clear and idle reports plus complete, connected CFS slot snapshots for the boxes present when the request started. An uncertain result stays locked until these observations resolve it. Recovery does not clear printer errors locally, automatically retry, or replay a command on reconnect.

Automated browser-bundle tests cover command identity and count, pending clicks, active printing, read-only access, errors changing during preflight, explicit rejection, disconnection, missing completion, incomplete CFS snapshots and uncertain-lock release. Timeout behavior is tested with controlled timers. This demonstrates UI and request behavior only; it does not demonstrate physical CFS recovery.

### Error-specific guidance (v0.1.3 beta, local simulation)

The panel describes 33 current Creality OS CFS codes using the vendor's error index:
https://wiki.creality.com/en/printers-general-documents

Descriptions identify the reported condition and suggest checks; they do not diagnose the physical root cause. Original codes and printer reports are retained as plain text. Unknown and legacy codes use the original fallback without inferring a current-code equivalent. A description does not add the code to the manual recovery allowlist.

In the local demo, select an error type and click **CFS 오류 만들기**. Compare 2836 (hub to extruder sensor), 2837 (sensor to gear), 2839 (runout), 2841 (cutter), 2853 (temperature/humidity sensor), 2865 (filament did not exit extruder), and unknown 2999. Error 2853 and unknown 2999 must not offer the CFS recovery command. The code's message must remain through unrelated status updates and clear only on an explicit zero error report.
