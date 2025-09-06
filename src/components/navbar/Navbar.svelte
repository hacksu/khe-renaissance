<script lang="ts">
    import { authClient } from "$lib/client";
    import Logo from "../../assets/2026logo.png";
    import devPost from "../../assets/devPost.png";
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

<div class="fixed w-full flex flex-row py-2 px-5 justify-between text-white gap-6 bg-secondary bg-opacity-25">
    <div class="flex justify-between w-full">
        <a href="https://mlh.io/seasons/2026/events" target="_blank">
            <img decoding="async" src="https://s3.amazonaws.com/logged-assets/trust-badge/2026/mlh-trust-badge-2026-red.svg" alt="Major League Hacking 2026 Hackathon Season" class="w-20 absolute top-0 left-0">
        </a>
    </div>
    <div class="flex justify-end lg:justify-center w-full">
        <NavbarItem href="/"><img src={Logo} width={80} alt="Kent Hack Enough" /></NavbarItem>
    </div>
    <div class="hidden lg:flex gap-4 justify-end items-center w-full">
        <NavbarItem href="https://kent-hack-enough-2026.devpost.com/" target="_blank" rel="noopener noreferrer"><img src={devPost} width={40} alt="DevPost" /></NavbarItem>
        {#if $session.data}
            <NavbarItem href="/profile" class="text-2xl text-offwhite">{$session.data.user.email}</NavbarItem>
        {:else}
            <NavbarItem href="/auth/login" class="text-2xl">Login</NavbarItem>
        {/if}
    </div>
</div>




