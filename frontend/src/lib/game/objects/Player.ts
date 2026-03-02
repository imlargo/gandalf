import Phaser from 'phaser';

const PLAYER_RADIUS = 18;
const COLLIDER_RADIUS = 12;
const SPEED = 160;

export class Player {
	scene: Phaser.Scene;
	sprite: Phaser.GameObjects.Container;
	body: Phaser.Physics.Arcade.Body;
	nameText: Phaser.GameObjects.Text;
	circle: Phaser.GameObjects.Graphics;
	color: number;
	playerName: string;
	cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	wasd!: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		S: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	};
	direction: string = 'down';

	constructor(scene: Phaser.Scene, x: number, y: number, name: string, color: string) {
		this.scene = scene;
		this.playerName = name;
		this.color = Phaser.Display.Color.HexStringToColor(color).color;

		// Create container for player visuals
		this.circle = scene.add.graphics();
		this.circle.fillStyle(this.color, 1);
		this.circle.fillCircle(0, 0, PLAYER_RADIUS);
		this.circle.lineStyle(2, 0x000000, 0.3);
		this.circle.strokeCircle(0, 0, PLAYER_RADIUS);

		// Initial letter
		const initial = scene.add
			.text(0, 0, name.charAt(0).toUpperCase(), {
				fontSize: '16px',
				color: '#ffffff',
				fontFamily: 'sans-serif',
				fontStyle: 'bold'
			})
			.setOrigin(0.5, 0.5);

		// Name above player
		this.nameText = scene.add
			.text(0, -(PLAYER_RADIUS + 14), name, {
				fontSize: '12px',
				color: '#1a202c',
				fontFamily: 'sans-serif',
				backgroundColor: 'rgba(255,255,255,0.8)',
				padding: { x: 4, y: 2 }
			})
			.setOrigin(0.5, 0.5);

		this.sprite = scene.add.container(x, y, [this.circle, initial, this.nameText]);
		this.sprite.setSize(PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);
		scene.physics.add.existing(this.sprite);

		this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
		this.body.setCollideWorldBounds(true);
		this.body.setCircle(COLLIDER_RADIUS, 0, 0);
		this.body.setOffset(-COLLIDER_RADIUS, -COLLIDER_RADIUS);

		// Input setup
		if (scene.input.keyboard) {
			this.cursors = scene.input.keyboard.createCursorKeys();
			this.wasd = {
				W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
				A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
				S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
				D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
			};
		}
	}

	update(): { x: number; y: number; direction: string; moved: boolean } {
		const body = this.body;
		let vx = 0;
		let vy = 0;

		const left = this.cursors?.left?.isDown || this.wasd?.A?.isDown;
		const right = this.cursors?.right?.isDown || this.wasd?.D?.isDown;
		const up = this.cursors?.up?.isDown || this.wasd?.W?.isDown;
		const down = this.cursors?.down?.isDown || this.wasd?.S?.isDown;

		if (left) {
			vx = -SPEED;
			this.direction = 'left';
		} else if (right) {
			vx = SPEED;
			this.direction = 'right';
		}

		if (up) {
			vy = -SPEED;
			this.direction = 'up';
		} else if (down) {
			vy = SPEED;
			this.direction = 'down';
		}

		// Normalize diagonal
		if (vx !== 0 && vy !== 0) {
			vx *= Math.SQRT1_2;
			vy *= Math.SQRT1_2;
		}

		body.setVelocity(vx, vy);

		const moved = vx !== 0 || vy !== 0;
		return {
			x: this.sprite.x,
			y: this.sprite.y,
			direction: this.direction,
			moved
		};
	}

	getCollider(): Phaser.GameObjects.Container {
		return this.sprite;
	}

	destroy(): void {
		this.sprite.destroy();
	}
}
