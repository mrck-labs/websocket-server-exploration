import http from 'node:http';
import {EventEmitter} from 'node:events';

export class WebSocketServer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
        this.port = options.port || 4000;
        this._init();
    }

    _generateAcceptValue(acceptKey) {
        return crypto
            .createHash('sha1')
            .update(acceptKey + this.GUID, 'binary')
            .digest('base64');
    }

    _init() {
        if (this._server) throw new Error('Server already initialized');

        this._server = http.createServer((req, res) => {
            const UPGRADE_REQUIRED = 426;
            const body = http.STATUS_CODES[UPGRADE_REQUIRED];
            res.writeHead(UPGRADE_REQUIRED, {
                'Content-Type': 'text/plain',
                'Upgrade': 'WebSocket',
            });
            res.end(body);
        });

        this._server.on('upgrade', (req, socket) => {
            this.emit('headers', req);

            if (req.headers.upgrade !== 'websocket') {
                socket.end('HTTP/1.1 400 Bad Request');
                return;
            }

            const acceptKey = req.headers['sec-websocket-key'];
            const acceptValue = this._generateAcceptValue(acceptKey);

            const responseHeaders = [
                'HTTP/1.1 101 Switching Protocols',
                'Upgrade: websocket',
                'Connection: Upgrade',
                `Sec-WebSocket-Accept: ${acceptValue}`,
            ];

            socket.write(responseHeaders.concat('\r\n').join('\r\n'));
        });
    }

    listen(callback) {
        this._server.listen(this.port, callback);
    }
}