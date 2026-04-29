# Markdown → HTML — упорядоченный комплексный тест

Этот файл предназначен для проверки локального Markdown-конвертера: предпросмотр, PDF, HTML, TXT-экспорт ~~и DOCX-экспорт~~. Пример объединяет базовый Markdown, GFM-расширения, raw HTML, формулы, диаграммы, ноты, изображения, таблицы, код и GitHub-специфичные элементы. Блоки сгруппированы по функциональности.

<a name="top"></a>

## Содержание

- [Предочистка и специальные символы](#предочистка-и-специальные-символы)
- [Заголовки и горизонтальные линии](#заголовки-и-горизонтальные-линии)
- [Текстовые стили](#текстовые-стили)
- [Ссылки, якоря и автоссылки](#ссылки-якоря-и-автоссылки)
- [Изображения, бейджи и видео-превью](#изображения-бейджи-и-видео-превью)
- [Списки](#списки)
- [Цитаты и GitHub alerts](#цитаты-и-github-alerts)
- [Таблицы](#таблицы)
- [Код и подсветка синтаксиса](#код-и-подсветка-синтаксиса)
- [Формулы](#формулы)
- [Диаграммы Mermaid](#диаграммы-mermaid)
- [ABC notation](#abc-notation)
- [Raw HTML и встроенные компоненты](#raw-html-и-встроенные-компоненты)
- [GitHub-специфичные элементы](#github-специфичные-элементы)
- [Разное](#разное)
- [Внешние справочные ссылки](#внешние-справочные-ссылки)

---

## Предочистка и специальные символы

Проверка типографики: «ёлочки» должны сохраняться, а “английские фигурные кавычки” при включённой очистке должны превращаться в обычные "прямые кавычки".

NBSP и узкий NBSP: 10 000 и 10 000.

Экранированный символ: \#не-заголовок.

Символ `^` в обычном тексте: ^caret^.

Символ `^` в формуле: $x^2 + y^2 = z^2$.

Символ `^` в коде: `^caret^`.

Текст с несколькими   пробелами в обычной строке — можно проверить опцию схлопывания.

Жёсткий перенос через два пробела:  
эта строка должна начаться с новой строки.

Перенос через обратный слеш:\
эта строка тоже должна начаться с новой строки.

HTML-комментарий `<!-- Комментарий для проверки обработки HTML comments. -->` ниже не должен отображаться в предпросмотре.

<!--
Комментарий для проверки обработки HTML comments.
-->

---

## Заголовки и горизонтальные линии

### Markdown-заголовки

```md
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

### Setext-заголовки

```md
Alt-H1
======

Alt-H2
------
```

Alt-H1
======

Alt-H2
------

### HTML-заголовки

```html
<h1>HTML Heading 1</h1>
<h2>HTML Heading 2</h2>
<h3 align="center">Centered HTML Heading 3</h3>
```

<h1>HTML Heading 1</h1>
<h2>HTML Heading 2</h2>
<h3 align="center">Centered HTML Heading 3</h3>

### Горизонтальные линии

```md
---
***
___
```

Hyphens:

---

Asterisks:

***

Underscores:

___

---

## Текстовые стили

### Базовое форматирование

```md
Normal text.
*Italic with asterisks* and _italic with underscores_.
**Bold with asterisks** and __bold with underscores__.
***Bold italic*** and **bold with _nested italic_**.
~~Strikethrough~~.
```

Normal text.

*Italic with asterisks* and _italic with underscores_.

**Bold with asterisks** and __bold with underscores__.

***Bold italic*** and **bold with _nested italic_**.

~~Strikethrough~~.

### HTML-стили текста

```html
<strong>Strong HTML</strong>
<em>Emphasis HTML</em>
<ins>Underlined text</ins>
<samp>Monospaced sample</samp>
<sub>subscript</sub> and <sup>superscript</sup>
```

<strong>Strong HTML</strong>

<em>Emphasis HTML</em>

<ins>Underlined text</ins>

<samp>Monospaced sample</samp>

log<sub>2</sub>(x), 2<sup>53</sup> and small text: <sup><sub>The quick brown fox jumps over the lazy dog.</sub></sup>

### Кнопки и клавиши

```html
<kbd>command + B</kbd>
<kbd>control + I</kbd>
<kbd>cmd + shift + p</kbd>
```

<kbd>command + B</kbd>, <kbd>control + I</kbd>, <kbd>cmd + shift + p</kbd>

[<kbd>Markdown-Cheatsheet</kbd>](https://github.com/lifeparticle/Markdown-Cheatsheet)

<kbd> <br> [Markdown-Cheatsheet](https://github.com/lifeparticle/Markdown-Cheatsheet) ↗️ <br> </kbd>

### Экранирование Markdown-символов

```md
\* Asterisk
\\ Backslash
\` Backtick
\{} Curly braces
\. Dot
\! Exclamation mark
\# Hash symbol
\- Hyphen symbol
\() Parentheses
\+ Plus symbol
\[] Square brackets
\_ Underscore
```

\* Asterisk  
\\ Backslash  
\` Backtick  
\{} Curly braces  
\. Dot  
\! Exclamation mark  
\# Hash symbol  
\- Hyphen symbol  
\() Parentheses  
\+ Plus symbol  
\[] Square brackets  
\_ Underscore

---

## Ссылки, якоря и автоссылки

### Inline, title и query string

```md
[Inline link](https://www.google.com)
[Inline link with title](https://www.google.com "Google's Homepage")
[Ссылка с query](https://example.com/docs?q=markdown&mode=local "Пример ссылки")
```

[Inline link](https://www.google.com)

[Inline link with title](https://www.google.com "Google's Homepage")

[Ссылка с query](https://example.com/docs?q=markdown&mode=local "Пример ссылки")

### Reference-ссылки

```md
[Reference-style link][reference text]
[Reference-style link by number][1]
[Markdown-Cheat-Sheet]

[reference text]: https://www.mozilla.org
[1]: https://slashdot.org
[Markdown-Cheat-Sheet]: https://github.com/lifeparticle/Markdown-Cheatsheet
```

[Reference-style link][reference text]

[Reference-style link by number][1]

[Markdown-Cheat-Sheet]

[reference text]: https://www.mozilla.org
[1]: https://slashdot.org
[Markdown-Cheat-Sheet]: https://github.com/lifeparticle/Markdown-Cheatsheet

### Relative, enclosed, auto и section-ссылки

```md
[Relative repository file](../blob/master/LICENSE)
[Relative local file](rl.md)
<https://github.com/>
Visit https://www.example.com
Email at example@example.com
[Перейти к Mermaid](#диаграммы-mermaid)
```

[Relative repository file](../blob/master/LICENSE)

[Relative local file](rl.md)

<https://github.com/>

Visit https://www.example.com

Email at example@example.com

[Перейти к Mermaid](#диаграммы-mermaid)

### Локальный якорь

<a id="sample-anchor" href="#sample-anchor">#sample-anchor</a>

Локальный якорь для проверки ссылок внутри документа.

[Back to top](#top) | [:arrow_up:](#top)

---

## Изображения, бейджи и видео-превью

### Local, remote и reference images

```md
![Local SVG icon](md.svg)
![Remote PNG](https://octodex.github.com/images/minion.png)
![Remote image with title](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")
![Reference image][image-ref]

[image-ref]: https://octodex.github.com/images/dojocat.jpg "The Dojocat"
```

![Local SVG icon](md.svg)

![Remote PNG](https://octodex.github.com/images/minion.png)

![Remote image with title](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

![Reference image][image-ref]

[image-ref]: https://octodex.github.com/images/dojocat.jpg "The Dojocat"

### HTML image и linked image

```html
<img src="md.svg" width="120" height="80" alt="Local Markdown SVG">
<a href="https://binarytree.dev/" target="_blank"><img src="md.svg" width="120" alt="Linked image"></a>
```

<img src="md.svg" width="120" height="80" alt="Local Markdown SVG">

<a href="https://binarytree.dev/" target="_blank"><img src="md.svg" width="120" alt="Linked image"></a>

### Picture tag и dark/light mode

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="md.svg">
  <source media="(prefers-color-scheme: light)" srcset="md.svg">
  <img alt="Theme-aware image" src="md.svg" width="160">
</picture>
```

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="md.svg">
  <source media="(prefers-color-scheme: light)" srcset="md.svg">
  <img alt="Theme-aware image" src="md.svg" width="160">
</picture>

### Группы изображений

Horizontal images:

<p>
  <img src="md.svg" width="100" height="70" alt="Image 1">
  <img src="md.svg" width="100" height="70" hspace="5" alt="Image 2">
  <img src="md.svg" width="100" height="70" hspace="5" alt="Image 3">
</p>

Vertical images:

<p>
  <img src="md.svg" width="100" height="70" alt="Image 1"><br><br>
  <img src="md.svg" width="100" height="70" vspace="5" alt="Image 2"><br><br>
  <img src="md.svg" width="100" height="70" vspace="5" alt="Image 3">
</p>

### Badges и YouTube preview

```md
![GitHub forks](https://img.shields.io/github/forks/lifeparticle/Markdown-Cheatsheet?style=for-the-badge)
[![IMAGE ALT TEXT HERE](https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/YouTube_logo_2015.svg/1200px-YouTube_logo_2015.svg.png)](https://www.youtube.com/watch?v=ciawICBvQoE)
```

![GitHub forks](https://img.shields.io/github/forks/lifeparticle/Markdown-Cheatsheet?style=for-the-badge)

[![IMAGE ALT TEXT HERE](https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/YouTube_logo_2015.svg/1200px-YouTube_logo_2015.svg.png)](https://www.youtube.com/watch?v=ciawICBvQoE)

HTML-вариант YouTube preview:

<a href="https://www.youtube.com/watch?feature=player_embedded&v=YOUTUBE_VIDEO_ID_HERE" target="_blank">
<img src="https://img.youtube.com/vi/YOUTUBE_VIDEO_ID_HERE/0.jpg" alt="IMAGE ALT TEXT HERE" width="240" height="180" border="10">
</a>

### Video URL

https://github.com/user-attachments/assets/90c624e0-f46b-47a7-8509-97585dc3688a

---

## Списки

### Ordered и unordered

```md
1. First ordered list item
2. Another item
   - Unordered sub-list
   1. Ordered sub-list
4. And another item

* Unordered list can use asterisks
- Or minuses
+ Or pluses
```

1. First ordered list item
2. Another item
   - Unordered sub-list
   1. Ordered sub-list
4. And another item

* Unordered list can use asterisks
- Or minuses
+ Or pluses

### Глубокая вложенность

```md
1. Make my changes
   1. Fix bug
   2. Improve formatting
      - Make the headings bigger
2. Push my commits to GitHub
3. Open a pull request
   * Describe my changes
   * Mention all the members of my team
     * Ask for feedback
```

1. Make my changes
   1. Fix bug
   2. Improve formatting
      - Make the headings bigger
2. Push my commits to GitHub
3. Open a pull request
   * Describe my changes
   * Mention all the members of my team
     * Ask for feedback

### HTML-list

```html
<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>
```

<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>

### Task lists

```md
- [x] Finish my changes
- [ ] Push my commits to GitHub
- [ ] Open a pull request
- [x] @mentions, #refs, [links](), **formatting**, and <del>tags</del> supported
- [x] list syntax required (any unordered or ordered list supported)
- [x] this is a complete item
- [ ] this is an incomplete item
```

- [x] Finish my changes
- [ ] Push my commits to GitHub
- [ ] Open a pull request
- [x] @mentions, #refs, [links](), **formatting**, and <del>tags</del> supported
- [x] list syntax required (any unordered or ordered list supported)
- [x] this is a complete item
- [ ] this is an incomplete item

### Абзацы и переносы внутри списков

1. List item with a paragraph.

   This paragraph belongs to the previous list item.

2. List item with a hard break.  
   This line remains inside the same list item.

---

## Цитаты и GitHub alerts

### Blockquotes

```md
> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh, you can *put* **Markdown** into a blockquote.

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.
```

> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh, you can *put* **Markdown** into a blockquote.

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.

### Alerts

```md
> [!NOTE]
> Essential details that users should not overlook.

> [!TIP]
> Additional advice to aid users in achieving better outcomes.

> [!IMPORTANT]
> Vital information required for users to attain success.

> [!WARNING]
> Urgent content that requires immediate user focus due to possible risks.

> [!CAUTION]
> Possible negative outcomes resulting from an action.
```

> [!NOTE]
> Essential details that users should not overlook.

> [!TIP]
> Additional advice to aid users in achieving better outcomes.

> [!IMPORTANT]
> Vital information required for users to attain success.

> [!WARNING]
> Urgent content that requires immediate user focus due to possible risks.

> [!CAUTION]
> Possible negative outcomes resulting from an action.

---

## Таблицы

### Markdown-таблицы и выравнивание

```md
| Default | Left align | Center align | Right align |
| - | :- | :-: | -: |
| 9999999999 | 9999999999 | 9999999999 | 9999999999 |
| 999999999 | 999999999 | 999999999 | 999999999 |
```

| Default | Left align | Center align | Right align |
| - | :- | :-: | -: |
| 9999999999 | 9999999999 | 9999999999 | 9999999999 |
| 999999999 | 999999999 | 999999999 | 999999999 |

### Inline Markdown внутри ячеек

```md
| Command | Description |
| --- | --- |
| `git status` | List all *new or modified* files |
| `git diff` | Show file differences that **haven't been** staged |
```

| Command | Description |
| --- | --- |
| `git status` | List all *new or modified* files |
| `git diff` | Show file differences that **haven't been** staged |

### Формулы, HTML и спецсимволы в таблице

| Поле | Значение | Комментарий |
|:--|--:|:--|
| A | 10 | `code` внутри ячейки |
| B | 20 | формула $a^2+b^2=c^2$ |
| C | 30 | HTML <mark>inline</mark> |
| Backtick | ` | одиночный backtick |
| Pipe | \| | экранированная вертикальная черта |

### Multiline cell

```md
| A | B | C |
|---|---|---|
| 1 | 2 | 3 <br> 4 <br> 5 |
```

| A | B | C |
|---|---|---|
| 1 | 2 | 3 <br> 4 <br> 5 |

### HTML-таблица

```html
<table>
<tr>
<th>Heading 1</th>
<th>Heading 2</th>
</tr>
<tr>
<td width="50%">The quick brown fox jumps over the lazy dog.</td>
<td width="50%">The quick brown fox jumps over the lazy dog.</td>
</tr>
</table>
```

<table>
<tr>
<th>Heading 1</th>
<th>Heading 2</th>
</tr>
<tr>
<td width="50%">The quick brown fox jumps over the lazy dog.</td>
<td width="50%">The quick brown fox jumps over the lazy dog.</td>
</tr>
</table>

### Markdown-таблица внутри HTML-таблицы

<table>
<tr>
<th>Nested table A</th>
<th>Nested table B</th>
</tr>
<tr>
<td>

| A | B | C |
|--|--|--|
| 1 | 2 | 3 |

</td>
<td>

| X | Y | Z |
|--|--|--|
| 7 | 8 | 9 |

</td>
</tr>
</table>

### Code block inside HTML table

<table>
<tr>
<th>Before Hoisting</th>
<th>After Hoisting</th>
</tr>
<tr>
<td>
<pre lang="js">
console.log(fullName); // undefined
fullName = "Dariana Trahan";
console.log(fullName); // Dariana Trahan
var fullName;
</pre>
</td>
<td>
<pre lang="js">
var fullName;
console.log(fullName); // undefined
fullName = "Dariana Trahan";
console.log(fullName); // Dariana Trahan
</pre>
</td>
</tr>
</table>

---

## Код и подсветка синтаксиса

Блоки кода расположены по функциональности: сначала Markdown/plain text, затем shell/diff, frontend, backend и прочие языки.

### Inline code и plain code

```md
Inline `code` has `back-ticks around` it.
```

Inline `code` has `back-ticks around` it.

```text
Plain text code block
with multiple lines
and symbols: ^ $ * _ # < > &
```

### Markdown source inside Markdown

````md
```md
# Nested Markdown example

- item
- item
```
````

### Shell / terminal commands

```bash
cd /var/www/example
npm install
npm run build
```

```powershell
Set-Location C:\Docs\Project
npm install
npm run build
```

### Diff

```diff
## git diff a/test.txt b/test.txt
diff --git a/a/test.txt b/b/test.txt
index 309ee57..c995021 100644
--- a/a/test.txt
+++ b/b/test.txt
@@ -1,8 +1,6 @@
-The quick brown fox jumps over the lazy dog
+The quick brown fox jumps over the lazy cat

 a
-b
 c
 d
-e
 f
```

```diff
- Text in Red
+ Text in Green
! Text in Orange
# Text in Gray
@@ Text in Purple and bold @@
```

### Frontend: HTML

```html
<dl>
  <dt>Definition list</dt>
  <dd>Is something people use sometimes.</dd>

  <dt>Markdown in HTML</dt>
  <dd>Does *not* work **very** well. Use HTML <em>tags</em>.</dd>
</dl>
```

### Frontend: CSS

```css
@font-face {
  font-family: Chunkfive;
  src: url('Chunkfive.otf');
}

body, .usertext {
  color: #F0F0F0;
  background: #600;
  font-family: Chunkfive, sans;
}

@import url(print.css);
@media print {
  a[href^=http]::after {
    content: attr(href);
  }
}
```

### Frontend: JavaScript

```javascript
function $initHighlight(block, cls) {
  try {
    if (cls.search(/\bno\-highlight\b/) !== -1) {
      return process(block, true, 0x0F) + ` class="${cls}"`;
    }
  } catch (e) {
    /* handle exception */
  }

  for (let i = 0; i < classes.length; i++) {
    if (checkCondition(classes[i]) === undefined) {
      console.log('undefined');
    }
  }
}

export { $initHighlight };
```

### Frontend: TypeScript

```ts
interface UserCard {
  id: number;
  name: string;
  flags?: string[];
}

const data: UserCard = {
  id: 7,
  name: "Markdown ^ HTML",
  flags: ["safe-clean", "local-only"]
};

console.log(data);
```

### Backend / general: Java

```java
public static String monthNames[] = {
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
};
```

### Backend / general: C#

```csharp
using System.IO.Compression;

#pragma warning disable 414, 3021

namespace MyApplication
{
    [Obsolete("...")]
    class Program : IInterface
    {
        public static List<int> JustDoIt(int count)
        {
            Console.WriteLine($"Hello {Name}!");
            return new List<int>(new int[] { 1, 2, 3 });
        }
    }
}
```

### Backend / general: PHP

```php
require_once 'Zend/Uri/Http.php';

namespace Location\Web;

interface Factory
{
    public static function _factory();
}

abstract class URI extends BaseURI implements Factory
{
    abstract public function test();

    public static $st1 = 1;
    public const ME = "Yo";
    private $var;

    /**
     * Returns a URI.
     *
     * @return array
     */
    public static function _factory($stats = [], $uri = 'http')
    {
        $parts = explode(':', $uri, 2);
        $schemeSpecific = $parts[1] ?? '';

        if (!ctype_alnum($parts[0])) {
            throw new \InvalidArgumentException('Illegal scheme');
        }

        return [
            'uri' => $parts,
            'schemeSpecific' => $schemeSpecific,
            'value' => null,
        ];
    }
}

echo URI::ME . URI::$st1;
```

### Code inside strikethrough

<strike>

```js
console.log('Error');
```

</strike>

---

## Формулы

### Inline math

Инлайн: $E = mc^2$, $\alpha + \beta \to \gamma$ и $\text{цена} = 5{,}0$.

This is an inline math expression $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$.

### Block math

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$

$$
x = {-b \pm \sqrt{b^2-4ac} \over 2a}
$$

\[
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
\]

### Align environment

\begin{align}
 a^2 + b^2 &= c^2 \\
 e^{i\pi} + 1 &= 0 \\
 \nabla \cdot \vec{E} &= \frac{\rho}{\varepsilon_0}
\end{align}

### Цветной текст через math syntax

| Color Name | Code | Example |
|---|---|---|
| Apricot | `\color{Apricot}{The\ quick\ brown\ fox}` | $\color{Apricot}{The\ quick\ brown\ fox}$ |
| Aquamarine | `\color{Aquamarine}{The\ quick\ brown\ fox}` | $\color{Aquamarine}{The\ quick\ brown\ fox}$ |
| Bittersweet | `\color{Bittersweet}{The\ quick\ brown\ fox}` | $\color{Bittersweet}{The\ quick\ brown\ fox}$ |
| Black | `\color{Black}{The\ quick\ brown\ fox}` | $\color{Black}{The\ quick\ brown\ fox}$ |

---

## Диаграммы Mermaid

### Flowchart

```mermaid
flowchart TD
    A[Исходный Markdown] --> B{Предочистка включена?}
    B -- Да --> C[Markdown-safe очистка]
    B -- Нет --> D[Прямой рендер]
    C --> E[markdown-it]
    D --> E
    E --> F[KaTeX / Mermaid / highlight.js]
    F --> G[HTML / Preview / PDF / DOCX]
```

### Pie chart

```mermaid
pie
"Movies" : 80
"TV shows" : 20
```

---

## ABC notation

```abc
X:1
T:Scale
M:4/4
L:1/4
K:C
C D E F | G A B c |
```

---

## Raw HTML и встроенные компоненты

### Details / summary

<details open>
  <summary>HTML-блок</summary>
  <p data-note="a — b">Этот блок не должен ломаться от предочистки.</p>
</details>

### Definition list

<dl>
  <dt>Definition list</dt>
  <dd>Is something people use sometimes.</dd>

  <dt>Markdown in HTML</dt>
  <dd>Does *not* work **very** well. Use HTML <em>tags</em>.</dd>
</dl>

### Boxed text через HTML table

<table><tr><td>The quick brown fox jumps over the lazy dog.</td></tr></table>

### Alignments

<p align="left">
<img src="md.svg" width="100" height="70" border="10" alt="Left aligned image">
</p>

<p align="center">
<img src="md.svg" width="100" height="70" border="10" alt="Center aligned image">
</p>

<p align="right">
<img src="md.svg" width="100" height="70" border="10" alt="Right aligned image">
</p>

---

## GitHub-специфичные элементы

### Mention people and teams

In issues:

```md
@lifeparticle
```

[Example shown in issue](https://github.com/lifeparticle/Markdown-Cheatsheet/issues/1)

In markdown file:

```md
https://github.com/lifeparticle
```

https://github.com/lifeparticle

### Reference issues and pull requests

In issues:

```md
#1
#10
```

[Example shown in issue](https://github.com/lifeparticle/Markdown-Cheatsheet/issues/1)

In markdown file:

```md
https://github.com/lifeparticle/Markdown-Cheatsheet/issues/1
https://github.com/lifeparticle/Markdown-Cheatsheet/pull/10
```

https://github.com/lifeparticle/Markdown-Cheatsheet/issues/1

https://github.com/lifeparticle/Markdown-Cheatsheet/pull/10

### Color models

In issues:

```md
`#ffffff`
`#000000`
`rgb(255, 0, 0)`
`hsl(120, 100%, 50%)`
```

`#ffffff`  
`#000000`  
`rgb(255, 0, 0)`  
`hsl(120, 100%, 50%)`

[Example shown in issue](https://github.com/lifeparticle/Markdown-Cheatsheet/issues/1)

![Color model example](https://github.com/user-attachments/assets/523128b8-e877-4e6f-884c-28691eaa1d8f)

### Code in titles

In issue and pull request titles:

```md
`TEST` ISSUE
```

`TEST` ISSUE

### Reference labels

Labels referenced by URLs in Markdown are now automatically rendered on GitHub.

https://github.com/lifeparticle/Markdown-Cheatsheet/labels/documentation

```md
https://github.com/lifeparticle/Markdown-Cheatsheet/labels/documentation
```

### GitHub README header and status badge

<h1 align="center">
  :black_circle: The Ultimate Markdown Cheat Sheet :black_circle:
</h1>

<div align="center">
  <a href="https://github.com/lifeparticle/Markdown-Cheatsheet/actions/workflows/readme-checker.yml">
    <img src="https://github.com/lifeparticle/Markdown-Cheatsheet/actions/workflows/readme-checker.yml/badge.svg" alt=".github/workflows/readme-checker.yml">
  </a>
</div>

---

## Разное

### Emojis

```md
:octocat:
:shipit:
:100:
:heavy_plus_sign:
:partly_sunny:
:woman_technologist:
```

:octocat: :shipit: :100: :heavy_plus_sign: :partly_sunny: :woman_technologist:

[Complete list of GitHub markdown emoji markup](https://gist.github.com/rxaviers/7360908)

### Footnotes

```md
Footnote 1 link[^fn-first].
Footnote 2 link[^fn-second].
Duplicated footnote reference[^fn-second].

[^fn-first]: Footnote **can have markup** and multiple paragraphs.

    This indented paragraph belongs to the first footnote.

[^fn-second]: Footnote text.
```

Footnote 1 link[^fn-first].

Footnote 2 link[^fn-second].

Duplicated footnote reference[^fn-second].

[^fn-first]: Footnote **can have markup** and multiple paragraphs.

    This indented paragraph belongs to the first footnote.

[^fn-second]: Footnote text.

### Collapsible item with Markdown inside

```md
<details>
  <summary>Markdown</summary>

- <kbd>[Markdown Editor](https://binarytree.dev/me)</kbd>
- <kbd>[Table Of Content](https://binarytree.dev/toc)</kbd>
- <kbd>[Markdown Table Generator](https://binarytree.dev/md_table_generator)</kbd>

</details>
```

<details>
  <summary>Markdown</summary>

- <kbd>[Markdown Editor](https://binarytree.dev/me)</kbd>
- <kbd>[Table Of Content](https://binarytree.dev/toc)</kbd>
- <kbd>[Markdown Table Generator](https://binarytree.dev/md_table_generator)</kbd>

</details>

### Back to top

First place this code at the start of the Markdown file:

```md
<a name="top"></a>
```

Then use:

```md
[Back to top](#top)
[:arrow_up:](#top)
```

[Back to top](#top)

[:arrow_up:](#top)

---

## Внешние справочные ссылки

- Markdown: [John Gruber Markdown](https://daringfireball.net/projects/markdown/)
- CommonMark: [CommonMark specification](https://commonmark.org/)
- GitHub Flavored Markdown: [GFM specification](https://github.github.com/gfm/)
- GitHub Markdown docs: [Basic writing and formatting syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
- Bitbucket Supported Markdown: [Bitbucket Markdown syntax guide](https://confluence.atlassian.com/bitbucketserver/markdown-syntax-guide-776639995.html)
- Azure DevOps Project wiki: [Azure DevOps Markdown guidance](https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance)
- MDX: [MDX documentation](https://mdxjs.com/)
- Markdown tools: [Markdownlint](https://github.com/DavidAnson/markdownlint), [MarkItDown](https://github.com/microsoft/markitdown), [Awesome Markdown](https://github.com/mundimark/awesome-markdown)
