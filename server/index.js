import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST']
  }
});

app.use(cors());

// Map bounds
const MAP_WIDTH = 2048;
const MAP_HEIGHT = 1536;
const SPAWN_X = 1020;
const SPAWN_Y = 800;

// In-memory player storage
const players = new Map(); // socketId → { id, name, color, x, y, direction }

// Rate limiting: track last move timestamp per socket
const lastMoveTime = new Map(); // socketId → timestamp
const MOVE_INTERVAL_MS = 50; // max 20 updates/second = 50ms between updates

app.get('/', (_req, res) => {
  res.json({ status: 'ok', players: players.size });
});

function clampPosition(val, max) {
  if (typeof val !== 'number' || !isFinite(val)) return null;
  return Math.max(0, Math.min(val, max));
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('player:join', (data, callback) => {
    const { name, color, x, y } = data;

    // Validate required fields
    if (!name || !color) {
      if (typeof callback === 'function') {
        callback({ error: 'Name and color are required' });
      }
      return;
    }

    // Check for duplicate names
    for (const [, player] of players) {
      if (player.name.toLowerCase() === name.toLowerCase()) {
        if (typeof callback === 'function') {
          callback({ error: 'Name already taken' });
        }
        return;
      }
    }

    const player = {
      id: socket.id,
      name,
      color,
      x: clampPosition(x, MAP_WIDTH) ?? SPAWN_X,
      y: clampPosition(y, MAP_HEIGHT) ?? SPAWN_Y,
      direction: 'down'
    };

    players.set(socket.id, player);
    lastMoveTime.set(socket.id, 0);

    // Send current players to the new player
    const currentPlayers = Object.fromEntries(players);
    if (typeof callback === 'function') {
      callback({ success: true, players: currentPlayers });
    }

    // Broadcast new player to everyone else
    socket.broadcast.emit('player:joined', player);

    console.log(`Player joined: ${name} (${socket.id}), total: ${players.size}`);
  });

  socket.on('player:move', (data) => {
    // Rate limiting
    const now = Date.now();
    const lastTime = lastMoveTime.get(socket.id) || 0;
    if (now - lastTime < MOVE_INTERVAL_MS) {
      return;
    }
    lastMoveTime.set(socket.id, now);

    const player = players.get(socket.id);
    if (!player) return;

    const { x, y, direction } = data;

    // Validate coordinates
    if (!isFinite(x) || !isFinite(y) || x < 0 || x > MAP_WIDTH || y < 0 || y > MAP_HEIGHT) {
      return;
    }

    player.x = x;
    player.y = y;
    player.direction = direction || player.direction;

    // Broadcast movement to everyone except sender
    socket.broadcast.emit('player:moved', {
      id: socket.id,
      x,
      y,
      direction: player.direction
    });
  });

  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      console.log(`Player left: ${player.name} (${socket.id}), total: ${players.size - 1}`);
    }
    players.delete(socket.id);
    lastMoveTime.delete(socket.id);

    // Broadcast player leaving
    socket.broadcast.emit('player:left', { id: socket.id });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
