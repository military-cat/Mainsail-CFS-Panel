#!/usr/bin/env python3
"""Build CFSail's deterministic standalone browser asset using Python stdlib."""
import json
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = ('en', 'ko', 'ja', 'zh', 'es')


def build():
    catalogs = {lang: json.loads((ROOT / 'locales' / 'panel' / (lang + '.json')).read_text(encoding='utf-8')) for lang in LANGUAGES}
    baseline = catalogs['en']
    placeholders = lambda text: sorted(re.findall(r'\{([a-zA-Z][a-zA-Z0-9]*)\}', text))
    for lang, catalog in catalogs.items():
        if set(catalog) != set(baseline):
            raise ValueError('Catalog key mismatch: ' + lang)
        for key, text in catalog.items():
            if not isinstance(text, str) or not text.strip() or placeholders(text) != placeholders(baseline[key]):
                raise ValueError('Invalid translation: ' + lang + '.' + key)
    source = (ROOT / 'src' / 'panel.js').read_text(encoding='utf-8')
    helper = (ROOT / 'src' / 'i18n.js').read_text(encoding='utf-8')
    for key in re.findall(r"\bt\('([^']+)'", source + helper):
        if key not in baseline:
            raise ValueError('Missing source translation: ' + key)
    if source.count('/* @i18n */') != 1 or helper.count('/* @catalogs */ {}') != 1:
        raise ValueError('Invalid build insertion markers')
    helper = helper.replace('/* @catalogs */ {}', json.dumps(catalogs, ensure_ascii=False, sort_keys=True, separators=(',', ':')))
    output = source.replace('/* @i18n */', helper)
    target = ROOT / 'assets' / 'cfs-panel.js'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(output.replace('\r\n', '\n').encode('utf-8'))
    manifest = {
        'schema': 1, 'version': '0.1.0', 'project': 'Mainsail-CFS-Panel',
        'languages': list(LANGUAGES),
        'assets': {name: hashlib.sha256((ROOT / 'assets' / name).read_bytes()).hexdigest()
                   for name in ('cfs-panel.js', 'cfs.png')}
    }
    (ROOT / 'release.json').write_text(json.dumps(manifest, sort_keys=True, indent=2) + '\n', encoding='utf-8')
    return target


if __name__ == '__main__':
    print(build())
