<script lang="ts">
    import { authClient } from "$lib/client";
    import Logo from "../../assets/2026logo.png";
    import NavbarItem from "./NavbarItem.svelte";
    import devPost from "../../assets/devPost.png";

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

<div class="fixed w-full flex flex-row py-2 px-5 justify-between align-middle text-white gap-6 bg-secondary bg-opacity-25">
    <NavbarItem href="/"><img src={Logo} width={80} alt="Kent Hack Enough" /></NavbarItem>
    <div class="hidden w-auto md:flex flex-col sm:flex-row gap-6 self-center">
        <NavbarItem href="https://kent-hack-enough-2026.devpost.com/" target="_blank" rel="noopener noreferrer"><img src={devPost} width={40} alt="DevPost" /></NavbarItem>
        {#if $session.data}
            <!-- <NavbarItem href="/profile" class="text-2xl" style="margin-right: 4.5rem;">{$session.data.user.email}</NavbarItem>-->
            <NavbarItem href="/profile" class="text-2xl text-offwhite">{$session.data.user.email}</NavbarItem>
        {:else}
            <!-- <NavbarItem href="/login" class="text-2xl" style="margin-right: 4.5rem;"></NavbarItem> -->
            <NavbarItem href="/login" class="text-2xl text-offwhite">Login</NavbarItem>
        {/if}
        <!--<NavbarItem href="https://mlh.io/seasons/2026/events" class="text-2xl">
            <img decoding="async" src="https://s3.amazonaws.com/logged-assets/trust-badge/2026/mlh-trust-badge-2026-red.svg" alt="Major League Hacking 2026 Hackathon Season" style="width: 5%; position: absolute; top: 0; right: 0;" class="self-center">
        </NavbarItem> -->
    </div>
</div>




