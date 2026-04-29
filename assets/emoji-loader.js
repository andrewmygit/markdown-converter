(() => {
  const SOURCE_URL = 'https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json';

  function dispatch(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  async function loadGitHubEmojiMap() {
    try {
      const response = await fetch(SOURCE_URL, {
        cache: 'force-cache',
        credentials: 'omit',
        referrerPolicy: 'no-referrer'
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();
      const map = Object.create(null);

      if (!Array.isArray(data)) {
        throw new Error('unexpected gemoji payload');
      }

      for (const item of data) {
        if (!item || typeof item.emoji !== 'string' || !Array.isArray(item.aliases)) continue;
        for (const alias of item.aliases) {
          if (typeof alias !== 'string' || !alias) continue;
          map[alias.toLowerCase()] = item.emoji;
        }
      }

      window.MD_EMOJI_MAP = map;
      window.MD_EMOJI_MAP_SOURCE = SOURCE_URL;
      window.MD_EMOJI_MAP_READY = true;
      dispatch('md-emoji-map-ready', { count: Object.keys(map).length, source: SOURCE_URL });
    } catch (error) {
      window.MD_EMOJI_MAP_READY = false;
      window.MD_EMOJI_MAP_ERROR = error && error.message ? error.message : String(error);
      dispatch('md-emoji-map-error', { message: window.MD_EMOJI_MAP_ERROR, source: SOURCE_URL });
    }
  }

  void loadGitHubEmojiMap();
})();
