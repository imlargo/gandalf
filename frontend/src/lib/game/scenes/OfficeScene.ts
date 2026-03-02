import Phaser from 'phaser';
import type { Socket } from 'socket.io-client';
import { Player } from '../objects/Player';
import { RemotePlayer } from '../objects/RemotePlayer';
import { buildOfficeMap, MAP_WIDTH, MAP_HEIGHT, SPAWN_X, SPAWN_Y } from '../map/officeMap';

interface PlayerData {
	id: string;
	name: string;
	color: string;
	x: number;
	y: number;
	direction: string;
}

const DEFAULT_ZOOM = 3;
const MIN_ZOOM = 1.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

export class OfficeScene extends Phaser.Scene {
	private player!: Player;
	private remotePlayers: Map<string, RemotePlayer> = new Map();
	private socket!: Socket;
	private playerName!: string;
	private playerColor!: string;
	private walls!: Phaser.Physics.Arcade.StaticGroup;
	private moveEmitInterval = 50; // ms between emits
	private lastEmitTime = 0;
	private lastEmittedX = 0;
	private lastEmittedY = 0;
	private onPlayerCountChange?: (count: number) => void;
	private onZoomChange?: (zoom: number) => void;
	private initialPlayers: Record<string, PlayerData> = {};

	constructor() {
		super({ key: 'OfficeScene' });
	}

	init(data: {
		socket: Socket;
		name: string;
		color: string;
		players: Record<string, PlayerData>;
		onPlayerCountChange?: (count: number) => void;
		onZoomChange?: (zoom: number) => void;
	}): void {
		this.socket = data.socket;
		this.playerName = data.name;
		this.playerColor = data.color;
		this.onPlayerCountChange = data.onPlayerCountChange;
		this.onZoomChange = data.onZoomChange;
		this.initialPlayers = data.players || {};
	}

	create(): void {
		// World bounds
		this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

		// Build the map
		this.walls = buildOfficeMap(this);

		// Spawn point (hallway intersection)
		const spawnX = SPAWN_X;
		const spawnY = SPAWN_Y;

		// Create local player
		this.player = new Player(this, spawnX, spawnY, this.playerName, this.playerColor);

		// Collisions
		this.physics.add.collider(this.player.getCollider(), this.walls);

		// Camera follow
		this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
		this.cameras.main.startFollow(this.player.getCollider(), true, 0.1, 0.1);
		this.cameras.main.setZoom(DEFAULT_ZOOM);

		// Scroll wheel zoom
		this.input.on('wheel', (_pointer: unknown, _gameObjects: unknown, _deltaX: number, deltaY: number) => {
			const cam = this.cameras.main;
			const delta = deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
			const newZoom = Phaser.Math.Clamp(cam.zoom + delta, MIN_ZOOM, MAX_ZOOM);
			cam.setZoom(newZoom);
			if (this.onZoomChange) {
				this.onZoomChange(newZoom);
			}
		});

		// Socket event listeners
		this.setupSocketListeners();

		// Add existing remote players (after map so they render on top)
		for (const [id, pData] of Object.entries(this.initialPlayers)) {
			if (id !== this.socket.id) {
				this.addRemotePlayer(pData);
			}
		}
		this.initialPlayers = {};

		// Emit initial position
		this.emitMove(spawnX, spawnY, 'down');

		this.updatePlayerCount();
	}

	private setupSocketListeners(): void {
		this.socket.on('player:joined', (data: PlayerData) => {
			this.addRemotePlayer(data);
			this.updatePlayerCount();
		});

		this.socket.on(
			'player:moved',
			(data: { id: string; x: number; y: number; direction: string }) => {
				const remote = this.remotePlayers.get(data.id);
				if (remote) {
					remote.setTarget(data.x, data.y, data.direction);
				}
			}
		);

		this.socket.on('player:left', (data: { id: string }) => {
			const remote = this.remotePlayers.get(data.id);
			if (remote) {
				remote.destroy();
				this.remotePlayers.delete(data.id);
				this.updatePlayerCount();
			}
		});
	}

	private addRemotePlayer(data: PlayerData): void {
		if (this.remotePlayers.has(data.id)) return;
		const remote = new RemotePlayer(this, data.id, data.x, data.y, data.name, data.color);
		this.remotePlayers.set(data.id, remote);
	}

	private emitMove(x: number, y: number, direction: string): void {
		this.socket.emit('player:move', { x, y, direction });
		this.lastEmittedX = x;
		this.lastEmittedY = y;
	}

	private updatePlayerCount(): void {
		// 1 for local player + remote players
		const count = 1 + this.remotePlayers.size;
		if (this.onPlayerCountChange) {
			this.onPlayerCountChange(count);
		}
	}

	update(time: number): void {
		if (!this.player) return;

		const { x, y, direction, moved } = this.player.update();

		// Emit position if moved and enough time passed
		if (moved && time - this.lastEmitTime > this.moveEmitInterval) {
			const dx = Math.abs(x - this.lastEmittedX);
			const dy = Math.abs(y - this.lastEmittedY);
			if (dx > 1 || dy > 1) {
				this.emitMove(x, y, direction);
				this.lastEmitTime = time;
			}
		}

		// Update remote players (lerp)
		for (const remote of this.remotePlayers.values()) {
			remote.update();
		}
	}

	shutdown(): void {
		this.socket.off('player:joined');
		this.socket.off('player:moved');
		this.socket.off('player:left');

		for (const remote of this.remotePlayers.values()) {
			remote.destroy();
		}
		this.remotePlayers.clear();

		if (this.player) {
			this.player.destroy();
		}
	}
}
