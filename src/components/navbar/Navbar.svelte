<script lang="ts">
    import { authClient } from "$lib/client";
    import NavbarItem from "./NavbarItem.svelte";

    let session = authClient.useSession();
</script>

<div class="absolute w-full flex flex-row p-5 justify-between bg-offwhite text-black">
    <h1 class="font-semibold">Kent Hack Enough</h1>
    <div class="hidden w-auto md:flex flex-col sm:flex-row gap-3">
        <NavbarItem href="/">Home</NavbarItem>
        {#if $session.data}
            <NavbarItem href="/profile">{$session.data.user.email}</NavbarItem>
        {:else}
            <NavbarItem href="/login">Login</NavbarItem>
        {/if}
    </div>
</div>
