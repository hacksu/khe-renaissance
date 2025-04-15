<script lang="ts">
    import { authClient } from "$lib/client";
    import NavbarItem from "./NavbarItem.svelte";

    let session = authClient.useSession();

</script>

<div class="absolute w-full flex flex-row p-5 justify-between bg-gray-950 text-white">
    <div>Kent Hack Enough</div>
    {#if $session.data}
        <div class="hidden w-auto md:flex flex-col sm:flex-row gap-3">
            <NavbarItem href="/">Home</NavbarItem>
            <NavbarItem href="/#sponsors">Sponsors</NavbarItem>
            <NavbarItem href="/#faq">FAQ</NavbarItem>
            <NavbarItem href="/contact">Contact</NavbarItem>
            <NavbarItem href="/schedule">Schedule</NavbarItem>
            <NavbarItem href="/profile">Hi, <span class="font-semibold">{$session.data.user.name}</span>!</NavbarItem>
        </div>
    {:else}
        <NavbarItem href="/login">Login</NavbarItem>
    {/if}
</div>
