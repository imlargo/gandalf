<script lang="ts">
	import JoinScreen from '$lib/components/JoinScreen.svelte';
	import GameCanvas from '$lib/components/GameCanvas.svelte';
	import HUD from '$lib/components/HUD.svelte';
	import { connectSocket, disconnectSocket, getSocket } from '$lib/stores/gameSocket';
	import { gameUser, inGame } from '$lib/stores/gameUser';
	import { SPAWN_X, SPAWN_Y } from '$lib/game/map/officeMap';
	import { onDestroy } from 'svelte';
	import type { Socket } from 'socket.io-client';

	let error = $state('');
	let loading = $state(false);
	let joined = $state(false);
	let playerCount = $state(1);
	let socket: Socket | null = $state(null);
	let playersData: Record<string, unknown> = $state({});
	let userName = $state('');
	let userColor = $state('');

	function handleJoin(name: string, color: string) {
		loading = true;
		error = '';

		const s = connectSocket();
		socket = s;

		s.emit(
			'player:join',
			{ name, color, x: SPAWN_X, y: SPAWN_Y },
			(response: { success?: boolean; error?: string; players?: Record<string, unknown> }) => {
				loading = false;

				if (response.error) {
					error = response.error;
					disconnectSocket();
					socket = null;
					return;
				}

				if (response.success) {
					userName = name;
					userColor = color;
					playersData = response.players || {};
					gameUser.set({ name, color });
					inGame.set(true);
					joined = true;
				}
			}
		);

		// Handle connection error
		s.on('connect_error', () => {
			loading = false;
			error = 'Could not connect to server. Make sure the server is running.';
			disconnectSocket();
			socket = null;
		});
	}

	function handlePlayerCountChange(count: number) {
		playerCount = count;
	}

	onDestroy(() => {
		disconnectSocket();
		gameUser.set(null);
		inGame.set(false);
	});
</script>

<svelte:head>
	<title>Virtual Office</title>
</svelte:head>

{#if joined && socket}
	<GameCanvas
		{socket}
		name={userName}
		color={userColor}
		players={playersData}
		onPlayerCountChange={handlePlayerCountChange}
	/>
	<HUD {playerCount} />
{:else}
	<JoinScreen onJoin={handleJoin} {error} {loading} />
{/if}
