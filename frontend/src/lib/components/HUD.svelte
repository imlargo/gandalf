<script lang="ts">
	import { Badge } from '$ui/badge/index.js';
	import { Button } from '$ui/button/index.js';
	import { Separator } from '$ui/separator/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$ui/card/index.js';

	interface Props {
		playerCount: number;
		userName: string;
		userColor: string;
		zoomLevel: number;
		onLeave?: () => void;
	}

	let { playerCount, userName, userColor, zoomLevel, onLeave }: Props = $props();

	let sidebarOpen = $state(true);

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}
</script>

<!-- Toggle button (always visible) -->
<button
	class="sidebar-toggle"
	onclick={toggleSidebar}
	aria-label={sidebarOpen ? 'Close panel' : 'Open panel'}
>
	{#if sidebarOpen}
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
	{/if}
</button>

<!-- Sidebar panel -->
<div class="sidebar-panel" class:open={sidebarOpen}>
	<div class="sidebar-inner">
		<!-- User info -->
		<Card class="border-0 shadow-none bg-transparent">
			<CardHeader class="px-3 py-3">
				<div class="user-section">
					<div class="user-avatar" style="background-color: {userColor}">
						{userName.charAt(0).toUpperCase()}
					</div>
					<div class="user-info">
						<CardTitle class="text-sm font-semibold">{userName}</CardTitle>
						<span class="text-xs text-muted-foreground">Connected</span>
					</div>
				</div>
			</CardHeader>
		</Card>

		<Separator />

		<!-- Online players -->
		<div class="sidebar-section">
			<div class="section-header">
				<span class="section-title">Online</span>
				<Badge variant="secondary" class="text-xs">{playerCount}</Badge>
			</div>
			<p class="text-xs text-muted-foreground mt-1">
				{playerCount} {playerCount === 1 ? 'player' : 'players'} in the office
			</p>
		</div>

		<Separator />

		<!-- Zoom info -->
		<div class="sidebar-section">
			<div class="section-header">
				<span class="section-title">Zoom</span>
				<Badge variant="outline" class="text-xs font-mono">{zoomLevel.toFixed(1)}x</Badge>
			</div>
			<p class="text-xs text-muted-foreground mt-1">
				Scroll to zoom in/out
			</p>
		</div>

		<Separator />

		<!-- Controls help -->
		<div class="sidebar-section">
			<span class="section-title">Controls</span>
			<div class="controls-grid">
				<div class="control-item">
					<kbd>W A S D</kbd>
					<span>Move</span>
				</div>
				<div class="control-item">
					<kbd>↑ ← ↓ →</kbd>
					<span>Move</span>
				</div>
				<div class="control-item">
					<kbd>Scroll</kbd>
					<span>Zoom</span>
				</div>
			</div>
		</div>

		<!-- Leave button at the bottom -->
		<div class="sidebar-footer">
			<Button variant="outline" size="sm" class="w-full" onclick={onLeave}>
				Leave Office
			</Button>
		</div>
	</div>
</div>

<style>
	.sidebar-toggle {
		position: fixed;
		top: 12px;
		left: 12px;
		z-index: 60;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: 1px solid hsl(var(--border));
		background: hsl(var(--background) / 0.9);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: hsl(var(--foreground));
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.sidebar-toggle:hover {
		background: hsl(var(--accent));
	}

	.sidebar-panel {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 50;
		height: 100vh;
		width: 240px;
		background: hsl(var(--background) / 0.92);
		backdrop-filter: blur(12px);
		border-right: 1px solid hsl(var(--border));
		transform: translateX(-100%);
		transition: transform 0.25s ease;
		pointer-events: none;
	}

	.sidebar-panel.open {
		transform: translateX(0);
		pointer-events: auto;
	}

	.sidebar-inner {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding-top: 52px;
		overflow-y: auto;
	}

	.user-section {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: 14px;
		flex-shrink: 0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.sidebar-section {
		padding: 12px 16px;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: hsl(var(--muted-foreground));
	}

	.controls-grid {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 8px;
	}

	.control-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: hsl(var(--muted-foreground));
	}

	.control-item kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 22px;
		padding: 0 5px;
		font-size: 10px;
		font-family: monospace;
		background: hsl(var(--muted));
		border: 1px solid hsl(var(--border));
		border-radius: 4px;
		color: hsl(var(--foreground));
	}

	.sidebar-footer {
		margin-top: auto;
		padding: 16px;
	}
</style>
