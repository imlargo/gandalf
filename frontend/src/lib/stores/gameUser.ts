import { writable } from 'svelte/store';

export interface GameUser {
	name: string;
	color: string;
}

export const gameUser = writable<GameUser | null>(null);
export const inGame = writable(false);
