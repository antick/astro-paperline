---
title: 'A small guide to Markdown'
description: 'Links, code blocks, footnotes, and simple HTML: a practical formatting sampler you can borrow for your own posts.'
pubDate: '2026-08-20'
author: 'Paperline'
authorUrl: '/about'
category: 'Writing'
subcategory: 'markdown'
topic: 'formatting'
tags: ['sample', 'markdown', 'typography', 'code']
draft: false
ogImage: '../../assets/samples/a-small-guide-to-markdown.webp'
ogImageAlt: 'A stack of ruled manuscript pages with a brass clip and a terracotta pencil.'
ogImageWidth: 1536
ogImageHeight: 1024
relatedPosts: ['notes-from-the-reading-room', 'room-for-white-space']
---

_This sample demonstrates Markdown formatting. The examples are deliberately small._

## Start with plain text

A paragraph is just a paragraph. Leave an empty line before the next one. Use **bold** for strong emphasis, _italics_ for a gentler change of voice, and ~~strikethrough~~ when a visible revision helps the reader.

A descriptive [link to the sample collection](/a-page-for-every-story) gives more context than “click here.” You can also use a [reference-style link][reading-room] when the same destination appears more than once.

## Give code its own space

Use backticks for short identifiers such as `title` or `tags`. A fenced block gives a longer example a language and room to breathe.

```js
const notebook = ['a sentence', 'a sketch', 'a question'];
const invitation = notebook.join(', ');
console.log(`Bring ${invitation}.`);
```

The next block shows CSS as a specimen, without changing the theme itself.

```css
.notebook {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
}
```

Plain text is useful for a directory tree or a short transcript:

```text
notebook/
  observations.md
  sketches.md
  questions.md
```

## Add a note without breaking the flow

A footnote lets a small detail wait until the end of the article.[^notebook] It is useful when the detail supports the sentence but does not belong in its middle.

<details>
<summary>Open an extra formatting note</summary>
<p>This is a native disclosure element. It can be opened with a pointer or a keyboard, and it keeps optional detail close to the paragraph it supports.</p>
</details>

## A few more characters

Plain HTML can handle H<sub>2</sub>O, x<sup>2</sup>, and <abbr title="HyperText Markup Language">HTML</abbr>. A keyboard hint can use <kbd>Tab</kbd>. Use these features when the meaning calls for them, rather than decorating every sentence.

[^notebook]: This footnote is part of the sample. The small return link takes you back to the sentence that referenced it.

[reading-room]: /notes-from-the-reading-room
