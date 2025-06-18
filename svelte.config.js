import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from 'svelte-adapter-bun';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		alias: {
			"$components/*": "./src/components/*"
		},
		adapter: adapter(),
		csrf: {
			checkOrigin: false // TODO: figure out a way to NOT have to do this, but for now Svelte just doesn't play nice with Compose
		},
	}
};

export default config;