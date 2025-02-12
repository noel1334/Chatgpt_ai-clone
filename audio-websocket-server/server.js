const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', message => {
    // Message is an ArrayBuffer containing audio data
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
    console.log('Client disconnected');
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

console.log('WebSocket server started on port 8080');