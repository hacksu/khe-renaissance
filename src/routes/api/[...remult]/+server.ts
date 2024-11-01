import { remultSveltekit } from "remult/remult-sveltekit";

export const _api = remultSveltekit({})

export const { GET, POST, PUT, DELETE } = _api
