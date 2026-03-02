import Phaser from 'phaser';

const PLAYER_RADIUS = 18;
const LERP_FACTOR = 0.15;

export class RemotePlayer {
	scene: Phaser.Scene;
	sprite: Phaser.GameObjects.Container;
	nameText: Phaser.GameObjects.Text;
	circle: Phaser.GameObjects.Graphics;
	color: number;
	playerName: string;
	targetX: number;
	targetY: number;
	direction: string = 'down';
	id: string;

	constructor(scene: Phaser.Scene, id: string, x: number, y: number, name: string, color: string) {
		this.scene = scene;
		this.id = id;
		this.playerName = name;
		this.targetX = x;
		this.targetY = y;
		this.color = Phaser.Display.Color.HexStringToColor(color).color;

		// Visual circle
		this.circle = scene.add.graphics();
		this.circle.fillStyle(this.color, 1);
		this.circle.fillCircle(0, 0, PLAYER_RADIUS);
		this.circle.lineStyle(2, 0x000000, 0.3);
		this.circle.strokeCircle(0, 0, PLAYER_RADIUS);

		// Initial letter
		const initial = scene.add.text(0, 0, name.charAt(0).toUpperCase(), {
			fontSize: '16px',
			color: '#ffffff',
			fontFamily: 'sans-serif',
			fontStyle: 'bold'
		}).setOrigin(0.5, 0.5);

		// Name label
		this.nameText = scene.add.text(0, -(PLAYER_RADIUS + 14), name, {
			fontSize: '12px',
			color: '#1a202c',
			fontFamily: 'sans-serif',
			backgroundColor: 'rgba(255,255,255,0.8)',
			padding: { x: 4, y: 2 }
		}).setOrigin(0.5, 0.5);

		this.sprite = scene.add.container(x, y, [this.circle, initial, this.nameText]);
		this.sprite.setSize(PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);
	}

	setTarget(x: number, y: number, direction: string): void {
		this.targetX = x;
		this.targetY = y;
		this.direction = direction;
	}

	update(): void {
		// Smooth interpolation toward target position
		this.sprite.x = Phaser.Math.Linear(this.sprite.x, this.targetX, LERP_FACTOR);
		this.sprite.y = Phaser.Math.Linear(this.sprite.y, this.targetY, LERP_FACTOR);
	}

	destroy(): void {
		this.sprite.destroy();
	}
}
