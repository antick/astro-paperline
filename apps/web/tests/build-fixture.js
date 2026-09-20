import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const source = resolve(import.meta.dir, '..');

export function createPublication() {
  const root = mkdtempSync(join(tmpdir(), 'paperline-tests-'));
  const web = join(root, 'apps/web');
  const blog = join(web, 'src/content/blog');
  mkdirSync(web, { recursive: true });
  const copy = (from, to) => cpSync(from, to, { recursive: true, verbatimSymlinks: true });
  try {
    copy(resolve(source, '../../package.json'), join(root, 'package.json'));
    copy(resolve(source, '../../node_modules'), join(root, 'node_modules'));
    for (const name of [
      'src',
      'public',
      'node_modules',
      'package.json',
      'astro.config.ts',
      'tsconfig.json'
    ]) {
      copy(join(source, name), join(web, name));
    }
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
  const originals = new Map(
    ['astro.config.ts', 'src/config.ts', 'src/settings.ts', 'src/data/links.ts'].map((file) => [
      file,
      readFileSync(join(web, file), 'utf8')
    ])
  );
  return {
    web,
    reset() {
      rmSync(blog, { recursive: true, force: true });
      mkdirSync(blog, { recursive: true });
      for (const [file, contents] of originals) writeFileSync(join(web, file), contents);
    },
    post(slug, { date = '2020-01-01', category = 'Writing', extra = '' } = {}) {
      writeFileSync(
        join(blog, `${slug}.md`),
        `---\ntitle: ${slug}\ndescription: Build scenario fixture\npubDate: ${date}\ncategory: ${category}\ntags: [sample]\n${extra}\n---\nA small article used only in a disposable build.\n`
      );
    },
    edit(file, transform) {
      const path = join(web, file);
      writeFileSync(path, transform(readFileSync(path, 'utf8')));
    },
    read(file) {
      return readFileSync(join(web, file), 'utf8');
    },
    build(succeeds = true) {
      for (const cache of ['.astro', 'node_modules/.astro'])
        rmSync(join(web, cache), { recursive: true, force: true });
      const result = spawnSync(process.execPath, ['run', 'astro', 'build'], {
        cwd: web,
        encoding: 'utf8',
        env: { ...process.env, NODE_ENV: 'production' },
        timeout: 90_000
      });
      const output = result.stdout + result.stderr;
      if (result.error || (result.status === 0) !== succeeds)
        throw new Error(output, { cause: result.error });
      return output;
    },
    close() {
      rmSync(root, { recursive: true, force: true });
    }
  };
}
