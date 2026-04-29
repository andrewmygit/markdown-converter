(() => {
  const STORAGE_KEY = 'md-local-modern-v1';
  const SETTINGS_KEY = 'md-local-modern-settings-v1';
  const SAMPLE_PATHS = {
    en: 'examples/complex-markdown-sample.en.md',
    ru: 'examples/complex-markdown-sample.ru.md'
  };
  const currentScriptUrl = document.currentScript?.src || new URL('assets/app.js', window.location.href).href;
  const APP_BASE_URL = new URL('../', currentScriptUrl).href;
  const root = document.documentElement;
  const STYLESHEET_ID = 'app-stylesheet';
  const STYLE_SECTION_MARKERS = {
    'highlight-style': '--md-section: highlight-style',
    'katex-style': '--md-section: katex-style',
    'app-style': '--md-section: app-style'
  };
  const cssSectionCache = new Map();
  let stylesheetReadyPromise = null;

  function readSectionFromGroupingRule(rule) {
    if (!rule || !rule.cssRules) return '';
    try {
      return Array.from(rule.cssRules).map((item) => item.cssText).join('\n').trim();
    } catch {
      return '';
    }
  }

  function readExternalStyleSection(id) {
    if (cssSectionCache.has(id)) return cssSectionCache.get(id);
    const marker = STYLE_SECTION_MARKERS[id];
    if (!marker) return '';
    const link = document.getElementById(STYLESHEET_ID);
    const sheet = link?.sheet;
    if (!sheet) return '';
    try {
      const rules = Array.from(sheet.cssRules || []);
      for (const rule of rules) {
        if (String(rule.conditionText || '').includes(marker)) {
          const text = readSectionFromGroupingRule(rule);
          cssSectionCache.set(id, text);
          return text;
        }
      }
    } catch {
      return '';
    }
    return '';
  }

  function readWholeExternalStylesheet() {
    const link = document.getElementById(STYLESHEET_ID);
    const sheet = link?.sheet;
    if (!sheet) return '';
    try {
      return Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join('\n').trim();
    } catch {
      return '';
    }
  }

  function ensureStylesheetReady() {
    const link = document.getElementById(STYLESHEET_ID);
    if (!link) return Promise.resolve();
    try {
      if (link.sheet && link.sheet.cssRules) return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
    if (!stylesheetReadyPromise) {
      stylesheetReadyPromise = new Promise((resolve) => {
        const done = () => resolve();
        link.addEventListener('load', done, { once: true });
        link.addEventListener('error', done, { once: true });
        window.setTimeout(done, 1500);
      });
    }
    return stylesheetReadyPromise;
  }


  const els = {
    app: document.querySelector('.app'),
    workspace: document.getElementById('workspace'),
    mdIn: document.getElementById('md-in'),
    raw: document.getElementById('html-out'),
    css: document.getElementById('css-out'),
    preview: document.getElementById('preview'),
    previewInner: document.getElementById('preview-inner'),
    fileInput: document.getElementById('fileInput'),
    dropzone: document.getElementById('dropzone'),
    status: document.getElementById('renderStatus'),
    statusText: document.getElementById('statusText'),
    languageSelect: document.getElementById('languageSelect'),
    errors: document.getElementById('errorsBox'),
    cleanMeta: document.getElementById('cleanMeta'),
    cleanOptions: {
      enabled: document.getElementById('cleanEnabled'),
      hidden: document.getElementById('cleanHidden'),
      nbsp: document.getElementById('cleanNbsp'),
      quotes: document.getElementById('cleanQuotes'),
      dashes: document.getElementById('cleanDashes'),
      trailing: document.getElementById('cleanTrailing'),
      doubleSpaces: document.getElementById('cleanDoubleSpaces')
    },
    errorsList: document.getElementById('errorsList'),
    metrics: {
      chars: document.getElementById('metricChars'),
      words: document.getElementById('metricWords'),
      lines: document.getElementById('metricLines'),
      nodes: document.getElementById('metricNodes')
    },
    buttons: {
      convert: document.getElementById('convert'),
      paste: document.getElementById('pasteBtn'),
      clear: document.getElementById('clearBtn'),
      import: document.getElementById('importBtn'),
      sync: document.getElementById('syncBtn'),
      live: document.getElementById('liveBtn'),
      lineNumbers: document.getElementById('lineNumbersBtn'),
      theme: document.getElementById('themeBtn'),
      preclean: document.getElementById('precleanBtn'),
      sample: document.getElementById('sampleBtn'),
      copyHtml: document.getElementById('copyHtmlBtn'),
      copyText: document.getElementById('copyTextBtn'),
      copyRich: document.getElementById('copyRichBtn'),
      downloadHtml: document.getElementById('downloadHtmlBtn'),
      downloadMd: document.getElementById('downloadMdBtn'),
      downloadDocx: document.getElementById('downloadDocxBtn'),
      print: document.getElementById('printBtn')
    },
    menu: {
      toggle: document.getElementById('menuBtn'),
      close: document.getElementById('menuCloseBtn'),
      panel: document.getElementById('controlMenu'),
      overlay: document.getElementById('menuOverlay')
    },
    viewButtons: document.querySelectorAll('[data-view]')
  };

  const defaultSettings = {
    language: getInitialLanguage(),
    languageExplicit: false,
    live: true,
    sync: false,
    lineNumbers: true,
    theme: 'dark',
    view: 'split',
    precleanEnabled: true,
    precleanHidden: true,
    precleanNbsp: true,
    precleanQuotes: false,
    precleanDashes: false,
    precleanTrailing: true,
    precleanDoubleSpaces: false
  };

  const settings = loadSettings();
  const renderState = {
    lastSanitizedHtml: '',
    lastRenderedHtml: '',
    lastStandaloneHtml: '',
    lastDocumentCss: '',
    isRendering: false,
    isPreparingPrint: false,
    printRestoreTheme: null,
    timer: null,
    errors: [],
    lastPreclean: { enabled: true, changes: 0, stats: {}, text: '' },
    sampleMarkdownByLang: {}
  };


  const TRANSLATIONS = {
    ru: {
      'meta.title': 'Markdown → HTML — локальный конвертер',
      'meta.description': 'Локальный конвертер Markdown в HTML с предпросмотром, формулами, Mermaid-схемами, экспортом и копированием результата.',
      'hero.title': 'Markdown → HTML',
      'hero.description': 'Полностью локальный конвертер: Markdown, итоговый HTML, живой предпросмотр, формулы KaTeX, Mermaid-схемы, экспорт HTML и копирование результата как кода, текста и rich-text.',
      'chip.noCdn': 'Без внешних CDN',
      'chip.mobile': 'Мобильный интерфейс',
      'chip.math': 'Поддержка формул и схем',
      'chip.autosave': 'Локальное автосохранение',
      'btn.convert': 'Преобразовать',
      'btn.paste': 'Вставить',
      'btn.import': 'Импорт .md',
      'btn.clear': 'Очистить',
      'view.markdown': 'Markdown',
      'view.split': 'Split',
      'view.preview': 'Просмотр',
      'view.html': 'HTML',
      'status.waiting': 'Ожидание',
      'btn.menu': 'Меню',
      'menu.title': 'Меню',
      'menu.subtitle': 'Настройки, копирование, экспорт и тестовый пример',
      'btn.close': 'Закрыть',
      'aria.closeMenu': 'Закрыть меню',
      'section.viewMode': 'Режим просмотра',
      'btn.live': 'Live',
      'btn.sync': 'Синхр. скролл',
      'btn.lineNumbers': 'Номера строк',
      'btn.themeLight': 'Светлая тема',
      'btn.themeDark': 'Тёмная тема',
      'section.actions': 'Действия',
      'btn.sample': 'Тестовый пример',
      'btn.precleanOn': 'Предочистка: вкл',
      'btn.precleanOff': 'Предочистка: выкл',
      'section.copy': 'Копирование',
      'btn.copyHtml': 'Копировать HTML',
      'btn.copyText': 'Копировать текст',
      'btn.copyRich': 'Копировать rich-text',
      'section.export': 'Экспорт',
      'btn.downloadHtml': 'Скачать HTML',
      'btn.downloadMd': 'Скачать .md',
      'btn.downloadDocx': 'Скачать .docx',
      'btn.print': 'PDF / печать',
      'clean.title': 'Предочистка перед рендером',
      'clean.enabledTitle': 'Включить предварительную очистку',
      'clean.enabledSub': 'Очистка применяется только перед рендером. Исходный Markdown в редакторе не переписывается.',
      'clean.hiddenTitle': 'Удалять BOM / zero-width / bidi-символы',
      'clean.hiddenSub': 'Полезно для невидимого мусора из веб-страниц и мессенджеров.',
      'clean.nbspTitle': 'Нормализовать NBSP и узкий NBSP',
      'clean.nbspSub': 'Преобразует неразрывные пробелы в обычные, кроме защищённых Markdown-сегментов.',
      'clean.quotesTitle': 'Нормализовать кавычки',
      'clean.quotesSub': 'Преобразует “ ” и ‘ ’ в прямые кавычки. Ёлочки « » и одиночные угловые ‹ › не меняются.',
      'clean.dashesTitle': 'Нормализовать тире',
      'clean.dashesSub': 'Применяется только к незашищённой прозе. Markdown, код и формулы не затрагиваются.',
      'clean.trailingTitle': 'Убирать хвостовые пробелы',
      'clean.trailingSub': 'Hard line break в Markdown сохраняется: две конечные пробельные позиции не удаляются.',
      'clean.doubleSpacesTitle': 'Схлопывать множественные пробелы в прозе',
      'clean.doubleSpacesSub': 'Консервативный режим: таблицы, списки, код и fenced-блоки пропускаются.',
      'clean.note': 'Символы синтаксиса Markdown, включая <code>^</code>, а также fenced code, inline code, формулы, Mermaid/ABC-блоки, raw HTML, ссылки и изображения не переписываются.',
      'clean.off': 'Предочистка отключена. Рендер идёт по исходному Markdown.',
      'clean.noChanges': 'Предочистка включена. Изменений в текущем тексте не найдено.',
      'clean.summary': 'Предочистка перед рендером: {changes} изм.{summary}',
      'clean.label.hidden': 'скрытые символы',
      'clean.label.nbsp': 'неразрывные пробелы',
      'clean.label.quotes': 'кавычки',
      'clean.label.dashes': 'тире',
      'clean.label.trailing': 'хвостовые пробелы',
      'clean.label.doubleSpaces': 'множественные пробелы',
      'section.stats': 'Статистика',
      'metric.chars': 'Символы Markdown',
      'metric.words': 'Слова Markdown',
      'metric.lines': 'Строки Markdown',
      'metric.resultChars': 'Символы результата',
      'errors.title': 'Во время рендера есть предупреждения:',
      'panel.markdown.title': 'Markdown',
      'panel.markdown.subtitle': 'Редактирование, drag-and-drop файла, автосохранение в браузере',
      'dropzone.file': 'Перетащите сюда <strong>.md</strong> / <strong>.markdown</strong> / <strong>.txt</strong> файл или используйте кнопку импорта.',
      'dropzone.local': 'Рендер идёт локально в браузере.',
      'placeholder.markdown': 'Вставьте Markdown сюда...',
      'panel.preview.title': 'Просмотр',
      'panel.preview.subtitle': 'Отрендеренный результат: текст, формулы, таблицы, схемы',
      'panel.html.title': 'HTML результата',
      'panel.html.subtitle': 'HTML-фрагмент документа после преобразования и визуальных рендеров',
      'panel.css.title': 'CSS документа',
      'panel.css.subtitle': 'Стили, которые попадут в экспортируемый HTML; служебные стили страницы сюда не включаются',
      'footer.note': 'Локальные библиотеки: markdown-it, highlight.js, KaTeX, Mermaid, ABCJS, DOMPurify.',
      'confirm.replaceSample': 'Заменить текущий Markdown расширенным тестовым примером?',
      'status.rendering': 'Рендеринг...',
      'status.ready': 'Готово',
      'status.readyWarnings': 'Готово с предупреждениями',
      'status.renderError': 'Ошибка рендера',
      'status.htmlCopied': 'HTML скопирован',
      'status.textCopied': 'Отображаемый текст скопирован',
      'status.richCopied': 'Rich-text скопирован',
      'status.textFallbackCopied': 'Скопирован текстовый fallback',
      'status.printSent': 'Отправлено на печать / PDF: только область предпросмотра',
      'status.printFailed': 'Печать не выполнена: см. предупреждения',
      'status.emojiLoaded': 'Emoji-словарь загружен: {count} shortcodes',
      'status.emojiFallback': 'Emoji-словарь не загружен, используется локальный fallback',
      'status.clipboardReadFailed': 'Не удалось прочитать буфер обмена',
      'status.cleared': 'Очищено',
      'status.lineNumbersOn': 'Номера строк включены',
      'status.lineNumbersOff': 'Номера строк выключены',
      'status.precleanOn': 'Предочистка включена',
      'status.precleanOff': 'Предочистка выключена',
      'status.docxPreparing': 'Подготовка DOCX...',
      'status.docxCreated': 'DOCX создан',
      'status.docxCreatedWarnings': 'DOCX создан с предупреждениями',
      'status.docxVisualWarnings': 'DOCX создан как визуальная копия с предупреждениями',
      'status.docxFailed': 'Ошибка DOCX-экспорта',
      'error.unrestoredPreclean': 'Предочистка: обнаружены невосстановленные служебные маркеры. Текст возвращён без предочистки.',
      'error.renderGeneral': 'Общая ошибка рендера: {message}',
      'error.formula': 'Формула не отрендерена: {message}',
      'error.katex': 'Ошибка KaTeX: {message}',
      'error.svgPng': 'Не удалось преобразовать SVG в PNG',
      'error.printDocument': 'Не удалось подготовить изолированный документ печати',
      'error.dataUrl': 'Неподдерживаемый data URL',
      'label.footnoteBack': 'Вернуться к сноске {n}',
      'alt.formula': 'Формула',
      'alt.image': 'Изображение',
      'alt.diagram': 'Диаграмма',
      'alt.page': 'Страница {n}',
      'fallback.imageUnavailable': '[Изображение недоступно: {src}]',
      'export.title': 'Markdown export',
      'print.title': 'Markdown print'
    },
    en: {
      'meta.title': 'Markdown → HTML — local converter',
      'meta.description': 'Local Markdown to HTML converter with preview, formulas, Mermaid diagrams, export, and result copying.',
      'hero.title': 'Markdown → HTML',
      'hero.description': 'Fully local converter: Markdown, resulting HTML, live preview, KaTeX formulas, Mermaid diagrams, HTML export, and copying as code, plain text, or rich text.',
      'chip.noCdn': 'No external CDNs',
      'chip.mobile': 'Mobile interface',
      'chip.math': 'Formulas and diagrams',
      'chip.autosave': 'Local autosave',
      'btn.convert': 'Convert',
      'btn.paste': 'Paste',
      'btn.import': 'Import .md',
      'btn.clear': 'Clear',
      'view.markdown': 'Markdown',
      'view.split': 'Split',
      'view.preview': 'Preview',
      'view.html': 'HTML',
      'status.waiting': 'Idle',
      'btn.menu': 'Menu',
      'menu.title': 'Menu',
      'menu.subtitle': 'Settings, copy actions, export, and test sample',
      'btn.close': 'Close',
      'aria.closeMenu': 'Close menu',
      'section.viewMode': 'View mode',
      'btn.live': 'Live',
      'btn.sync': 'Sync scroll',
      'btn.lineNumbers': 'Line numbers',
      'btn.themeLight': 'Light theme',
      'btn.themeDark': 'Dark theme',
      'section.actions': 'Actions',
      'btn.sample': 'Test sample',
      'btn.precleanOn': 'Preclean: on',
      'btn.precleanOff': 'Preclean: off',
      'section.copy': 'Copy',
      'btn.copyHtml': 'Copy HTML',
      'btn.copyText': 'Copy text',
      'btn.copyRich': 'Copy rich text',
      'section.export': 'Export',
      'btn.downloadHtml': 'Download HTML',
      'btn.downloadMd': 'Download .md',
      'btn.downloadDocx': 'Download .docx',
      'btn.print': 'PDF / print',
      'clean.title': 'Preclean before rendering',
      'clean.enabledTitle': 'Enable precleaning',
      'clean.enabledSub': 'Cleanup is applied only before rendering. The source Markdown in the editor is not rewritten.',
      'clean.hiddenTitle': 'Remove BOM / zero-width / bidi characters',
      'clean.hiddenSub': 'Useful for invisible junk copied from web pages and messengers.',
      'clean.nbspTitle': 'Normalize NBSP and narrow NBSP',
      'clean.nbspSub': 'Converts non-breaking spaces to regular spaces, except inside protected Markdown segments.',
      'clean.quotesTitle': 'Normalize quotes',
      'clean.quotesSub': 'Converts “ ” and ‘ ’ to straight quotes. Russian guillemets « » and single angle quotes ‹ › are not changed.',
      'clean.dashesTitle': 'Normalize dashes',
      'clean.dashesSub': 'Applied only to unprotected prose. Markdown, code, and formulas are not touched.',
      'clean.trailingTitle': 'Remove trailing spaces',
      'clean.trailingSub': 'Markdown hard line breaks are preserved: two trailing whitespace positions are not removed.',
      'clean.doubleSpacesTitle': 'Collapse multiple spaces in prose',
      'clean.doubleSpacesSub': 'Conservative mode: tables, lists, code, and fenced blocks are skipped.',
      'clean.note': 'Markdown syntax characters, including <code>^</code>, as well as fenced code, inline code, formulas, Mermaid/ABC blocks, raw HTML, links, and images are not rewritten.',
      'clean.off': 'Precleaning is disabled. Rendering uses the source Markdown.',
      'clean.noChanges': 'Precleaning is enabled. No changes were found in the current text.',
      'clean.summary': 'Precleaning before render: {changes} change(s).{summary}',
      'clean.label.hidden': 'hidden characters',
      'clean.label.nbsp': 'non-breaking spaces',
      'clean.label.quotes': 'quotes',
      'clean.label.dashes': 'dashes',
      'clean.label.trailing': 'trailing spaces',
      'clean.label.doubleSpaces': 'multiple spaces',
      'section.stats': 'Statistics',
      'metric.chars': 'Markdown characters',
      'metric.words': 'Markdown words',
      'metric.lines': 'Markdown lines',
      'metric.resultChars': 'Result characters',
      'errors.title': 'Render warnings:',
      'panel.markdown.title': 'Markdown',
      'panel.markdown.subtitle': 'Editing, file drag-and-drop, browser autosave',
      'dropzone.file': 'Drop a <strong>.md</strong> / <strong>.markdown</strong> / <strong>.txt</strong> file here or use the import button.',
      'dropzone.local': 'Rendering runs locally in the browser.',
      'placeholder.markdown': 'Paste Markdown here...',
      'panel.preview.title': 'Preview',
      'panel.preview.subtitle': 'Rendered result: text, formulas, tables, diagrams',
      'panel.html.title': 'Result HTML',
      'panel.html.subtitle': 'Document HTML fragment after conversion and visual rendering',
      'panel.css.title': 'Document CSS',
      'panel.css.subtitle': 'Styles included in exported HTML; page UI styles are not included',
      'footer.note': 'Local libraries: markdown-it, highlight.js, KaTeX, Mermaid, ABCJS, DOMPurify.',
      'confirm.replaceSample': 'Replace the current Markdown with the extended test sample?',
      'status.rendering': 'Rendering...',
      'status.ready': 'Ready',
      'status.readyWarnings': 'Ready with warnings',
      'status.renderError': 'Render error',
      'status.htmlCopied': 'HTML copied',
      'status.textCopied': 'Rendered text copied',
      'status.richCopied': 'Rich text copied',
      'status.textFallbackCopied': 'Plain-text fallback copied',
      'status.printSent': 'Sent to print / PDF: preview area only',
      'status.printFailed': 'Print failed: see warnings',
      'status.emojiLoaded': 'Emoji dictionary loaded: {count} shortcodes',
      'status.emojiFallback': 'Emoji dictionary was not loaded; local fallback is used',
      'status.clipboardReadFailed': 'Could not read clipboard',
      'status.cleared': 'Cleared',
      'status.lineNumbersOn': 'Line numbers enabled',
      'status.lineNumbersOff': 'Line numbers disabled',
      'status.precleanOn': 'Precleaning enabled',
      'status.precleanOff': 'Precleaning disabled',
      'status.docxPreparing': 'Preparing DOCX...',
      'status.docxCreated': 'DOCX created',
      'status.docxCreatedWarnings': 'DOCX created with warnings',
      'status.docxVisualWarnings': 'DOCX created as a visual copy with warnings',
      'status.docxFailed': 'DOCX export failed',
      'error.unrestoredPreclean': 'Precleaning: unrestored internal markers were detected. The text was returned without precleaning.',
      'error.renderGeneral': 'General render error: {message}',
      'error.formula': 'Formula was not rendered: {message}',
      'error.katex': 'KaTeX error: {message}',
      'error.svgPng': 'Could not convert SVG to PNG',
      'error.printDocument': 'Could not prepare the isolated print document',
      'error.dataUrl': 'Unsupported data URL',
      'label.footnoteBack': 'Back to footnote {n}',
      'alt.formula': 'Formula',
      'alt.image': 'Image',
      'alt.diagram': 'Diagram',
      'alt.page': 'Page {n}',
      'fallback.imageUnavailable': '[Image unavailable: {src}]',
      'export.title': 'Markdown export',
      'print.title': 'Markdown print'
    }
  };

  function detectBrowserLanguage() {
    const languages = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    return languages.some((lang) => String(lang || '').toLowerCase().startsWith('ru')) ? 'ru' : 'en';
  }

  function getInitialLanguage() {
    return window.__MD_LOCAL_BOOT_LANG__ === 'ru' || window.__MD_LOCAL_BOOT_LANG__ === 'en'
      ? window.__MD_LOCAL_BOOT_LANG__
      : detectBrowserLanguage();
  }

  function getLanguage() {
    return settings.language === 'ru' ? 'ru' : 'en';
  }

  function getLocale() {
    return getLanguage() === 'ru' ? 'ru-RU' : 'en-US';
  }

  function t(key, params = {}) {
    const lang = getLanguage();
    const template = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? TRANSLATIONS.ru[key] ?? key;
    return String(template).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? '');
  }

  function setText(selector, key) {
    const node = document.querySelector(selector);
    if (node) node.textContent = t(key);
  }

  function setHtml(selector, key) {
    const node = document.querySelector(selector);
    if (node) node.innerHTML = t(key);
  }

  function setAttr(selector, attr, key) {
    const node = document.querySelector(selector);
    if (node) node.setAttribute(attr, t(key));
  }

  function localizeMessage(message) {
    const text = String(message || '');
    if (getLanguage() === 'ru') return text;
    const exact = {
      'Предочистка отключена. Рендер идёт по исходному Markdown.': t('clean.off'),
      'Предочистка включена. Изменений в текущем тексте не найдено.': t('clean.noChanges'),
      'Рендеринг...': t('status.rendering'),
      'Готово': t('status.ready'),
      'Готово с предупреждениями': t('status.readyWarnings'),
      'Ошибка рендера': t('status.renderError'),
      'HTML скопирован': t('status.htmlCopied'),
      'Отображаемый текст скопирован': t('status.textCopied'),
      'Rich-text скопирован': t('status.richCopied'),
      'Скопирован текстовый fallback': t('status.textFallbackCopied'),
      'Отправлено на печать / PDF: только область предпросмотра': t('status.printSent'),
      'Печать не выполнена: см. предупреждения': t('status.printFailed'),
      'Emoji-словарь не загружен, используется локальный fallback': t('status.emojiFallback'),
      'Не удалось прочитать буфер обмена': t('status.clipboardReadFailed'),
      'Очищено': t('status.cleared'),
      'Номера строк включены': t('status.lineNumbersOn'),
      'Номера строк выключены': t('status.lineNumbersOff'),
      'Предочистка включена': t('status.precleanOn'),
      'Предочистка выключена': t('status.precleanOff'),
      'Подготовка DOCX...': t('status.docxPreparing'),
      'DOCX создан': t('status.docxCreated'),
      'DOCX создан с предупреждениями': t('status.docxCreatedWarnings'),
      'DOCX создан как визуальная копия с предупреждениями': t('status.docxVisualWarnings'),
      'Ошибка DOCX-экспорта': t('status.docxFailed'),
      'Не удалось преобразовать SVG в PNG': t('error.svgPng'),
      'Неподдерживаемый data URL': t('error.dataUrl'),
      'Не удалось подготовить изолированный документ печати': t('error.printDocument'),
      'Предочистка: обнаружены невосстановленные служебные маркеры. Текст возвращён без предочистки.': t('error.unrestoredPreclean')
    };
    if (exact[text]) return exact[text];

    let match = text.match(/^Предочистка перед рендером: (\d+) изм\.(.*)$/);
    if (match) return t('clean.summary', { changes: match[1], summary: match[2] ? ' ' + match[2].trim() : '' });
    match = text.match(/^Emoji-словарь загружен: (\d+) shortcodes$/);
    if (match) return t('status.emojiLoaded', { count: match[1] });
    match = text.match(/^Общая ошибка рендера: (.*)$/);
    if (match) return t('error.renderGeneral', { message: match[1] });
    match = text.match(/^Формула не отрендерена: (.*)$/);
    if (match) return t('error.formula', { message: match[1] });
    match = text.match(/^Ошибка KaTeX: (.*)$/);
    if (match) return t('error.katex', { message: match[1] });
    return text
      .replace(/^DOCX \/ изображение недоступно:/, 'DOCX / image unavailable:')
      .replace(/^DOCX \/ SVG-изображение:/, 'DOCX / SVG image:')
      .replace(/^DOCX \/ формула-подготовка:/, 'DOCX / formula preparation:')
      .replace(/^DOCX \/ inline-формула-подготовка:/, 'DOCX / inline formula preparation:')
      .replace(/^DOCX \/ диаграмма-подготовка:/, 'DOCX / diagram preparation:')
      .replace(/^DOCX \/ SVG-подготовка:/, 'DOCX / SVG preparation:')
      .replace(/^DOCX \/ canvas-подготовка:/, 'DOCX / canvas preparation:')
      .replace(/^DOCX \/ HTML-чанк \/ изображение:/, 'DOCX / HTML chunk / image:')
      .replace(/^DOCX \/ структурный экспорт:/, 'DOCX / structural export:')
      .replace(/^DOCX \/ визуальный fallback:/, 'DOCX / visual fallback:');
  }

  function applyLanguage() {
    const lang = getLanguage();
    root.lang = lang;
    document.documentElement.lang = lang;
    root.dataset.bootLang = lang;
    root.classList.remove('lang-en', 'lang-ru');
    root.classList.add('lang-' + lang, 'boot-i18n-ready');
    document.title = t('meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
    if (els.languageSelect) els.languageSelect.value = lang;

    setText('.hero h1', 'hero.title');
    setText('.hero p', 'hero.description');
    const chips = document.querySelectorAll('.chips .chip');
    ['chip.noCdn', 'chip.mobile', 'chip.math', 'chip.autosave'].forEach((key, index) => {
      if (chips[index]) chips[index].textContent = t(key);
    });

    setText('#convert', 'btn.convert');
    setText('#pasteBtn', 'btn.paste');
    setText('#importBtn', 'btn.import');
    setText('#clearBtn', 'btn.clear');
    setText('[data-view="markdown"]', 'view.markdown');
    setText('[data-view="split"]', 'view.split');
    setText('[data-view="preview"]', 'view.preview');
    setText('[data-view="html"]', 'view.html');
    if (els.statusText?.textContent === 'Ожидание' || els.statusText?.textContent === 'Idle') setText('#statusText', 'status.waiting');
    setText('#menuBtn', 'btn.menu');
    setText('.control-menu__head .panel-title', 'menu.title');
    setText('.control-menu__head .panel-subtitle', 'menu.subtitle');
    setText('#menuCloseBtn', 'btn.close');
    setAttr('#menuCloseBtn', 'aria-label', 'aria.closeMenu');

    const sectionTitles = document.querySelectorAll('.menu-section__title');
    ['section.viewMode', 'section.actions', 'section.copy', 'section.export', null, 'section.stats'].forEach((key, index) => {
      if (key && sectionTitles[index]) sectionTitles[index].textContent = t(key);
    });
    setText('#liveBtn', 'btn.live');
    setText('#syncBtn', 'btn.sync');
    setText('#lineNumbersBtn', 'btn.lineNumbers');
    setText('#sampleBtn', 'btn.sample');
    setText('#copyHtmlBtn', 'btn.copyHtml');
    setText('#copyTextBtn', 'btn.copyText');
    setText('#copyRichBtn', 'btn.copyRich');
    setText('#downloadHtmlBtn', 'btn.downloadHtml');
    setText('#downloadMdBtn', 'btn.downloadMd');
    setText('#downloadDocxBtn', 'btn.downloadDocx');
    setText('#printBtn', 'btn.print');
    setText('.cleaner-box .panel-title', 'clean.title');

    const cleanerLabels = {
      cleanEnabled: ['clean.enabledTitle', 'clean.enabledSub', true],
      cleanHidden: ['clean.hiddenTitle', 'clean.hiddenSub', false],
      cleanNbsp: ['clean.nbspTitle', 'clean.nbspSub', false],
      cleanQuotes: ['clean.quotesTitle', 'clean.quotesSub', false],
      cleanDashes: ['clean.dashesTitle', 'clean.dashesSub', false],
      cleanTrailing: ['clean.trailingTitle', 'clean.trailingSub', false],
      cleanDoubleSpaces: ['clean.doubleSpacesTitle', 'clean.doubleSpacesSub', false]
    };
    Object.entries(cleanerLabels).forEach(([id, [titleKey, subKey, strong]]) => {
      const outer = document.getElementById(id)?.closest('.cleaner-option')?.querySelector(':scope > span');
      if (!outer) return;
      outer.innerHTML = `${strong ? '<strong>' : '<span>'}${t(titleKey)}${strong ? '</strong>' : '</span>'}<span class="cleaner-sub">${t(subKey)}</span>`;
    });
    setHtml('.cleaner-note', 'clean.note');

    const metricLabels = document.querySelectorAll('.metric-label');
    ['metric.chars', 'metric.words', 'metric.lines', 'metric.resultChars'].forEach((key, index) => {
      if (metricLabels[index]) metricLabels[index].textContent = t(key);
    });

    const errorsStrong = document.querySelector('#errorsBox strong');
    if (errorsStrong) errorsStrong.textContent = t('errors.title');
    const panels = [
      ['.editor-panel .panel-title', 'panel.markdown.title'],
      ['.editor-panel .panel-subtitle', 'panel.markdown.subtitle'],
      ['.preview-panel .panel-title', 'panel.preview.title'],
      ['.preview-panel .panel-subtitle', 'panel.preview.subtitle'],
      ['.html-panel .panel-title', 'panel.html.title'],
      ['.html-panel .panel-subtitle', 'panel.html.subtitle'],
      ['.css-panel .panel-title', 'panel.css.title'],
      ['.css-panel .panel-subtitle', 'panel.css.subtitle']
    ];
    panels.forEach(([selector, key]) => setText(selector, key));
    const dropParts = document.querySelectorAll('.dropzone > div');
    if (dropParts[0]) dropParts[0].innerHTML = t('dropzone.file');
    if (dropParts[1]) dropParts[1].textContent = t('dropzone.local');
    els.mdIn?.setAttribute('placeholder', t('placeholder.markdown'));
    setText('.footer-note', 'footer.note');

    applyTheme();
    applyCleanerControls();
    updateErrors();
  }

  function getSamplePath(lang = getLanguage()) {
    return SAMPLE_PATHS[lang] || SAMPLE_PATHS.en;
  }

  const diagramAliases = {
    sequence: 'sequenceDiagram',
    sequencediagram: 'sequenceDiagram',
    class: 'classDiagram',
    classdiagram: 'classDiagram',
    state: 'stateDiagram-v2',
    statediagram: 'stateDiagram-v2',
    er: 'erDiagram',
    erdiagram: 'erDiagram',
    journey: 'journey',
    gantt: 'gantt',
    pie: 'pie',
    gitgraph: 'gitGraph',
    mindmap: 'mindmap',
    timeline: 'timeline',
    requirement: 'requirementDiagram',
    requirementdiagram: 'requirementDiagram',
    xychart: 'xychart-beta',
    xychartbeta: 'xychart-beta',
    quadrant: 'quadrantChart',
    quadrantchart: 'quadrantChart',
    sankey: 'sankey-beta',
    sankeybeta: 'sankey-beta',
    block: 'block-beta',
    blockbeta: 'block-beta',
    architecture: 'architecture-beta',
    architecturebeta: 'architecture-beta',
    packet: 'packet-beta',
    packetbeta: 'packet-beta'
  };

  const mathDelimiters = [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false },
    { left: '$', right: '$', display: false },
    { left: '\\begin{equation}', right: '\\end{equation}', display: true },
    { left: '\\begin{equation*}', right: '\\end{equation*}', display: true },
    { left: '\\begin{align}', right: '\\end{align}', display: true },
    { left: '\\begin{align*}', right: '\\end{align*}', display: true },
    { left: '\\begin{alignat}', right: '\\end{alignat}', display: true },
    { left: '\\begin{gather}', right: '\\end{gather}', display: true },
    { left: '\\begin{gather*}', right: '\\end{gather*}', display: true },
    { left: '\\begin{multline}', right: '\\end{multline}', display: true },
    { left: '\\begin{CD}', right: '\\end{CD}', display: true }
  ];

  const fallbackEmojiShortcodes = {
    '+1': '👍',
    '-1': '👎',
    thumbsup: '👍',
    thumbsdown: '👎',
    black_circle: '⚫',
    white_circle: '⚪',
    red_circle: '🔴',
    large_blue_circle: '🔵',
    large_orange_diamond: '🔶',
    large_blue_diamond: '🔷',
    small_orange_diamond: '🔸',
    small_blue_diamond: '🔹',
    arrow_up: '⬆️',
    arrow_down: '⬇️',
    arrow_left: '⬅️',
    arrow_right: '➡️',
    left_right_arrow: '↔️',
    up_down_arrow: '↕️',
    checkered_flag: '🏁',
    white_check_mark: '✅',
    heavy_check_mark: '✔️',
    x: '❌',
    negative_squared_cross_mark: '❎',
    warning: '⚠️',
    information_source: 'ℹ️',
    question: '❓',
    exclamation: '❗',
    bangbang: '‼️',
    interrobang: '⁉️',
    heart: '❤️',
    orange_heart: '🧡',
    yellow_heart: '💛',
    green_heart: '💚',
    blue_heart: '💙',
    purple_heart: '💜',
    black_heart: '🖤',
    broken_heart: '💔',
    fire: '🔥',
    star: '⭐',
    star2: '🌟',
    sparkles: '✨',
    zap: '⚡',
    boom: '💥',
    collision: '💥',
    rocket: '🚀',
    bulb: '💡',
    memo: '📝',
    pencil: '📝',
    book: '📖',
    books: '📚',
    link: '🔗',
    lock: '🔒',
    unlock: '🔓',
    key: '🔑',
    eyes: '👀',
    pray: '🙏',
    clap: '👏',
    ok_hand: '👌',
    muscle: '💪',
    point_up: '☝️',
    point_down: '👇',
    point_left: '👈',
    point_right: '👉',
    smile: '😄',
    smiley: '😃',
    grinning: '😀',
    grin: '😁',
    joy: '😂',
    laughing: '😆',
    satisfied: '😆',
    blush: '😊',
    wink: '😉',
    sunglasses: '😎',
    thinking: '🤔',
    neutral_face: '😐',
    confused: '😕',
    cry: '😢',
    sob: '😭',
    angry: '😠',
    rage: '😡',
    tada: '🎉',
    confetti_ball: '🎊',
    gift: '🎁',
    trophy: '🏆',
    medal_sports: '🏅',
    bug: '🐛',
    hammer: '🔨',
    wrench: '🔧',
    gear: '⚙️',
    computer: '💻',
    keyboard: '⌨️',
    phone: '☎️',
    email: '✉️',
    envelope: '✉️',
    octocat: '🐙',
    shipit: '🐿️',
	squirrel: '🐿️'
  };

  const katexOptions = {
    throwOnError: false,
    strict: 'ignore',
    trust: false,
    output: 'htmlAndMathml',
    macros: {
      '\\RR': '\\mathbb{R}',
      '\\NN': '\\mathbb{N}',
      '\\ZZ': '\\mathbb{Z}',
      '\\QQ': '\\mathbb{Q}',
      '\\CC': '\\mathbb{C}'
    }
  };

  let md = null;

  function initMarkdown() {
    hljs.configure({ languages: [] });

    md = window.markdownit({
      html: true,
      linkify: true,
      typographer: true,
      // Smartquotes in markdown-it must not re-convert normalized ASCII quotes to curly quotes.
      // Quote normalization is controlled by the precleaner below.
      quotes: "\"\"''",
      breaks: true,
      highlight(str, lang) {
        const norm = (lang || '').trim().toLowerCase();
        const languageClass = norm ? ` language-${norm}` : '';
        if (!norm || !hljs.getLanguage(norm)) {
          return `<pre><code class="hljs${languageClass}">${md.utils.escapeHtml(str)}</code></pre>`;
        }
        const highlighted = hljs.highlight(str, { language: norm, ignoreIllegals: true }).value;
        return `<pre><code class="hljs${languageClass}">${highlighted}</code></pre>`;
      }
    }).use(window.markdownitCheckbox);

    installEmojiShortcodes();

    const originalValidateLink = md.validateLink.bind(md);
    md.validateLink = (url) => {
      const normalized = String(url || '').trim().toLowerCase();
      if (/^data:image\/svg\+xml(?:;charset=[^,;\s]+)?(?:;base64|;utf8)?,/.test(normalized)) {
        return true;
      }
      return originalValidateLink(url);
    };

    const defaultFence = md.renderer.rules.fence || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const info = (token.info || '').trim();
      const lang = info.split(/\s+/)[0].toLowerCase();
      const content = token.content.replace(/\r\n?/g, '\n');

      if (lang === 'mermaid' || diagramAliases[lang]) {
        const diagramSource = normalizeDiagramSource(lang, content);
        return [
          '<div class="diagram-source">',
          `<pre><code class="language-mermaid" data-diagram-source="${escapeAttr(diagramSource)}">${md.utils.escapeHtml(diagramSource)}</code></pre>`,
          '</div>'
        ].join('');
      }

      if (['math', 'tex', 'latex'].includes(lang)) {
        return `<div class="math-fence" data-math="${escapeAttr(content.trim())}"></div>`;
      }

      return defaultFence(tokens, idx, options, env, self);
    };
  }

  function installEmojiShortcodes() {
    const defaultTextRenderer = md.renderer.rules.text || ((tokens, idx) => md.utils.escapeHtml(tokens[idx].content));
    md.renderer.rules.text = (tokens, idx, options, env, self) => {
      const escaped = defaultTextRenderer(tokens, idx, options, env, self);
      return renderEmojiShortcodes(escaped);
    };
  }

  function renderEmojiShortcodes(value) {
    return String(value || '').replace(/:([+\-a-z0-9_]+):/gi, (match, alias) => {
      const key = String(alias || '').toLowerCase();
      const emoji = lookupEmojiShortcode(key);
      if (!emoji) return match;
      return renderEmojiShortcodeValue(key, emoji, match);
    });
  }

  function lookupEmojiShortcode(key) {
    const externalMap = window.MD_EMOJI_MAP;
    if (externalMap && Object.prototype.hasOwnProperty.call(externalMap, key)) {
      return externalMap[key];
    }
    return fallbackEmojiShortcodes[key];
  }

  function renderEmojiShortcodeValue(key, value, original) {
    const safeAlias = escapeAttr(key);

    if (typeof value === 'string') {
      return '<span class="emoji-shortcode" role="img" aria-label="' + safeAlias + '" title=":' + safeAlias + ':">' + value + '</span>';
    }

    if (value && typeof value === 'object') {
      const textValue = value.emoji || value.char || value.text || value.value;
      if (typeof textValue === 'string' && textValue) {
        return '<span class="emoji-shortcode" role="img" aria-label="' + safeAlias + '" title=":' + safeAlias + ':">' + textValue + '</span>';
      }

      if (value.type === 'image' && value.src) {
        const src = escapeAttr(value.src);
        const alt = escapeAttr(value.alt || ':' + key + ':');
        return '<img class="emoji-shortcode emoji-shortcode-img" src="' + src + '" alt="' + alt + '" title=":' + safeAlias + ':" loading="lazy" decoding="async">';
      }
    }

    return original;
  }

  function normalizeDiagramSource(lang, content) {
    if (lang === 'mermaid') return content.trim();
    const header = diagramAliases[lang];
    const trimmed = content.trim();
    if (!header) return trimmed;
    if (trimmed.toLowerCase().startsWith(header.toLowerCase())) return trimmed;
    return `${header}\n${trimmed}`.trim();
  }

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function decodeAttr(value) {
    const txt = document.createElement('textarea');
    txt.innerHTML = value;
    return txt.value;
  }

  function normalizeInput(value) {
    return String(value || '')
      .normalize('NFC')
      .replace(/\r\n?/g, '\n');
  }

  function isAbsoluteOrSpecialUrl(value) {
    const url = String(value || '').trim();
    return !url
      || url.startsWith('#')
      || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url);
  }

  function hasPathTraversalSegment(value) {
    let decoded = String(value || '').trim();
    for (let i = 0; i < 3; i += 1) {
      try {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      } catch {
        break;
      }
    }
    return /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(decoded);
  }

  function isSafeLocalAssetUrl(value) {
    const url = String(value || '').trim();
    if (!url || isAbsoluteOrSpecialUrl(url) || hasPathTraversalSegment(url)) return false;
    try {
      const resolved = new URL(url, APP_BASE_URL);
      return resolved.href.startsWith(APP_BASE_URL);
    } catch {
      return false;
    }
  }

  function safeLocalAssetHref(value) {
    return isSafeLocalAssetUrl(value) ? new URL(String(value || '').trim(), APP_BASE_URL).href : '';
  }

  function isFetchableResourceUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return false;
    if (/^data:image\/(?:gif|png|jpe?g|webp|svg\+xml)(?:[;,]|$)/i.test(raw)) return true;
    if (/^blob:/i.test(raw)) return true;
    if (/^https?:\/\//i.test(raw)) return true;
    if (/^\/\//.test(raw)) return true;
    return isSafeLocalAssetUrl(raw);
  }

  function absolutizeAssetUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return value;
    if (/^(?:https?:|data:image\/|blob:|#|mailto:|tel:|\/\/)/i.test(raw)) return value;
    return safeLocalAssetHref(raw);
  }

  function absolutizeHtmlResourceUrls(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');

    template.content.querySelectorAll('img[src], video[poster], source[src]').forEach((node) => {
      if (node.hasAttribute('src')) {
        const nextSrc = absolutizeAssetUrl(node.getAttribute('src'));
        if (nextSrc) node.setAttribute('src', nextSrc);
        else node.removeAttribute('src');
      }
      if (node.hasAttribute('poster')) {
        const nextPoster = absolutizeAssetUrl(node.getAttribute('poster'));
        if (nextPoster) node.setAttribute('poster', nextPoster);
        else node.removeAttribute('poster');
      }
    });

    template.content.querySelectorAll('[srcset]').forEach((node) => {
      const srcset = node.getAttribute('srcset') || '';
      const next = srcset.split(',').map((part) => {
        const trimmed = part.trim();
        if (!trimmed) return '';
        const bits = trimmed.split(/\s+/);
        bits[0] = absolutizeAssetUrl(bits[0]);
        return bits.join(' ');
      }).filter(Boolean).join(', ');
      if (next) node.setAttribute('srcset', next);
    });

    return template.innerHTML;
  }

  function normalizePreviewResourceUrls(container = els.previewInner) {
    if (!container) return;
    container.querySelectorAll('img[src], video[poster], source[src]').forEach((node) => {
      if (node.hasAttribute('src')) {
        const nextSrc = absolutizeAssetUrl(node.getAttribute('src'));
        if (nextSrc) node.setAttribute('src', nextSrc);
        else node.removeAttribute('src');
      }
      if (node.hasAttribute('poster')) {
        const nextPoster = absolutizeAssetUrl(node.getAttribute('poster'));
        if (nextPoster) node.setAttribute('poster', nextPoster);
        else node.removeAttribute('poster');
      }
    });
  }

  function getPrecleanOptions() {
    return {
      enabled: settings.precleanEnabled,
      hidden: settings.precleanHidden,
      nbsp: settings.precleanNbsp,
      quotes: settings.precleanQuotes,
      dashes: settings.precleanDashes,
      trailing: settings.precleanTrailing,
      doubleSpaces: settings.precleanDoubleSpaces
    };
  }

  function protectMarkdownSegments(input) {
    const protectedStore = [];
    const token = (value) => `@@MDPROTECT${protectedStore.push(value) - 1}@@`;
    let text = String(input || '');

    const patterns = [
      /```[\s\S]*?```/g,
      /~~~[\s\S]*?~~~/g,
      /<!--[\s\S]*?-->/g,
      /<pre\b[\s\S]*?<\/pre>/gi,
      /<code\b[\s\S]*?<\/code>/gi,
      /<script\b[\s\S]*?<\/script>/gi,
      /<style\b[\s\S]*?<\/style>/gi,
      /\\begin\{([a-zA-Z][a-zA-Z0-9*]*)\}[\s\S]*?\\end\{\1\}/g,
      /\$\$[\s\S]*?\$\$/g,
      /\\\[[\s\S]*?\\\]/g,
      /\\\([\s\S]*?\\\)/g,
      /(`+)([\s\S]*?[^`])\1/g,
      /!?\[[^\]\n]*\]\((?:[^()\\]|\\.|\([^()]*\))*\)/g,
      /^\[[^\]\n]+\]:[^\n]*$/gm,
      /^[ \t]{0,3}(?:[*_-][ \t]*){3,}$/gm,
      /_{2,3}/g,
      /<https?:\/\/[^>\s]+>/gi,
      /<[^>\n]+>/g
    ];

    patterns.forEach((regex) => {
      text = text.replace(regex, (match) => token(match));
    });

    return { text, protectedStore };
  }

  function restoreProtectedMarkdownSegments(input, protectedStore) {
    let restored = String(input || '');
    const restoreOnce = (value) => value.replace(/@@MDPROTECT(\d+)@@/g, (match, index) => {
      const source = protectedStore[Number(index)];
      return typeof source === 'string' ? source : match;
    });

    for (let i = 0; i < 3; i += 1) {
      const next = restoreOnce(restored);
      if (next === restored) break;
      restored = next;
    }

    return restored;
  }

  function hasUnrestoredMarkdownProtectionTokens(value) {
    const text = String(value || "");
    return /@@MDPROTECT\d+@@/.test(text)
      || /@@MDFOOTNOTE\d+@@/.test(text)
      || /[\uE000\uE001\uE100\uE101]/.test(text);
  }
  function hasActivePrecleanOptions(options) {
    return Boolean(
      options.hidden
      || options.nbsp
      || options.quotes
      || options.dashes
      || options.trailing
      || options.doubleSpaces
    );
  }

  function shouldSkipSpaceCompaction(line) {
    const trimmed = line.trimStart();
    if (!trimmed) return true;
    if (/^```/.test(trimmed) || /^~~~/.test(trimmed)) return true;
    if (/^#{1,6}\s/.test(trimmed)) return true;
    if (/^(>|[-+*]\s|\d+\.\s)/.test(trimmed)) return true;
    if (/^\|.*\|\s*$/.test(trimmed) || /^[:\-| ]+$/.test(trimmed)) return true;
    if (/^ {4,}|^\t/.test(line)) return true;
    if (/(^|\s)\|([^|]|$)/.test(line)) return true;
    return false;
  }

  function applyMarkdownPrecleaning(input) {
    const options = getPrecleanOptions();
    if (!options.enabled) {
      return { enabled: false, changes: 0, stats: {}, text: input };
    }

    if (!hasActivePrecleanOptions(options)) {
      return { enabled: true, changes: 0, stats: {}, text: input };
    }

    const protectedResult = protectMarkdownSegments(input);
    const protectedStore = protectedResult.protectedStore;
    let text = protectedResult.text;
    const stats = {};
    let changes = 0;

    const replaceCount = (regex, replacer, key) => {
      text = text.replace(regex, (...args) => {
        const match = args[0];
        const replacement = typeof replacer === 'function' ? replacer(...args) : replacer;
        if (replacement === match) return match;
        changes += 1;
        stats[key] = (stats[key] || 0) + 1;
        return replacement;
      });
    };

    if (options.hidden) {
      replaceCount(/[\u00AD\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, '', 'hidden');
    }

    if (options.nbsp) {
      replaceCount(/[\u00A0\u202F]/g, ' ', 'nbsp');
    }

    if (options.quotes) {
      replaceCount(/[“”„‟]/g, '"', 'quotes');
      replaceCount(/[‘’‚‛]/g, "'", 'quotes');
    }

    if (options.dashes) {
      replaceCount(/[—–]/g, '–', 'dashes');
      replaceCount(/[\u2011]/g, '-', 'dashes');
    }

    if (options.trailing) {
      text = text.split('\n').map((line) => {
        const match = line.match(/[ \t]+$/);
        if (!match) return line;
        if (/^ {2,}$/.test(match[0])) return line;
        changes += 1;
        stats.trailing = (stats.trailing || 0) + 1;
        return line.slice(0, -match[0].length);
      }).join('\n');
    }

    if (options.doubleSpaces) {
      text = text.split('\n').map((line) => {
        if (!line || shouldSkipSpaceCompaction(line)) return line;
        return line.replace(/([^\s]) {2,}([^\s])/g, (match, left, right) => {
          changes += 1;
          stats.doubleSpaces = (stats.doubleSpaces || 0) + 1;
          return `${left} ${right}`;
        });
      }).join('\n');
    }

    text = restoreProtectedMarkdownSegments(text, protectedStore);
    if (hasUnrestoredMarkdownProtectionTokens(text)) {
      renderState.errors.push(t('error.unrestoredPreclean'));
      return { enabled: true, changes: 0, stats: {}, text: input };
    }
    return { enabled: true, changes, stats, text };
  }

  function updatePrecleanMeta() {
    if (!els.cleanMeta) return;
    const info = renderState.lastPreclean || { enabled: settings.precleanEnabled, changes: 0, stats: {}, text: '' };
    if (!settings.precleanEnabled) {
      els.cleanMeta.textContent = t('clean.off');
      return;
    }

    if (!info.changes) {
      els.cleanMeta.textContent = t('clean.noChanges');
      return;
    }

    const labels = {
      hidden: t('clean.label.hidden'),
      nbsp: t('clean.label.nbsp'),
      quotes: t('clean.label.quotes'),
      dashes: t('clean.label.dashes'),
      trailing: t('clean.label.trailing'),
      doubleSpaces: t('clean.label.doubleSpaces')
    };

    const summary = Object.entries(info.stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, count]) => `${labels[key] || key}: ${count}`)
      .join(', ');

    els.cleanMeta.textContent = t('clean.summary', { changes: info.changes, summary: summary ? ` ${summary}` : '' });
  }

  function applyCleanerControls() {
    if (!els.buttons.preclean) return;
    els.buttons.preclean.classList.toggle('active', settings.precleanEnabled);
    els.buttons.preclean.textContent = settings.precleanEnabled ? t('btn.precleanOn') : t('btn.precleanOff');

    const optionMap = {
      enabled: 'precleanEnabled',
      hidden: 'precleanHidden',
      nbsp: 'precleanNbsp',
      quotes: 'precleanQuotes',
      dashes: 'precleanDashes',
      trailing: 'precleanTrailing',
      doubleSpaces: 'precleanDoubleSpaces'
    };

    Object.entries(optionMap).forEach(([key, settingKey]) => {
      const input = els.cleanOptions[key];
      if (!input) return;
      input.checked = Boolean(settings[settingKey]);
      const label = input.closest('.cleaner-option');
      if (key !== 'enabled') {
        input.disabled = !settings.precleanEnabled;
        label?.classList.toggle('is-disabled', !settings.precleanEnabled);
      } else {
        input.disabled = false;
        label?.classList.remove('is-disabled');
      }
    });

    updatePrecleanMeta();
  }

  function updatePrecleanOption(key, checked) {
    const optionMap = {
      enabled: 'precleanEnabled',
      hidden: 'precleanHidden',
      nbsp: 'precleanNbsp',
      quotes: 'precleanQuotes',
      dashes: 'precleanDashes',
      trailing: 'precleanTrailing',
      doubleSpaces: 'precleanDoubleSpaces'
    };
    const settingKey = optionMap[key];
    if (!settingKey) return;
    settings[settingKey] = checked;
    persistSettings();
    applyCleanerControls();
    scheduleRender();
    if (!settings.live) void render();
  }


  function preprocessMarkdownForRender(markdown) {
    const footnotePrepared = preprocessFootnotes(markdown);
    const segments = footnotePrepared.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g);
    return segments.map((segment, index) => {
      if (index % 2) return segment;
      return encodeInlineSvgDataUris(replaceBlockMath(segment));
    }).join('');
  }

  function preprocessFootnotes(markdown) {
    const lines = String(markdown || '').split('\n');
    const kept = [];
    const defs = [];
    let inFence = null;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const fence = line.match(/^\s*(```|~~~)/);
      if (fence) {
        if (!inFence) inFence = fence[1];
        else if (fence[1] === inFence) inFence = null;
        kept.push(line);
        continue;
      }

      if (!inFence) {
        const def = line.match(/^\[\^([^\]\s]+)\]:[ \t]*(.*)$/);
        if (def) {
          const id = def[1];
          const body = [def[2]];
          while (i + 1 < lines.length && /^(?: {2,4}|\t)/.test(lines[i + 1])) {
            i += 1;
            body.push(lines[i].replace(/^(?: {2,4}|\t)/, ''));
          }
          defs.push({ id, body: body.join('\n').trim() });
          continue;
        }
      }

      kept.push(line);
    }

    if (!defs.length) return markdown;

    const order = new Map();
    defs.forEach((def) => {
      if (!order.has(def.id)) order.set(def.id, order.size + 1);
    });

    const restoreStore = [];
    const protectInline = (value) => `@@MDFOOTNOTE${restoreStore.push(value) - 1}@@`;
    let text = kept.join("\n")
      .replace(/```[\s\S]*?```/g, (match) => protectInline(match))
      .replace(/~~~[\s\S]*?~~~/g, (match) => protectInline(match))
      .replace(/(`+)([^`\n]*?)\1/g, (match) => protectInline(match));

    text = text.replace(/\[\^([^\]\s]+)\]/g, (match, id) => {
      if (!order.has(id)) return match;
      const n = order.get(id);
      const safe = slugifyId(`fn-${id}`);
      return `<sup class="footnote-ref" id="fnref-${safe}"><a href="#fn-${safe}" role="doc-noteref">${n}</a></sup>`;
    });

    for (let i = 0; i < 8; i += 1) {
      const next = text.replace(/@@MDFOOTNOTE(\d+)@@/g, (match, index) => restoreStore[Number(index)] || match);
      if (next === text) break;
      text = next;
    }
    const items = defs.map((def) => {
      const safe = slugifyId(`fn-${def.id}`);
      const n = order.get(def.id);
      const body = def.body ? md.renderInline(def.body) : '';
      return `<li id="fn-${safe}">${body} <a class="footnote-backref" href="#fnref-${safe}" aria-label="${t('label.footnoteBack', { n })}">↩</a></li>`;
    }).join('\n');

    return `${text}\n\n<section class="footnotes" role="doc-endnotes">\n<hr>\n<ol>\n${items}\n</ol>\n</section>`;
  }

  function slugifyId(value) {
    const fallback = 'section';
    const slug = String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N} _.-]+/gu, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return slug || fallback;
  }

  function encodeInlineSvgDataUris(segment) {
    return segment.replace(
      /(!?\[[^\]]*\]\()(\s*data:image\/svg\+xml(?:;charset=[^,)\s]+)?(?:;utf8)?\,)(<svg[\s\S]*?(?:<\/svg>|\/>))(\))/gi,
      (match, open, prefix, payload, close) => `${open}${prefix}${encodeSvgDataPayload(payload)}${close}`
    );
  }

  function encodeSvgDataPayload(payload) {
    return payload
      .split(/(%[0-9A-Fa-f]{2})/g)
      .map((part) => {
        if (/^%[0-9A-Fa-f]{2}$/.test(part)) return part;
        return encodeURI(part)
          .replace(/#/g, '%23')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29');
      })
      .join('');
  }

  function replaceBlockMath(segment) {
    let result = segment;

    result = result.replace(
      /(^|\n)[ \t]*\$\$\n?([\s\S]*?)\n?\$\$[ \t]*(?=\n|$)/g,
      (match, lead, block) => `${lead}<div class="math-fence" data-math="${escapeAttr(block.trim())}"></div>`
    );

    result = result.replace(
      /(^|\n)[ \t]*\\\[\n?([\s\S]*?)\n?\\\][ \t]*(?=\n|$)/g,
      (match, lead, block) => `${lead}<div class="math-fence" data-math="${escapeAttr(`\\[\n${block.trim()}\n\\]`)}"></div>`
    );

    result = result.replace(
      /(^|\n)([ \t]*\\begin\{(align\*?|alignat\*?|equation\*?|gather\*?|multline\*?|CD)\}[\s\S]*?[ \t]*\\end\{\3\}[ \t]*)(?=\n|$)/g,
      (match, lead, block) => `${lead}<div class="math-fence" data-math="${escapeAttr(block.trim())}"></div>`
    );

    return result;
  }

  function sanitizeHtml(html) {
    if (!window.DOMPurify) return html;
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true, svg: true, mathMl: true },
      ADD_ATTR: ['target', 'rel', 'class', 'data-diagram-source', 'data-math'],
      ADD_DATA_URI_TAGS: ['img'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$)|data:image\/(?:gif|png|jpeg|webp|svg\+xml)(?:;charset=[^,;\s]+)?(?:;base64|;utf8)?,)/i,
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
      RETURN_TRUSTED_TYPE: false
    });
  }

  async function render() {
    if (renderState.isRendering) return;
    await ensureStylesheetReady();
    if (renderState.isRendering) return;
    renderState.isRendering = true;
    renderState.errors = [];
    setStatus(t('status.rendering'), 'warn');

    try {
      const normalized = normalizeInput(els.mdIn.value);
      const precleaned = applyMarkdownPrecleaning(normalized);
      renderState.lastPreclean = precleaned;
      updatePrecleanMeta();
      const prepared = preprocessMarkdownForRender(precleaned.text);
      const rawHtml = md.render(prepared);
      const sanitized = sanitizeHtml(rawHtml);
      const displayHtml = absolutizeHtmlResourceUrls(sanitized);
      renderState.lastSanitizedHtml = displayHtml;
      els.previewInner.innerHTML = displayHtml;

      enhanceRenderedMarkdown();
      renderMathBlocks();
      renderInlineMath();
      await renderMermaidBlocks();
      renderAbcBlocks();
      highlightBlocks();
      enhanceColorModels();
      normalizeLinks();
      normalizePreviewResourceUrls();

      renderState.lastRenderedHtml = getCleanPreviewHtml();
      renderState.lastDocumentCss = buildDocumentCss();
      renderState.lastStandaloneHtml = buildStandaloneHtml();
      els.raw.value = renderState.lastRenderedHtml;
      if (els.css) els.css.value = renderState.lastDocumentCss;

      updateMetrics();
      updateErrors();
      persistDraft();
      setStatus(renderState.errors.length ? t('status.readyWarnings') : t('status.ready'), renderState.errors.length ? 'warn' : 'ok');
    } catch (error) {
      console.error(error);
      renderState.errors.push(t('error.renderGeneral', { message: error.message }));
      updateErrors();
      setStatus(t('status.renderError'), 'error');
    } finally {
      renderState.isRendering = false;
    }
  }

  function enhanceRenderedMarkdown() {
    addHeadingIds();
    enhanceTaskListItems();
    enhanceColorModels();
    enhanceGitHubAlerts();
  }

  function enhanceTaskListItems() {
    els.previewInner.querySelectorAll('li > input[type="checkbox"]').forEach((checkbox) => {
      const item = checkbox.closest('li');
      if (!item) return;
      item.classList.add('task-list-item');
      const parent = item.parentElement;
      if (parent && /^(UL|OL)$/i.test(parent.tagName)) {
        parent.classList.add('task-list');
      }
      checkbox.disabled = true;
    });
  }

  function normalizeColorModelValue(value) {
    let text = String(value || '').trim();
    const codeMatch = text.match(/^\`([^\`]+)\`$/);
    if (codeMatch) text = codeMatch[1].trim();
    if (!text) return '';

    if (/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(text)) return text;
    if (/^(?:rgb|rgba|hsl|hsla)\(.*\)$/i.test(text)) {
      if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('color', text)) return text;
    }
    return '';
  }

  function createColorModelSwatch(colorValue) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'color-model-swatch');
    svg.setAttribute('viewBox', '0 0 14 14');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '7');
    circle.setAttribute('cy', '7');
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', colorValue);
    circle.setAttribute('stroke', 'currentColor');
    circle.setAttribute('stroke-opacity', '0.35');
    circle.setAttribute('stroke-width', '1.2');
    svg.appendChild(circle);

    return svg;
  }

  function createColorModelCode(colorValue) {
    const code = document.createElement('code');
    code.className = 'color-model-code';
    code.appendChild(createColorModelSwatch(colorValue));
    code.appendChild(document.createTextNode(colorValue));
    return code;
  }

  function getPreTextForColorModels(pre) {
    const cleanHtmlEncoded = pre.getAttribute('data-clean-html');
    if (cleanHtmlEncoded) {
      const template = document.createElement('template');
      template.innerHTML = decodeURIComponent(cleanHtmlEncoded);
      return template.content.textContent || '';
    }
    const code = pre.querySelector('code');
    return code ? (code.textContent || '') : (pre.textContent || '');
  }

  function enhanceColorModels() {
    els.previewInner.querySelectorAll('pre').forEach((pre) => {
      const lines = getPreTextForColorModels(pre)
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      if (!lines.length || lines.length > 32) return;
      const colors = lines.map(normalizeColorModelValue);
      if (colors.some((value) => !value)) return;

      const list = document.createElement('div');
      list.className = 'color-model-list';
      list.setAttribute('role', 'list');
      colors.forEach((color) => {
        const item = document.createElement('div');
        item.className = 'color-model-item';
        item.setAttribute('role', 'listitem');
        item.appendChild(createColorModelCode(color));
        list.appendChild(item);
      });
      pre.replaceWith(list);
    });

    els.previewInner.querySelectorAll('code:not(pre code)').forEach((code) => {
      if (code.classList.contains('color-model-code')) return;
      const color = normalizeColorModelValue(code.textContent || '');
      if (!color) return;
      code.classList.add('color-model-code');
      if (!code.querySelector('.color-model-swatch')) {
        code.insertBefore(createColorModelSwatch(color), code.firstChild);
      }
    });
  }

  function addHeadingIds() {
    const used = new Map();
    els.previewInner.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((heading) => {
      if (heading.id) {
        used.set(heading.id, (used.get(heading.id) || 0) + 1);
        return;
      }
      const base = slugifyId(heading.textContent);
      const count = used.get(base) || 0;
      used.set(base, count + 1);
      heading.id = count ? `${base}-${count}` : base;
    });
  }

  function enhanceGitHubAlerts() {
    const titles = {
      note: 'NOTE',
      tip: 'TIP',
      important: 'IMPORTANT',
      warning: 'WARNING',
      caution: 'CAUTION'
    };

    els.previewInner.querySelectorAll('blockquote').forEach((quote) => {
      const first = quote.firstElementChild;
      if (!first || first.tagName.toLowerCase() !== 'p') return;
      const text = first.textContent || '';
      const match = text.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
      if (!match) return;

      const kind = match[1].toLowerCase();
      quote.classList.add('markdown-alert', `markdown-alert-${kind}`);

      const title = document.createElement('div');
      title.className = 'markdown-alert-title';
      title.textContent = titles[kind] || match[1].toUpperCase();

      first.innerHTML = first.innerHTML.replace(/\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>)?/i, '');
      quote.prepend(title);
      if (!first.textContent.trim() && !first.querySelector('img,svg,code,a')) first.remove();
    });
  }

  function renderMathBlocks() {
    els.previewInner.querySelectorAll('.math-fence').forEach((node) => {
      const source = decodeAttr(node.getAttribute('data-math') || '').trim();
      const shell = document.createElement('div');
      shell.className = 'math-shell';
      try {
        katex.render(source, shell, { ...katexOptions, displayMode: true });
      } catch (error) {
        shell.classList.add('math-error');
        shell.innerHTML = `<pre><code>${escapeHtml(source)}</code></pre>`;
        renderState.errors.push(t('error.formula', { message: error.message }));
      }
      node.replaceWith(shell);
    });
  }

  function renderInlineMath() {
    if (!window.renderMathInElement) return;
    try {
      window.renderMathInElement(els.previewInner, {
        delimiters: mathDelimiters,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
        macros: katexOptions.macros,
        errorCallback(message, error) {
          renderState.errors.push(`KaTeX: ${message} ${error?.message || ''}`.trim());
        }
      });
    } catch (error) {
      renderState.errors.push(t('error.katex', { message: error.message }));
    }
  }

  async function renderMermaidBlocks() {
    if (!window.mermaid) return;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: settings.theme === 'light' ? 'default' : 'dark',
      flowchart: { htmlLabels: false, curve: 'basis' },
      sequence: { wrap: true },
      mindmap: { padding: 12 },
      themeVariables: settings.theme === 'light'
        ? { fontFamily: 'Inter, system-ui, sans-serif' }
        : { fontFamily: 'Inter, system-ui, sans-serif' }
    });

    const blocks = [...els.previewInner.querySelectorAll('pre code.language-mermaid')];
    for (let i = 0; i < blocks.length; i += 1) {
      const code = blocks[i];
      const source = code.dataset.diagramSource || code.textContent || '';
      const wrapper = document.createElement('div');
      wrapper.className = 'diagram-shell';
      wrapper.setAttribute('data-mermaid-source', encodeURIComponent(source));
      const host = document.createElement('div');
      host.className = 'mermaid-host';
      wrapper.append(host);
      code.closest('pre')?.replaceWith(wrapper);
      try {
        const id = `mermaid-${Date.now()}-${i}`;
        const { svg, bindFunctions } = await mermaid.render(id, source);
        host.innerHTML = svg;
        bindFunctions?.(host);
      } catch (error) {
        wrapper.classList.add('diagram-error');
        wrapper.innerHTML = `<pre><code>${escapeHtml(source)}</code></pre>`;
        renderState.errors.push(`Mermaid: ${error.message}`);
      }
    }
  }

  function renderAbcBlocks() {
    const selector = 'pre code.language-abc, pre code.language-music-abc, pre code.language-abcjs, pre code.language-music';
    els.previewInner.querySelectorAll(selector).forEach((code) => {
      const source = code.textContent.replace(/\r\n?/g, '\n').trim();
      if (!source) return;
      const wrap = document.createElement('div');
      wrap.className = 'abcjs-wrap';
      const svgHost = document.createElement('div');
      wrap.append(svgHost);
      code.closest('pre')?.replaceWith(wrap);
      try {
        if (window.ABCJS?.renderAbc) {
          ABCJS.renderAbc(svgHost, source, { responsive: 'resize', add_classes: true, staffwidth: Math.max(560, svgHost.clientWidth || 560) });
        }
      } catch (error) {
        wrap.innerHTML = `<pre><code>${escapeHtml(source)}</code></pre>`;
        renderState.errors.push(`ABCJS: ${error.message}`);
      }
    });
  }

  function highlightBlocks() {
    els.previewInner.querySelectorAll('pre code').forEach((code) => {
      if (!code.classList.contains('hljs')) {
        hljs.highlightElement(code);
      }

      const pre = code.parentElement;
      if (!pre || pre.tagName !== 'PRE') return;

      const cleanHtml = code.innerHTML;
      const cleanClass = code.className || 'hljs';
      pre.setAttribute('data-clean-html', encodeURIComponent(cleanHtml));
      pre.setAttribute('data-clean-class', cleanClass);

      if (settings.lineNumbers && hljs.lineNumbersValue) {
        const numbered = hljs.lineNumbersValue(cleanHtml, { singleLine: true });
        if (numbered) {
          pre.classList.add('has-line-numbers');
          pre.innerHTML = numbered;
        }
      }
    });
  }

  function normalizeLinks() {
    els.previewInner.querySelectorAll('a[href]').forEach((link) => {
      const href = String(link.getAttribute('href') || '').trim();
      if (!href || href.startsWith('#')) return;
      if (/^https?:\/\//i.test(href)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer nofollow');
        return;
      }
      if (/^(?:mailto:|tel:)/i.test(href)) return;
      if (isAbsoluteOrSpecialUrl(href)) {
        link.removeAttribute('href');
        link.setAttribute('data-blocked-href', href);
        return;
      }
      const safeHref = safeLocalAssetHref(href);
      if (safeHref) {
        link.setAttribute('href', safeHref);
      } else {
        link.removeAttribute('href');
        link.setAttribute('data-blocked-href', href);
      }
    });
  }

  function updateMetrics() {
    const text = els.mdIn.value;
    const renderedText = getRenderedText();
    els.metrics.chars.textContent = text.length.toLocaleString(getLocale());
    els.metrics.words.textContent = countWords(text).toLocaleString(getLocale());
    els.metrics.lines.textContent = text ? text.split('\n').length.toLocaleString(getLocale()) : '0';
    els.metrics.nodes.textContent = renderedText ? renderedText.length.toLocaleString(getLocale()) : '0';
  }

  function countWords(text) {
    const m = text.trim().match(/\S+/g);
    return m ? m.length : 0;
  }

  function createCleanPreviewClone(options = {}) {
    const preserveMathMl = Boolean(options.preserveMathMl);
    const preserveSvgInternals = Boolean(options.preserveSvgInternals);
    const clone = els.previewInner.cloneNode(true);

    clone.querySelectorAll('pre').forEach((pre) => {
      const cleanHtmlEncoded = pre.getAttribute('data-clean-html');
      if (cleanHtmlEncoded) {
        const code = document.createElement('code');
        code.className = pre.getAttribute('data-clean-class') || 'hljs';
        code.innerHTML = decodeURIComponent(cleanHtmlEncoded);
        pre.classList.remove('has-line-numbers');
        pre.innerHTML = '';
        pre.append(code);
      }
    });

    const cleanupSelectors = ['.hljs-ln-numbers'];
    if (!preserveMathMl) cleanupSelectors.push('.katex-mathml');
    if (!preserveSvgInternals) cleanupSelectors.push('svg style', 'svg defs', 'svg title', 'svg desc', 'svg metadata');
    clone.querySelectorAll(cleanupSelectors.join(', ')).forEach((node) => node.remove());

    return clone;
  }

  function getCleanPreviewHtml() {
    return createCleanPreviewClone().innerHTML;
  }

  function getRenderedText() {
    const clean = createCleanPreviewClone();
    return (clean.innerText || clean.textContent || '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }


  function getDocxExportCss() {
    const appCss = getStyleText('app-style') || readWholeExternalStylesheet();
    const katexCss = getStyleText('katex-style');
    const highlightCss = getStyleText('highlight-style');
    return `${highlightCss}
${katexCss}
${appCss}
:root{
  --bg:#eef3ff;
  --bg-elev:rgba(255,255,255,0.9);
  --panel:rgba(255,255,255,0.96);
  --panel-2:rgba(248,250,252,0.98);
  --border:rgba(15,23,42,0.1);
  --text:#0f172a;
  --muted:#475569;
  --accent:#2563eb;
  --accent-2:#059669;
  --danger:#dc2626;
  --warn:#d97706;
  --shadow:0 18px 36px rgba(15,23,42,0.08);
  --preview-bg:#ffffff;
  --editor-bg:#f8fafc;
  --chip:rgba(37,99,235,0.08);
  --selection:rgba(37,99,235,0.18);
  --code-bg:#f3f4f6;
  color-scheme:light;
}
body{margin:0;padding:0;background:#fff;color:#111827;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.viewer-inner{max-width:none;margin:0;color:#111827}
.viewer-inner img,.viewer-inner svg{max-width:100%;height:auto}
.viewer-inner pre{overflow:auto}
.viewer-inner table{width:100%;border-collapse:collapse}
.viewer-inner th,.viewer-inner td{border:1px solid #d1d5db;padding:10px 12px}
.viewer-inner blockquote{margin:1rem 0;padding:.8rem 1rem;border-left:4px solid #60a5fa;background:#eff6ff}
.docx-export-stage,.docx-export-stage *{color:#111827}
.docx-export-stage .viewer-inner,.docx-export-stage .viewer-inner *{color:inherit}
.docx-export-stage .hljs{color:#24292e;background:#fff}
.docx-export-stage .hljs-comment{color:#6a737d}
.docx-export-stage .hljs-keyword,.docx-export-stage .hljs-string,.docx-export-stage .hljs-title,.docx-export-stage .hljs-number,.docx-export-stage .hljs-selector-tag,.docx-export-stage .hljs-meta,.docx-export-stage .hljs-literal,.docx-export-stage .hljs-attr,.docx-export-stage .hljs-built_in,.docx-export-stage .hljs-symbol,.docx-export-stage .hljs-quote,.docx-export-stage .hljs-name,.docx-export-stage .hljs-operator,.docx-export-stage .hljs-emphasis,.docx-export-stage .hljs-strong,.docx-export-stage .hljs-subst{color:inherit}
.docx-export-stage .katex{color:#111827 !important}
.docx-export-stage .katex svg{fill:currentColor !important;stroke:currentColor !important}
.docx-export-stage .diagram-shell,.docx-export-stage .abcjs-wrap,.docx-export-stage .math-shell{background:#fff;color:#111827}
`;
  }

  function createDocxExportStage(clone) {
    const host = document.createElement('div');
    host.className = 'docx-export-stage';
    host.setAttribute('aria-hidden', 'true');
    host.style.position = 'fixed';
    host.style.left = '-20000px';
    host.style.top = '0';
    host.style.width = '980px';
    host.style.padding = '32px';
    host.style.background = '#ffffff';
    host.style.color = '#111827';
    host.style.pointerEvents = 'none';
    host.style.opacity = '0';
    host.style.zIndex = '-1';

    const style = document.createElement('style');
    style.textContent = getDocxExportCss();
    host.append(style);

    const surface = document.createElement('div');
    surface.className = 'viewer';
    surface.style.background = '#ffffff';
    surface.style.border = '0';
    surface.style.padding = '0';
    surface.style.minHeight = '0';

    const inner = document.createElement('div');
    inner.className = 'viewer-inner';
    inner.append(clone);
    surface.append(inner);
    host.append(surface);
    document.body.append(host);
    return host;
  }

  async function settleImages(root) {
    const images = [...root.querySelectorAll('img')];
    await Promise.all(images.map((img) => new Promise((resolve) => {
      if (img.complete) {
        resolve();
        return;
      }
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
      setTimeout(done, 1200);
    })));
  }

  function svgMarkupToDataUrl(svgMarkup) {
    const encoded = btoa(unescape(encodeURIComponent(svgMarkup)));
    return `data:image/svg+xml;base64,${encoded}`;
  }

  function normalizeSvgMarkupForRaster(svgMarkup, width, height, background = '#ffffff') {
    const safeWidth = Math.max(1, Math.ceil(width || 1));
    const safeHeight = Math.max(1, Math.ceil(height || 1));
    const source = /<svg[\s>]/i.test(svgMarkup || '')
      ? String(svgMarkup || '')
      : `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">${svgMarkup || ''}</svg>`;

    try {
      const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
      const parserError = parsed.querySelector('parsererror');
      if (parserError) throw new Error(parserError.textContent || 'Invalid SVG');
      const svg = parsed.documentElement;
      if (!svg || svg.tagName.toLowerCase() !== 'svg') throw new Error('Invalid SVG root');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      if (!svg.getAttribute('viewBox')) svg.setAttribute('viewBox', `0 0 ${safeWidth} ${safeHeight}`);
      svg.setAttribute('width', String(safeWidth));
      svg.setAttribute('height', String(safeHeight));
      svg.querySelectorAll('script').forEach((node) => node.remove());
      if (background) {
        const rect = parsed.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '0');
        rect.setAttribute('y', '0');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', background);
        rect.setAttribute('data-docx-bg', '1');
        svg.insertBefore(rect, svg.firstChild);
      }
      return new XMLSerializer().serializeToString(svg);
    } catch (error) {
      return source.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
        const cleanedAttrs = attrs
          .replace(/\s(width|height)=("[^"]*"|'[^']*'|[^\s>]*)/gi, '')
          .replace(/\sxmlns(:xlink)?=("[^"]*"|'[^']*'|[^\s>]*)/gi, '');
        return `<svg${cleanedAttrs} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${safeWidth}" height="${safeHeight}">`;
      });
    }
  }

  function svgMarkupToPngDataUrl(svgMarkup, width, height, background = '#ffffff') {
    return new Promise((resolve, reject) => {
      const safeWidth = Math.max(1, Math.ceil(width || 1));
      const safeHeight = Math.max(1, Math.ceil(height || 1));
      const wrapped = normalizeSvgMarkupForRaster(svgMarkup, safeWidth, safeHeight, background);

      const drawImageToCanvas = (img, cleanup) => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = safeWidth;
          canvas.height = safeHeight;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = background || '#ffffff';
          ctx.fillRect(0, 0, safeWidth, safeHeight);
          ctx.drawImage(img, 0, 0, safeWidth, safeHeight);
          const dataUrl = canvas.toDataURL('image/png');
          cleanup?.();
          resolve(dataUrl);
        } catch (error) {
          cleanup?.();
          reject(error);
        }
      };

      const tryLoad = (src, cleanup) => {
        const img = new Image();
        img.decoding = 'sync';
        img.onload = () => drawImageToCanvas(img, cleanup);
        img.onerror = () => {
          cleanup?.();
          reject(new Error(t('error.svgPng')));
        };
        img.src = src;
      };

      try {
        const blob = new Blob([wrapped], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.decoding = 'sync';
        img.onload = () => drawImageToCanvas(img, () => URL.revokeObjectURL(url));
        img.onerror = () => {
          URL.revokeObjectURL(url);
          tryLoad(svgMarkupToDataUrl(wrapped));
        };
        img.src = url;
      } catch (error) {
        tryLoad(svgMarkupToDataUrl(wrapped));
      }
    });
  }

  function simplifySvgForeignObjectsForDocx(svgRoot) {
    if (!svgRoot?.querySelectorAll) return;
    const svgNs = 'http://www.w3.org/2000/svg';
    svgRoot.querySelectorAll('foreignObject').forEach((node) => {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) {
        node.remove();
        return;
      }
      const width = Number.parseFloat(node.getAttribute('width') || '') || 120;
      const height = Number.parseFloat(node.getAttribute('height') || '') || 24;
      const x = Number.parseFloat(node.getAttribute('x') || '') || 0;
      const y = Number.parseFloat(node.getAttribute('y') || '') || 0;
      const textEl = document.createElementNS(svgNs, 'text');
      textEl.setAttribute('x', String(x + width / 2));
      textEl.setAttribute('y', String(y + height / 2));
      textEl.setAttribute('text-anchor', 'middle');
      textEl.setAttribute('dominant-baseline', 'middle');
      textEl.setAttribute('font-family', 'Inter, Arial, sans-serif');
      textEl.setAttribute('font-size', '14');
      textEl.setAttribute('fill', '#111827');
      textEl.textContent = text;
      node.replaceWith(textEl);
    });
  }

  async function svgElementToPngDataUrl(svgElement, background = '#ffffff') {
    const clone = svgElement.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    const viewBox = clone.getAttribute('viewBox');
    const bbox = svgElement.getBoundingClientRect();
    let width = parseFloat(clone.getAttribute('width')) || bbox.width || 1;
    let height = parseFloat(clone.getAttribute('height')) || bbox.height || 1;
    if ((!width || !height) && viewBox) {
      const parts = viewBox.split(/\s+/).map(Number);
      if (parts.length === 4 && Number.isFinite(parts[2]) && Number.isFinite(parts[3])) {
        width = parts[2];
        height = parts[3];
      }
    }
    width = Math.max(1, Math.ceil(width || 1));
    height = Math.max(1, Math.ceil(height || 1));
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    if (!clone.getAttribute('viewBox')) {
      clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    simplifySvgForeignObjectsForDocx(clone);
    const serialized = new XMLSerializer().serializeToString(clone);
    return svgMarkupToPngDataUrl(serialized, width, height, background);
  }

  function svgElementToDataUrl(svgElement) {
    const clone = svgElement.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    const viewBox = clone.getAttribute('viewBox');
    const bbox = svgElement.getBoundingClientRect();
    let width = parseFloat(clone.getAttribute('width')) || bbox.width || 1;
    let height = parseFloat(clone.getAttribute('height')) || bbox.height || 1;
    if ((!width || !height) && viewBox) {
      const parts = viewBox.split(/\s+/).map(Number);
      if (parts.length === 4 && Number.isFinite(parts[2]) && Number.isFinite(parts[3])) {
        width = parts[2];
        height = parts[3];
      }
    }
    width = Math.max(1, Math.ceil(width || 1));
    height = Math.max(1, Math.ceil(height || 1));
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    if (!clone.getAttribute('viewBox')) {
      clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    simplifySvgForeignObjectsForDocx(clone);
    return svgMarkupToDataUrl(new XMLSerializer().serializeToString(clone));
  }

  async function domNodeToPngDataUrl(node, options = {}) {
    const padding = options.padding ?? 8;
    const background = options.background ?? '#ffffff';
    const rect = node.getBoundingClientRect();
    const width = Math.max(1, Math.ceil(rect.width + padding * 2));
    const height = Math.max(1, Math.ceil(rect.height + padding * 2));
    const clone = node.cloneNode(true);
    const css = `${getDocxExportCss()} .docx-foreign-root{display:inline-block;padding:${padding}px;background:${background};color:#111827;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}`;
    const serialized = new XMLSerializer().serializeToString(clone);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <foreignObject x="0" y="0" width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" class="docx-foreign-root">
            <style>${escapeHtml(css)}</style>
            ${serialized}
          </div>
        </foreignObject>
      </svg>`;
    return svgMarkupToPngDataUrl(svg, width, height, background);
  }

  function getMathAltText(node) {
    const annotation = node.querySelector('.katex-mathml annotation');
    if (annotation?.textContent?.trim()) return annotation.textContent.trim();
    return (node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function getMathMlElement(node) {
    if (!node) return null;
    if (node.tagName?.toLowerCase() === 'math') return node;
    return node.querySelector('.katex-mathml math');
  }

  function makeOmmlMathRun(text) {
    const value = String(text ?? '');
    if (!value) return '';
    const preserve = /(^\s|\s$|\s{2,})/.test(value) ? ' xml:space="preserve"' : '';
    return `<m:r><m:t${preserve}>${escapeXml(value)}</m:t></m:r>`;
  }

  function wrapOmmlMathArg(xml) {
    return xml && xml.trim() ? xml : '<m:r><m:t xml:space="preserve"> </m:t></m:r>';
  }

  function mathMlChildrenToOmml(nodes) {
    return [...nodes].map((child) => mathMlNodeToOmml(child)).join('');
  }

  function mathMlTableToOmml(tableNode) {
    const rows = [...tableNode.children].filter((child) => child.tagName?.toLowerCase() === 'mtr');
    const rowXml = rows.map((row) => {
      const cells = [...row.children].filter((cell) => {
        if (cell.tagName?.toLowerCase() !== 'mtd') return false;
        const className = cell.getAttribute('class') || '';
        return !/mtr-glue|mml-eqn-num/.test(className);
      });
      const pieces = cells.map((cell) => wrapOmmlMathArg(mathMlChildrenToOmml(cell.childNodes))).filter(Boolean);
      const merged = pieces.length ? pieces.join(makeOmmlMathRun(' ')) : makeOmmlMathRun((row.textContent || '').trim());
      return `<m:e>${wrapOmmlMathArg(merged)}</m:e>`;
    }).join('');
    return rowXml ? `<m:eqArr>${rowXml}</m:eqArr>` : makeOmmlMathRun((tableNode.textContent || '').trim());
  }

  function mathMlNodeToOmml(node) {
    if (!node) return '';
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue || '';
      return value ? makeOmmlMathRun(value) : '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();
    if (tag === 'annotation') return '';
    if (['annotation-xml', 'semantics', 'math', 'mrow', 'mstyle', 'mpadded', 'mphantom'].includes(tag)) {
      return mathMlChildrenToOmml(node.childNodes);
    }
    if (['mi', 'mn', 'mo', 'mtext'].includes(tag)) {
      return makeOmmlMathRun(node.textContent || '');
    }
    if (tag === 'mspace') {
      return makeOmmlMathRun(' ');
    }
    if (tag === 'msup') {
      return `<m:sSup><m:e>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[0]))}</m:e><m:sup>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[1]))}</m:sup></m:sSup>`;
    }
    if (tag === 'msub') {
      return `<m:sSub><m:e>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[0]))}</m:e><m:sub>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[1]))}</m:sub></m:sSub>`;
    }
    if (tag === 'msubsup') {
      return `<m:sSubSup><m:e>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[0]))}</m:e><m:sub>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[1]))}</m:sub><m:sup>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[2]))}</m:sup></m:sSubSup>`;
    }
    if (tag === 'mfrac') {
      return `<m:f><m:num>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[0]))}</m:num><m:den>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[1]))}</m:den></m:f>`;
    }
    if (tag === 'msqrt') {
      return `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:e>${wrapOmmlMathArg(mathMlChildrenToOmml(node.childNodes))}</m:e></m:rad>`;
    }
    if (tag === 'mroot') {
      return `<m:rad><m:deg>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[1]))}</m:deg><m:e>${wrapOmmlMathArg(mathMlNodeToOmml(node.children[0]))}</m:e></m:rad>`;
    }
    if (tag === 'mfenced') {
      const open = node.getAttribute('open') || '(';
      const close = node.getAttribute('close') || ')';
      const inner = mathMlChildrenToOmml(node.childNodes);
      return `${makeOmmlMathRun(open)}${inner}${makeOmmlMathRun(close)}`;
    }
    if (tag === 'mtable') {
      return mathMlTableToOmml(node);
    }
    if (tag === 'mtr' || tag === 'mtd') {
      return mathMlChildrenToOmml(node.childNodes);
    }
    if (tag === 'mover' || tag === 'munder' || tag === 'munderover') {
      return mathMlChildrenToOmml(node.childNodes);
    }
    return node.childNodes?.length ? mathMlChildrenToOmml(node.childNodes) : makeOmmlMathRun(node.textContent || '');
  }

  function mathElementToInlineOmml(mathElement) {
    if (!mathElement) return '';
    const body = wrapOmmlMathArg(mathMlNodeToOmml(mathElement));
    return `<m:oMath>${body}</m:oMath>`;
  }

  function createDocxOmmlPlaceholder(sourceNode, block = false) {
    const mathElement = getMathMlElement(sourceNode);
    if (!mathElement) return null;
    const placeholder = document.createElement(block ? 'div' : 'span');
    placeholder.className = block ? 'docx-omml-block' : 'docx-omml-inline';
    placeholder.setAttribute('data-docx-omml', encodeURIComponent(mathElementToInlineOmml(mathElement)));
    placeholder.setAttribute('data-docx-alt', getMathAltText(sourceNode) || t('alt.formula'));
    if (!block) placeholder.style.display = 'inline';
    return placeholder;
  }

  function normalizeDocxFallbackText(source, options = {}) {
    const keepLines = options.keepLines ?? false;
    const value = String(source || '')
      .replace(/\r\n?/g, '\n')
      .replace(/\u200b/g, '')
      .trim();
    if (!value) return '';
    return keepLines ? value.replace(/\n{3,}/g, '\n\n') : value.replace(/\s+/g, ' ').trim();
  }

  function buildDocxFallbackInline(source) {
    const span = document.createElement('span');
    span.className = 'docx-fallback-inline';
    span.textContent = normalizeDocxFallbackText(source);
    return span;
  }

  function buildDocxFallbackBlock(source, className = 'docx-fallback-block') {
    const pre = document.createElement('pre');
    pre.className = className;
    const code = document.createElement('code');
    code.textContent = normalizeDocxFallbackText(source, { keepLines: true });
    pre.append(code);
    return pre;
  }

  function replaceMathNodeWithFallback(node, block = false) {
    const source = getMathAltText(node) || t('alt.formula');
    const fallback = block ? buildDocxFallbackBlock(source, 'docx-fallback-math-block') : buildDocxFallbackInline(source);
    node.replaceWith(fallback);
  }

  function replaceMermaidNodeWithFallback(node) {
    const source = decodeURIComponent(node.getAttribute('data-mermaid-source') || '') || 'Mermaid diagram';
    node.replaceWith(buildDocxFallbackBlock(source, 'docx-fallback-diagram-block'));
  }

  function cleanupDocxExportClone(root) {
    root.querySelectorAll('.katex').forEach((node) => replaceMathNodeWithFallback(node, false));
    root.querySelectorAll('.math-shell').forEach((node) => replaceMathNodeWithFallback(node, true));
    root.querySelectorAll('.diagram-shell[data-mermaid-source]').forEach((node) => replaceMermaidNodeWithFallback(node));
    root.querySelectorAll('.katex-mathml, math, semantics, annotation, annotation-xml, style, defs, title, desc, metadata, script').forEach((node) => node.remove());
    root.querySelectorAll('svg').forEach((node) => {
      const text = node.getAttribute('aria-label') || 'SVG diagram';
      node.replaceWith(buildDocxFallbackBlock(text, 'docx-fallback-svg-block'));
    });
    root.querySelectorAll('canvas').forEach((node) => {
      const text = node.getAttribute('aria-label') || 'Canvas diagram';
      node.replaceWith(buildDocxFallbackBlock(text, 'docx-fallback-canvas-block'));
    });
  }

  async function replaceComplexNodesForDocx(root) {
    const blockMath = [...root.querySelectorAll('.math-shell')];
    for (const shell of blockMath) {
      const placeholder = createDocxOmmlPlaceholder(shell, true);
      if (placeholder) {
        shell.replaceWith(placeholder);
      } else {
        replaceMathNodeWithFallback(shell, true);
      }
    }

    const inlineMath = [...root.querySelectorAll('.katex')].filter((node) => !node.closest('.math-shell'));
    for (const mathNode of inlineMath) {
      const placeholder = createDocxOmmlPlaceholder(mathNode, false);
      if (placeholder) {
        mathNode.replaceWith(placeholder);
      } else {
        replaceMathNodeWithFallback(mathNode, false);
      }
    }

    const mermaidBlocks = [...root.querySelectorAll('.diagram-shell[data-mermaid-source]')];
    for (const wrapper of mermaidBlocks) {
      const encodedSource = wrapper.getAttribute('data-mermaid-source') || '';
      const source = decodeURIComponent(encodedSource);
      const svgEl = wrapper.querySelector('svg');
      if (!svgEl) {
        replaceMermaidNodeWithFallback(wrapper);
        continue;
      }
      try {
        const img = document.createElement('img');
        const wrapperRect = wrapper.getBoundingClientRect();
        const svgRect = svgEl.getBoundingClientRect();
        const width = Math.max(1, Math.ceil(wrapperRect.width || svgRect.width || parseFloat(svgEl.getAttribute('width')) || 1));
        const height = Math.max(1, Math.ceil(wrapperRect.height || svgRect.height || parseFloat(svgEl.getAttribute('height')) || 1));
        img.src = await svgElementToPngDataUrl(svgEl, '#ffffff');
        img.alt = source.split('\n').slice(0, 2).join(' ').trim() || 'Mermaid diagram';
        img.setAttribute('data-docx-image-kind', 'diagram');
        img.setAttribute('data-docx-width-px', String(width));
        img.setAttribute('data-docx-height-px', String(height));
        img.style.display = 'block';
        img.style.maxWidth = '100%';
        wrapper.replaceWith(img);
      } catch (error) {
        try {
          const img = document.createElement('img');
          const wrapperRect = wrapper.getBoundingClientRect();
          const svgRect = svgEl.getBoundingClientRect();
          const width = Math.max(1, Math.ceil(wrapperRect.width || svgRect.width || parseFloat(svgEl.getAttribute('width')) || 1));
          const height = Math.max(1, Math.ceil(wrapperRect.height || svgRect.height || parseFloat(svgEl.getAttribute('height')) || 1));
          img.src = svgElementToDataUrl(svgEl);
          img.alt = source.split('\n').slice(0, 2).join(' ').trim() || 'Mermaid diagram';
          img.setAttribute('data-docx-image-kind', 'diagram-svg');
          img.setAttribute('data-docx-width-px', String(width));
          img.setAttribute('data-docx-height-px', String(height));
          img.style.display = 'block';
          img.style.maxWidth = '100%';
          wrapper.replaceWith(img);
        } catch (fallbackError) {
          renderState.errors.push(`DOCX / Mermaid: ${error.message}`);
          replaceMermaidNodeWithFallback(wrapper);
        }
      }
    }

    const svgNodes = [...root.querySelectorAll('svg')];
    for (const svgNode of svgNodes) {
      if (svgNode.closest('.katex')) continue;
      try {
        const rect = svgNode.getBoundingClientRect();
        const width = Math.max(1, Math.ceil(rect.width || parseFloat(svgNode.getAttribute('width')) || 1));
        const height = Math.max(1, Math.ceil(rect.height || parseFloat(svgNode.getAttribute('height')) || 1));
        const img = document.createElement('img');
        img.src = await svgElementToPngDataUrl(svgNode, '#ffffff');
        img.alt = svgNode.getAttribute('aria-label') || 'SVG';
        img.setAttribute('data-docx-image-kind', 'svg');
        img.setAttribute('data-docx-width-px', String(width));
        img.setAttribute('data-docx-height-px', String(height));
        img.style.display = getComputedStyle(svgNode).display === 'inline' ? 'inline-block' : 'block';
        img.style.maxWidth = '100%';
        svgNode.replaceWith(img);
      } catch (error) {
        try {
          const rect = svgNode.getBoundingClientRect();
          const width = Math.max(1, Math.ceil(rect.width || parseFloat(svgNode.getAttribute('width')) || 1));
          const height = Math.max(1, Math.ceil(rect.height || parseFloat(svgNode.getAttribute('height')) || 1));
          const img = document.createElement('img');
          img.src = svgElementToDataUrl(svgNode);
          img.alt = svgNode.getAttribute('aria-label') || 'SVG';
          img.setAttribute('data-docx-image-kind', 'svg-vector');
          img.setAttribute('data-docx-width-px', String(width));
          img.setAttribute('data-docx-height-px', String(height));
          img.style.display = getComputedStyle(svgNode).display === 'inline' ? 'inline-block' : 'block';
          img.style.maxWidth = '100%';
          svgNode.replaceWith(img);
        } catch (fallbackError) {
          renderState.errors.push(`DOCX / SVG: ${error.message}`);
          const fallback = svgNode.getAttribute('aria-label') || 'SVG diagram';
          svgNode.replaceWith(buildDocxFallbackBlock(fallback, 'docx-fallback-svg-block'));
        }
      }
    }

    const canvases = [...root.querySelectorAll('canvas')];
    for (const canvas of canvases) {
      try {
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.alt = canvas.getAttribute('aria-label') || 'Canvas';
        img.setAttribute('data-docx-image-kind', 'canvas');
        img.style.display = getComputedStyle(canvas).display === 'inline' ? 'inline-block' : 'block';
        img.style.maxWidth = '100%';
        canvas.replaceWith(img);
      } catch (error) {
        renderState.errors.push(`DOCX / canvas: ${error.message}`);
        const fallback = canvas.getAttribute('aria-label') || 'Canvas diagram';
        canvas.replaceWith(buildDocxFallbackBlock(fallback, 'docx-fallback-canvas-block'));
      }
    }
  }

  function isLikelySvgImageSource(src) {
    return /^data:image\/svg\+xml/i.test(src || '') || /\.svg(?:[?#]|$)/i.test(src || '');
  }

  function decodeTextDataUrl(dataUrl) {
    const match = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/i.exec(dataUrl || '');
    if (!match) return '';
    const payload = match[3] || '';
    if (match[2]) {
      return decodeURIComponent(escape(atob(payload)));
    }
    return decodeURIComponent(payload);
  }

  async function loadSvgMarkupFromImage(img) {
    const src = img.getAttribute('src') || '';
    if (!src) return '';
    if (/^data:image\/svg\+xml/i.test(src)) {
      return decodeTextDataUrl(src);
    }
    const fetchUrl = normalizeFetchableImageUrl(src);
    if (!fetchUrl) throw new Error('Blocked unsafe SVG image path');
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  }

  async function rasterizeSvgImagesForDocx(root) {
    const images = [...root.querySelectorAll('img[src]')].filter((img) => isLikelySvgImageSource(img.getAttribute('src') || ''));
    for (const img of images) {
      try {
        const rect = img.getBoundingClientRect();
        const width = Math.max(1, Math.ceil(rect.width || img.naturalWidth || Number(img.getAttribute('width')) || 64));
        const height = Math.max(1, Math.ceil(rect.height || img.naturalHeight || Number(img.getAttribute('height')) || 64));
        const svgMarkup = await loadSvgMarkupFromImage(img);
        if (!svgMarkup.trim()) continue;
        img.src = await svgMarkupToPngDataUrl(svgMarkup, width, height, '#ffffff');
        img.setAttribute('data-docx-image-kind', 'svg-rasterized');
        img.setAttribute('data-docx-width-px', String(width));
        img.setAttribute('data-docx-height-px', String(height));
      } catch (error) {
        renderState.errors.push(`DOCX / SVG-изображение: ${error.message}`);
      }
    }
  }

  function annotateDocxImageSizes(root) {
    root.querySelectorAll('img').forEach((img) => {
      const rect = img.getBoundingClientRect();
      const width = Math.max(1, Math.ceil(rect.width || img.naturalWidth || 1));
      const height = Math.max(1, Math.ceil(rect.height || img.naturalHeight || 1));
      img.setAttribute('data-docx-width-px', String(width));
      img.setAttribute('data-docx-height-px', String(height));
    });
  }

  async function prepareDocxExportDom() {
    const clone = createCleanPreviewClone({ preserveMathMl: true, preserveSvgInternals: true });
    const stage = createDocxExportStage(clone);
    try {
      await settleImages(stage);
      await replaceComplexNodesForDocx(clone);
      await rasterizeSvgImagesForDocx(clone);
      await settleImages(stage);
      cleanupDocxExportClone(clone);
      annotateDocxImageSizes(clone);
      return clone;
    } finally {
      stage.remove();
    }
  }

  function createDocxVisualClone() {
    const clone = els.previewInner.cloneNode(true);

    clone.querySelectorAll('pre').forEach((pre) => {
      const cleanHtmlEncoded = pre.getAttribute('data-clean-html');
      if (!cleanHtmlEncoded) return;
      const code = document.createElement('code');
      code.className = pre.getAttribute('data-clean-class') || 'hljs';
      code.innerHTML = decodeURIComponent(cleanHtmlEncoded);
      pre.classList.remove('has-line-numbers');
      pre.innerHTML = '';
      pre.append(code);
    });

    clone.querySelectorAll('.hljs-ln-numbers, .hljs-ln, .katex-mathml, script, title, desc, metadata').forEach((node) => node.remove());
    clone.querySelectorAll('[contenteditable], .resize-observer').forEach((node) => {
      node.removeAttribute('contenteditable');
      node.classList?.remove('resize-observer');
    });

    return clone;
  }

  async function rasterizeVisualCloneAssets(root) {
    const rasterizeNodeShell = async (node, options = {}) => {
      if (!node?.isConnected) return;
      const rect = node.getBoundingClientRect();
      const width = Math.max(1, Math.ceil(options.width || rect.width || 1));
      const height = Math.max(1, Math.ceil(options.height || rect.height || 1));
      const img = document.createElement('img');
      img.src = await domNodeToPngDataUrl(node, {
        padding: options.padding ?? 0,
        background: options.background ?? '#ffffff'
      });
      img.alt = options.alt || node.getAttribute?.('aria-label') || t('alt.image');
      img.style.display = options.display || (getComputedStyle(node).display === 'inline' ? 'inline-block' : 'block');
      img.style.verticalAlign = options.verticalAlign || getComputedStyle(node).verticalAlign || 'baseline';
      img.style.width = `${width}px`;
      img.style.height = `${height}px`;
      img.style.maxWidth = '100%';
      img.setAttribute('data-rasterized-from', options.kind || node.tagName.toLowerCase());
      node.replaceWith(img);
    };

    const blockMathNodes = [...root.querySelectorAll('.math-shell')];
    for (const node of blockMathNodes) {
      try {
        await rasterizeNodeShell(node, {
          kind: 'math-block',
          padding: 8,
          background: '#ffffff',
          display: 'block',
          alt: getMathAltText(node) || t('alt.formula')
        });
      } catch (error) {
        renderState.errors.push(`DOCX / формула-подготовка: ${error.message}`);
      }
    }

    const inlineMathNodes = [...root.querySelectorAll('.katex')].filter((node) => !node.closest('.math-shell'));
    for (const node of inlineMathNodes) {
      try {
        await rasterizeNodeShell(node, {
          kind: 'math-inline',
          padding: 2,
          background: '#ffffff',
          display: 'inline-block',
          verticalAlign: 'middle',
          alt: getMathAltText(node) || t('alt.formula')
        });
      } catch (error) {
        renderState.errors.push(`DOCX / inline-формула-подготовка: ${error.message}`);
      }
    }

    const diagramNodes = [...root.querySelectorAll('.diagram-shell, .abcjs-wrap')];
    for (const node of diagramNodes) {
      try {
        const source = decodeURIComponent(node.getAttribute?.('data-mermaid-source') || '');
        await rasterizeNodeShell(node, {
          kind: 'diagram',
          padding: 0,
          background: '#ffffff',
          display: 'block',
          alt: source.split('\n').slice(0, 2).join(' ').trim() || node.getAttribute?.('aria-label') || t('alt.diagram')
        });
      } catch (error) {
        renderState.errors.push(`DOCX / диаграмма-подготовка: ${error.message}`);
      }
    }

    const svgNodes = [...root.querySelectorAll('svg')];
    for (const svgNode of svgNodes) {
      if (!svgNode.isConnected) continue;
      const rect = svgNode.getBoundingClientRect();
      const width = Math.max(1, Math.ceil(rect.width || parseFloat(svgNode.getAttribute('width')) || 1));
      const height = Math.max(1, Math.ceil(rect.height || parseFloat(svgNode.getAttribute('height')) || 1));
      const display = getComputedStyle(svgNode).display === 'inline' ? 'inline-block' : 'block';
      try {
        const dataUrl = await svgElementToPngDataUrl(svgNode, '#ffffff');
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = svgNode.getAttribute('aria-label') || 'SVG';
        img.style.display = display;
        img.style.verticalAlign = 'middle';
        img.style.width = `${width}px`;
        img.style.height = `${height}px`;
        img.style.maxWidth = '100%';
        img.setAttribute('data-rasterized-from', 'svg');
        svgNode.replaceWith(img);
      } catch (error) {
        try {
          const img = document.createElement('img');
          img.src = svgElementToDataUrl(svgNode);
          img.alt = svgNode.getAttribute('aria-label') || 'SVG';
          img.style.display = display;
          img.style.verticalAlign = 'middle';
          img.style.width = `${width}px`;
          img.style.height = `${height}px`;
          img.style.maxWidth = '100%';
          img.setAttribute('data-rasterized-from', 'svg-data-url');
          svgNode.replaceWith(img);
        } catch {
          renderState.errors.push(`DOCX / SVG-подготовка: ${error.message}`);
        }
      }
    }

    const canvasNodes = [...root.querySelectorAll('canvas')];
    for (const canvas of canvasNodes) {
      if (!canvas.isConnected) continue;
      try {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.ceil(rect.width || canvas.width || 1));
        const height = Math.max(1, Math.ceil(rect.height || canvas.height || 1));
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.alt = canvas.getAttribute('aria-label') || 'Canvas';
        img.style.display = getComputedStyle(canvas).display === 'inline' ? 'inline-block' : 'block';
        img.style.verticalAlign = 'middle';
        img.style.width = `${width}px`;
        img.style.height = `${height}px`;
        img.style.maxWidth = '100%';
        img.setAttribute('data-rasterized-from', 'canvas');
        canvas.replaceWith(img);
      } catch (error) {
        renderState.errors.push(`DOCX / canvas-подготовка: ${error.message}`);
      }
    }
  }

  function getDocxPageAspectRatio() {
    const pageWidthTwips = 11906 - 1080 - 1080;
    const pageHeightTwips = 16838 - 1080 - 1080;
    return pageHeightTwips / pageWidthTwips;
  }

  async function domSliceToPngDataUrl(node, options = {}) {
    const background = options.background ?? '#ffffff';
    const clipWidth = Math.max(1, Math.ceil(options.clipWidth || node.getBoundingClientRect().width || 1));
    const clipHeight = Math.max(1, Math.ceil(options.clipHeight || node.getBoundingClientRect().height || 1));
    const offsetY = Math.max(0, Math.floor(options.offsetY || 0));
    const wrapper = document.createElement('div');
    wrapper.className = 'docx-slice-frame';
    wrapper.style.width = `${clipWidth}px`;
    wrapper.style.height = `${clipHeight}px`;
    wrapper.style.overflow = 'hidden';
    wrapper.style.background = background;
    wrapper.style.color = '#111827';

    const shifted = node.cloneNode(true);
    shifted.style.transform = `translateY(-${offsetY}px)`;
    shifted.style.transformOrigin = 'top left';
    shifted.style.margin = '0';
    shifted.style.width = `${clipWidth}px`;
    wrapper.append(shifted);

    return domNodeToPngDataUrl(wrapper, { padding: 0, background });
  }

  async function renderDocxVisualPages() {
    const clone = createDocxVisualClone();
    const stage = createDocxExportStage(clone);
    try {
      await settleImages(stage);
      await rasterizeVisualCloneAssets(clone);
      await settleImages(stage);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const rect = clone.getBoundingClientRect();
      const width = Math.max(1, Math.ceil(rect.width || 1));
      const height = Math.max(1, Math.ceil(rect.height || 1));
      const aspectRatio = getDocxPageAspectRatio();
      const pageHeightPx = Math.max(200, Math.round(width * aspectRatio));
      const pages = [];

      for (let offsetY = 0; offsetY < height; offsetY += pageHeightPx) {
        const sliceHeight = Math.min(pageHeightPx, height - offsetY);
        const dataUrl = await domSliceToPngDataUrl(clone, {
          clipWidth: width,
          clipHeight: sliceHeight,
          offsetY,
          background: '#ffffff'
        });
        pages.push({ dataUrl, width, height: sliceHeight });
      }

      return pages;
    } finally {
      stage.remove();
    }
  }

  async function buildVisualDocxBlob(pages) {
    const ctx = createDocxContext();
    let bodyXml = '';

    for (let i = 0; i < pages.length; i += 1) {
      const page = pages[i];
      const img = document.createElement('img');
      img.src = page.dataUrl;
      img.alt = t('alt.page', { n: i + 1 });
      img.setAttribute('data-docx-width-px', String(page.width));
      img.setAttribute('data-docx-height-px', String(page.height));
      const asset = await collectImageAsset(img, ctx);
      if (!asset) throw new Error(`Could not assemble page image ${i + 1}`);
      bodyXml += `<w:p>${paragraphPropsXml({ center: true })}${buildImageRunXml(asset, page.width, page.height, ctx, img.alt)}</w:p>`;
      if (i < pages.length - 1) {
        bodyXml += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      }
    }

    if (!bodyXml.trim()) {
      bodyXml = await paragraphFromText('', ctx);
    }

    const files = [
      { name: '[Content_Types].xml', data: buildContentTypesXml(ctx) },
      { name: '_rels/.rels', data: buildRootRelsXml() },
      { name: 'docProps/core.xml', data: buildCoreXml() },
      { name: 'docProps/app.xml', data: buildAppXml() },
      { name: 'word/document.xml', data: buildDocumentXml(bodyXml) },
      { name: 'word/styles.xml', data: buildStylesXml() },
      { name: 'word/numbering.xml', data: buildNumberingXml() },
      { name: 'word/settings.xml', data: buildSettingsXml() },
      { name: 'word/webSettings.xml', data: buildWebSettingsXml() },
      { name: 'word/_rels/document.xml.rels', data: buildDocumentRelsXml(ctx) }
    ];

    ctx.media.forEach((item) => {
      files.push({ name: `word/media/${item.name}`, data: item.bytes });
    });

    return buildZipStoreBlob(files, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function pxToTwips(px) {
    return Math.max(1, Math.round(px * 15));
  }

  function pxToEmu(px) {
    return Math.max(1, Math.round(px * 9525));
  }

  function textToXmlRuns(text, state = {}) {
    if (!text) return '';
    const needsPreserve = /^\s|\s$|\s{2,}|\n/.test(text);
    const escaped = escapeXml(text);
    const rPr = [];
    if (state.bold) rPr.push('<w:b/>');
    if (state.italic) rPr.push('<w:i/>');
    if (state.underline) rPr.push('<w:u w:val="single"/>');
    if (state.strike) rPr.push('<w:strike/>');
    if (state.code) {
      rPr.push('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>');
      rPr.push('<w:sz w:val="20"/>');
      rPr.push('<w:shd w:val="clear" w:color="auto" w:fill="F3F4F6"/>');
    }
    if (state.link) {
      rPr.push('<w:color w:val="2563EB"/>');
      rPr.push('<w:u w:val="single"/>');
    }
    if (state.vertAlign === 'superscript') rPr.push('<w:vertAlign w:val="superscript"/>');
    if (state.vertAlign === 'subscript') rPr.push('<w:vertAlign w:val="subscript"/>');
    if (state.highlight) rPr.push(`<w:highlight w:val="${state.highlight}"/>`);
    const rPrXml = rPr.length ? `<w:rPr>${rPr.join('')}</w:rPr>` : '';
    return escaped.split('\n').map((part, idx) => {
      const textXml = part ? `<w:t${needsPreserve ? ' xml:space="preserve"' : ''}>${part}</w:t>` : '<w:t xml:space="preserve"></w:t>';
      return `<w:r>${rPrXml}${idx ? '<w:br/>' : ''}${textXml}</w:r>`;
    }).join('');
  }

  function createDocxContext() {
    return {
      documentParts: [],
      media: [],
      rels: [
        { id: 'rId1', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles', target: 'styles.xml' },
        { id: 'rId2', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering', target: 'numbering.xml' },
        { id: 'rId3', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings', target: 'settings.xml' },
        { id: 'rId4', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings', target: 'webSettings.xml' }
      ],
      nextRelId: 5,
      nextImageId: 1,
      nextDrawingId: 1,
      maxContentWidthEmu: pxToEmu(620)
    };
  }

  function addHyperlinkRel(ctx, href) {
    const id = `rId${ctx.nextRelId++}`;
    ctx.rels.push({ id, type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', target: href, external: true });
    return id;
  }

  function base64ToBytes(base64) {
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }

  function dataUrlToBytes(dataUrl) {
    const match = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/i.exec(dataUrl || '');
    if (!match) throw new Error(t('error.dataUrl'));
    const mime = match[1] || 'application/octet-stream';
    const payload = match[3] || '';
    const bytes = match[2] ? base64ToBytes(payload) : new TextEncoder().encode(decodeURIComponent(payload));
    return { mime, bytes };
  }

  function extensionFromMime(mime) {
    if (/png/i.test(mime)) return 'png';
    if (/jpe?g/i.test(mime)) return 'jpg';
    if (/gif/i.test(mime)) return 'gif';
    if (/svg\+xml/i.test(mime)) return 'svg';
    if (/webp/i.test(mime)) return 'webp';
    return 'bin';
  }


  function normalizeFetchableImageUrl(src) {
    const value = String(src || '').trim();
    if (!value || value.startsWith('data:') || value.startsWith('blob:')) return value;
    if (!isFetchableResourceUrl(value)) return '';
    try {
      const url = new URL(value, APP_BASE_URL);
      if (url.hostname === 'github.com') {
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 5 && parts[2] === 'raw') {
          return `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/${parts.slice(3).join('/')}${url.search}`;
        }
        if (parts.length >= 5 && parts[2] === 'blob') {
          return `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/${parts.slice(3).join('/')}${url.search}`;
        }
      }
      return url.href;
    } catch {
      return '';
    }
  }

  async function collectImageAsset(img, ctx) {
    const src = img.getAttribute('src') || '';
    let mime = 'image/png';
    let bytes = null;

    if (src.startsWith('data:')) {
      const parsed = dataUrlToBytes(src);
      mime = parsed.mime;
      bytes = parsed.bytes;
    } else if (src) {
      const fetchUrl = normalizeFetchableImageUrl(src);
      if (!fetchUrl) {
        renderState.errors.push(`DOCX / заблокирован небезопасный путь к изображению: ${src}`);
        return null;
      }
      try {
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        mime = response.headers.get('content-type') || mime;
        bytes = new Uint8Array(buffer);
      } catch (error) {
        renderState.errors.push(`DOCX / изображение недоступно: ${src}`);
        return null;
      }
    }

    if (!bytes) return null;

    const ext = extensionFromMime(mime);
    const name = `image-${ctx.nextImageId}.${ext}`;
    const rid = `rId${ctx.nextRelId++}`;
    ctx.rels.push({ id: rid, type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image', target: `media/${name}` });
    ctx.media.push({ name, bytes, mime });
    ctx.nextImageId += 1;
    return { rid, name, mime };
  }

  function buildImageRunXml(asset, widthPx, heightPx, ctx, alt = '') {
    const maxWidth = ctx.maxContentWidthEmu;
    let cx = pxToEmu(widthPx || 1);
    let cy = pxToEmu(heightPx || 1);
    if (cx > maxWidth) {
      const ratio = maxWidth / cx;
      cx = Math.round(cx * ratio);
      cy = Math.round(cy * ratio);
    }
    const drawingId = ctx.nextDrawingId++;
    return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${drawingId}" name="${escapeXml(asset.name)}" descr="${escapeXml(alt || asset.name)}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="${escapeXml(asset.name)}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${asset.rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
  }

  async function inlineNodesToXml(nodes, ctx, state = {}) {
    const fragments = [];
    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue || '';
        if (value) fragments.push(textToXmlRuns(value, state));
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.classList?.contains('docx-omml-inline') || node.classList?.contains('docx-omml-block')) {
        const omml = decodeURIComponent(node.getAttribute('data-docx-omml') || '');
        if (omml) fragments.push(omml);
        continue;
      }
      const tag = node.tagName.toLowerCase();
      if (node.classList?.contains('katex-mathml')) continue;
      if (['style', 'script', 'defs', 'title', 'desc', 'metadata', 'annotation', 'annotation-xml', 'semantics', 'math'].includes(tag)) continue;
      if (tag === 'br') {
        fragments.push('<w:r><w:br/></w:r>');
        continue;
      }
      if (tag === 'input' && String(node.getAttribute('type') || '').toLowerCase() === 'checkbox') {
        const checked = node.checked || node.hasAttribute('checked') || node.getAttribute('aria-checked') === 'true';
        fragments.push(textToXmlRuns(checked ? '☑ ' : '☐ ', state));
        continue;
      }
      if (tag === 'svg') {
        const fallback = node.getAttribute('aria-label') || 'SVG diagram';
        fragments.push(textToXmlRuns(`[${fallback}]`, state));
        continue;
      }
      if (tag === 'canvas') {
        fragments.push(textToXmlRuns('[Canvas diagram]', state));
        continue;
      }
      if (tag === 'img') {
        const asset = await collectImageAsset(node, ctx);
        if (asset) {
          const width = Number(node.getAttribute('data-docx-width-px')) || node.naturalWidth || 120;
          const height = Number(node.getAttribute('data-docx-height-px')) || node.naturalHeight || 40;
          fragments.push(buildImageRunXml(asset, width, height, ctx, node.getAttribute('alt') || t('alt.image')));
        } else if (node.getAttribute('alt')) {
          fragments.push(textToXmlRuns(`[${node.getAttribute('alt')}]`, state));
        }
        continue;
      }
      const nextState = { ...state };
      if (['strong', 'b'].includes(tag)) nextState.bold = true;
      if (['em', 'i'].includes(tag)) nextState.italic = true;
      if (['s', 'strike', 'del'].includes(tag)) nextState.strike = true;
      if (tag === 'code') nextState.code = true;
      if (tag === 'sup') nextState.vertAlign = 'superscript';
      if (tag === 'sub') nextState.vertAlign = 'subscript';
      if (tag === 'mark') nextState.highlight = 'yellow';
      if (tag === 'a') {
        const href = node.getAttribute('href') || '';
        const relId = href ? addHyperlinkRel(ctx, href) : null;
        const inner = await inlineNodesToXml(node.childNodes, ctx, { ...nextState, link: true });
        fragments.push(relId ? `<w:hyperlink r:id="${relId}" w:history="1">${inner || textToXmlRuns(href, { ...nextState, link: true })}</w:hyperlink>` : inner);
        continue;
      }
      fragments.push(await inlineNodesToXml(node.childNodes, ctx, nextState));
    }
    return fragments.join('');
  }

  function paragraphPropsXml(options = {}) {
    const parts = [];
    if (options.style) parts.push(`<w:pStyle w:val="${options.style}"/>`);
    if (options.list) {
      parts.push(`<w:numPr><w:ilvl w:val="${options.list.level}"/><w:numId w:val="${options.list.ordered ? 2 : 1}"/></w:numPr>`);
      parts.push('<w:spacing w:before="0" w:after="60"/>');
    }
    if (options.codeBlock) {
      parts.push('<w:spacing w:before="120" w:after="120" w:line="276" w:lineRule="auto"/>');
      parts.push('<w:ind w:left="120" w:right="120"/>');
      parts.push('<w:shd w:val="clear" w:color="auto" w:fill="F3F4F6"/>');
      parts.push('<w:pBdr><w:top w:val="single" w:sz="4" w:color="D1D5DB"/><w:left w:val="single" w:sz="4" w:color="D1D5DB"/><w:bottom w:val="single" w:sz="4" w:color="D1D5DB"/><w:right w:val="single" w:sz="4" w:color="D1D5DB"/></w:pBdr>');
    }
    if (options.blockquote) {
      parts.push('<w:spacing w:before="80" w:after="80" w:line="300" w:lineRule="auto"/>');
      parts.push('<w:ind w:left="540" w:right="120"/>');
      parts.push('<w:shd w:val="clear" w:color="auto" w:fill="EFF6FF"/>');
      parts.push('<w:pBdr><w:left w:val="single" w:sz="10" w:space="18" w:color="60A5FA"/></w:pBdr>');
    }
    if (options.hr) {
      parts.push('<w:spacing w:before="120" w:after="120"/>');
      parts.push('<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="10" w:color="CBD5E1"/></w:pBdr>');
    }
    if (options.center) parts.push('<w:jc w:val="center"/>');
    return parts.length ? `<w:pPr>${parts.join('')}</w:pPr>` : '';
  }

  async function paragraphFromElement(node, ctx, options = {}) {
    const runs = await inlineNodesToXml(node.childNodes, ctx, options.inlineState || {});
    return `<w:p>${paragraphPropsXml(options)}${runs || '<w:r><w:t xml:space="preserve"></w:t></w:r>'}</w:p>`;
  }

  async function imageParagraphFromElement(node, ctx) {
    const asset = await collectImageAsset(node, ctx);
    if (!asset) return await paragraphFromText(t('fallback.imageUnavailable', { src: node.getAttribute('src') || node.getAttribute('alt') || 'image' }), ctx);
    const width = Number(node.getAttribute('data-docx-width-px')) || node.naturalWidth || 320;
    const height = Number(node.getAttribute('data-docx-height-px')) || node.naturalHeight || 180;
    return `<w:p>${paragraphPropsXml({ center: true })}${buildImageRunXml(asset, width, height, ctx, node.getAttribute('alt') || t('alt.image'))}</w:p>`;
  }

  async function paragraphFromText(text, ctx, options = {}) {
    return `<w:p>${paragraphPropsXml(options)}${textToXmlRuns(text, options.inlineState || {})}</w:p>`;
  }

  async function codeBlockToXml(pre, ctx, options = {}) {
    const code = pre.querySelector('code');
    const text = (code?.textContent || pre.textContent || '').replace(/\r\n?/g, '\n');
    const lines = text.split('\n');
    const paragraphs = lines.map((line) => `<w:p>${paragraphPropsXml({ codeBlock: true, blockquote: options.blockquote })}${textToXmlRuns(line || ' ', { code: true })}</w:p>`).join('');
    return paragraphs;
  }

  async function tableToXml(table, ctx) {
    const rows = [...table.querySelectorAll('tr')];
    if (!rows.length) return '';
    const colCount = Math.max(...rows.map((row) => [...row.children].reduce((sum, cell) => sum + Number(cell.getAttribute('colspan') || 1), 0)), 1);
    const weights = new Array(colCount).fill(1);
    rows.forEach((row) => {
      let col = 0;
      [...row.children].forEach((cell) => {
        const span = Number(cell.getAttribute('colspan') || 1);
        const textLen = Math.min(40, Math.max(1, (cell.innerText || cell.textContent || '').trim().length || 1));
        for (let i = 0; i < span; i += 1) weights[col + i] = Math.max(weights[col + i], Math.ceil(textLen / span));
        col += span;
      });
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0) || colCount;
    const totalWidth = 9000;
    const widths = weights.map((weight) => Math.max(900, Math.round(totalWidth * weight / totalWeight)));
    const grid = widths.map((width) => `<w:gridCol w:w="${width}"/>`).join('');
    const rowXml = [];

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      let col = 0;
      const cellsXml = [];
      for (const cell of [...row.children]) {
        const span = Math.max(1, Number(cell.getAttribute('colspan') || 1));
        const width = widths.slice(col, col + span).reduce((a, b) => a + b, 0);
        const isHeader = cell.tagName.toLowerCase() === 'th' || row.parentElement?.tagName.toLowerCase() === 'thead' || rowIndex === 0;
        const cellParagraph = await paragraphFromElement(cell, ctx, { inlineState: isHeader ? { bold: true } : {} });
        cellsXml.push(`<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${span > 1 ? `<w:gridSpan w:val="${span}"/>` : ''}<w:vAlign w:val="center"/>${isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="EDF3FF"/>' : ''}</w:tcPr>${cellParagraph}</w:tc>`);
        col += span;
      }
      rowXml.push(`<w:tr>${rowIndex === 0 ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}${cellsXml.join('')}</w:tr>`);
    }

    return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="6" w:color="CBD5E1"/><w:left w:val="single" w:sz="6" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="6" w:color="CBD5E1"/><w:right w:val="single" w:sz="6" w:color="CBD5E1"/><w:insideH w:val="single" w:sz="4" w:color="E2E8F0"/><w:insideV w:val="single" w:sz="4" w:color="E2E8F0"/></w:tblBorders><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${rowXml.join('')}</w:tbl>`;
  }

  async function listToXml(listNode, ctx, level = 0, ordered = false) {
    const parts = [];
    const items = [...listNode.children].filter((child) => child.tagName && child.tagName.toLowerCase() === 'li');
    for (const item of items) {
      const blockChildren = [...item.childNodes].filter((node) => node.nodeType === Node.ELEMENT_NODE && ['ul', 'ol'].includes(node.tagName.toLowerCase()));
      const inlineContainer = document.createElement('div');
      item.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE && ['ul', 'ol'].includes(child.tagName.toLowerCase())) return;
        inlineContainer.append(child.cloneNode(true));
      });
      parts.push(await paragraphFromElement(inlineContainer, ctx, { list: { level, ordered } }));
      for (const nested of blockChildren) {
        parts.push(await listToXml(nested, ctx, level + 1, nested.tagName.toLowerCase() === 'ol'));
      }
    }
    return parts.join('');
  }

  async function blockChildrenToXml(parent, ctx, options = {}) {
    const fragments = [];
    for (const node of [...parent.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.nodeValue || '').trim();
        if (text) fragments.push(await paragraphFromText(text, ctx, { blockquote: options.blockquote }));
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.classList?.contains('docx-omml-block')) {
        const omml = decodeURIComponent(node.getAttribute('data-docx-omml') || '');
        if (omml) fragments.push(`<w:p>${paragraphPropsXml({ center: true })}${omml}</w:p>`);
        continue;
      }
      const tag = node.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        const level = Number(tag.slice(1));
        fragments.push(await paragraphFromElement(node, ctx, { style: `Heading${Math.min(level, 3)}`, blockquote: options.blockquote }));
        continue;
      }
      if (tag === 'p') {
        fragments.push(await paragraphFromElement(node, ctx, { blockquote: options.blockquote }));
        continue;
      }
      if (tag === 'pre') {
        fragments.push(await codeBlockToXml(node, ctx, { blockquote: options.blockquote }));
        continue;
      }
      if (tag === 'blockquote') {
        const quoteBlocks = [...node.children].length ? await blockChildrenToXml(node, ctx, { ...options, blockquote: true }) : await paragraphFromText(node.textContent || '', ctx, { blockquote: true });
        if (quoteBlocks) fragments.push(quoteBlocks);
        continue;
      }
      if (tag === 'details') {
        const summary = [...node.children].find((child) => child.tagName?.toLowerCase() === 'summary');
        if (summary) fragments.push(await paragraphFromElement(summary, ctx, { inlineState: { bold: true }, blockquote: options.blockquote }));
        const detailsBody = document.createElement('div');
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE && child.tagName.toLowerCase() === 'summary') return;
          detailsBody.append(child.cloneNode(true));
        });
        const detailsXml = await blockChildrenToXml(detailsBody, ctx, options);
        if (detailsXml) fragments.push(detailsXml);
        continue;
      }
      if (tag === 'ul' || tag === 'ol') {
        fragments.push(await listToXml(node, ctx, 0, tag === 'ol'));
        continue;
      }
      if (tag === 'table') {
        fragments.push(await tableToXml(node, ctx));
        continue;
      }
      if (tag === 'img') {
        fragments.push(await imageParagraphFromElement(node, ctx));
        continue;
      }
      if (node.classList?.contains('docx-fallback-inline')) {
        fragments.push(await paragraphFromElement(node, ctx, { blockquote: options.blockquote }));
        continue;
      }
      if (tag === 'svg' || tag === 'canvas') {
        const fallback = node.getAttribute('aria-label') || (tag === 'svg' ? 'SVG diagram' : 'Canvas diagram');
        fragments.push(await paragraphFromText(`[${fallback}]`, ctx, { blockquote: options.blockquote }));
        continue;
      }
      if (tag === 'hr') {
        fragments.push(`<w:p>${paragraphPropsXml({ hr: true })}<w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`);
        continue;
      }
      if (['div', 'section', 'article', 'figure'].includes(tag)) {
        if (node.querySelector(':scope > img') && node.children.length === 1 && node.firstElementChild?.tagName.toLowerCase() === 'img') {
          fragments.push(await imageParagraphFromElement(node.firstElementChild, ctx));
        } else {
          fragments.push(await blockChildrenToXml(node, ctx, options));
        }
        continue;
      }
      fragments.push(await paragraphFromElement(node, ctx, { blockquote: options.blockquote }));
    }
    return fragments.join('');
  }

  function buildStylesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:lang w:val="ru-RU"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="34"/><w:color w:val="0F172A"/></w:rPr><w:pPr><w:spacing w:before="280" w:after="140"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="0F172A"/></w:rPr><w:pPr><w:spacing w:before="220" w:after="120"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0F172A"/></w:rPr><w:pPr><w:spacing w:before="180" w:after="100"/></w:pPr></w:style>
  <w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:basedOn w:val="DefaultParagraphFont"/><w:uiPriority w:val="99"/><w:unhideWhenUsed/><w:rPr><w:color w:val="2563EB"/><w:u w:val="single"/></w:rPr></w:style>
</w:styles>`;
  }

  function buildNumberingXml() {
    const levels = Array.from({ length: 9 }, (_, level) => {
      const left = 720 + level * 360;
      const hanging = 360;
      return `<w:lvl w:ilvl="${level}"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${left}" w:hanging="${hanging}"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/></w:rPr></w:lvl>`;
    }).join('');
    const orderedLevels = Array.from({ length: 9 }, (_, level) => {
      const left = 720 + level * 360;
      const hanging = 360;
      return `<w:lvl w:ilvl="${level}"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%${level + 1}."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${left}" w:hanging="${hanging}"/></w:pPr></w:lvl>`;
    }).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="1">${levels}</w:abstractNum>
  <w:abstractNum w:abstractNumId="2">${orderedLevels}</w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>
  <w:num w:numId="2"><w:abstractNumId w:val="2"/></w:num>
</w:numbering>`;
  }

  function buildSettingsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:zoom w:percent="100"/><w:updateFields w:val="true"/></w:settings>`;
  }

  function buildWebSettingsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:webSettings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`;
  }

  function buildCoreXml() {
    const created = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Markdown export</dc:title><dc:creator>Local Markdown Converter</dc:creator><cp:lastModifiedBy>Local Markdown Converter</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${created}</dcterms:modified></cp:coreProperties>`;
  }

  function buildAppXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Markdown Converter</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><Company></Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>1.0</AppVersion></Properties>`;
  }

  function buildDocumentRelsXml(ctx) {
    const rels = ctx.rels.map((rel) => `<Relationship Id="${rel.id}" Type="${rel.type}" Target="${escapeXml(rel.target)}"${rel.external ? ' TargetMode="External"' : ''}/>`).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
  }

  function buildRootRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
  }

  function buildContentTypesXml(ctx) {
    const overrides = [
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>',
      '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>',
      '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>',
      '<Override PartName="/word/webSettings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml"/>',
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
      '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
    ];
    const mimeMap = new Map();
    ctx.media.forEach((item) => mimeMap.set(extensionFromMime(item.mime), item.mime));
    const defaults = ['<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>', '<Default Extension="xml" ContentType="application/xml"/>'];
    mimeMap.forEach((mime, ext) => defaults.push(`<Default Extension="${ext}" ContentType="${mime}"/>`));
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">${defaults.join('')}${overrides.join('')}</Types>`;
  }

  function buildDocumentXml(bodyXml) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 wp14"><w:body>${bodyXml}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  }

  function crc32(bytes) {
    let crc = -1;
    for (let i = 0; i < bytes.length; i += 1) {
      crc ^= bytes[i];
      for (let j = 0; j < 8; j += 1) {
        crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
      }
    }
    return (crc ^ -1) >>> 0;
  }

  function u16(value) {
    const arr = new Uint8Array(2);
    new DataView(arr.buffer).setUint16(0, value, true);
    return arr;
  }

  function u32(value) {
    const arr = new Uint8Array(4);
    new DataView(arr.buffer).setUint32(0, value >>> 0, true);
    return arr;
  }

  function concatUint8Arrays(parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    parts.forEach((part) => {
      out.set(part, offset);
      offset += part.length;
    });
    return out;
  }

  function encodeFileData(data) {
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    return new TextEncoder().encode(String(data));
  }

  function getDosDateTime(date = new Date()) {
    const dosTime = ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0x0f) << 5) | (date.getDate() & 0x1f);
    return { dosDate, dosTime };
  }

  function buildZipStoreBlob(files, mimeType) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    files.forEach((file) => {
      const nameBytes = encoder.encode(file.name);
      const dataBytes = encodeFileData(file.data);
      const crc = crc32(dataBytes);
      const { dosDate, dosTime } = getDosDateTime(file.date || new Date());

      const localHeader = concatUint8Arrays([
        u32(0x04034b50),
        u16(20),
        u16(0x0800),
        u16(0),
        u16(dosTime),
        u16(dosDate),
        u32(crc),
        u32(dataBytes.length),
        u32(dataBytes.length),
        u16(nameBytes.length),
        u16(0),
        nameBytes
      ]);
      localParts.push(localHeader, dataBytes);

      const centralHeader = concatUint8Arrays([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0x0800),
        u16(0),
        u16(dosTime),
        u16(dosDate),
        u32(crc),
        u32(dataBytes.length),
        u32(dataBytes.length),
        u16(nameBytes.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        nameBytes
      ]);
      centralParts.push(centralHeader);
      offset += localHeader.length + dataBytes.length;
    });

    const centralDir = concatUint8Arrays(centralParts);
    const endRecord = concatUint8Arrays([
      u32(0x06054b50),
      u16(0),
      u16(0),
      u16(files.length),
      u16(files.length),
      u32(centralDir.length),
      u32(offset),
      u16(0)
    ]);

    return new Blob([...localParts, centralDir, endRecord], {
      type: mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }

  async function buildDocxBlob(root) {
    const ctx = createDocxContext();
    let bodyXml = await blockChildrenToXml(root, ctx);
    if (!bodyXml.trim()) {
      bodyXml = await paragraphFromText('', ctx);
    }
    const files = [
      { name: '[Content_Types].xml', data: buildContentTypesXml(ctx) },
      { name: '_rels/.rels', data: buildRootRelsXml() },
      { name: 'docProps/core.xml', data: buildCoreXml() },
      { name: 'docProps/app.xml', data: buildAppXml() },
      { name: 'word/document.xml', data: buildDocumentXml(bodyXml) },
      { name: 'word/styles.xml', data: buildStylesXml() },
      { name: 'word/numbering.xml', data: buildNumberingXml() },
      { name: 'word/settings.xml', data: buildSettingsXml() },
      { name: 'word/webSettings.xml', data: buildWebSettingsXml() },
      { name: 'word/_rels/document.xml.rels', data: buildDocumentRelsXml(ctx) }
    ];

    ctx.media.forEach((item) => {
      files.push({ name: `word/media/${item.name}`, data: item.bytes });
    });

    return buildZipStoreBlob(files, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  function buildAltChunkDocumentXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 wp14"><w:body><w:altChunk r:id="htmlChunk"/><w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  }

  function buildAltChunkDocumentRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="htmlChunk" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="afchunk/document.html"/></Relationships>`;
  }

  function buildAltChunkContentTypesXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="html" ContentType="text/html"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
  }

  async function htmlStringToDataUrl(html) {
    const bytes = new TextEncoder().encode(html);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return `data:text/html;charset=utf-8;base64,${btoa(binary)}`;
  }

  async function inlineHtmlImages(doc) {
    const images = [...doc.querySelectorAll('img[src]')];
    for (const img of images) {
      const src = img.getAttribute('src') || '';
      if (!src || src.startsWith('data:')) continue;
      try {
        const fetchUrl = normalizeFetchableImageUrl(src);
        if (!fetchUrl) throw new Error('Blocked unsafe image path');
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Could not inline image in HTML chunk'));
          reader.readAsDataURL(blob);
        });
        img.setAttribute('src', dataUrl);
      } catch (error) {
        renderState.errors.push(`DOCX / HTML-чанк / изображение: ${src}`);
      }
    }
  }

  async function buildDocxHtmlChunk() {
    const html = buildStandaloneHtml();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    await inlineHtmlImages(doc);
    doc.querySelectorAll('script').forEach((node) => node.remove());
    doc.querySelectorAll('.hljs-ln, .hljs-ln-numbers').forEach((node) => node.remove());
    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  }

  async function buildAltChunkDocxBlob(htmlChunk) {
    const files = [
      { name: '[Content_Types].xml', data: buildAltChunkContentTypesXml() },
      { name: '_rels/.rels', data: buildRootRelsXml() },
      { name: 'docProps/core.xml', data: buildCoreXml() },
      { name: 'docProps/app.xml', data: buildAppXml() },
      { name: 'word/document.xml', data: buildAltChunkDocumentXml() },
      { name: 'word/_rels/document.xml.rels', data: buildAltChunkDocumentRelsXml() },
      { name: 'word/afchunk/document.html', data: htmlChunk }
    ];
    return buildZipStoreBlob(files, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  }

  function getDocxExportFileName() {
    const heading = els.previewInner.querySelector('h1, h2, h3')?.textContent || 'markdown-export';
    const cleaned = heading
      .normalize('NFC')
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80) || 'markdown-export';
    return cleaned.toLowerCase().endsWith('.docx') ? cleaned : `${cleaned}.docx`;
  }

  function saveDocxBlob(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDocxExportFileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function downloadDocx() {
    setStatus(t('status.docxPreparing'), 'warn');
    renderState.errors = renderState.errors.filter((message) => !String(message).startsWith('DOCX'));

    try {
      const root = await prepareDocxExportDom();
      const blob = await buildDocxBlob(root);
      saveDocxBlob(blob);
      updateErrors();
      setStatus(renderState.errors.length ? t('status.docxCreatedWarnings') : t('status.docxCreated'), renderState.errors.length ? 'warn' : 'ok');
    } catch (error) {
      console.error(error);
      renderState.errors.push(`DOCX / структурный экспорт: ${error.message}`);
      try {
        const pages = await renderDocxVisualPages();
        const fallbackBlob = await buildVisualDocxBlob(pages);
        saveDocxBlob(fallbackBlob);
        updateErrors();
        setStatus(t('status.docxVisualWarnings'), 'warn');
      } catch (fallbackError) {
        console.error(fallbackError);
        renderState.errors.push(`DOCX / визуальный fallback: ${fallbackError.message}`);
        updateErrors();
        setStatus(t('status.docxFailed'), 'error');
      }
    }
  }


  function updateErrors() {
    els.errorsList.innerHTML = '';
    if (!renderState.errors.length) {
      els.errors.classList.remove('show');
      return;
    }
    const unique = [...new Set(renderState.errors)].slice(0, 10);
    unique.forEach((message) => {
      const li = document.createElement('li');
      li.textContent = localizeMessage(message);
      els.errorsList.append(li);
    });
    els.errors.classList.add('show');
  }

  function setStatus(message, kind = 'ok') {
    els.status.classList.remove('is-error', 'is-warn');
    if (kind === 'error') els.status.classList.add('is-error');
    if (kind === 'warn') els.status.classList.add('is-warn');
    els.statusText.textContent = localizeMessage(message);
  }

  function isLikelyBuiltInSample(text) {
    const normalized = normalizeInput(String(text || '')).trim();
    return (normalized.startsWith('# Markdown → HTML — упорядоченный комплексный тест')
        && normalized.includes('## Предочистка и специальные символы')
        && normalized.includes('## Диаграммы Mermaid'))
      || (normalized.startsWith('# Markdown → HTML — ordered comprehensive test')
        && normalized.includes('## Precleaning and special characters')
        && normalized.includes('## Mermaid diagrams'))
      || (normalized.startsWith('# Markdown → HTML — расширенный тест')
        && normalized.includes('## Что должно сохраниться')
        && normalized.includes('## Mermaid'));
  }

  function getCurrentSampleMarkdown() {
    return renderState.sampleMarkdownByLang[getLanguage()] || getComplexSampleMarkdown(getLanguage());
  }

  function isCurrentEditorSample() {
    const normalizedEditor = normalizeInput(els.mdIn.value || '').trim();
    if (!normalizedEditor) return false;
    const normalizedSample = normalizeInput(getCurrentSampleMarkdown()).trim();
    return normalizedEditor === normalizedSample || isLikelyBuiltInSample(normalizedEditor);
  }

  function persistDraft() {
    if (isCurrentEditorSample()) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ markdown: els.mdIn.value }));
  }

  function getComplexSampleMarkdown(lang = getLanguage()) {
    const fence = '```';
    if (lang === 'en') {
      return [
        '# Markdown → HTML — ordered comprehensive test',
        '',
        'This fallback sample is used when the external example file cannot be loaded. It covers text, lists, links, tables, formulas, Mermaid, ABC notation, and raw HTML.',
        '',
        '> Important check: a line with a hard break.  ',
        '> The next line must stay on a new line.',
        '',
        '## What should be preserved',
        '',
        '- Escaped symbol: \\#not-a-heading',
        '- The `^` character in plain text: ^caret^',
        '- The `^` character in a formula: $x^2 + y^2 = z^2$',
        '- The `^` character in code: `^caret^`',
        '- Text with several   spaces in a regular line.',
        '',
        '## Lists and tasks',
        '',
        '1. First item',
        '   - nested item',
        '   - another item',
        '2. Second item',
        '',
        '- [x] Local rendering',
        '- [x] Formulas',
        '- [ ] DOCX remains a separate task',
        '',
        '## Links and images',
        '',
        '[Link with a query string](https://example.com/docs?q=markdown&mode=local "Example link")',
        '',
        '![Test icon image](md.svg)',
        '',
        'Anchor test: [Jump to Mermaid](#mermaid).',
        '',
        '## Table',
        '',
        '| Field | Value | Comment |',
        '|:--|--:|:--|',
        '| A | 10 | `code` inside a cell |',
        '| B | 20 | formula $a^2+b^2=c^2$ |',
        '| C | 30 | HTML `<mark>inline</mark>` |',
        '',
        '## Formulas',
        '',
        'Inline: $E = mc^2$, $\\alpha + \\beta \\to \\gamma$, and $\\text{price} = 5{,}0$.',
        '',
        'Block:',
        '',
        '$$',
        '\\int_0^1 x^2 \\, dx = \\frac{1}{3}',
        '$$',
        '',
        '## Code',
        '',
        'Inline code: `const value = input ?? defaultValue;`',
        '',
        `${fence}ts`,
        'interface UserCard {',
        '  id: number;',
        '  name: string;',
        '}',
        '',
        'const data: UserCard = { id: 7, name: "Markdown ^ HTML" };',
        'console.log(data);',
        fence,
        '',
        '## Mermaid',
        '',
        `${fence}mermaid`,
        'flowchart TD',
        '    A[Source Markdown] --> B{Precleaning enabled?}',
        '    B -- Yes --> C[Markdown-safe cleanup]',
        '    B -- No --> D[Direct rendering]',
        '    C --> E[markdown-it]',
        '    D --> E',
        '    E --> F[KaTeX / Mermaid / highlight.js]',
        '    F --> G[HTML / Preview / PDF]',
        fence,
        '',
        '## ABC notation',
        '',
        `${fence}abc`,
        'X:1',
        'T:Scale',
        'M:4/4',
        'L:1/4',
        'K:C',
        'C D E F | G A B c |',
        fence,
        '',
        '## Raw HTML',
        '',
        '<details open>',
        '  <summary>HTML block</summary>',
        '  <p data-note="a — b">This block must not be broken by precleaning.</p>',
        '</details>'
      ].join('\n');
    }
    return [
      '# Markdown → HTML — расширенный тест',
      '',
      'Проверка более сложного рендера с предварительной очисткой. Здесь есть «типографика», NBSP, узкий NBSP, экранирование, HTML-блоки, Mermaid, ABC, формулы и tricky Markdown.',
      '',
      '> Важная проверка: строка с жёстким переносом.  ',
      '> Следующая строка должна остаться на новой строке.',
      '',
      '## Что должно сохраниться',
      '',
      '- Экранированный символ: \\#не-заголовок',
      '- Символ `^` в обычном тексте: ^caret^',
      '- Символ `^` в формуле: $x^2 + y^2 = z^2$',
      '- Символ `^` в коде: `^caret^`',
      '- Текст с несколькими   пробелами в обычной строке — можно проверить опцию схлопывания.',
      '',
      '## Списки и задачи',
      '',
      '1. Первый пункт',
      '   - вложенный элемент',
      '   - ещё один элемент',
      '2. Второй пункт',
      '',
      '- [x] Локальный рендер',
      '- [x] Формулы',
      '- [ ] DOCX остаётся отдельной задачей',
      '',
      '## Ссылки и изображения',
      '',
      '[Ссылка с query](https://example.com/docs?q=markdown&mode=local "Пример ссылки")',
      '',
      '![Тестовая картинка-иконка](md.svg)',
      '',
      'Тест ссылки с якорем: [Перейти к Mermaid](#mermaid).',
      '',
      '## Таблица',
      '',
      '| Поле | Значение | Комментарий |',
      '|:--|--:|:--|',
      '| A | 10 | `code` внутри ячейки |',
      '| B | 20 | формула $a^2+b^2=c^2$ |',
      '| C | 30 | HTML `<mark>inline</mark>` |',
      '',
      '## Формулы',
      '',
      'Инлайн: $E = mc^2$, $\alpha + \beta \to \gamma$ и $\text{цена} = 5,$$.',
      '',
      'Блочная:',
      '',
      '$$',
      '\\int_0^1 x^2 \\, dx = \\frac{1}{3}',
      '$$',
      '',
      '\\begin{align}',
      ' a^2 + b^2 &= c^2 \\\\',
      ' e^{i\\pi} + 1 &= 0 \\\\',
      ' \\nabla \\cdot \\vec{E} &= \\frac{\\rho}{\\varepsilon_0}',
      '\\end{align}',
      '',
      '\\[',
      '\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}',
      '\\]',
      '',
      '## Код',
      '',
      'Инлайн-код: `const value = input ?? defaultValue;`',
      '',
      `${fence}ts`,
      'interface UserCard {',
      '  id: number;',
      '  name: string;',
      '  flags?: string[];',
      '}',
      '',
      'const data: UserCard = {',
      '  id: 7,',
      '  name: "Markdown ^ HTML",',
      '  flags: ["safe-clean", "local-only"]',
      '};',
      '',
      'console.log(data);',
      fence,
      '',
      '## Mermaid',
      '',
      `${fence}mermaid`,
      'flowchart TD',
      '    A[Исходный Markdown] --> B{Предочистка включена?}',
      '    B -- Да --> C[Markdown-safe очистка]',
      '    B -- Нет --> D[Прямой рендер]',
      '    C --> E[markdown-it]',
      '    D --> E',
      '    E --> F[KaTeX / Mermaid / highlight.js]',
      '    F --> G[HTML / Preview / PDF]',
      fence,
      '',
      '## ABC notation',
      '',
      `${fence}abc`,
      'X:1',
      'T:Scale',
      'M:4/4',
      'L:1/4',
      'K:C',
      'C D E F | G A B c |',
      fence,
      '',
      '## Raw HTML',
      '',
      '<details open>',
      '  <summary>HTML-блок</summary>',
      '  <p data-note="a — b">Этот блок не должен ломаться от предочистки.</p>',
      '</details>',
      '',
      '## Якорь и raw HTML',
      '',
      '<a id="sample-anchor" href="#sample-anchor">#sample-anchor</a>',
      '',
      'Локальный якорь для проверки ссылок внутри документа.'
    ].join('\n');
  }

  async function loadComplexSampleMarkdown(lang = getLanguage()) {
    const sampleLang = lang === 'ru' ? 'ru' : 'en';
    if (renderState.sampleMarkdownByLang[sampleLang]) return renderState.sampleMarkdownByLang[sampleLang];
    try {
      const response = await fetch(`${getSamplePath(sampleLang)}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = normalizeInput(await response.text());
      if (text.trim()) {
        renderState.sampleMarkdownByLang[sampleLang] = text;
        return renderState.sampleMarkdownByLang[sampleLang];
      }
    } catch {}

    renderState.sampleMarkdownByLang[sampleLang] = getComplexSampleMarkdown(sampleLang);
    return renderState.sampleMarkdownByLang[sampleLang];
  }

  async function maybeLoadComplexSample() {
    const sample = await loadComplexSampleMarkdown();
    if (els.mdIn.value.trim() && normalizeInput(els.mdIn.value).trim() !== normalizeInput(sample).trim()) {
      const ok = window.confirm(t('confirm.replaceSample'));
      if (!ok) return;
    }
    els.mdIn.value = sample;
    localStorage.removeItem(STORAGE_KEY);
    void render();
  }

  async function loadDraft() {
    const sample = await loadComplexSampleMarkdown();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (typeof saved.markdown === 'string' && saved.markdown.trim()) {
        const normalizedSaved = normalizeInput(saved.markdown).trim();
        const normalizedSample = normalizeInput(sample).trim();
        if (normalizedSaved !== normalizedSample && !isLikelyBuiltInSample(normalizedSaved)) {
          els.mdIn.value = saved.markdown;
          return;
        }
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}

    els.mdIn.value = sample;
  }

  function loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      const merged = { ...defaultSettings, ...raw };
      if (raw.languageExplicit !== true) {
        merged.language = getInitialLanguage();
        merged.languageExplicit = false;
      }
      return merged;
    } catch {
      return { ...defaultSettings };
    }
  }

  function persistSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function applyTheme() {
    root.dataset.theme = settings.theme;
    els.buttons.theme.textContent = settings.theme === 'light' ? t('btn.themeDark') : t('btn.themeLight');
  }

  function applyView() {
    els.workspace.dataset.mode = settings.view;
    els.viewButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === settings.view));
  }

  function openMenu() {
    if (!els.menu.panel || !els.menu.overlay) return;
    document.body.classList.add('menu-open');
    els.menu.overlay.hidden = false;
    els.menu.panel.removeAttribute('inert');
    els.menu.panel.setAttribute('aria-hidden', 'false');
    els.menu.toggle?.setAttribute('aria-expanded', 'true');
  }

  function closeMenu({ returnFocus = true } = {}) {
    if (!els.menu.panel || !els.menu.overlay) return;

    if (els.menu.panel.contains(document.activeElement)) {
      if (returnFocus && els.menu.toggle) {
        els.menu.toggle.focus({ preventScroll: true });
      } else {
        document.activeElement.blur();
      }
    }

    document.body.classList.remove('menu-open');
    els.menu.overlay.hidden = true;
    els.menu.panel.setAttribute('inert', '');
    els.menu.panel.setAttribute('aria-hidden', 'true');
    els.menu.toggle?.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    if (document.body.classList.contains('menu-open')) {
      closeMenu();
      return;
    }
    openMenu();
  }

  function applyToggles() {
    els.buttons.live.classList.toggle('active', settings.live);
    els.buttons.sync.classList.toggle('active', settings.sync);
    els.buttons.lineNumbers.classList.toggle('active', settings.lineNumbers);
    applyCleanerControls();
  }

  function scheduleRender() {
    if (!settings.live) return;
    clearTimeout(renderState.timer);
    renderState.timer = setTimeout(() => void render(), 220);
  }

  async function importFile(file) {
    if (!file) return;
    const text = await file.text();
    els.mdIn.value = text;
    await render();
  }

  function getStyleText(id) {
    const node = document.getElementById(id);
    if (node && node.tagName === 'STYLE') return (node.textContent || '').trim();
    return readExternalStyleSection(id);
  }

  function getDocumentBaseCss() {
    return ":root {\n  --doc-bg: #ffffff;\n  --doc-text: #111827;\n  --doc-muted: #4b5563;\n  --doc-border: #d1d5db;\n  --doc-soft-border: #e5e7eb;\n  --doc-code-bg: #f3f4f6;\n  --doc-accent: #2563eb;\n  --doc-accent-soft: rgba(37, 99, 235, 0.08);\n  --doc-tip: #059669;\n  --doc-important: #7c3aed;\n  --doc-warning: #d97706;\n  --doc-caution: #dc2626;\n  color-scheme: light;\n}\n\n* { box-sizing: border-box; }\nhtml, body { margin: 0; padding: 0; background: var(--doc-bg); color: var(--doc-text); }\nbody {\n  padding: 32px;\n  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Arial, sans-serif;\n  font-size: 16px;\n  line-height: 1.6;\n}\n.export-doc { max-width: 960px; margin: 0 auto; }\n.viewer-inner { max-width: none; margin: 0; color: var(--doc-text); background: var(--doc-bg); }\n.viewer-inner > *:first-child { margin-top: 0; }\n.viewer-inner > *:last-child { margin-bottom: 0; }\n.viewer-inner h1,\n.viewer-inner h2,\n.viewer-inner h3,\n.viewer-inner h4,\n.viewer-inner h5,\n.viewer-inner h6 {\n  line-height: 1.2;\n  margin: 1.35em 0 0.7em;\n  color: var(--doc-text);\n}\n.viewer-inner h1 { font-size: 2.25rem; }\n.viewer-inner h2 { font-size: 1.8rem; padding-bottom: 0.25em; border-bottom: 1px solid var(--doc-soft-border); }\n.viewer-inner h3 { font-size: 1.35rem; }\n.viewer-inner h4 { font-size: 1.15rem; }\n.viewer-inner p { margin: 0 0 1em; overflow-wrap: anywhere; }\n.viewer-inner a { color: var(--doc-accent); text-decoration: underline; }\n.viewer-inner ul,\n.viewer-inner ol { padding-left: 1.45em; margin: 0 0 1em; }\n.viewer-inner li { margin: 0.2em 0; }\n.viewer-inner hr { border: 0; border-top: 1px solid var(--doc-border); margin: 1.6em 0; height: 0; }\n.viewer-inner blockquote {\n  margin: 1.2em 0;\n  padding: 0.8em 1em;\n  border-left: 4px solid var(--doc-accent);\n  background: var(--doc-accent-soft);\n  color: var(--doc-text);\n  border-radius: 0 10px 10px 0;\n}\n.viewer-inner blockquote > :last-child { margin-bottom: 0; }\n.viewer-inner table {\n  width: 100%;\n  border-collapse: collapse;\n  margin: 1.2em 0;\n  font-size: 0.96em;\n}\n.viewer-inner th,\n.viewer-inner td {\n  border: 1px solid var(--doc-border);\n  padding: 0.6em 0.75em;\n  vertical-align: top;\n}\n.viewer-inner thead th,\n.viewer-inner th { background: #eef2ff; font-weight: 700; }\n.viewer-inner tr:nth-child(even) td { background: #f9fafb; }\n.viewer-inner img,\n.viewer-inner svg { max-width: 100%; height: auto; }\n.viewer-inner code:not(pre code) {\n  background: var(--doc-code-bg);\n  color: var(--doc-text);\n  padding: 0.12em 0.36em;\n  border-radius: 6px;\n  font-size: 0.92em;\n}\n.viewer-inner pre {\n  margin: 1.2em 0;\n  overflow: auto;\n  border-radius: 12px;\n  border: 1px solid var(--doc-soft-border);\n  background: var(--doc-code-bg);\n}\n.viewer-inner pre code {\n  display: block;\n  padding: 1em;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n.viewer-inner pre.has-line-numbers { padding: 0; }\n.viewer-inner pre.has-line-numbers table { width: 100%; border-collapse: collapse; margin: 0; }\n.viewer-inner pre.has-line-numbers td { border: 0; background: transparent; vertical-align: top; }\n.viewer-inner pre.has-line-numbers .hljs-ln-code { white-space: pre; overflow-wrap: normal; padding: 0 1em 0 0.75em !important; }\n.viewer-inner pre.has-line-numbers .hljs-ln-numbers { user-select: none; text-align: right; color: #6b7280; border-right: 1px solid var(--doc-soft-border); padding: 0 0.65em 0 1em !important; }\n.viewer-inner .diagram-shell,\n.viewer-inner .math-shell,\n.viewer-inner .abcjs-wrap {\n  margin: 1.2em 0;\n  border: 1px solid var(--doc-soft-border);\n  border-radius: 12px;\n  background: #ffffff;\n  padding: 0.9em;\n  overflow: auto;\n}\n.viewer-inner .diagram-shell > svg,\n.viewer-inner .abcjs-wrap svg { max-width: 100% !important; height: auto !important; }\n.viewer-inner .math-shell { text-align: center; }\n.viewer-inner .math-error,\n.viewer-inner .diagram-error {\n  border: 1px solid #fecaca;\n  background: #fef2f2;\n  color: var(--doc-text);\n}\n.viewer-inner .task-list-item { list-style: none; }\n.viewer-inner .task-list-item input { margin-right: 0.5em; }\n.viewer-inner .task-list { padding-left: 0; }\n.viewer-inner .color-model-list {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 0.45em;\n  margin: 1em 0;\n}\n.viewer-inner .color-model-item { line-height: 1.4; }\n.viewer-inner .color-model-code {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.42em;\n  white-space: nowrap;\n}\n.viewer-inner .color-model-swatch {\n  display: inline-block;\n  width: 0.95em;\n  height: 0.95em;\n  flex: 0 0 auto;\n  overflow: visible;\n  border: 0;\n  border-radius: 0;\n  box-shadow: none;\n}\n.viewer-inner .markdown-alert {\n  margin: 1rem 0;\n  padding: 0.9rem 1rem;\n  border: 1px solid var(--doc-soft-border);\n  border-left: 4px solid var(--doc-accent);\n  border-radius: 10px;\n  background: var(--doc-accent-soft);\n}\n.viewer-inner .markdown-alert-title { margin: 0 0 0.45rem; font-weight: 800; letter-spacing: 0.02em; }\n.viewer-inner .markdown-alert > :last-child { margin-bottom: 0; }\n.viewer-inner .markdown-alert-note { border-left-color: var(--doc-accent); }\n.viewer-inner .markdown-alert-tip { border-left-color: var(--doc-tip); }\n.viewer-inner .markdown-alert-important { border-left-color: var(--doc-important); }\n.viewer-inner .markdown-alert-warning { border-left-color: var(--doc-warning); }\n.viewer-inner .markdown-alert-caution { border-left-color: var(--doc-caution); }\n.viewer-inner .footnotes { margin-top: 2rem; font-size: 0.92em; color: var(--doc-muted); }\n.viewer-inner .footnotes ol { padding-left: 1.4rem; }\n.viewer-inner .footnote-ref { font-size: 0.78em; }\n.viewer-inner .footnote-backref { margin-left: 0.35rem; text-decoration: none; }\n@media print {\n  body { padding: 0; }\n  .viewer-inner pre,\n  .viewer-inner table,\n  .viewer-inner blockquote,\n  .viewer-inner .diagram-shell,\n  .viewer-inner .math-shell,\n  .viewer-inner .abcjs-wrap { break-inside: avoid; page-break-inside: avoid; }\n}";
  }

  function buildDocumentCss() {
    return [
      getStyleText('highlight-style'),
      getStyleText('katex-style'),
      getDocumentBaseCss()
    ].filter(Boolean).join('\n\n').trim();
  }

  function buildStandaloneHtml() {
    const cleanHtml = renderState.lastRenderedHtml || getCleanPreviewHtml();
    const documentCss = renderState.lastDocumentCss || buildDocumentCss();

    return '<!DOCTYPE html>\n' +
      `<html lang="${getLanguage()}">\n` +
      '<head>\n' +
      '<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      `<title>${escapeHtml(t('export.title'))}</title>\n` +
      '<style>\n' + documentCss + '\n</style>\n' +
      '</head>\n' +
      '<body>\n' +
      '<div class="export-doc">\n' +
      '  <div class="viewer-inner">' + cleanHtml + '</div>\n' +
      '</div>\n' +
      '</body>\n' +
      '</html>';
  }

  function buildPrintHtml() {
    const katexCss = getStyleText('katex-style');
    const highlightCss = getStyleText('highlight-style');
    const cleanHtml = getCleanPreviewHtml();
    const printCss = `
      @page { size: A4; margin: 14mm; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      html, body { margin: 0; padding: 0; background: #ffffff; color: #111827; }
      body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12pt; line-height: 1.55; }
      .print-doc { width: 100%; max-width: none; margin: 0; padding: 0; background: #ffffff; color: #111827; }
      .viewer-inner { max-width: none; margin: 0; padding: 0; color: #111827; background: #ffffff; }
      .viewer-inner > :first-child { margin-top: 0; }
      .viewer-inner h1, .viewer-inner h2, .viewer-inner h3, .viewer-inner h4 { color: #111827; break-after: avoid; page-break-after: avoid; }
      .viewer-inner h1 { font-size: 24pt; margin: 0 0 12pt; }
      .viewer-inner h2 { font-size: 20pt; margin: 20pt 0 10pt; border-bottom: 1px solid #d8dee9; padding-bottom: 4pt; }
      .viewer-inner h3 { font-size: 16pt; margin: 16pt 0 8pt; }
      .viewer-inner p, .viewer-inner li { color: #111827; }
      .viewer-inner a { color: #1d4ed8; text-decoration: underline; }
      .viewer-inner img, .viewer-inner svg { max-width: 100%; height: auto; }
      .viewer-inner table { width: 100%; border-collapse: collapse; margin: 12pt 0; break-inside: avoid; page-break-inside: avoid; }
      .viewer-inner th, .viewer-inner td { border: 1px solid #d1d5db; padding: 7pt 8pt; vertical-align: top; }
      .viewer-inner th { background: #f1f5f9; font-weight: 700; }
      .viewer-inner blockquote { margin: 12pt 0; padding: 8pt 10pt; border-left: 4px solid #60a5fa; background: #eff6ff; color: #1f2937; }
      .viewer-inner code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 0.92em; background: #f3f4f6; color: #111827; padding: 0.12em 0.32em; border-radius: 4px; }
      .viewer-inner pre { margin: 12pt 0; padding: 10pt; background: #f8fafc; border: 1px solid #d1d5db; border-radius: 8px; overflow: visible; white-space: pre-wrap; break-inside: avoid; page-break-inside: avoid; }
      .viewer-inner pre code { display: block; padding: 0; background: transparent; white-space: pre-wrap; color: #111827; }
      .viewer-inner .diagram-shell, .viewer-inner .math-shell, .viewer-inner .abcjs-wrap { margin: 12pt 0; padding: 10pt; background: #ffffff; color: #111827; border: 1px solid #d1d5db; border-radius: 10px; break-inside: avoid; page-break-inside: avoid; }
      .viewer-inner .katex, .viewer-inner .katex * { color: #111827 !important; }
      .viewer-inner .katex svg { fill: currentColor !important; stroke: currentColor !important; }
      .viewer-inner .katex-display { margin: 10pt 0; overflow: visible; }
      .viewer-inner .hljs { background: transparent; color: #111827; }
      .viewer-inner .hljs-ln-numbers { display: none !important; }
      .viewer-inner .katex-mathml { display: none !important; }
      .viewer-inner .mermaid, .viewer-inner .abcjs-container { max-width: 100%; overflow: visible; }
      .viewer-inner hr { border: 0; border-top: 1px solid #d1d5db; margin: 16pt 0; }
      .viewer-inner .line-numbers, .viewer-inner .toolbar, .viewer-inner .control-menu, .viewer-inner .menu-overlay { display: none !important; }
    `;

    return `<!DOCTYPE html>
<html lang="${getLanguage()}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(t('print.title'))}</title>
<style>
${highlightCss}\n${katexCss}\n${printCss}
</style>
</head>
<body>
<main class="print-doc">
  <div class="viewer-inner">${cleanHtml}</div>
</main>
</body>
</html>`;
  }

  function waitForPrintAssets(doc) {
    const imagePromises = [...doc.images].map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    const fontPromise = doc.fonts?.ready?.catch?.(() => undefined) || Promise.resolve();
    return Promise.all([fontPromise, ...imagePromises, new Promise((resolve) => setTimeout(resolve, 160))]);
  }

  async function printIsolatedPreview() {
    const frame = document.createElement('iframe');
    frame.setAttribute('title', 'Markdown print preview');
    frame.setAttribute('aria-hidden', 'true');
    Object.assign(frame.style, {
      position: 'fixed',
      left: '-10000px',
      top: '0',
      width: '794px',
      height: '1123px',
      border: '0',
      opacity: '0',
      pointerEvents: 'none'
    });

    document.body.append(frame);

    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    if (!doc || !win) {
      frame.remove();
      throw new Error(t('error.printDocument'));
    }

    doc.open();
    doc.write(buildPrintHtml());
    doc.close();

    await waitForPrintAssets(doc);

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      setTimeout(() => frame.remove(), 600);
    };

    win.addEventListener('afterprint', cleanup, { once: true });
    win.focus();
    win.print();
    setTimeout(cleanup, 5000);
  }

  async function copyHtml() {
    await navigator.clipboard.writeText(renderState.lastRenderedHtml || els.raw.value || '');
    setStatus(t('status.htmlCopied'), 'ok');
  }

  async function copyRenderedText() {
    await navigator.clipboard.writeText(getRenderedText());
    setStatus(t('status.textCopied'), 'ok');
  }

  async function copyRich() {
    const html = `<div class="viewer-inner">${renderState.lastRenderedHtml}</div>`;
    const text = getRenderedText();

    if (navigator.clipboard?.write && window.ClipboardItem) {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' })
      });
      await navigator.clipboard.write([item]);
      setStatus(t('status.richCopied'), 'ok');
      return;
    }

    await navigator.clipboard.writeText(text);
    setStatus(t('status.textFallbackCopied'), 'warn');
  }

  async function restorePrintTheme() {
    // Печать теперь выполняется в изолированном iframe, поэтому тему основной страницы восстанавливать не нужно.
    if (!renderState.printRestoreTheme) return;

    const nextTheme = renderState.printRestoreTheme;
    renderState.printRestoreTheme = null;
    settings.theme = nextTheme;
    applyTheme();
  }

  function waitForPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  }

  function printCurrentPreviewOnly() {
    let cleaned = false;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      document.body.classList.remove('print-preview-only');
      window.removeEventListener('afterprint', cleanup);
    };

    document.body.classList.add('print-preview-only');
    window.addEventListener('afterprint', cleanup, { once: true });

    try {
      window.focus();
      window.print();
    } finally {
      setTimeout(cleanup, 2500);
    }
  }

  async function handlePrint() {
    try {
      if (document.body.classList.contains('menu-open')) {
        closeMenu();
        await waitForPaint();
      }

      await render();
      await waitForPaint();
      printCurrentPreviewOnly();
      setStatus(t('status.printSent'), 'ok');
    } catch (err) {
      document.body.classList.remove('print-preview-only');
      reportError('PDF / печать', err);
      setStatus(t('status.printFailed'), 'err');
    }
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function bindEmojiMapEvents() {
    window.addEventListener('md-emoji-map-ready', (event) => {
      const count = Number(event.detail?.count || Object.keys(window.MD_EMOJI_MAP || {}).length || 0);
      if (count > 0) {
        setStatus(t('status.emojiLoaded', { count }), 'ok');
      }
      if (md && els.previewInner) {
        void render();
      }
    });

    window.addEventListener('md-emoji-map-error', (event) => {
      const message = event.detail?.message || 'could not load external emoji dictionary';
      renderState.errors.push('Emoji: ' + message);
      updateErrors();
      setStatus(t('status.emojiFallback'), 'warn');
    });
  }

  function bindEvents() {
    bindEmojiMapEvents();

    els.mdIn.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        els.mdIn.setRangeText('    ', els.mdIn.selectionStart, els.mdIn.selectionEnd, 'end');
        scheduleRender();
      }
    });

    els.mdIn.addEventListener('input', scheduleRender);

    els.menu.toggle?.addEventListener('click', toggleMenu);
    els.menu.close?.addEventListener('click', closeMenu);
    els.menu.overlay?.addEventListener('click', closeMenu);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        closeMenu();
      }
    });

    els.buttons.convert.addEventListener('click', () => void render());
    els.buttons.paste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        els.mdIn.setRangeText(text, els.mdIn.selectionStart, els.mdIn.selectionEnd, 'end');
        await render();
      } catch {
        setStatus(t('status.clipboardReadFailed'), 'error');
      }
    });

    els.buttons.clear.addEventListener('click', () => {
      els.mdIn.value = '';
      els.raw.value = '';
      if (els.css) els.css.value = '';
      els.previewInner.innerHTML = '';
      renderState.lastRenderedHtml = '';
      renderState.lastDocumentCss = '';
      renderState.lastStandaloneHtml = '';
      updateMetrics();
      persistDraft();
      setStatus(t('status.cleared'), 'ok');
    });

    els.buttons.import.addEventListener('click', () => els.fileInput.click());
    els.fileInput.addEventListener('change', async (e) => {
      await importFile(e.target.files?.[0]);
      e.target.value = '';
    });

    els.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.dropzone.classList.add('is-over');
    });
    ['dragleave', 'dragend'].forEach((eventName) => {
      els.dropzone.addEventListener(eventName, () => els.dropzone.classList.remove('is-over'));
    });
    els.dropzone.addEventListener('drop', async (e) => {
      e.preventDefault();
      els.dropzone.classList.remove('is-over');
      const file = e.dataTransfer?.files?.[0];
      if (file) await importFile(file);
    });

    els.buttons.sync.addEventListener('click', () => {
      settings.sync = !settings.sync;
      persistSettings();
      applyToggles();
    });

    els.buttons.live.addEventListener('click', () => {
      settings.live = !settings.live;
      persistSettings();
      applyToggles();
      if (settings.live) scheduleRender();
    });

    els.buttons.lineNumbers.addEventListener('click', async () => {
      settings.lineNumbers = !settings.lineNumbers;
      persistSettings();
      applyToggles();
      await render();
      setStatus(settings.lineNumbers ? t('status.lineNumbersOn') : t('status.lineNumbersOff'), 'ok');
    });

    els.buttons.theme.addEventListener('click', async () => {
      settings.theme = settings.theme === 'light' ? 'dark' : 'light';
      persistSettings();
      applyTheme();
      await render();
    });

    els.languageSelect?.addEventListener('change', async () => {
      const previousLanguage = getLanguage();
      const editorWasSample = isCurrentEditorSample();
      settings.language = els.languageSelect.value === 'ru' ? 'ru' : 'en';
      settings.languageExplicit = true;
      persistSettings();
      applyLanguage();
      if (editorWasSample || !els.mdIn.value.trim()) {
        els.mdIn.value = await loadComplexSampleMarkdown(getLanguage());
        localStorage.removeItem(STORAGE_KEY);
      } else if (previousLanguage !== getLanguage()) {
        renderState.lastStandaloneHtml = buildStandaloneHtml();
      }
      await render();
    });

    els.buttons.preclean.addEventListener('click', () => {
      updatePrecleanOption('enabled', !settings.precleanEnabled);
      setStatus(settings.precleanEnabled ? t('status.precleanOn') : t('status.precleanOff'), 'ok');
    });

    els.buttons.sample.addEventListener('click', () => {
      void maybeLoadComplexSample();
    });

    Object.entries(els.cleanOptions).forEach(([key, input]) => {
      if (!input) return;
      input.addEventListener('change', () => {
        updatePrecleanOption(key, input.checked);
      });
    });

    els.buttons.copyHtml.addEventListener('click', () => void copyHtml());
    els.buttons.copyText.addEventListener('click', () => void copyRenderedText());
    els.buttons.copyRich.addEventListener('click', () => void copyRich());
    els.buttons.downloadHtml.addEventListener('click', () => downloadFile('markdown-export.html', renderState.lastStandaloneHtml, 'text/html;charset=utf-8'));
    els.buttons.downloadMd.addEventListener('click', () => downloadFile('document.md', els.mdIn.value, 'text/markdown;charset=utf-8'));
    els.buttons.downloadDocx.addEventListener('click', () => void downloadDocx());
    els.buttons.print.addEventListener('click', () => void handlePrint());

    window.addEventListener('afterprint', () => { void restorePrintTheme(); });

    els.viewButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        settings.view = btn.dataset.view;
        persistSettings();
        applyView();
      });
    });

    linkScroll(els.mdIn, [els.raw, els.preview]);
    linkScroll(els.raw, [els.mdIn, els.preview]);
    linkScroll(els.preview, [els.mdIn, els.raw]);
  }

  function linkScroll(source, targets) {
    source.addEventListener('scroll', () => {
      if (!settings.sync) return;
      const max = source.scrollHeight - source.clientHeight || 1;
      const ratio = source.scrollTop / max;
      targets.forEach((target) => {
        const targetMax = target.scrollHeight - target.clientHeight;
        target.scrollTop = ratio * targetMax;
      });
    }, { passive: true });
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function init() {
    applyLanguage();
    applyView();
    applyToggles();
    initMarkdown();
    await loadDraft();
    updateMetrics();
    bindEvents();
    await ensureStylesheetReady();
    void render();
  }

  window.addEventListener('DOMContentLoaded', () => { void init(); });
})();
