const fs = require('fs');
const net = require('net');
const crypto = require('crypto');
const http = require('http');
const path = require('path');
const { URL } = require('url');

function httpGetJson(target) {
  return new Promise((resolve, reject) => {
    const req = http.get(target, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
  });
}

class WsClient {
  constructor(wsUrl) {
    this.url = new URL(wsUrl);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.pending = new Map();
    this.id = 0;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const key = crypto.randomBytes(16).toString('base64');
      const socket = net.createConnection(
        { host: this.url.hostname, port: Number(this.url.port || 80) },
        () => {
          const request =
            `GET ${this.url.pathname}${this.url.search} HTTP/1.1\r\n` +
            `Host: ${this.url.host}\r\n` +
            'Upgrade: websocket\r\n' +
            'Connection: Upgrade\r\n' +
            `Sec-WebSocket-Key: ${key}\r\n` +
            'Sec-WebSocket-Version: 13\r\n\r\n';
          socket.write(request);
        },
      );

      this.socket = socket;
      let handshake = '';
      let complete = false;

      socket.on('data', (chunk) => {
        if (!complete) {
          handshake += chunk.toString('binary');
          const marker = handshake.indexOf('\r\n\r\n');
          if (marker === -1) return;
          complete = true;
          if (!handshake.startsWith('HTTP/1.1 101')) {
            reject(new Error(`WebSocket handshake failed: ${handshake.slice(0, marker)}`));
            socket.end();
            return;
          }
          const rest = Buffer.from(handshake.slice(marker + 4), 'binary');
          if (rest.length) this.handleData(rest);
          resolve();
          return;
        }
        this.handleData(chunk);
      });

      socket.on('error', reject);
    });
  }

  send(method, params = {}) {
    this.id += 1;
    const id = this.id;
    const payload = JSON.stringify({ id, method, params });

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.writeFrame(Buffer.from(payload, 'utf8'));
    });
  }

  handleData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      let length = second & 0x7f;
      let offset = 2;

      if (length === 126) {
        if (this.buffer.length < 4) return;
        length = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (this.buffer.length < 10) return;
        length = Number(this.buffer.readBigUInt64BE(2));
        offset = 10;
      }

      if (this.buffer.length < offset + length) return;
      const opcode = first & 0x0f;
      const payload = this.buffer.slice(offset, offset + length);
      this.buffer = this.buffer.slice(offset + length);

      if (opcode === 0x1) {
        const message = JSON.parse(payload.toString('utf8'));
        if (!message.id) continue;
        const pending = this.pending.get(message.id);
        if (!pending) continue;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message || 'CDP error'));
        else pending.resolve(message.result || {});
      }
    }
  }

  writeFrame(payload) {
    const mask = crypto.randomBytes(4);
    const header = [0x81];
    if (payload.length < 126) {
      header.push(0x80 | payload.length);
    } else {
      header.push(0x80 | 126, (payload.length >> 8) & 0xff, payload.length & 0xff);
    }
    const masked = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i += 1) masked[i] = payload[i] ^ mask[i % 4];
    this.socket.write(Buffer.concat([Buffer.from(header), mask, masked]));
  }

  close() {
    this.socket?.end();
    this.socket?.destroy();
  }
}

async function main() {
  const outFile = process.argv[2];
  if (!outFile) throw new Error('Missing output file');
  const viewportWidth = Number(process.argv[3] || 0);
  const viewportHeight = Number(process.argv[4] || 0);

  const tabs = await httpGetJson('http://127.0.0.1:9222/json/list');
  const page = tabs.find((tab) => tab.type === 'page' && /127\.0\.0\.1:3000\/zh/.test(tab.url));
  if (!page) throw new Error('Local /zh page not found in Chrome');

  const client = new WsClient(page.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  if (viewportWidth > 0 && viewportHeight > 0) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: viewportWidth < 768 ? 2 : 1,
      mobile: viewportWidth < 768,
    });
  }
  await client.send('Page.bringToFront');
  await client.send('Page.reload', { ignoreCache: true });

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await client.send('Runtime.evaluate', {
    expression: `
      new Promise((resolve) => {
        const step = Math.max(window.innerHeight * 0.75, 360);
        const max = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
        ) - window.innerHeight;
        let y = 0;

        function next() {
          y = Math.min(y + step, max);
          window.scrollTo(0, y);
          if (y >= max) {
            window.setTimeout(() => {
              window.scrollTo(0, 0);
              window.setTimeout(resolve, 1200);
            }, 600);
            return;
          }
          window.setTimeout(next, 420);
        }

        next();
      })
    `,
    awaitPromise: true,
  });
  await client.send('Runtime.evaluate', {
    expression: `
      Promise.race([
        Promise.all(
          Array.from(document.images)
            .filter((image) => image.currentSrc || image.src)
            .map((image) => {
              if (image.complete && image.naturalWidth > 0) {
                return Promise.resolve();
              }

              return new Promise((resolve) => {
                image.addEventListener('load', resolve, { once: true });
                image.addEventListener('error', resolve, { once: true });
              }).then(() => {
                if (image.decode) {
                  return image.decode().catch(() => undefined);
                }
                return undefined;
              });
            }),
        ),
        new Promise((resolve) => window.setTimeout(resolve, 12000)),
      ])
    `,
    awaitPromise: true,
  });
  if (process.env.CAPTURE_DEBUG_IMAGES === '1') {
    const imageDebug = await client.send('Runtime.evaluate', {
      expression: `
        Array.from(document.images).map((image) => ({
          alt: image.alt,
          src: image.currentSrc || image.src,
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          clientWidth: image.clientWidth,
          clientHeight: image.clientHeight,
        }))
      `,
      returnByValue: true,
    });
    console.log(JSON.stringify(imageDebug.result?.value || [], null, 2));
  }

  const { data } = await client.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    fromSurface: true,
  });

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, Buffer.from(data, 'base64'));
  console.log(outFile);
  if (viewportWidth > 0 && viewportHeight > 0) {
    await client.send('Emulation.clearDeviceMetricsOverride');
  }
  client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
