<script lang="ts">
	import { Button } from '$ui/button/index.js';
	import { Input } from '$ui/input/index.js';

	const AVATAR_COLORS = [
		{ name: 'Red', hex: '#e53e3e' },
		{ name: 'Blue', hex: '#3182ce' },
		{ name: 'Green', hex: '#38a169' },
		{ name: 'Purple', hex: '#805ad5' },
		{ name: 'Orange', hex: '#dd6b20' },
		{ name: 'Teal', hex: '#319795' }
	];

	interface Props {
		onJoin: (name: string, color: string) => void;
		error?: string;
		loading?: boolean;
	}

	let { onJoin, error = '', loading = false }: Props = $props();

	let name = $state('');
	let selectedColor = $state(AVATAR_COLORS[0].hex);

	function handleSubmit(e: Event) {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) return;
		onJoin(trimmed, selectedColor);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
	<div class="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
		<h1 class="mb-2 text-center text-2xl font-bold text-gray-900">Virtual Office</h1>
		<p class="mb-6 text-center text-sm text-gray-500">Enter your name and pick a color to join</p>

		<form onsubmit={handleSubmit} class="space-y-6">
			<div>
				<label for="username" class="mb-1.5 block text-sm font-medium text-gray-700">
					Username
				</label>
				<Input
					id="username"
					type="text"
					placeholder="Enter your name"
					bind:value={name}
					maxlength={20}
					required
				/>
			</div>

			<fieldset>
				<legend class="mb-2 block text-sm font-medium text-gray-700">Avatar Color</legend>
				<div class="flex flex-wrap gap-3">
					{#each AVATAR_COLORS as color}
						<button
							type="button"
							class="h-10 w-10 rounded-full border-2 transition-transform hover:scale-110"
							class:border-gray-900={selectedColor === color.hex}
							class:border-transparent={selectedColor !== color.hex}
							class:ring-2={selectedColor === color.hex}
							class:ring-gray-400={selectedColor === color.hex}
							style="background-color: {color.hex}"
							onclick={() => (selectedColor = color.hex)}
							title={color.name}
						></button>
					{/each}
				</div>
			</fieldset>

			{#if error}
				<p class="text-sm text-red-600">{error}</p>
			{/if}

			<Button type="submit" class="w-full" disabled={!name.trim() || loading}>
				{loading ? 'Connecting...' : 'Enter Office'}
			</Button>
		</form>
	</div>
</div>
