#!/usr/bin/env python3
"""Build a public archive from an explicit allowlist; never package printer logs."""
from pathlib import Path
import hashlib
import json
import re
import zipfile

base = Path(__file__).resolve().parent.parent
version = json.loads((base / 'release.json').read_text(encoding='utf-8'))['version']
assert re.fullmatch(r'\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?', version), 'Invalid release version'
destination = base.parent / ('Mainsail-CFS-Panel-v' + version + '.zip')
top_files = ['install.py', 'install.sh', 'LICENSE', 'NOTICE.md', 'README.md', 'README.ko.md', '.gitignore', 'release.json']
documentation = ['TRANSLATIONS.md', 'INSTALLATION.md', 'COMPATIBILITY.md', 'TESTING.md']
files = [base / name for name in top_files] + [base / 'docs' / name for name in documentation]
exact_files = [
    'assets/cfs-panel.js', 'assets/cfs.png', 'src/panel.js', 'src/i18n.js',
    'tests/test_installer.py', 'tests/test_panel_build.py',
    'tests/panel.test.cjs', 'tests/transport.test.cjs', 'tests/sync.test.cjs',
    'tests/browser-fixture.cjs', 'tests/recovery.test.cjs', 'tests/error-messages.test.cjs',
    'tests/external.test.cjs', 'tests/i18n.test.cjs', 'tests/panel-dom.test.cjs',
    'tests/synthetic-printer.json', 'demo/index.html', 'demo/server.cjs', 'demo/sample.json',
    'tools/build.py', 'tools/package.py',
    'docs/screenshots/cfs-overview.png', 'docs/screenshots/filament-actions.png',
    'docs/screenshots/filament-editor.png', 'docs/screenshots/external-spool.png',
    'docs/screenshots/multiple-cfs.png', 'docs/screenshots/language-menu.png',
    'docs/screenshots/printing-loaded-slot.png', 'docs/screenshots/printing-actions-blocked.png',
    'docs/images/cfsail-banner.png',
]
exact_files.extend('locales/' + folder + '/' + lang + '.json'
    for folder in ('installer', 'panel') for lang in ('en', 'ko', 'ja', 'zh', 'es'))
files.extend(base / relative for relative in exact_files)
assert all(path.is_file() for path in files), 'Required release file is missing'
for path in files:
    assert not any(parent.is_symlink() for parent in (path, *path.parents)), 'Release symlinks are not allowed'
    try:
        path.resolve().relative_to(base.resolve())
    except ValueError as error:
        raise ValueError('Release file escapes the project') from error
private = re.compile(r'(?<!\d)(?:192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?!\d)|[A-Za-z]:[\\/]Users[\\/][^\\/\s]+|BEGIN [A-Z ]*PRIVATE KEY|\.[a-z0-9]+_known_hosts')
for path in files:
    if path.suffix != '.png':
        assert not private.search(path.read_text(encoding='utf-8')), 'Private data in ' + str(path.relative_to(base))
names = sorted(set(files))
with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in names:
        info = zipfile.ZipInfo(str(Path('Mainsail-CFS-Panel') / path.relative_to(base)).replace('\\', '/'), date_time=(2026, 10, 13, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = (0o755 if path.name in ('install.sh', 'install.py') else 0o644) << 16
        archive.writestr(info, path.read_bytes())
with zipfile.ZipFile(destination) as archive:
    assert archive.testzip() is None
    assert not any('..' in Path(name).parts or '.verification' in name for name in archive.namelist())
report = {'archive': destination.name, 'files': len(names), 'sha256': hashlib.sha256(destination.read_bytes()).hexdigest()}
print(json.dumps(report))
