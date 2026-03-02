import Phaser from 'phaser';

export const MAP_WIDTH = 2048;
export const MAP_HEIGHT = 1536;

const WALL_COLOR = 0x4a5568;
const FLOOR_COLOR = 0xf7fafc;
const DESK_COLOR = 0x8b6914;
const MEETING_COLOR = 0xebf8ff;
const KITCHEN_COLOR = 0xf0fff4;
const HALLWAY_COLOR = 0xedf2f7;
const WALL_BORDER_COLOR = 0x2d3748;
const ZONE_BORDER_COLOR = 0xa0aec0;

interface RectDef {
	x: number;
	y: number;
	w: number;
	h: number;
}

/**
 * Draw office map using Phaser Graphics and return collision rectangles.
 */
export function buildOfficeMap(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
	const graphics = scene.add.graphics();
	const walls = scene.physics.add.staticGroup();

	// Floor background
	graphics.fillStyle(FLOOR_COLOR, 1);
	graphics.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

	// -- Zones --

	// Work area (top-left)
	graphics.fillStyle(FLOOR_COLOR, 1);
	graphics.fillRect(40, 40, 900, 680);
	graphics.lineStyle(2, ZONE_BORDER_COLOR, 0.5);
	graphics.strokeRect(40, 40, 900, 680);

	// Meeting room (top-right)
	graphics.fillStyle(MEETING_COLOR, 1);
	graphics.fillRect(1100, 40, 900, 680);
	graphics.lineStyle(2, ZONE_BORDER_COLOR, 0.8);
	graphics.strokeRect(1100, 40, 900, 680);

	// Kitchen / break area (bottom-right)
	graphics.fillStyle(KITCHEN_COLOR, 1);
	graphics.fillRect(1100, 880, 900, 600);
	graphics.lineStyle(2, ZONE_BORDER_COLOR, 0.8);
	graphics.strokeRect(1100, 880, 900, 600);

	// Hallway (horizontal, middle)
	graphics.fillStyle(HALLWAY_COLOR, 1);
	graphics.fillRect(40, 720, 1960, 160);

	// Hallway (vertical, middle)
	graphics.fillStyle(HALLWAY_COLOR, 1);
	graphics.fillRect(940, 40, 160, 1440);

	// -- Zone labels --
	scene.add
		.text(490, 60, 'WORKSPACE', {
			fontSize: '18px',
			color: '#718096',
			fontFamily: 'sans-serif'
		})
		.setOrigin(0.5, 0);

	scene.add
		.text(1550, 60, 'MEETING ROOM', {
			fontSize: '18px',
			color: '#4299e1',
			fontFamily: 'sans-serif'
		})
		.setOrigin(0.5, 0);

	scene.add
		.text(1550, 900, 'KITCHEN', {
			fontSize: '18px',
			color: '#48bb78',
			fontFamily: 'sans-serif'
		})
		.setOrigin(0.5, 0);

	// -- Desks in workspace --
	const desks: RectDef[] = [
		{ x: 120, y: 140, w: 160, h: 80 },
		{ x: 340, y: 140, w: 160, h: 80 },
		{ x: 560, y: 140, w: 160, h: 80 },
		{ x: 120, y: 320, w: 160, h: 80 },
		{ x: 340, y: 320, w: 160, h: 80 },
		{ x: 560, y: 320, w: 160, h: 80 },
		{ x: 120, y: 500, w: 160, h: 80 },
		{ x: 340, y: 500, w: 160, h: 80 },
		{ x: 560, y: 500, w: 160, h: 80 }
	];

	for (const desk of desks) {
		graphics.fillStyle(DESK_COLOR, 1);
		graphics.fillRect(desk.x, desk.y, desk.w, desk.h);
		graphics.lineStyle(1, 0x6b5310, 1);
		graphics.strokeRect(desk.x, desk.y, desk.w, desk.h);
		addWallBody(scene, walls, desk);
	}

	// -- Meeting room table --
	const meetingTable: RectDef = { x: 1350, y: 260, w: 400, h: 200 };
	graphics.fillStyle(0x5a4a28, 1);
	graphics.fillRect(meetingTable.x, meetingTable.y, meetingTable.w, meetingTable.h);
	graphics.lineStyle(1, 0x3d3219, 1);
	graphics.strokeRect(meetingTable.x, meetingTable.y, meetingTable.w, meetingTable.h);
	addWallBody(scene, walls, meetingTable);

	// -- Kitchen furniture --
	const kitchenItems: RectDef[] = [
		{ x: 1200, y: 960, w: 200, h: 60 },
		{ x: 1200, y: 1100, w: 60, h: 120 },
		{ x: 1700, y: 960, w: 200, h: 60 },
		{ x: 1500, y: 1200, w: 120, h: 120 }
	];
	for (const item of kitchenItems) {
		graphics.fillStyle(0x9ca3af, 1);
		graphics.fillRect(item.x, item.y, item.w, item.h);
		graphics.lineStyle(1, 0x6b7280, 1);
		graphics.strokeRect(item.x, item.y, item.w, item.h);
		addWallBody(scene, walls, item);
	}

	// -- Outer walls --
	const outerWalls: RectDef[] = [
		{ x: 0, y: 0, w: MAP_WIDTH, h: 20 },
		{ x: 0, y: MAP_HEIGHT - 20, w: MAP_WIDTH, h: 20 },
		{ x: 0, y: 0, w: 20, h: MAP_HEIGHT },
		{ x: MAP_WIDTH - 20, y: 0, w: 20, h: MAP_HEIGHT }
	];
	for (const wall of outerWalls) {
		graphics.fillStyle(WALL_COLOR, 1);
		graphics.fillRect(wall.x, wall.y, wall.w, wall.h);
		addWallBody(scene, walls, wall);
	}

	// Inner walls with doorways

	// Bottom wall of workspace (with doorway)
	const workBottomWalls: RectDef[] = [
		{ x: 40, y: 720, w: 350, h: 12 },
		{ x: 540, y: 720, w: 400, h: 12 }
	];
	for (const wall of workBottomWalls) {
		graphics.fillStyle(WALL_BORDER_COLOR, 1);
		graphics.fillRect(wall.x, wall.y, wall.w, wall.h);
		addWallBody(scene, walls, wall);
	}

	// Top wall of bottom-left area (with doorway)
	const bottomLeftWalls: RectDef[] = [
		{ x: 40, y: 880, w: 350, h: 12 },
		{ x: 540, y: 880, w: 400, h: 12 }
	];
	for (const wall of bottomLeftWalls) {
		graphics.fillStyle(WALL_BORDER_COLOR, 1);
		graphics.fillRect(wall.x, wall.y, wall.w, wall.h);
		addWallBody(scene, walls, wall);
	}

	// Bottom-left open area label
	scene.add
		.text(490, 940, 'LOUNGE', {
			fontSize: '18px',
			color: '#718096',
			fontFamily: 'sans-serif'
		})
		.setOrigin(0.5, 0);

	return walls;
}

function addWallBody(
	scene: Phaser.Scene,
	group: Phaser.Physics.Arcade.StaticGroup,
	rect: RectDef
): void {
	const body = scene.add.zone(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h);
	group.add(body);
	(body.body as Phaser.Physics.Arcade.StaticBody).setSize(rect.w, rect.h);
}
