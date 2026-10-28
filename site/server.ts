import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {root as projectRoot} from './project.ts';

// A local preview of dist/: module scripts do not load from file:// URLs.
const dist = fileURLToPath(new URL('dist/', projectRoot)), portIndex = process.argv.indexOf('--port');
const port = portIndex < 0 ? 8090 : Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid preview port.');
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.map': 'application/json', '.svg': 'image/svg+xml',
};
const server = createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const filename = path.resolve(dist, '.' + pathname);
    if (!filename.startsWith(dist) || !mime[path.extname(filename)]) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    const content = await readFile(filename);
    response.writeHead(200, {'Content-Type': mime[path.extname(filename)], 'Cache-Control': 'no-store'});
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});
server.listen(port, '127.0.0.1', () => {
  const address = server.address();
  if (address && typeof address !== 'string') console.log(`Grokking lessons: http://127.0.0.1:${address.port}/`);
});
