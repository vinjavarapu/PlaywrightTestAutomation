const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = __dirname;
const playwrightCli = path.join(projectRoot, 'node_modules', '@playwright', 'test', 'cli.js');
const args = [
  'test',
  'tests/ui/inventory.spec.ts',
  'tests/ui/checkout.spec.ts',
  'tests/ui/extended-quality.spec.ts',
  'tests/ui/navigation-session.spec.ts',
  '--project=chromium',
  '--reporter=line',
];

const result = spawnSync(process.execPath, [playwrightCli, ...args], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: false,
});

process.exit(result.status ?? 1);
