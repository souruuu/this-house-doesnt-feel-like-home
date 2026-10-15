// Local QA harness only; this server is never part of dist or production deployment.
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist');
const mount = '/nested/game/';
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};
createServer((request, response) => {
  const path = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
  if (path === '/iframe') {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(
      '<!doctype html><html><head><title>M0 iframe test</title></head><body style="margin:0"><iframe title="เกมทดสอบ" src="/nested/game/" allowfullscreen style="border:0;width:100vw;height:100vh"></iframe></body></html>',
    );
    return;
  }
  if (!path.startsWith(mount)) {
    response.writeHead(404).end();
    return;
  }
  const file = resolve(root, path.slice(mount.length) || 'index.html');
  if (!file.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    if (!statSync(file).isFile()) throw new Error('Not a file');
    response.setHeader(
      'Content-Type',
      mime[extname(file)] ?? 'application/octet-stream',
    );
    response.end(readFileSync(file));
  } catch {
    response.writeHead(404).end();
  }
}).listen(4174, '127.0.0.1');
