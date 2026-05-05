const fs = require('fs');
const net = require('net');
const crypto = require('crypto');
const http = require('http');
const path = require('path');
const { URL } = require('url');

function httpGetJson(target) {
  return new Promise((resolve, reject) => {
    http.get(target, (res) => {
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
    }).on('error', reject);
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
      const socket = net.createConnection({ host: this.url.hostname, port: Number(this.url.port || 80) }, () => {
        socket.write(
          `GET ${this.url.pathname}${this.url.search} HTTP/1.1\r\n` +
            `Host: ${this.url.host}\r\n` +
            'Upgrade: websocket\r\n' +
            'Connection: Upgrade\r\n' +
            `Sec-WebSocket-Key: ${key}\r\n` +
            'Sec-WebSocket-Version: 13\r\n\r\n',
        );
      });

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
}

async function main() {
  const outFile = process.argv[2] || '.capture/about-stats.png';
  const tabs = await httpGetJson('http://127.0.0.1:9222/json/list');
  const page =
    [...tabs].reverse().find((tab) => tab.type === 'page' && /127\.0\.0\.1:3000\/zh\/about/.test(tab.url)) ||
    [...tabs].reverse().find((tab) => tab.type === 'page');
  if (!page) throw new Error('No debuggable Chrome page found');

  const client = new WsClient(page.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1400,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await client.send('Page.bringToFront');
  await client.send('Page.navigate', { url: 'http://127.0.0.1:3000/zh/about' });
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const findStatsBlockExpression = `
    (() => {
      const block = document.querySelector('[data-about-stats]');
      if (!block) return null;
      const rect = block.getBoundingClientRect();
      return { x: rect.left + window.scrollX, y: rect.top + window.scrollY, width: rect.width, height: rect.height };
    })()
  `;

  let visibleBlock = null;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = await client.send('Runtime.evaluate', {
      returnByValue: true,
      expression: findStatsBlockExpression,
    });
    visibleBlock = result.result.value;
    if (visibleBlock) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  await client.send('Runtime.evaluate', {
    expression: `
      (() => {
        const block = ${visibleBlock ? 'document.querySelector("[data-about-stats]")' : 'null'};
        if (block) block.scrollIntoView({ block: 'center', inline: 'nearest' });
      })()
    `,
  });
  await new Promise((resolve) => setTimeout(resolve, 800));

  const evalResult = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: visibleBlock
      ? findStatsBlockExpression
      : `
        (() => {
          return {
            error: 'not-found',
            href: location.href,
            title: document.title,
            text: document.body.innerText.slice(0, 1200),
          };
        })()
      `,
  });

  const rect = evalResult.result.value;
  if (!rect || rect.error) throw new Error(`Stats block not found: ${JSON.stringify(rect)}`);
  console.log(`rect=${JSON.stringify(rect)}`);
  await new Promise((resolve) => setTimeout(resolve, 600));

  const { data } = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    clip: {
      x: Math.max(0, Math.round(rect.x)),
      y: Math.max(0, Math.round(rect.y)),
      width: Math.max(1, Math.round(rect.width)),
      height: Math.max(1, Math.round(rect.height)),
      scale: 1,
    },
  });

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const full = Buffer.from(data, 'base64');
  fs.writeFileSync(outFile, full);
  if (client.socket) client.socket.end();
  console.log(outFile);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
