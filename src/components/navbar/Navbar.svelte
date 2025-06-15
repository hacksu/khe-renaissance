<script lang="ts">
    import { authClient } from "$lib/client";
    import Logo from "../../assets/khe.png";
    import NavbarItem from "./NavbarItem.svelte";

    let session = authClient.useSession();
    // let element: HTMLDivElement

    // onMount(() => {
    //     const scrollHandler = () => {
    //         const progress = window.pageYOffset / window.innerHeight;
    //         if (progress > 1) return;
    //         element.style.backgroundColor = `rgba(182, 182, 182, ${progress.toFixed(2)}`;
    //     };
        
    //     window.addEventListener("scroll", scrollHandler);
    //     return () => {
    //         window.removeEventListener("scroll", scrollHandler)
    //     }
    // });

</script>

<div class="fixed w-full flex flex-row p-5 justify-between align-middle text-white">
    <NavbarItem href="/"><img src={Logo} width={64} alt="Kent Hack Enough" /></NavbarItem>
    <div class="hidden w-auto md:flex flex-col sm:flex-row gap-3 self-center">
        {#if $session.data}
            <NavbarItem href="/profile">{$session.data.user.email}</NavbarItem>
        {:else}
            <NavbarItem href="/login">Login</NavbarItem>
        {/if}
    </div>
</div>
