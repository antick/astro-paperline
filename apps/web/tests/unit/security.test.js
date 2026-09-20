import { expect, test } from 'bun:test';
import { resolve } from 'node:path';
import { readdir } from 'node:fs/promises';

const root = resolve(import.meta.dir, '../../../..');

test('workflows isolate pull requests from write tokens and persisted checkout credentials', async () => {
  const directory = resolve(root, '.github/workflows');
  for (const file of await readdir(directory)) {
    if (!/\.ya?ml$/.test(file)) continue;
    const workflow = Bun.YAML.parse(await Bun.file(resolve(directory, file)).text());
    expect(workflow.on).not.toHaveProperty('pull_request_target');
    expect(workflow.on).not.toHaveProperty('workflow_run');
    expect(workflow.permissions).toEqual({ contents: 'read' });
    expect(workflow.concurrency['cancel-in-progress']).toBe(true);
    for (const job of Object.values(workflow.jobs)) {
      expect(job.permissions ?? workflow.permissions).toEqual({ contents: 'read' });
      expect(job['runs-on']).toBe('ubuntu-latest');
      expect(job['timeout-minutes']).toBeGreaterThan(0);
      expect(job['timeout-minutes']).toBeLessThanOrEqual(20);
      for (const step of job.steps) {
        if (!step.uses) continue;
        expect(step.uses).toMatch(/^[\w-]+\/[\w-]+@[a-f0-9]{40}$/);
        if (step.uses.startsWith('actions/checkout@')) {
          expect(step.with?.['persist-credentials']).toBe(false);
        }
      }
    }
  }
});

test('Git ignores environment files at every depth but permits the example template', () => {
  for (const file of ['.env', '.env.staging', '.env.test', 'apps/web/.env.preview']) {
    const result = Bun.spawnSync(['git', 'check-ignore', '--no-index', file], { cwd: root });
    expect(result.exitCode, file).toBe(0);
  }
  for (const file of ['.env.example', 'apps/web/.env.example']) {
    const result = Bun.spawnSync(['git', 'check-ignore', '--no-index', file], { cwd: root });
    expect(result.exitCode, file).toBe(1);
  }
});
