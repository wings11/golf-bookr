import { WebSocketServer, WebSocket } from 'ws';

let wss;

export const initWebSocket = (server) => {
    wss = new WebSocketServer({ server });
    
    wss.on('connection', (ws) => {
        console.log('New client connected');
        
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
};

export const broadcastBookingUpdate = () => {
    if (wss) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'booking_update',
                    timestamp: new Date().toISOString()
                }));
            }
        });
    }
};
