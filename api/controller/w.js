
import { WebSocketServer } from 'ws';
import fs from 'fs';

export function createWebSocketServer(server) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', ws => {
        console.log('Client connected (WebSocket)');

        ws.on('message', message => {
            console.log('Received audio data');

            // Process or save the audio data (e.g., write to a file)
            const filename = `received_audio_${Date.now()}.webm`;
            fs.writeFile(filename, Buffer.from(message), err => {
                if (err) {
                    console.error('Error writing file:', err);
                } else {
                    console.log('Audio saved to', filename);
                }
            });
        });

        ws.on('close', () => {
            console.log('Client disconnected (WebSocket)');
        });

        ws.on('error', error => {
            console.error('WebSocket error:', error);
        });
    });

    console.log('WebSocket server initialized.'); // Moved here for clarity
    return wss; // Returning wss is not essential, but might be useful later
}