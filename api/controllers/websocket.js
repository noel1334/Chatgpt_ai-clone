import { WebSocketServer } from 'ws';

export function createWebSocketServer(server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', ws => {
        console.log('Client connected (WebSocket)');

        ws.on('message', message => {
            // Do absolutely nothing with the message
            console.log('Received audio data (doing nothing with it)');
            // You could add some basic validation here, or logging, but no processing

        });

        ws.on('close', () => {
            console.log('Client disconnected (WebSocket)');
        });

        ws.on('error', error => {
            console.error('WebSocket error:', error);
        });
    });

    console.log('WebSocket server initialized.');
    return wss;
}