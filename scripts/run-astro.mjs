import { spawn } from 'node:child_process';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/run-astro.mjs <astro-args...>');
  process.exit(1);
}

const command =
  process.platform === 'win32' ? process.env.ComSpec ?? 'cmd.exe' : 'pnpm';
const commandArgs =
  process.platform === 'win32'
    ? ['/d', '/s', '/c', 'pnpm', 'exec', 'astro', ...args]
    : ['exec', 'astro', ...args];

const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    BROWSERSLIST_IGNORE_OLD_DATA: '1',
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
