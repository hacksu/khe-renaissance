<script lang="ts">
    import { authClient } from "$lib/client";
    import Logo from "../../assets/styledLogo.png";
    import NavbarItem from "./NavbarItem.svelte";
    import devPost from "../../assets/Devpost.png";

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
    <NavbarItem href="/"><img src={Logo} width={70} alt="Kent Hack Enough" /></NavbarItem>
    <div class="hidden w-auto md:flex flex-col sm:flex-row gap-3 self-center">
        <NavbarItem href="https://kent-hack-enough-2026.devpost.com/" target="_blank" rel="noopener noreferrer"><img src={devPost} width={30} alt="DevPost" /></NavbarItem>
        <br>
        {#if $session.data}
            <NavbarItem href="/profile">{$session.data.user.email}</NavbarItem>
        {:else}
            <NavbarItem href="/login">Login</NavbarItem>
        {/if}
    </div>
</div>
