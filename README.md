# khe-renaissance

The recreation of [khe-revengeance](https://github.com/hacksu/khe-revengeance) but this time it's a Sveltekit app.
I also used Tailwind in this project because I think it makes most things easier.

### Why?

I have been given too much creative freedom.

## Installation

As you can see in the root of this repository, there is no package-lock.json. There is, however, a bun.lock. All of the packages in this project are managed by Bun, which is a Node.js runtime, as well as a drop in replacement for npm. You can find [instructions to install Bun here](https://bun.sh/).

Once you have Bun installed, this project is really easy to get up and running:

1. Install packages with `bun i`
2. Configure your .env file. You will want to copy the default one and then change it to your local dev settings. If you don't have a database:
   - Download [Docker](https://www.docker.com/products/docker-desktop/) for your machine. **PLEASE DO NOT PAY FOR IT** - there is a free tier that has all the features
   - Run `docker run --name dev-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres`
   - Run `docker exec -it dev-postgres psql -U postgres`
   - Once in the PSQL shell, run `CREATE DATABASE khe`
   - Now you can set the `DATABASE_URL` to `postgresql://postgres:postgres@localhost/khe`
3. Push the Prisma configuration to the database with `bunx prisma db push`
4. Generate the Prisma types with `bunx prisma generate`
5. Spin up the environment with `bun run dev`

## Technology Overview

This application uses some core technologies, most importantly:

- [SvelteKit](https://svelte.dev/): A full-stack JavaScript framework
- [Tailwind](https://tailwindcss.com/): Utility-first CSS classes
- [BetterAuth](https://www.better-auth.com/): Super easy authentication management (with Prisma integration)
- [daisyUI](https://daisyui.com/): Extension for Tailwind to add components
- [Prisma](https://www.prisma.io/orm): All-in-one database modeling and management, with TypeScript type safety 

### Sveltekit

I love Svelte and it's so easy to use. Typically I use **Svelte 5 in Runes mode**, which just means we explicitly declare state. What do I mean by that? Well, state used to be implicit in Svelte, like the following:
```Svelte
<script lang="ts">
    let x = 0;
</script>

<p>{x}</p>
<button on:click={() => x++}>Increase!</button>
```
But in Svelte 5 with Runes, the same component looks like this:
```Svelte
<script lang="ts">
    let x = $state(0);
</script>

<p>{x}</p>
<button onclick={() => x++}>Increase!</button>
```

I recommend if you haven't used any Svelte, to use the interactive tutorials [on their website](https://svelte.dev/docs/kit/introduction). Their documentation is fantastic and so much better than anything I could explain myself here.

### Tailwind

If you've never used Tailwind, it's dark magic. Instead of declaring CSS yourself, with classes like the following:
```Svelte
<script lang="ts">
    let x = $state(0);
</script>

<p class="red-text">{x}</p>
<button onclick={() => x++}>Increase!</button>

<style>
    .red-text {
        color: red;
    }
</style>
```
We just use a utility class from Tailwind:
```Svelte
<script lang="ts">
    let x = $state(0);
</script>

<p class="text-red-500">{x}</p>
<button onclick={() => x++}>Increase!</button>
```

No style tags needed, just classes inline with the components. [Tailwind's docs](https://tailwindcss.com/) are great and you can basically find any information about any class on there.

### BetterAuth

I just like having simplistic authentication management, which is what BetterAuth provides. It's complex under the hood but the client API we interact with is simple and well thought out. Not much needed to explain here. Authentication will not be cumbersome at all on this project.

### Prisma

In this project, there is a `prisma/` folder, which has a `schema.prisma` in it. That file contains the entire layout for our database. You can look through it and see how we define certain columns in those tables. With Prisma, we can then generate our TypeScript types, as well as push our tables to the database. At some point, we will probably start to generate migrations for our database, which will be in a `prisma/migrations/` folder.

### daisyUI

Just an extension of Tailwind. Adds a bunch of default styling for buttons, cards, etc. It's like we have a version of Bootstrap but for Tailwind. We will mostly use those components for the admin panel, all of the user facing interfaces will probably be custom design.

