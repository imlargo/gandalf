import Phaser from 'phaser';
import type { Socket } from 'socket.io-client';
import { OfficeScene } from './scenes/OfficeScene';
import { MAP_WIDTH, MAP_HEIGHT } from './map/officeMap';

interface PlayerData {
	id: string;
	name: string;
	color: string;
	x: number;
	y: number;
	direction: string;
}

export function createGame(
	parent: HTMLElement,
	socket: Socket,
	name: string,
	color: string,
	players: Record<string, PlayerData>,
	onPlayerCountChange?: (count: number) => void,
	onZoomChange?: (zoom: number) => void
): Phaser.Game {
	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		parent,
		width: MAP_WIDTH,
		height: MAP_HEIGHT,
		backgroundColor: '#e2e8f0',
		physics: {
			default: 'arcade',
			arcade: {
				gravity: { x: 0, y: 0 },
				debug: false
			}
		},
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
			width: MAP_WIDTH,
			height: MAP_HEIGHT
		},
		scene: [OfficeScene]
	};

	const game = new Phaser.Game(config);

	// Start the scene with data
	game.scene.start('OfficeScene', {
		socket,
		name,
		color,
		players,
		onPlayerCountChange,
		onZoomChange
	});

	return game;
}
