const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {}; // Store player data

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'update') {
            // Update player data
            players[data.id] = { x: data.x, y: data.y };

            // Broadcast updated player data
            const playersData = JSON.stringify({ type: 'state', players });
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(playersData);
                }
            });
        } else if (data.type === 'disconnect') {
            delete players[data.id];
        }
    });

    ws.on('close', () => {
        // Remove player on disconnect
        for (const id in players) {
            if (players[id].socket === ws) {
                delete players[id];
            }
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server running on http://localhost:3000');
});
