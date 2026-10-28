import {cpSync, readdirSync, rmSync, statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {root} from '../project.ts';

function run(args: string[]): void {
  const result = spawnSync(process.execPath, args, {cwd: fileURLToPath(root), stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

/** Copy the pages and styles of `src/` next to the emitted modules in `dist/`. */
function copyStatic(from: string, to: string): void {
  for (const name of readdirSync(from)) {
    const source = path.join(from, name), target = path.join(to, name);
    if (statSync(source).isDirectory()) copyStatic(source, target);
    else if (name.endsWith('.html') || name.endsWith('.css')) cpSync(source, target);
  }
}

// TypeScript keeps the outputs of deleted sources, so every build starts empty.
for (const directory of ['dist/', 'build/']) rmSync(new URL(directory, root), {recursive: true, force: true});
run(['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json']);
run(['node_modules/typescript/bin/tsc', '-p', 'tsconfig.tools.json']);
copyStatic(fileURLToPath(new URL('src/', root)), fileURLToPath(new URL('dist/', root)));
