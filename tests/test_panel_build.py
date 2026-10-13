"""Exercise the shipped stdlib builder against isolated catalog failures."""
import json
import hashlib
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class PanelBuildTests(unittest.TestCase):
    def setUp(self):
        # Keep child-process writes in the workspace on restricted Windows hosts.
        self.temp = tempfile.TemporaryDirectory(prefix='panel-build-fixture-', dir=ROOT)
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for folder in ('src', 'locales/panel', 'tools'):
            shutil.copytree(ROOT / folder, self.root / folder)
        (self.root / 'assets').mkdir()
        shutil.copyfile(ROOT / 'assets/cfs.png', self.root / 'assets/cfs.png')

    def run_build(self):
        return subprocess.run([sys.executable, str(self.root / 'tools/build.py')], capture_output=True, text=True)

    def test_build_is_deterministic_and_matches_release_asset(self):
        first = self.run_build()
        self.assertEqual(first.returncode, 0, first.stderr)
        content = (self.root / 'assets/cfs-panel.js').read_bytes()
        self.assertEqual(self.run_build().returncode, 0)
        self.assertEqual((self.root / 'assets/cfs-panel.js').read_bytes(), content)
        self.assertEqual(content, (ROOT / 'assets/cfs-panel.js').read_bytes())

    def test_missing_key_refuses_output(self):
        catalog_path = self.root / 'locales/panel/ja.json'
        catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
        del catalog['editor.saved']
        catalog_path.write_text(json.dumps(catalog), encoding='utf-8')
        result = self.run_build()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Catalog key mismatch', result.stderr)
        self.assertFalse((self.root / 'assets/cfs-panel.js').exists())

    def test_release_manifest_hashes_cover_both_shipped_assets(self):
        self.assertEqual(self.run_build().returncode, 0)
        manifest = json.loads((self.root / 'release.json').read_text(encoding='utf-8'))
        self.assertEqual(manifest['schema'], 1)
        self.assertEqual(manifest['languages'], ['en', 'ko', 'ja', 'zh', 'es'])
        for name in ('cfs-panel.js', 'cfs.png'):
            self.assertEqual(manifest['assets'][name], hashlib.sha256((self.root / 'assets' / name).read_bytes()).hexdigest())
        original = (self.root / 'release.json').read_bytes()
        self.assertEqual(self.run_build().returncode, 0)
        self.assertEqual(original, (self.root / 'release.json').read_bytes())

    def test_mistranslated_interpolation_refuses_output(self):
        catalog_path = self.root / 'locales/panel/es.json'
        catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
        catalog['editor.preset'] = 'Se guardará como {wrong}.'
        catalog_path.write_text(json.dumps(catalog), encoding='utf-8')
        result = self.run_build()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Invalid translation: es.editor.preset', result.stderr)
        self.assertFalse((self.root / 'assets/cfs-panel.js').exists())


if __name__ == '__main__':
    unittest.main()
