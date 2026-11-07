const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = __dirname;
const cli = path.join(projectRoot, 'node_modules', '@playwright', 'test', 'cli.js');
const args = [
  'test',
  'tests/ui/inventory.spec.ts',
  'tests/ui/navigation-session.spec.ts',
  '--project=chromium',
  '--reporter=line',
];

const result = spawnSync(process.execPath, [cli, ...args], {
  cwd: projectRoot,
  encoding: 'utf-8',
  stdio: ['inherit', 'pipe', 'pipe'],
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(result.status ?? 1);
