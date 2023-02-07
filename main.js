import {WebSocketServer} from "./ws.js";
import { setTimeout as sleep } from 'node:timers/promises';
import {randomBytes} from 'node:crypto';

const api = {
    auth: async (login, password) => {
        console.log({login, password})
        await sleep(300); // simulate asynchronous call
        console.log("oh whatever")
        if (login === 'admin' && password === 'secret') {
            return {
                token: randomBytes(20).toString('hex')
            };
        }

        return {
            error: 'Unauthorized',
        };
    },

    getUsers: () => {
        return [
            { login: 'johnny', email: 'johnny@example.org' },
            { login: 'valentine', email: 'valentine@example.org' },
        ];
    }
}

const PORT = 4000;
const server = new WebSocketServer({ port: PORT });
server.on('headers', ({ headers }) => console.log(headers));

server.on('data', async (message, reply) => {
    if (!message) return;

    const data = JSON.parse(message);
    const { method, args = [] } = data;
    const handler = api[method];
    if (!handler) return reply({ error: 'Not Found' });

    try {
        const result = await handler(...args);
        reply(result);
    } catch (error) {
        console.error(error);
        reply({ error: 'Internal Server Error' });
    }
});

server.listen(() => {
    console.log(`WebSocket server listening on port ${PORT}`);
});