"""Installer integration tests use synthetic frontend trees only."""
import hashlib
import contextlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import struct
import sys
import tempfile
import unittest
import zlib

PROJECT = Path(__file__).resolve().parents[1]
ANCHORS = 'let d=[...lt];getPanelName(e){return e};GS=U([z({components:{AfcPanel:y_}})]);'


def fixture_png():
    def chunk(name, data):
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', zlib.crc32(name + data) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', 1,1,8,6,0,0,0)) + chunk(b'IDAT',zlib.compress(b'\0' * 5)) + chunk(b'IEND', b'')


class InstallerTests(unittest.TestCase):
    def setUp(self):
        # The Windows sandbox permits atomic rename inside the workspace.
        self.temp = tempfile.TemporaryDirectory(prefix='installer-fixture-', dir=PROJECT)
        self.base = Path(self.temp.name)
        self.package = self.base / 'package'
        self.package.mkdir()
        if (PROJECT / 'install.py').exists():
            shutil.copy2(PROJECT / 'install.py', self.package / 'install.py')
        if (PROJECT / 'locales/installer').exists():
            shutil.copytree(PROJECT / 'locales/installer', self.package / 'locales/installer')
        (self.package / 'assets').mkdir()
        (self.package / 'assets/cfs-panel.js').write_text('/* SPDX-License-Identifier: GPL-3.0-only CFSail synthetic fixture */ (function(){})();', encoding='utf-8')
        (self.package / 'assets/cfs.png').write_bytes(fixture_png())
        self.write_manifest()
        self.root = self.base / 'mainsail'
        (self.root / 'assets').mkdir(parents=True)
        self.index = '<!doctype html><html><head><title>Mainsail</title><script type="module" src="/assets/index-original.js"></script></head><body></body></html>'
        (self.root / 'index.html').write_text(self.index, encoding='utf-8')
        (self.root / 'assets/index-original.js').write_text('/* Mainsail */ export const app=1;', encoding='utf-8')
        self.backups = self.base / 'backups'

    def tearDown(self):
        self.temp.cleanup()

    def write_manifest(self):
        manifest = {'schema':1,'version':'0.1.0','project':'Mainsail-CFS-Panel',
                    'languages':['en','ko','ja','zh','es'],
                    'assets':{name:hashlib.sha256((self.package / 'assets' / name).read_bytes()).hexdigest()
                              for name in ('cfs-panel.js','cfs.png')}}
        (self.package / 'release.json').write_text(json.dumps(manifest),encoding='utf-8')

    def cli(self, *args, ok=True, input=None):
        result = subprocess.run([sys.executable, str(self.package / 'install.py'), *args,
                                 '--web-root', str(self.root), '--backup-dir', str(self.backups)],
                                input=input, text=True, encoding='utf-8', capture_output=True)
        self.assertEqual(result.returncode == 0, ok, result.stdout + result.stderr)
        return result

    def snapshot(self):
        return {str(p.relative_to(self.base)): p.read_bytes() for p in self.base.rglob('*') if p.is_file()}

    def test_dry_run_has_no_writes(self):
        before = self.snapshot()
        self.cli('--yes', '--dry-run', '--lang', 'ko')
        self.assertEqual(before, self.snapshot())

    def test_install_language_update_and_uninstall_restore_exact_original(self):
        self.cli('--yes', '--lang', 'ja-JP')
        installed = (self.root / 'index.html').read_text(encoding='utf-8')
        self.assertIn('data-lang="ja"', installed)
        self.assertIn('/cfsail/cfs-panel.js?v=', installed)
        self.assertNotIn('data-native-layout', installed)
        self.cli('update', '--yes', '--lang', 'es')
        self.assertIn('data-lang="es"', (self.root / 'index.html').read_text(encoding='utf-8'))
        self.cli('uninstall', '--yes', '--lang', 'en')
        self.assertEqual(self.index, (self.root / 'index.html').read_text(encoding='utf-8'))
        self.assertFalse((self.root / 'cfsail/cfs-panel.js').exists())

    def test_noninteractive_requires_yes(self):
        before = self.snapshot()
        self.cli('--lang', 'en', ok=False)
        self.assertEqual(before, self.snapshot())

    def test_catalogs_have_same_keys_and_placeholders(self):
        import re
        catalogs = [json.loads((PROJECT / 'locales/installer' / (lang + '.json')).read_text(encoding='utf-8')) for lang in ['en','ko','ja','zh','es']]
        for catalog in catalogs:
            self.assertEqual(set(catalogs[0]), set(catalog))
            for key, value in catalog.items():
                self.assertEqual(re.findall(r'\{\w+\}', catalogs[0][key]), re.findall(r'\{\w+\}', value), key)

    def test_native_unsupported_refuses_without_writes(self):
        before = self.snapshot()
        self.cli('--yes', '--layout', 'native', '--lang', 'en', ok=False)
        self.assertEqual(before, self.snapshot())

    def test_native_complete_reverse_graph_and_removal(self):
        (self.root / 'assets/index-original.js').write_text('/* Mainsail */' + ANCHORS + 'import "./math.vector-a.js";', encoding='utf-8')
        (self.root / 'assets/math.vector-a.js').write_text('import "./index-original.js";', encoding='utf-8')
        (self.root / 'assets/leaf.js').write_text('import "./math.vector-a.js";', encoding='utf-8')
        (self.root / 'assets/independent.js').write_text('export const unrelated=1;', encoding='utf-8')
        original = {p.name:p.read_bytes() for p in (self.root / 'assets').iterdir()}
        self.cli('--yes', '--layout', 'native', '--lang', 'en')
        html = (self.root / 'index.html').read_text(encoding='utf-8')
        self.assertIn('data-native-layout="true"', html)
        self.assertNotIn('/assets/index-original.js', html)
        generated = list((self.root / 'assets').glob('*-cfsail-*.js'))
        self.assertEqual(3, len(generated))
        self.assertTrue(any('NoyeahCfsPanel' in p.read_text(encoding='utf-8') for p in generated))
        for p in generated:
            self.assertNotIn('"./index-original.js"', p.read_text(encoding='utf-8'))
            self.assertNotIn('"./math.vector-a.js"', p.read_text(encoding='utf-8'))
        self.cli('restore', '--yes', '--lang', 'en')
        self.assertEqual(original, {p.name:p.read_bytes() for p in (self.root / 'assets').iterdir()})

    def test_preserves_existing_legacy_native_host(self):
        script = self.root / 'assets/index-original.js'
        script.write_text('/* Mainsail */ NoyeahCfsPanel;"data-noyeah-cfs-mount";', encoding='utf-8')
        before = script.read_bytes()
        self.cli('--yes', '--lang', 'en')
        self.assertIn('data-native-layout="true"', (self.root / 'index.html').read_text(encoding='utf-8'))
        self.assertEqual(before, script.read_bytes())

    def test_refuses_missing_module_or_non_mainsail(self):
        (self.root / 'assets/index-original.js').unlink()
        self.cli('--yes', '--lang', 'en', ok=False)
        (self.root / 'assets/index-original.js').write_text('export const app=1;')
        (self.root / 'index.html').write_text(self.index.replace('Mainsail', 'Unknown'))
        self.cli('--yes', '--lang', 'en', ok=False)

    def test_refuses_missing_dependency(self):
        (self.root / 'assets/index-original.js').write_text('/* Mainsail */ import "./missing.js";')
        self.cli('--yes', '--lang', 'en', ok=False)

    def test_edited_index_and_installed_asset_are_conflicts(self):
        self.cli('--yes', '--lang', 'en')
        script = self.root / 'cfsail/cfs-panel.js'
        script.write_text('unrelated edit')
        before = self.snapshot()
        self.cli('update', '--yes', '--lang', 'en', ok=False)
        self.cli('uninstall', '--yes', '--lang', 'en', ok=False)
        self.assertEqual(before, self.snapshot())

    def test_backup_tamper_refuses_restore(self):
        self.cli('--yes', '--lang', 'en')
        saved = next(self.backups.rglob('*.bak'))
        saved.write_bytes(b'tampered')
        before = self.snapshot()
        self.cli('restore', '--yes', '--lang', 'en', ok=False)
        self.assertEqual(before, self.snapshot())

    def test_existing_unmanaged_panel_refused(self):
        (self.root / 'cfsail').mkdir()
        (self.root / 'cfsail/cfs-panel.js').write_text('unmanaged')
        self.cli('--yes', '--lang', 'en', ok=False)

    def test_backup_inside_webroot_refused(self):
        self.backups = self.root / 'backup'
        self.cli('--yes', '--lang', 'en', ok=False)

    def test_symlink_and_traversal_refused(self):
        unsafe = self.base / 'unsafe'
        try:
            unsafe.symlink_to(self.root, target_is_directory=True)
        except OSError:
            self.skipTest('Windows account cannot create symlinks')
        self.root = unsafe
        self.cli('--yes', '--lang', 'en', ok=False)

    def test_lexical_traversal_refused(self):
        self.root = self.root / '..' / 'mainsail'
        result = self.cli('--yes', '--lang', 'en', ok=False)
        self.assertIn('unsafe traversal', result.stderr)

    def test_migrates_only_known_legacy_script_and_restores_it(self):
        self.index = self.index.replace('</head>', '<script src="/noyeah-cfs/cfs-panel.js?v=old" data-lang="ko"></script></head>')
        (self.root / 'index.html').write_text(self.index, encoding='utf-8')
        (self.root / 'assets/index-original.js').write_text('/* Mainsail */NoyeahCfsPanel;"data-noyeah-cfs-mount";', encoding='utf-8')
        (self.root / 'noyeah-cfs').mkdir()
        legacy = self.root / 'noyeah-cfs/cfs-panel.js'
        legacy.write_text('legacy fixture')
        self.cli('--yes', '--lang', 'en')
        self.assertNotIn('/noyeah-cfs/', (self.root / 'index.html').read_text(encoding='utf-8'))
        self.assertEqual('legacy fixture', legacy.read_text())
        self.cli('uninstall', '--yes', '--lang', 'en')
        self.assertEqual(self.index, (self.root / 'index.html').read_text(encoding='utf-8'))

    def test_failure_rolls_back_exact_webroot(self):
        import importlib.util
        from unittest.mock import patch
        spec = importlib.util.spec_from_file_location('installer', PROJECT / 'install.py')
        installer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(installer)
        before = {str(p.relative_to(self.root)): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        original_write = installer.atomic_write
        failed = False
        def fail_once(path, data):
            nonlocal failed
            if path.name == 'index.html' and not failed:
                failed = True
                raise OSError('synthetic index replacement failure')
            return original_write(path, data)
        with patch.object(installer, 'atomic_write', fail_once), contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            status = installer.main(['--yes','--lang','en','--web-root',str(self.root),'--backup-dir',str(self.backups)], self.package)
        self.assertEqual(1, status)
        self.assertTrue(failed)
        after = {str(p.relative_to(self.root)): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertEqual(before, after)

    def test_index_conflict_refuses_update_without_writes(self):
        self.cli('--yes', '--lang', 'en')
        path = self.root / 'index.html'
        path.write_text(path.read_text(encoding='utf-8') + '<!-- external edit -->', encoding='utf-8')
        before = self.snapshot()
        result = self.cli('update', '--yes', '--lang', 'en', ok=False)
        self.assertIn('conflict', result.stderr)
        self.assertEqual(before, self.snapshot())

    def test_unknown_language_falls_back_and_every_language_runs(self):
        for language in ('en','ko','ja','zh','es','unknown'):
            result = self.cli('--dry-run','--lang',language)
            self.assertNotIn('Traceback', result.stderr)
        self.cli('--yes','--lang','unknown')
        self.assertIn('data-lang="en"', (self.root / 'index.html').read_text(encoding='utf-8'))

    def module(self):
        import importlib.util
        spec = importlib.util.spec_from_file_location('installer', PROJECT / 'install.py')
        installer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(installer)
        return installer

    def test_invalid_choices_are_localized_before_root_validation(self):
        for language in ('ja','es'):
            result = self.cli('--yes','--lang',language,'--layout','invalid',ok=False)
            self.assertNotIn('invalid choice', result.stderr)
            self.assertNotIn('choose from', result.stderr)
            self.assertIn('--layout', result.stderr)

    def test_reinstall_after_removal(self):
        self.cli('--yes','--lang','en')
        self.cli('uninstall','--yes','--lang','en')
        self.cli('--yes','--lang','ko')
        self.cli('restore','--yes','--lang','ko')
        self.assertEqual(self.index, (self.root / 'index.html').read_text(encoding='utf-8'))

    def test_changed_original_after_removal_requires_new_backup(self):
        self.cli('--yes','--lang','en')
        self.cli('uninstall','--yes','--lang','en')
        (self.root / 'index.html').write_text(self.index + '<!-- a new Mainsail release -->', encoding='utf-8')
        before = self.snapshot()
        self.cli('--yes','--lang','en',ok=False)
        self.assertEqual(before, self.snapshot())

    def test_root_edit_between_plan_and_commit_refused(self):
        from unittest.mock import patch
        installer = self.module()
        original_commit = installer.commit_transaction
        def edited_commit(root, location, writes, journal, previous):
            (root / 'index.html').write_text(self.index + '<!-- concurrent external edit -->', encoding='utf-8')
            return original_commit(root, location, writes, journal, previous)
        with patch.object(installer, 'commit_transaction', edited_commit), contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = installer.main(['--yes','--lang','en','--web-root',str(self.root),'--backup-dir',str(self.backups)], self.package)
        self.assertEqual(1, result)
        self.assertFalse((self.root / 'cfsail').exists())
        self.assertIn('concurrent external edit', (self.root / 'index.html').read_text(encoding='utf-8'))

    def test_interrupted_transaction_can_restore_without_missing_module_inspection(self):
        (self.root / 'assets/index-original.js').write_text('/* Mainsail */' + ANCHORS, encoding='utf-8')
        self.cli('--yes','--layout','native','--lang','en')
        journal_file = next(self.backups.rglob('journal.json'))
        journal = json.loads(journal_file.read_text(encoding='utf-8'))
        journal['state'] = 'pending'
        journal_file.write_text(json.dumps(journal), encoding='utf-8')
        # An interrupted restore may already have removed a generated entry.
        entry = next((self.root / 'assets').glob('index-original-cfsail-*.js'))
        entry.unlink()
        self.cli('restore','--yes','--lang','en')
        self.assertEqual(self.index, (self.root / 'index.html').read_text(encoding='utf-8'))

    def test_journal_traversal_is_refused(self):
        self.cli('--yes','--lang','en')
        journal_file = next(self.backups.rglob('journal.json'))
        journal = json.loads(journal_file.read_text(encoding='utf-8'))
        journal['files']['../outside.txt'] = {'before_hash':None,'after_hash':None}
        journal_file.write_text(json.dumps(journal), encoding='utf-8')
        before = self.snapshot()
        self.cli('restore','--yes','--lang','en',ok=False)
        self.assertEqual(before, self.snapshot())

    def test_nested_reference_cannot_silently_escape_graph_validation(self):
        (self.root / 'assets/index-original.js').write_text('/* Mainsail */ import "./nested/missing.js";', encoding='utf-8')
        before = self.snapshot()
        self.cli('--yes','--lang','en',ok=False)
        self.assertEqual(before, self.snapshot())

    def test_native_query_references_are_rewritten(self):
        (self.root / 'assets/index-original.js').write_text('/* Mainsail */' + ANCHORS + 'import "./other.js?x=1";', encoding='utf-8')
        (self.root / 'assets/other.js').write_text('import "./index-original.js?x=2";', encoding='utf-8')
        self.cli('--yes','--layout','native','--lang','en')
        generated = list((self.root / 'assets').glob('*-cfsail-*.js'))
        self.assertEqual(2, len(generated))
        self.assertTrue(any('.js?x=2' in p.read_text(encoding='utf-8') for p in generated))
        self.assertFalse(any('"./index-original.js?' in p.read_text(encoding='utf-8') for p in generated))

    def test_native_write_order_keeps_original_index_until_all_assets_ready(self):
        from unittest.mock import patch
        installer = self.module()
        (self.root / 'assets/index-original.js').write_text('/* Mainsail */' + ANCHORS, encoding='utf-8')
        original_write = installer.atomic_write
        index_writes = []
        def observe_write(path, data):
            if path.name == 'index.html':
                self.assertTrue((self.root / 'cfsail/cfs-panel.js').is_file())
                self.assertTrue((self.root / 'cfsail/cfs.png').is_file())
                self.assertTrue(list((self.root / 'assets').glob('*-cfsail-*.js')))
                self.assertEqual(self.index, path.read_text(encoding='utf-8'))
                index_writes.append(path)
            return original_write(path, data)
        with patch.object(installer, 'atomic_write', observe_write), contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            result = installer.main(['--yes','--lang','en','--web-root',str(self.root),'--backup-dir',str(self.backups)], self.package)
        self.assertEqual(0, result)
        self.assertEqual(1, len(index_writes))

    def test_recovery_after_abandoned_lock(self):
        self.cli('--yes','--lang','en')
        location = next(self.backups.glob('root-*'))
        journal_file = location / 'journal.json'
        journal = json.loads(journal_file.read_text(encoding='utf-8'))
        journal['state'] = 'pending'
        journal_file.write_text(json.dumps(journal), encoding='utf-8')
        # The transaction process has gone away; its file descriptor lock has
        # been released. A leftover lock file must not prevent recovery.
        (location / '.lock').write_bytes(b'0')
        self.cli('restore','--yes','--lang','en')
        self.assertEqual(self.index, (self.root / 'index.html').read_text(encoding='utf-8'))

    def test_confirmation_flag_must_be_explicit(self):
        before = self.snapshot()
        self.cli('--y','--lang','en',ok=False)
        self.assertEqual(before, self.snapshot())

    def test_language_selection_precedes_other_prompts(self):
        from unittest.mock import patch
        installer = self.module()
        stdin = io.StringIO()
        stdin.isatty = lambda: True
        answers = iter(['2','n'])
        prompts = []
        def answer(prompt):
            prompts.append(prompt)
            return next(answers)
        with patch.object(installer.sys, 'stdin', stdin), patch('builtins.input', answer), contextlib.redirect_stdout(io.StringIO()):
            result = installer.main(['--web-root',str(self.root),'--backup-dir',str(self.backups)], self.package)
        self.assertEqual(0, result)
        self.assertEqual(2, len(prompts))
        self.assertIn('[1-5', prompts[0])
        self.assertIn('적용하시겠습니까', prompts[1])
        self.assertFalse((self.root / 'cfsail').exists())

    def test_spanish_accepts_accented_and_plain_confirmation(self):
        from unittest.mock import patch
        installer = self.module()
        stdin = io.StringIO()
        stdin.isatty = lambda: True
        with patch.object(installer.sys, 'stdin', stdin), patch('builtins.input', return_value='si'), contextlib.redirect_stdout(io.StringIO()):
            result = installer.main(['--lang','es','--web-root',str(self.root),'--backup-dir',str(self.backups)], self.package)
        self.assertEqual(0, result)
        self.assertIn('data-lang="es"', (self.root / 'index.html').read_text(encoding='utf-8'))

    def test_active_os_lock_blocks_concurrent_install(self):
        installer = self.module()
        location = installer.journal_location(self.root, self.backups)
        location.mkdir(parents=True)
        lock = installer.acquire_lock(location)
        try:
            result = self.cli('--yes','--lang','en',ok=False)
            self.assertIn('lock', result.stderr)
            self.assertEqual(self.index, (self.root / 'index.html').read_text(encoding='utf-8'))
        finally:
            lock.close()

    def test_original_index_hash_cannot_be_null(self):
        self.cli('--yes','--lang','en')
        journal_file = next(self.backups.rglob('journal.json'))
        journal = json.loads(journal_file.read_text(encoding='utf-8'))
        journal['files']['index.html']['before_hash'] = None
        journal_file.write_text(json.dumps(journal), encoding='utf-8')
        before = self.snapshot()
        self.cli('restore','--yes','--lang','en',ok=False)
        self.assertEqual(before, self.snapshot())

    def test_invalid_journal_record_types_are_refused(self):
        self.cli('--yes','--lang','en')
        journal_file = next(self.backups.rglob('journal.json'))
        original = json.loads(journal_file.read_text(encoding='utf-8'))
        for mutate in (lambda j:j['files'].__setitem__('index.html', []),
                       lambda j:j['files']['index.html'].__setitem__('previous_hash','bad'),
                       lambda j:j.__setitem__('version',True)):
            journal = json.loads(json.dumps(original))
            mutate(journal)
            journal_file.write_text(json.dumps(journal), encoding='utf-8')
            before = self.snapshot()
            self.cli('restore','--yes','--lang','en',ok=False)
            self.assertEqual(before,self.snapshot())

    def test_empty_and_corrupted_source_assets_refused_before_writes(self):
        for relative, content in (('cfs-panel.js',b''),('cfs-panel.js',b'console.log("unrelated");'),
                                  ('cfs.png',b''),('cfs.png',b'not a png'),('cfs.png',fixture_png()[:-2])):
            file = self.package / 'assets' / relative
            original = file.read_bytes()
            file.write_bytes(content)
            before = self.snapshot()
            self.cli('--yes','--lang','en',ok=False)
            self.assertEqual(before,self.snapshot())
            file.write_bytes(original)

    def test_fragment_reference_rewritten_and_nonstandard_local_imports_refused(self):
        script = self.root / 'assets/index-original.js'
        script.write_text('/* Mainsail */' + ANCHORS + 'import "./other.js#v=1";', encoding='utf-8')
        (self.root / 'assets/other.js').write_text('import "./index-original.js#v=2";', encoding='utf-8')
        self.cli('--yes','--layout','native','--lang','en')
        generated = list((self.root / 'assets').glob('*-cfsail-*.js'))
        self.assertEqual(2,len(generated))
        self.assertFalse(any('"./index-original.js#' in p.read_text(encoding='utf-8') for p in generated))
        self.cli('restore','--yes','--lang','en')
        for reference in ('../missing.js#v=1','./other.mjs','/elsewhere/other.js'):
            script.write_text('/* Mainsail */ import "' + reference + '";',encoding='utf-8')
            before = self.snapshot()
            self.cli('--yes','--lang','en',ok=False)
            self.assertEqual(before,self.snapshot())

    def test_release_manifest_is_required_and_structurally_valid(self):
        file = self.package / 'release.json'
        original = file.read_bytes()
        file.unlink()
        self.cli('--yes','--lang','en',ok=False)
        for content in (b'{}',b'[]',b'{broken',b'{"schema":true}'):
            file.write_bytes(content)
            before = self.snapshot()
            self.cli('--yes','--lang','en',ok=False)
            self.assertEqual(before,self.snapshot())
        file.write_bytes(original)

    def test_manifest_detects_valid_looking_asset_changes(self):
        script = self.package / 'assets/cfs-panel.js'
        script.write_text(script.read_text(encoding='utf-8').replace('(function(){})','(function(){return 2;})'),encoding='utf-8')
        before = self.snapshot()
        self.cli('--yes','--lang','en',ok=False)
        self.assertEqual(before,self.snapshot())
        self.write_manifest()
        image = self.package / 'assets/cfs.png'
        image.write_bytes(image.read_bytes() + b'extra')
        before = self.snapshot()
        self.cli('--yes','--lang','en',ok=False)
        self.assertEqual(before,self.snapshot())

    def test_restore_does_not_depend_on_release_assets(self):
        self.cli('--yes','--lang','en')
        (self.package / 'release.json').unlink()
        (self.package / 'assets/cfs-panel.js').unlink()
        self.cli('restore','--yes','--lang','en')
        self.assertEqual(self.index,(self.root / 'index.html').read_text(encoding='utf-8'))

    def test_asset_update_changes_cache_version_and_restores_original(self):
        self.cli('--yes','--lang','en')
        first = (self.root / 'index.html').read_bytes()
        script = self.package / 'assets/cfs-panel.js'
        script.write_text(script.read_text(encoding='utf-8').replace('fixture','fixture v2'),encoding='utf-8')
        self.write_manifest()
        self.cli('update','--yes','--lang','en')
        self.assertNotEqual(first,(self.root / 'index.html').read_bytes())
        self.assertEqual(script.read_bytes(),(self.root / 'cfsail/cfs-panel.js').read_bytes())
        self.cli('restore','--yes','--lang','en')
        self.assertEqual(self.index,(self.root / 'index.html').read_text(encoding='utf-8'))

    def test_known_classic_pwa_worker_is_a_resource_not_module_dependency(self):
        (self.root / 'assets/index-original.js').write_text('/* Mainsail */' + ANCHORS + 'import "./virtual_pwa-register-fixture.js";',encoding='utf-8')
        pwa = 'import {s as e} from "./index-original.js"; const a=()=>import("./workbox-window-fixture.js").then(()=>new e(`/sw.js`,{scope:`/`,type:`classic`})); export {a as registerSW};'
        (self.root / 'assets/virtual_pwa-register-fixture.js').write_text(pwa,encoding='utf-8')
        (self.root / 'assets/workbox-window-fixture.js').write_text('export const worker=1;',encoding='utf-8')
        (self.root / 'sw.js').write_text('/* classic worker fixture */',encoding='utf-8')
        self.cli('--yes','--layout','native','--lang','en')
        generated = list((self.root / 'assets').glob('*-cfsail-*.js'))
        self.assertEqual(2,len(generated))
        pwa_generated = next(p for p in generated if p.name.startswith('virtual_pwa-register'))
        text = pwa_generated.read_text(encoding='utf-8')
        self.assertIn('`/sw.js`',text)
        self.assertNotIn('"./index-original.js"',text)
        self.assertIn('"./workbox-window-fixture.js"',text)
        self.cli('restore','--yes','--lang','en')
        self.assertEqual('/* classic worker fixture */',(self.root / 'sw.js').read_text(encoding='utf-8'))

    def test_pwa_context_does_not_allow_sw_as_es_import(self):
        source = '/* Mainsail */ import "./virtual_pwa-register-fixture.js";'
        (self.root / 'assets/index-original.js').write_text(source,encoding='utf-8')
        pwa = 'import "/sw.js"; const classic={type:`classic`}; const a=()=>import("./workbox-window-fixture.js"); export {a as registerSW};'
        (self.root / 'assets/virtual_pwa-register-fixture.js').write_text(pwa,encoding='utf-8')
        (self.root / 'assets/workbox-window-fixture.js').write_text('export const worker=1;',encoding='utf-8')
        before = self.snapshot()
        self.cli('--yes','--lang','en',ok=False)
        self.assertEqual(before,self.snapshot())


if __name__ == '__main__':
    unittest.main()
