import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compileFixture } from './scripts/narrative-compile.ts';
import { validateFixture } from './scripts/narrative-validate.ts';
import { compileDemo, validateDemo } from './scripts/narrative-production.ts';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'm0-technical-ink',
      configureServer(server) {
        const refresh = () => {
          compileFixture();
          compileDemo();
          validateFixture();
          validateDemo();
        };
        refresh();
        server.watcher.add('narrative/**/*.ink');
        server.watcher.on('change', (path) => {
          if (
            !path.replaceAll('\\', '/').includes('/narrative/') ||
            !path.endsWith('.ink')
          )
            return;
          try {
            refresh();
            server.ws.send({ type: 'full-reload' });
          } catch (error) {
            server.ws.send({
              type: 'error',
              err: { message: String(error), stack: '' },
            });
          }
        });
      },
    },
  ],
  build: {
    target: ['chrome107', 'edge107', 'firefox104', 'safari16'],
  },
});
