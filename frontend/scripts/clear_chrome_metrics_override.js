const net = require("net");
const crypto = require("crypto");

const wsUrl = process.argv[2];

if (!wsUrl) {
  throw new Error("Missing WebSocket debugger URL");
}

const url = new URL(wsUrl);

class WsClient {
  constructor(target) {
    this.url = target;
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.pending = new Map();
    this.id = 0;
    this.partialChunks = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      const key = crypto.randomBytes(16).toString("base64");
      const socket = net.createConnection(
        { host: this.url.hostname, port: Number(this.url.port || 80) },
        () => {
          const request =
            `GET ${this.url.pathname}${this.url.search} HTTP/1.1\r\n` +
            `Host: ${this.url.host}\r\n` +
            "Upgrade: websocket\r\n" +
            "Connection: Upgrade\r\n" +
            `Sec-WebSocket-Key: ${key}\r\n` +
            "Sec-WebSocket-Version: 13\r\n\r\n";
          socket.write(request);
        },
      );

      this.socket = socket;

      let handshake = "";
      let complete = false;

      socket.on("data", (chunk) => {
        if (!complete) {
          handshake += chunk.toString("binary");
          const marker = handshake.indexOf("\r\n\r\n");
          if (marker === -1) return;
          complete = true;
          const headerText = handshake.slice(0, marker);
          if (!headerText.startsWith("HTTP/1.1 101")) {
            reject(new Error(`WebSocket handshake failed: ${headerText}`));
            socket.end();
            return;
          }

          const rest = Buffer.from(handshake.slice(marker + 4), "binary");
          if (rest.length) this.handleData(rest);
          resolve();
          return;
        }

        this.handleData(chunk);
      });

      socket.on("error", reject);
    });
  }

  send(method, params = {}) {
    this.id += 1;
    const id = this.id;
    const payload = JSON.stringify({ id, method, params });

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.writeFrame(Buffer.from(payload, "utf8"));
    });
  }

  handleData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const opcode = first & 0x0f;
      const masked = (second & 0x80) !== 0;
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

      const maskBytes = masked ? 4 : 0;
      if (this.buffer.length < offset + maskBytes + length) return;

      let payload = this.buffer.slice(offset + maskBytes, offset + maskBytes + length);
      if (masked) {
        const mask = this.buffer.slice(offset, offset + 4);
        const decoded = Buffer.alloc(payload.length);
        for (let i = 0; i < payload.length; i += 1) decoded[i] = payload[i] ^ mask[i % 4];
        payload = decoded;
      }

      this.buffer = this.buffer.slice(offset + maskBytes + length);

      if (opcode === 0x8) return;
      if (opcode === 0x9) {
        this.writeFrame(payload, 0xA);
        continue;
      }
      if (opcode === 0x0) {
        this.partialChunks.push(payload);
        continue;
      }
      if (opcode === 0x1 || opcode === 0x2) {
        const message = JSON.parse(payload.toString("utf8"));
        if (!message.id) continue;
        const pending = this.pending.get(message.id);
        if (!pending) continue;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message || "CDP error"));
        else pending.resolve(message.result || {});
      }
    }
  }

  writeFrame(payload, opcode = 0x1) {
    const mask = crypto.randomBytes(4);
    const header = [0x80 | opcode];

    if (payload.length < 126) {
      header.push(0x80 | payload.length);
    } else if (payload.length < 65536) {
      header.push(0x80 | 126, (payload.length >> 8) & 0xff, payload.length & 0xff);
    } else {
      const lengthBuffer = Buffer.alloc(8);
      lengthBuffer.writeBigUInt64BE(BigInt(payload.length));
      header.push(0x80 | 127, ...lengthBuffer);
    }

    const maskedPayload = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i += 1) maskedPayload[i] = payload[i] ^ mask[i % 4];

    this.socket.write(Buffer.concat([Buffer.from(header), mask, maskedPayload]));
  }
}

async function main() {
  const client = new WsClient(url);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.clearDeviceMetricsOverride");
  await client.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  await client.send("Page.reload", { ignoreCache: true });
  console.log("Cleared device metrics override and reloaded page.");
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
