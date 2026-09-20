import { expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { ESLint } from 'eslint';
import * as prettier from 'prettier';

const root = resolve(import.meta.dir, '../../../..');
const eslint = new ESLint({ cwd: root });
const astroPath = 'apps/web/src/components/LintProbe.astro';

async function lint(source, filePath = astroPath) {
  const [result] = await eslint.lintText(source, { filePath });
  expect(result.fatalErrorCount).toBe(0);
  return result.messages.map((message) => message.ruleId);
}

test('Astro lint understands TypeScript frontmatter and component use in templates', async () => {
  expect(
    await lint(`---
import Heading from './Heading.astro';
interface Props { title: string }
const { title } = Astro.props;
---
<Heading title={title} />
<img src="/cover.png" alt="An open notebook" />
`)
  ).toEqual([]);
});

test('Astro lint rejects inaccessible markup and invalid client directives', async () => {
  const rules = await lint(`---
import Widget from './Widget.tsx';
---
<img src="/cover.png" />
<button aria-invalid-property="true">Open</button>
<Widget client:only />
`);
  expect(rules).toContain('astro/jsx-a11y/alt-text');
  expect(rules).toContain('astro/jsx-a11y/aria-props');
  expect(rules).toContain('astro/missing-client-only-directive-value');
});

test('Astro lint catches unused code in frontmatter and embedded browser scripts', async () => {
  const rules = await lint(`---
const unusedFrontmatter: string = 'unused';
---
<h1>Article</h1>
<script>
  const unusedBrowserValue: number = 1;
  document.querySelector('h1');
</script>
`);
  expect(rules.filter((rule) => rule === '@typescript-eslint/no-unused-vars')).toHaveLength(2);
});

test('React lint checks accessibility and conditional Hooks', async () => {
  const rules = await lint(
    `import { useEffect } from 'react';
export default function Example({ visible }: { visible: boolean }) {
  if (visible) useEffect(() => {}, []);
  return <img src="/cover.png" />;
}`,
    'apps/web/src/components/LintProbe.tsx'
  );
  expect(rules).toContain('jsx-a11y-x/alt-text');
  expect(rules).toContain('react-hooks/rules-of-hooks');
});

test('Prettier rejects and then fixes malformed Astro formatting with the actual project config', async () => {
  const filepath = resolve(root, astroPath);
  const options = { ...(await prettier.resolveConfig(filepath)), filepath };
  const source = '---\nconst title="Example"\n---\n<h1   class="title">{title}</h1>';
  expect(await prettier.check(source, options)).toBe(false);
  const formatted = await prettier.format(source, options);
  expect(await prettier.check(formatted, options)).toBe(true);
  expect(await lint(formatted)).toEqual([]);
});
