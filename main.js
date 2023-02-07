import {WebSocketServer} from "./ws.js";


const PORT = 4000.
const server = new WebSocketServer({ port: PORT });

server.on('headers', ({ headers }) => console.log(headers));

server.listen(() => {
    console.log(`WebSocket server listening on port ${PORT}`);
});