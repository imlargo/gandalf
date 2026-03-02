<script lang="ts">
	import { Badge } from '$ui/badge/index.js';

	interface Props {
		playerCount: number;
	}

	let { playerCount }: Props = $props();
</script>

<div class="hud-overlay">
	<Badge variant="secondary" class="select-none shadow-md">
		{playerCount}
		{playerCount === 1 ? 'user' : 'users'} online
	</Badge>
</div>

<style>
	.hud-overlay {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 50;
		pointer-events: none;
	}

	.hud-overlay :global(*) {
		pointer-events: auto;
	}
</style>
