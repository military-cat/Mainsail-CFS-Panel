#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""CFSail frontend installer. Python 3 standard library; no printer services/configs."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import struct
import sys
import tempfile
import zlib

LANGUAGES = ('en', 'ko', 'ja', 'zh', 'es')
COMMON_ROOTS = ('/usr/share/mainsail', '/usr/data/mainsail', '/usr/data/www/mainsail',
                '/usr/share/nginx/html', '/mnt/UDISK/mainsail')
REFERENCES = re.compile(r'(?P<prefix>\./|/assets/|assets/)(?P<name>[A-Za-z0-9_.-]+\.js)(?=["\'`?#])')
LOCAL_MODULE_URL = re.compile(r'["\'`]((?:\./|\.\./|/|assets/)[^"\'`]*?\.m?js(?:[?#][^"\'`]*)?)["\'`]')
PANEL_TAG = re.compile(r'<script\b[^>]*\bdata-cfsail="true"[^>]*>\s*</script>', re.I)
LEGACY_TAG = re.compile(r'<script\b(?=[^>]*\bsrc\s*=\s*(["\'])/noyeah-cfs/cfs-panel\.js(?:\?[^"\']*)?\1)[^>]*>\s*</script>', re.I)
PATCHES = (
    ('let d=[...lt]', 'let d=[...lt,`cfs`]'),
    ('getPanelName(e){', 'getPanelName(e){if(e===`cfs`)return`CFS`;'),
    ('GS=U([z({components:{AfcPanel:y_',
     'GS=U([z({components:{CfsPanel:{name:`NoyeahCfsPanel`,render(e){return e(`div`,{attrs:{"data-noyeah-cfs-mount":""}})}},AfcPanel:y_'),
)


class InstallError(Exception):
    def __init__(self, key, **values):
        self.key, self.values = key, values
        super().__init__(key)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def safe_path(value):
    """Reject traversal and every symlink ancestor before canonicalizing."""
    path = Path(value).expanduser()
    if '..' in path.parts:
        raise InstallError('unsafe_path', path=str(path))
    absolute = Path(os.path.abspath(str(path)))
    for ancestor in (absolute, *absolute.parents):
        if ancestor.is_symlink():
            raise InstallError('unsafe_path', path=str(ancestor))
    return absolute


def within(child, parent):
    try:
        child.relative_to(parent)
        return True
    except ValueError:
        return False


def root_file(root, relative):
    if not isinstance(relative, str) or '\\' in relative:
        raise InstallError('unsafe_path', path=str(relative))
    path = safe_path(root / relative)
    if not within(path, root) or path == root:
        raise InstallError('unsafe_path', path=relative)
    return path


def atomic_write(path, data):
    safe_path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    previous_mode = path.stat().st_mode & 0o777 if path.exists() else 0o644
    fd, name = tempfile.mkstemp(prefix='.cfsail-', dir=str(path.parent))
    try:
        with os.fdopen(fd, 'wb') as output:
            output.write(data)
            output.flush()
            os.fsync(output.fileno())
        os.chmod(name, previous_mode)
        os.replace(name, path)
        if path.read_bytes() != data:
            raise InstallError('verify_failed', path=str(path))
    finally:
        if os.path.exists(name):
            os.unlink(name)


class IndexParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.modules = []
        self.panels = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'script':
            if values.get('type') == 'module' and values.get('src'):
                self.modules.append(values['src'])
            if 'cfs-panel' in values.get('src', '').lower():
                self.panels.append(values)


def inspect_root(root):
    if not root.is_dir():
        raise InstallError('invalid_root', path=str(root))
    index_file = root_file(root, 'index.html')
    if not index_file.is_file():
        raise InstallError('invalid_root', path=str(root))
    html = index_file.read_text(encoding='utf-8')
    parser = IndexParser()
    parser.feed(html)
    if len(parser.modules) != 1 or len(re.findall(r'</head\s*>', html, re.I)) != 1:
        raise InstallError('invalid_root', path=str(root))
    entry_match = re.fullmatch(r'(?:/|\./)?assets/([A-Za-z0-9_.-]+\.js)(?:\?[^#]*)?', parser.modules[0])
    if not entry_match:
        raise InstallError('invalid_root', path=str(root))
    entry = entry_match.group(1)
    assets = root_file(root, 'assets')
    if not assets.is_dir():
        raise InstallError('invalid_root', path=str(root))
    sources = {}
    for file in sorted(assets.rglob('*.js')):
        safe_path(file)
        if file.parent != assets or not file.is_file():
            raise InstallError('unsupported_modules', path=str(file))
        sources[file.name] = file.read_text(encoding='utf-8')
    if entry not in sources or 'mainsail' not in (html + sources[entry]).lower():
        raise InstallError('invalid_root', path=str(root))
    graph = {}
    for name, source in sources.items():
        for match in LOCAL_MODULE_URL.finditer(source):
            url = match.group(1)
            if known_classic_pwa_worker(name, source, url):
                continue
            if not re.fullmatch(r'(?:\./|/assets/|assets/)[A-Za-z0-9_.-]+\.js(?:[?#][^"\'`]*)?', url):
                raise InstallError('unsupported_modules', path=name)
        graph[name] = [match.group('name') for match in REFERENCES.finditer(source)]
        for dependency in graph[name]:
            if dependency not in sources:
                raise InstallError('missing_module', path=dependency)
    return html, parser, entry, sources, graph


def known_classic_pwa_worker(name, source, url):
    """Vite PWA registers /sw.js as a classic resource, not an ES module.

    Restrict this exception to the known generated registration module and its
    Workbox registration context. An actual import/re-export of that same URL
    remains unsupported and must not disappear from dependency validation.
    """
    if (url != '/sw.js' or not re.fullmatch(r'virtual_pwa-register-[A-Za-z0-9_.-]+\.js',name)
            or 'workbox-window' not in source or 'registerSW' not in source
            or not re.search(r'\btype\s*:\s*(["\'`])classic\1',source)):
        return False
    space = r'(?:\s|/\*[\s\S]*?\*/|//[^\n]*\n)*'
    actual_import = r'\b(?:from|import)' + space + r'(?:\(' + space + r')?["\'`]/sw\.js(?:[?#][^"\'`]*)?["\'`]'
    return not re.search(actual_import,source)


def native_plan(entry, sources, graph):
    source = sources[entry]
    legacy = ('NoyeahCfsPanel' in source, 'data-noyeah-cfs-mount' in source)
    if any(legacy):
        if not all(legacy):
            raise InstallError('unknown_integration')
        return True, {}, {}
    if any('NoyeahCfsPanel' in text or 'data-noyeah-cfs-mount' in text for text in sources.values()):
        raise InstallError('unknown_integration')
    if not all(source.count(before) == 1 for before, _ in PATCHES):
        return False, {}, {}
    patched = source
    for before, after in PATCHES:
        patched = patched.replace(before, after, 1)
    affected = {entry}
    while True:
        expanded = affected | {name for name, dependencies in graph.items() if affected.intersection(dependencies)}
        if expanded == affected:
            break
        affected = expanded
    # A graph fingerprint works even for circular imports, where independent
    # per-file content hashes cannot be computed before reference rewriting.
    fingerprint = digest(json.dumps({name: patched if name == entry else sources[name]
                                     for name in sorted(affected)}, sort_keys=True).encode())[:16]
    renamed = {name: name[:-3] + '-cfsail-' + fingerprint + '.js' for name in affected}
    writes = {}
    for name in sorted(affected):
        text = patched if name == entry else sources[name]
        text = REFERENCES.sub(lambda m: m.group('prefix') + renamed.get(m.group('name'), m.group('name')), text)
        writes['assets/' + renamed[name]] = text.encode('utf-8')
    return True, writes, renamed


def journal_location(root, backup_dir):
    return backup_dir / ('root-' + digest(str(root).encode())[:24])


def read_journal(location, root):
    path = safe_path(location / 'journal.json')
    if not path.exists():
        return None
    try:
        journal = json.loads(path.read_text(encoding='utf-8'))
        if not isinstance(journal, dict) or type(journal['version']) is not int or journal['version'] != 1 or journal['root'] != str(root) or journal['state'] not in ('installed','pending','removed'):
            raise ValueError('invalid journal header')
        if journal['language'] not in LANGUAGES or journal['layout'] not in ('native','standalone'):
            raise ValueError('invalid journal settings')
        if not isinstance(journal['files'], dict):
            raise ValueError('invalid files')
        if not {'index.html','cfsail/cfs-panel.js','cfsail/cfs.png'}.issubset(journal['files']):
            raise ValueError('missing mandatory managed files')
        for relative, record in journal['files'].items():
            root_file(root, relative)
            if not isinstance(record,dict) or set(record) - {'before_hash','after_hash','previous_hash'}:
                raise ValueError('invalid file record')
            if relative != 'index.html' and relative not in ('cfsail/cfs-panel.js','cfsail/cfs.png') and not re.fullmatch(r'assets/[A-Za-z0-9_.-]+-cfsail-[0-9a-f]{16}\.js', relative):
                raise ValueError('invalid managed path')
            if (relative == 'index.html' and (record['before_hash'] is None or record['after_hash'] is None or record.get('previous_hash',record['before_hash']) is None)) or (relative != 'index.html' and record['before_hash'] is not None):
                raise ValueError('invalid original file invariants')
            for field in ('before_hash', 'after_hash', 'previous_hash'):
                value = record.get(field)
                if value is not None and (not isinstance(value,str) or not re.fullmatch(r'[0-9a-f]{64}',value)):
                    raise ValueError('invalid hash')
            if journal['state'] == 'installed' and record['after_hash'] is None:
                raise ValueError('missing installed hash')
            if record['before_hash'] is not None:
                original = safe_path(location / (digest(relative.encode()) + '.bak'))
                if not original.is_file() or digest(original.read_bytes()) != record['before_hash']:
                    raise InstallError('backup_tampered', path=relative)
        if 'index.html' not in journal['files']:
            raise ValueError('missing index record')
        return journal
    except (ValueError, KeyError, TypeError) as error:
        raise InstallError('invalid_journal', path=str(path)) from error


def validate_asset(name, data):
    if name == 'cfs-panel.js':
        text = data.decode('utf-8')
        if len(data) < 64 or 'CFSail' not in text[:1024] or 'SPDX-License-Identifier: GPL-3.0-only' not in text[:1024] or '(function' not in text or not text.rstrip().endswith(';'):
            raise InstallError('invalid_asset', path=name)
        return
    try:
        if not data.startswith(b'\x89PNG\r\n\x1a\n'):
            raise ValueError('PNG signature')
        offset, names, compressed = 8, [], bytearray()
        width = height = depth = color = interlace = 0
        while offset + 12 <= len(data):
            length = struct.unpack('>I', data[offset:offset+4])[0]
            end = offset + length + 12
            if end > len(data):
                raise ValueError('truncated chunk')
            kind = data[offset+4:offset+8]
            body = data[offset+8:offset+8+length]
            checksum = struct.unpack('>I', data[offset+8+length:end])[0]
            if zlib.crc32(kind+body) & 0xffffffff != checksum:
                raise ValueError('chunk checksum')
            if not names and kind != b'IHDR':
                raise ValueError('missing header')
            names.append(kind)
            if kind == b'IHDR':
                if length != 13 or names.count(kind) != 1:
                    raise ValueError('invalid header')
                width,height,depth,color,compression,filter_method,interlace = struct.unpack('>IIBBBBB',body)
                depths = {0:(1,2,4,8,16),2:(8,16),3:(1,2,4,8),4:(8,16),6:(8,16)}
                if not width or not height or width*height > 16777216 or depth not in depths.get(color,()) or compression != 0 or filter_method != 0 or interlace not in (0,1):
                    raise ValueError('unsupported header')
            elif kind == b'IDAT':
                compressed.extend(body)
            elif kind == b'IEND':
                if length or end != len(data):
                    raise ValueError('invalid end')
                break
            offset = end
        if not names or names[-1] != b'IEND' or not compressed or (color == 3 and b'PLTE' not in names):
            raise ValueError('incomplete image')
        channels = {0:1,2:3,3:1,4:2,6:4}[color]
        row_size = (width*channels*depth+7)//8+1
        decompressor = zlib.decompressobj()
        pixels = decompressor.decompress(bytes(compressed), row_size*height+height*8+1024)
        if not decompressor.eof or decompressor.unused_data or (interlace == 0 and len(pixels) != row_size*height):
            raise ValueError('invalid compressed image')
    except (ValueError, KeyError, struct.error, zlib.error) as error:
        raise InstallError('invalid_asset', path=name) from error


def read_release_assets(package):
    manifest_file = safe_path(package / 'release.json')
    if not manifest_file.is_file():
        raise InstallError('missing_asset', path='release.json')
    try:
        manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
        if (not isinstance(manifest,dict) or type(manifest['schema']) is not int or manifest['schema'] != 1
                or manifest['project'] != 'Mainsail-CFS-Panel' or manifest['languages'] != list(LANGUAGES)
                or not isinstance(manifest['version'],str) or not re.fullmatch(r'\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?',manifest['version'])
                or not isinstance(manifest['assets'],dict) or set(manifest['assets']) != {'cfs-panel.js','cfs.png'}):
            raise ValueError('invalid release header')
        for value in manifest['assets'].values():
            if not isinstance(value,str) or not re.fullmatch(r'[0-9a-f]{64}',value):
                raise ValueError('invalid asset hash')
    except (ValueError, KeyError, TypeError, UnicodeError) as error:
        raise InstallError('invalid_asset',path='release.json') from error
    assets = {}
    for name in ('cfs-panel.js','cfs.png'):
        file = safe_path(package / 'assets' / name)
        if not file.is_file():
            raise InstallError('missing_asset',path=name)
        data = file.read_bytes()
        validate_asset(name,data)
        if digest(data) != manifest['assets'][name]:
            raise InstallError('invalid_asset',path=name)
        assets['cfsail/' + name] = data
    return assets


def verify_current(root, journal, recovering=False):
    for relative, record in journal['files'].items():
        file = root_file(root, relative)
        if file.exists() and not file.is_file():
            raise InstallError('conflict', path=relative)
        actual = digest(file.read_bytes()) if file.exists() else None
        allowed = {record['after_hash']}
        if recovering:
            allowed.update((record['before_hash'], record.get('previous_hash')))
        if actual not in allowed:
            raise InstallError('conflict', path=relative)


def serialized(journal):
    return (json.dumps(journal, ensure_ascii=False, sort_keys=True, indent=2) + '\n').encode('utf-8')


def acquire_lock(location):
    """OS-held file locks disappear when a process exits, including after a kill."""
    lock_path = safe_path(location / '.lock')
    handle = lock_path.open('a+b')
    try:
        if lock_path.stat().st_size == 0:
            handle.write(b'0')
            handle.flush()
        handle.seek(0)
        if os.name == 'nt':
            import msvcrt
            msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        return handle
    except OSError as error:
        handle.close()
        raise InstallError('locked', path=str(location)) from error


def validate_preimages(root, location, writes, journal, previous):
    for relative in writes:
        path = root_file(root, relative)
        actual = digest(path.read_bytes()) if path.exists() else None
        expected = previous['files'][relative]['after_hash'] if previous and relative in previous['files'] else journal['files'][relative]['before_hash']
        if not (previous and previous['state'] == 'pending') and actual != expected:
            raise InstallError('conflict', path=relative)
        original_hash = journal['files'][relative]['before_hash']
        backup_file = safe_path(location / (digest(relative.encode()) + '.bak'))
        if original_hash is not None and backup_file.exists() and digest(backup_file.read_bytes()) != original_hash:
            raise InstallError('backup_tampered', path=relative)


def commit_transaction(root, location, writes, journal, previous):
    """Record recoverable intent, replace index last, verify, then commit journal."""
    # Revalidate planned preimages before creating anything. This catches both
    # a concurrent frontend edit and attempts to reuse a different original.
    validate_preimages(root, location, writes, journal, previous)
    safe_path(location)
    location.mkdir(parents=True, exist_ok=True)
    lock = acquire_lock(location)
    old_journal = (location / 'journal.json').read_bytes() if (location / 'journal.json').exists() else None
    changed = []
    snapshots = {}
    created_dirs = []
    try:
        validate_preimages(root, location, writes, journal, previous)
        if previous:
            verify_current(root, previous, previous['state'] == 'pending')
        for relative, data in writes.items():
            path = root_file(root, relative)
            snapshots[relative] = path.read_bytes() if path.exists() else None
            if snapshots[relative] is not None and journal['files'][relative]['before_hash'] == digest(snapshots[relative]):
                saved = location / (digest(relative.encode()) + '.bak')
                if not saved.exists():
                    atomic_write(saved, snapshots[relative])
            journal['files'][relative]['previous_hash'] = digest(snapshots[relative]) if snapshots[relative] is not None else None
        desired_state = journal['state']
        journal['state'] = 'pending'
        atomic_write(location / 'journal.json', serialized(journal))
        for relative in sorted(writes, key=lambda value: (value == 'index.html', value)):
            path, data = root_file(root, relative), writes[relative]
            if not path.parent.exists():
                created_dirs.append(path.parent)
            changed.append(relative)
            if data is None:
                if path.exists():
                    path.unlink()
            else:
                atomic_write(path, data)
        for relative, data in writes.items():
            path = root_file(root, relative)
            if (data is None and path.exists()) or (data is not None and (not path.exists() or digest(path.read_bytes()) != digest(data))):
                raise InstallError('verify_failed', path=relative)
        journal['state'] = desired_state
        atomic_write(location / 'journal.json', serialized(journal))
    except BaseException:
        # Rollback restores the exact state immediately before this transaction,
        # while the external original backups remain available for recovery.
        for relative in reversed(changed):
            path, data = root_file(root, relative), snapshots[relative]
            if data is None:
                if path.exists():
                    path.unlink()
            else:
                atomic_write(path, data)
        if old_journal is not None:
            atomic_write(location / 'journal.json', old_journal)
        elif (location / 'journal.json').exists():
            (location / 'journal.json').unlink()
        for path in reversed(created_dirs):
            if path.is_dir() and not any(path.iterdir()):
                path.rmdir()
        raise
    finally:
        lock.close()
    panel_dir = root_file(root, 'cfsail')
    if panel_dir.is_dir() and not any(panel_dir.iterdir()):
        panel_dir.rmdir()


def choose_language(argv):
    explicit = None
    for position, value in enumerate(argv):
        if value.startswith('--lang='):
            explicit = value.split('=', 1)[1]
        elif value == '--lang' and position + 1 < len(argv):
            explicit = argv[position + 1]
    if explicit is None and sys.stdin.isatty() and '--yes' not in argv and '--help' not in argv and '-h' not in argv:
        print('Language / 언어 / 言語 / 语言 / Idioma:')
        print('1. English  2. 한국어  3. 日本語  4. 简体中文  5. Español')
        explicit = input('[1-5, en]: ').strip()
        explicit = dict(zip(('1','2','3','4','5'), LANGUAGES)).get(explicit, explicit)
    language = (explicit or 'en').lower().replace('_','-').split('-')[0]
    return language if language in LANGUAGES else 'en'


def main(argv=None, package_dir=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    package = Path(package_dir) if package_dir else Path(__file__).resolve().parent
    language = choose_language(argv)
    catalog = json.loads((package / 'locales/installer' / (language + '.json')).read_text(encoding='utf-8'))
    def message(key, **values):
        return catalog[key].format(**values)
    class LocalizedParser(argparse.ArgumentParser):
        def error(self, _detail):
            raise InstallError('invalid_arguments', detail=' '.join(argv))
    parser = LocalizedParser(add_help=False, allow_abbrev=False)
    parser.add_argument('action', nargs='?', default='install')
    parser.add_argument('--lang')
    parser.add_argument('--web-root')
    parser.add_argument('--backup-dir')
    parser.add_argument('--layout', default='auto')
    parser.add_argument('--yes', action='store_true')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--help', '-h', action='store_true')
    try:
        args, unknown = parser.parse_known_args(argv)
        if unknown:
            raise InstallError('invalid_arguments', detail=' '.join(unknown))
        if args.help:
            print(message('help'))
            return 0
        for option, value, allowed in (('action',args.action,('install','update','uninstall','restore')),
                                       ('--layout',args.layout,('auto','native','standalone'))):
            if value not in allowed:
                raise InstallError('invalid_choice', option=option, value=value, allowed=', '.join(allowed))
        if args.web_root:
            root = safe_path(args.web_root)
        else:
            candidates = []
            for candidate in COMMON_ROOTS:
                try:
                    resolved = safe_path(candidate)
                    inspect_root(resolved)
                    candidates.append(resolved)
                except (InstallError, OSError, UnicodeError):
                    pass
            if len(candidates) == 1:
                root = candidates[0]
            elif sys.stdin.isatty() and not args.yes:
                root = safe_path(input(message('root_prompt') + ' '))
            else:
                raise InstallError('root_required')
        if not root.is_dir():
            raise InstallError('invalid_root', path=str(root))
        if args.backup_dir:
            backup_dir = safe_path(args.backup_dir)
        elif str(root).replace('\\','/') in COMMON_ROOTS and Path('/mnt/UDISK').is_dir():
            backup_dir = safe_path('/mnt/UDISK/cfsail-backups')
        else:
            raise InstallError('backup_required')
        if within(backup_dir, root) or within(root, backup_dir):
            raise InstallError('unsafe_backup', path=str(backup_dir))
        location = journal_location(root, backup_dir)
        journal = read_journal(location, root)
        if journal and journal['state'] == 'removed':
            journal = None
        if journal:
            if journal['state'] == 'pending' and args.action not in ('uninstall','restore'):
                raise InstallError('pending_transaction')
            verify_current(root, journal, journal['state'] == 'pending')
        writes = {}
        if args.action in ('uninstall','restore'):
            if journal is None:
                raise InstallError('not_installed')
            for relative, record in journal['files'].items():
                writes[relative] = (location / (digest(relative.encode()) + '.bak')).read_bytes() if record['before_hash'] is not None else None
            planned = json.loads(json.dumps(journal))
            planned['state'] = 'removed'
            for relative, record in planned['files'].items():
                record['after_hash'] = record['before_hash']
            layout = message('restore_layout')
        else:
            release_assets = read_release_assets(package)
            html, index_parser, entry, sources, graph = inspect_root(root)
            if args.action == 'update' and journal is None:
                raise InstallError('not_installed')
            if journal is None:
                legacy_panel = (len(index_parser.panels) == 1 and len(LEGACY_TAG.findall(html)) == 1
                                and 'NoyeahCfsPanel' in sources[entry] and 'data-noyeah-cfs-mount' in sources[entry])
                if (index_parser.panels and not legacy_panel) or root_file(root, 'cfsail').exists():
                    raise InstallError('unknown_integration')
                if legacy_panel:
                    html = LEGACY_TAG.sub('', html)
            if journal and len(PANEL_TAG.findall(html)) != 1:
                raise InstallError('unknown_integration')
            native, native_writes, renamed = native_plan(entry, sources, graph)
            if args.layout == 'native' and not native:
                raise InstallError('native_unsupported')
            if args.layout == 'standalone':
                native_writes, renamed = {}, {}
                # A preserved legacy native host is still assured; letting the
                # panel use it avoids duplicating an existing host.
                native = 'NoyeahCfsPanel' in sources[entry] and 'data-noyeah-cfs-mount' in sources[entry]
            if not native:
                print(message('standalone_notice'))
            writes.update(native_writes)
            html = REFERENCES.sub(lambda m: m.group('prefix') + renamed.get(m.group('name'), m.group('name')), html)
            html = PANEL_TAG.sub('', html)
            writes.update(release_assets)
            version = digest(writes['cfsail/cfs-panel.js'])[:16]
            tag = '<script defer src="/cfsail/cfs-panel.js?v=' + version + '" data-cfsail="true" data-lang="' + language + '"'
            if native:
                tag += ' data-native-layout="true"'
            tag += '></script>'
            html = re.sub(r'</head\s*>', lambda _: tag + '</head>', html, count=1, flags=re.I)
            writes['index.html'] = html.encode('utf-8')
            planned = json.loads(json.dumps(journal)) if journal else {'version':1, 'root':str(root), 'files':{}}
            planned.update(state='installed', language=language, layout='native' if native else 'standalone')
            for relative, data in writes.items():
                path = root_file(root, relative)
                if relative not in planned['files']:
                    if path.exists() and relative != 'index.html':
                        raise InstallError('conflict', path=relative)
                    planned['files'][relative] = {'before_hash':digest(path.read_bytes()) if path.exists() else None}
                planned['files'][relative]['after_hash'] = digest(data)
            layout = message('native_layout' if native else 'standalone_layout')
        print(message('plan', action=message('action_' + args.action), root=str(root), backup=str(location), language=language, layout=layout))
        for relative in sorted(writes):
            print(message('file_plan', path=relative))
        if args.dry_run:
            print(message('dry_run'))
            return 0
        if not args.yes:
            if not sys.stdin.isatty():
                raise InstallError('yes_required')
            answer = input(message('confirm') + ' ').strip().lower()
            affirmative = {'y','yes',catalog['affirmative']}
            if language == 'es':
                affirmative.add('si')
            if answer not in affirmative:
                print(message('cancelled'))
                return 0
        commit_transaction(root, location, writes, planned, journal)
        print(message('completed', backup=str(location)))
        return 0
    except argparse.ArgumentError as error:
        print(message('error', detail=message('invalid_arguments', detail=str(error))), file=sys.stderr)
    except InstallError as error:
        print(message('error', detail=message(error.key, **error.values)), file=sys.stderr)
    except (OSError, UnicodeError) as error:
        print(message('error', detail=message('filesystem_error', detail=str(error))), file=sys.stderr)
    return 1


if __name__ == '__main__':
    # UTF-8 catalogs must work when Windows pipes default to a legacy codepage.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            stream.reconfigure(encoding='utf-8', errors='backslashreplace')
    sys.exit(main())
