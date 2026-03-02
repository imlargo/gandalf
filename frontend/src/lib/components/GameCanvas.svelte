<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Socket } from 'socket.io-client';
	import type Phaser from 'phaser';

	interface Props {
		socket: Socket;
		name: string;
		color: string;
		players: Record<string, unknown>;
		onPlayerCountChange?: (count: number) => void;
	}

	let { socket, name, color, players, onPlayerCountChange }: Props = $props();

	let canvasContainer: HTMLDivElement;
	let game: Phaser.Game | null = null;

	onMount(async () => {
		const { createGame } = await import('$lib/game/main');
		game = createGame(canvasContainer, socket, name, color, players as Record<string, never>, onPlayerCountChange);
	});

	onDestroy(() => {
		if (game) {
			game.destroy(true);
			game = null;
		}
	});
</script>

<div bind:this={canvasContainer} class="game-canvas-container"></div>

<style>
	.game-canvas-container {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: #e2e8f0;
	}

	.game-canvas-container :global(canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
	}
</style>
