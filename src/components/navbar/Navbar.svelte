<script lang="ts">
    import { authClient } from "$lib/client";
    import { onMount } from "svelte";
    import Logo from "../../assets/khe.png";
    import NavbarItem from "./NavbarItem.svelte";

    let session = authClient.useSession();
    let element: HTMLDivElement

    onMount(() => {
        const scrollHandler = () => {
            const progress = window.pageYOffset / window.innerHeight;
            if (progress > 1) return;
            element.style.backgroundColor = `rgba(182, 182, 182, ${progress.toFixed(2)}`;
        };
        
        window.addEventListener("scroll", scrollHandler);
        return () => {
            window.removeEventListener("scroll", scrollHandler)
        }
    });

</script>

<div bind:this={element}
    class="fixed w-full flex flex-row p-5 justify-between align-middle text-white">
    <img src={Logo} width={64} alt="Kent Hack Enough" />
    <div class="hidden w-auto md:flex flex-col sm:flex-row gap-3 self-center">
        <NavbarItem href="/">Home</NavbarItem>
        {#if $session.data}
            <NavbarItem href="/profile">{$session.data.user.email}</NavbarItem>
        {:else}
            <NavbarItem href="/login">Login</NavbarItem>
        {/if}
    </div>
</div>
