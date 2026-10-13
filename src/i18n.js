  // Bundled at build time: no network request or runtime dependency.
  const catalogs = /* @catalogs */ {};
  const normalizeLanguage = value => {
    const base = String(value || '').trim().toLowerCase().replace(/_/g, '-').split('-')[0];
    return Object.prototype.hasOwnProperty.call(catalogs, base) ? base : 'en';
  };
  const installationLanguage = normalizeLanguage(typeof document !== 'undefined' ? document.currentScript?.dataset.lang :
    (typeof module !== 'undefined' && module.exports ? 'ko' : 'en'));
  let languageMode = 'auto';
  if (typeof document !== 'undefined') {
    try {
      const saved = root.localStorage?.getItem('cfsail.languageMode');
      if (Object.prototype.hasOwnProperty.call(catalogs, saved)) languageMode = saved;
    } catch (_) { /* Use automatic synchronization when storage is blocked. */ }
  }
  function mainsailLanguage() {
    const app = typeof document !== 'undefined' ? document.querySelector('#app')?.__vue__ : null;
    return app?.$store?.state?.gui?.general?.language || app?.$i18n?.locale || installationLanguage;
  }
  let language = languageMode === 'auto' ? normalizeLanguage(mainsailLanguage()) : languageMode;
  function setLanguage(value) { language = normalizeLanguage(value); return language; }
  function t(key, params = {}) {
    const template = catalogs[language]?.[key] ?? catalogs.en[key];
    if (typeof template !== 'string') throw new Error('Missing translation: ' + key);
    return template.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (_, name) => {
      if (!Object.prototype.hasOwnProperty.call(params, name)) throw new Error('Missing translation parameter: ' + key + '.' + name);
      return String(params[name]);
    });
  }
  const displaySlotLabel = slot => slot?.kind === 'external' ? t('external.short') : slot?.label;
  const uiLanguage = () => language === 'zh' ? 'zh-Hans' : language;
  const slotStatusText = (slot, loaded) => loaded ? t('slot.loaded') : t({
    empty: 'slot.empty', unconfigured: 'slot.configure', feeding: 'slot.loading',
    retracting: 'slot.unloading', rfid: 'slot.rfid', manual: 'slot.manual'
  }[slot.status]);
