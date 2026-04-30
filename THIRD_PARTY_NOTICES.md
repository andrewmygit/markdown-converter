# Third-party notices

This project bundles and uses third-party browser-side software.

The GNU General Public License v3.0 license of this project applies to the project-specific source code. Third-party components retain their original licenses, copyright notices and disclaimers.

This file summarizes third-party components used by the project and records the license basis for each of them.

## Bundled runtime files

| Bundled file | Component | License | Notes |
|---|---|---|---|
| `js/markdown-it-all.min.js` | markdown-it bundle and related Markdown parser components | MIT-compatible notices required | The file is a bundled/minified Markdown parser build. The exact bundle composition should be recorded if this file is rebuilt or replaced. |
| `js/highlight-all.min.js` | highlight.js | BSD-3-Clause | The bundled file contains a Highlight.js license banner. |
| `js/latex.min.js` | Highlight.js LaTeX grammar | BSD-3-Clause | This is a Highlight.js grammar file, not LaTeX.js. |
| `js/katex.min.js` | KaTeX | MIT | Used for formula rendering. |
| `js/auto-render.min.js` | KaTeX auto-render extension | MIT | Used together with KaTeX. |
| `js/mermaid.min.js` | Mermaid | MIT | Used for Mermaid diagram rendering. |
| `js/abcjs-basic.min.js` | abcjs | MIT | Used for ABC notation rendering. |
| `js/purify.min.js` | DOMPurify | Apache-2.0 or MPL-2.0 | This project treats DOMPurify as used under the Apache License 2.0 path. |

## Runtime external data

| Project file | External resource | License / notice status | Notes |
|---|---|---|---|
| `assets/emoji-loader.js` | GitHub gemoji emoji database | MIT, according to the upstream gemoji project | The emoji JSON is loaded at runtime from the upstream GitHub gemoji repository. It is not bundled as a static file in this repository. |

## Component notices

### markdown-it

Bundled file:

- `js/markdown-it-all.min.js`

Upstream project:

- https://github.com/markdown-it/markdown-it

License:

- MIT

Copyright notice from upstream markdown-it:

- Copyright (c) 2014 Vitaly Puzrin, Alex Kocharin.

MIT license condition:

- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

Maintainer note:

- The current bundled file name indicates a combined markdown-it build. If this bundle is rebuilt, replaced, or expanded with additional markdown-it plugins, update this file with the exact plugin list, upstream repositories, copyright notices, and licenses.

### highlight.js

Bundled files:

- `js/highlight-all.min.js`
- `js/latex.min.js`

Upstream project:

- https://github.com/highlightjs/highlight.js

License:

- BSD-3-Clause

Bundled banner in `js/highlight-all.min.js`:

- Highlight.js v11.9.0 (git: f47103d4f1) (c) 2006-2023 undefined and other contributors License: BSD-3-Clause

Bundled banner in `js/latex.min.js`:

- `latex` grammar compiled for Highlight.js 11.11.0

BSD-3-Clause notice summary:

- Redistributions of source code must retain the copyright notice, conditions and disclaimer.
- Redistributions in binary form must reproduce the copyright notice, conditions and disclaimer in the documentation and/or other materials provided with the distribution.
- The names of the copyright holder and contributors may not be used to endorse or promote derived products without prior written permission.

### KaTeX

Bundled files:

- `js/katex.min.js`
- `js/auto-render.min.js`

Upstream project:

- https://github.com/KaTeX/KaTeX

License:

- MIT

Copyright notice from upstream KaTeX:

- Copyright (c) 2013-2020 Khan Academy and other contributors

MIT license condition:

- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

### Mermaid

Bundled file:

- `js/mermaid.min.js`

Upstream project:

- https://github.com/mermaid-js/mermaid

License:

- MIT

Copyright notice from upstream Mermaid:

- Copyright (c) 2014 - 2022 Knut Sveidqvist

MIT license condition:

- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

### abcjs

Bundled file:

- `js/abcjs-basic.min.js`

Upstream project:

- https://github.com/paulrosen/abcjs

License:

- MIT

Bundled file source note:

- Original file: `/npm/abcjs@6.2.3/dist/abcjs-basic.js`

Copyright notice found in the bundled file:

- Copyright (c) 2009-2023 Paul Rosen and Gregory Dyke

MIT license condition:

- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

### DOMPurify

Bundled file:

- `js/purify.min.js`

Upstream project:

- https://github.com/cure53/DOMPurify

License:

- Apache License 2.0 or Mozilla Public License 2.0

This project treats DOMPurify as used under:

- Apache License 2.0

Copyright notice from upstream DOMPurify:

- DOMPurify Copyright 2025 Dr.-Ing. Mario Heiderich, Cure53

Apache-2.0 redistribution requirements include:

- You must give any other recipients of the Work or Derivative Works a copy of this License.
- You must retain copyright, patent, trademark, and attribution notices from the Source form of the Work, excluding notices that do not pertain to any part of the Derivative Works.
- If the Work includes a NOTICE text file, attribution notices from that NOTICE file must be included as required by the Apache License 2.0.

Maintainer note:

- If DOMPurify is updated, replaced, or redistributed in another packaged form, check whether the upstream package contains a NOTICE file and preserve it if required.

### GitHub gemoji

Project file:

- `assets/emoji-loader.js`

External runtime resource:

- https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json

Upstream project:

- https://github.com/github/gemoji

License:

- MIT

Notice:

- The gemoji database is loaded at runtime and is not bundled as a static file in this repository. If the emoji database is bundled in the future, preserve the upstream license and copyright notice in this file or in a dedicated third-party license file.

## License text references

The repository contains the main project license in:

- `LICENSE`

That file covers the project-specific source code under GNU GPL v3.0 only.

The third-party components listed above retain their own licenses. Their upstream license texts should be checked when updating bundled files.

Recommended upstream license references:

- markdown-it: https://github.com/markdown-it/markdown-it/blob/master/LICENSE
- highlight.js: https://github.com/highlightjs/highlight.js/blob/main/LICENSE
- KaTeX: https://github.com/KaTeX/KaTeX/blob/main/LICENSE
- Mermaid: https://github.com/mermaid-js/mermaid/blob/develop/LICENSE
- abcjs: https://github.com/paulrosen/abcjs/blob/main/LICENSE.md
- DOMPurify: https://github.com/cure53/DOMPurify/blob/main/LICENSE
- gemoji: https://github.com/github/gemoji/blob/master/LICENSE

## Maintainer checklist

When updating bundled third-party files:

1. Keep upstream copyright and license comments when available.
2. Update this file if a library, version, bundled file, source URL, license, or copyright notice changes.
3. Do not assume that a minified file may be redistributed without preserving its license notice.
4. If a custom bundle is created, record the exact upstream packages included in the bundle.
5. If a third-party package contains a separate `NOTICE` file, preserve it when the license requires it.
6. Do not describe `js/latex.min.js` as LaTeX.js. It is a Highlight.js LaTeX grammar file.
