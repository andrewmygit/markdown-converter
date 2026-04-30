# Markdown Converter

Live demo: https://andrewmygit.github.io/markdown-converter/

Static browser-based Markdown converter with preview, HTML export, PDF export, KaTeX, Mermaid, ABC notation, syntax highlighting, emoji support, and bilingual English/Russian UI.

## Features

- Markdown to HTML preview
- HTML export with document styles
- PDF export through browser print/rendering
- KaTeX formula rendering
- Mermaid diagram rendering
- ABC notation rendering
- Syntax highlighting
- Emoji shortcode support
- English/Russian UI
- Browser-language based UI selection
- Static deployment

## DOCX status

DOCX export is currently disabled.

The previous browser-side DOCX export requires additional work before it can be considered reliable. Known problem areas include formulas, Mermaid diagrams, ABC notation, SVG conversion, complex HTML blocks and external images.

DOCX support may return later as an experimental or server-assisted feature.

## Privacy

The app runs fully in the browser. Markdown input is processed locally on the user's device and is not sent to a server by this project.

External images, links, badges, videos, fonts or other remote resources referenced inside Markdown may still be requested by the browser from their original third-party hosts.

## Known limitations

- DOCX export is disabled and requires further development.
- PDF export depends on the browser's print/rendering engine.
- Some external images may fail to load because of CORS, hotlinking protection, expired links or unavailable remote resources.
- Complex SVG, Mermaid diagrams, ABC notation and formulas may render differently across browsers and export formats.
- GitHub Pages does not use `.htaccess`. The included `.htaccess` file is only relevant for Apache static hosting.

## Project structure

```text
.
├── index.html
├── .htaccess
├── md.svg
├── assets/
│   ├── app.css
│   ├── app.js
│   └── emoji-loader.js
├── examples/
│   ├── complex-markdown-sample.en.md
│   └── complex-markdown-sample.ru.md
└── js/
    ├── abcjs-basic.min.js
    ├── auto-render.min.js
    ├── highlight-all.min.js
    ├── katex.min.js
    ├── latex.min.js
    ├── markdown-it-all.min.js
    ├── mermaid.min.js
    └── purify.min.js
