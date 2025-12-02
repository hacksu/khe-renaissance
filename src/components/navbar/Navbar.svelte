<script lang="ts">
    import { authClient } from "$lib/client";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import Logo from "../../assets/2026logo.png";
    import devPost from "../../assets/devPost.png";
    import NavbarItem from "./NavbarItem.svelte";

    let session = authClient.useSession();
    let scrolled = $state(false);
    let mobileMenuOpen = $state(false);


    // Navigation links - some are pages, some are homepage sections, sorry, nothing I can do about that.
    const navLinks = [
        { href: "/", label: "Home", type: "page" },
        { href: "/schedule", label: "Schedule", type: "page" },
        { href: "/#prizes", label: "Prizes", type: "section" },
        { href: "/#faq", label: "FAQ", type: "section" },
        { href: "/#sponsors", label: "Sponsors", type: "section" }
    ];

    onMount(() => {
        const handleScroll = () => {
            scrolled = window.scrollY > 100;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    });

    function isActive(href: string): boolean {
        return $page.url.pathname === href;
    }
</script>

<a href="https://mlh.io/seasons/2026/events" target="_blank" class="fixed top-0 left-0 z-50">
    <img 
        decoding="async" 
        src="https://s3.amazonaws.com/logged-assets/trust-badge/2026/mlh-trust-badge-2026-red.svg" 
        alt="Major League Hacking 2026 Hackathon Season" 
        class="w-20"
    >
</a>

<nav 
    class="fixed top-0 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out"
    class:scrolled
    style="
        margin-top: {scrolled ? '0' : '1.5rem'};
        width: {scrolled ? '100%' : 'min(90%, 900px)'};
        border-radius: {scrolled ? '0' : '9999px'};
    "
>
    <div 
        class="relative backdrop-blur-sm bg-white bg-opacity-30 border border-white border-opacity-20 shadow-lg transition-all duration-500"
        style="border-radius: inherit;"
    >
        <div 
            class="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none transition-opacity duration-500"
            style="border-radius: inherit; opacity: {scrolled ? '1' : '0.5'};"
        ></div>

        <div class="relative px-6 py-3 flex items-center justify-center gap-4">
            <div class="hidden lg:flex items-center gap-1 flex-1 justify-end" style="padding-left: {$page.url.pathname === '/' ? '0' : (scrolled ? '100px' : '0')};">
                {#each navLinks.slice(1) as link}
                    <NavbarItem 
                        href={link.href}
                        class="relative px-3 py-2 text-gray-900 font-medium transition-all duration-300 hover:text-gray-600 group text-sm"
                    >
                        <span class="relative z-10">{link.label}</span>
                        
                        {#if isActive(link.href)}
                            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-accent rounded-full"></div>
                        {/if}
                        
                        <div class="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                    </NavbarItem>
                {/each}
            </div>

            <NavbarItem href="/" class="flex-shrink-0 mx-4">
                <img 
                    src={Logo} 
                    width={scrolled ? 60 : 70} 
                    alt="Kent Hack Enough" 
                    class="transition-all duration-500 hover:scale-110 hover:rotate-3"
                />
            </NavbarItem>

            <div class="hidden lg:flex items-center gap-3 flex-1 justify-end">
                <NavbarItem 
                    href="https://kent-hack-enough-2026.devpost.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="transition-transform duration-300 hover:scale-110 hover:rotate-6"
                >
                    <img src={devPost} width={40} alt="DevPost" />
                </NavbarItem>
                
                {#if $session.data}
                    <NavbarItem 
                        href="/profile" 
                        class="px-4 py-2 text-gray-900 font-medium bg-accent/20 hover:bg-accent/30 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/50 text-sm"
                    >
                        {$session.data.user.email}
                    </NavbarItem>
                {:else}
                    <NavbarItem 
                        href="/auth/login" 
                        class="px-5 py-2 text-gray-900 font-semibold bg-accent rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/50 hover:scale-105 hover:bg-accent/80 text-sm"
                    >
                        Login
                    </NavbarItem>
                {/if}
            </div>

            <button
                class="lg:hidden absolute right-4 w-10 h-10 flex flex-col justify-center items-center gap-1.5 group"
                onclick={() => mobileMenuOpen = !mobileMenuOpen}
                aria-label="Toggle menu"
            >
                <span 
                    class="w-6 h-0.5 bg-offwhite rounded-full transition-all duration-300 group-hover:bg-white"
                    class:rotate-45={mobileMenuOpen}
                    class:translate-y-2={mobileMenuOpen}
                ></span>
                <span 
                    class="w-6 h-0.5 bg-offwhite rounded-full transition-all duration-300 group-hover:bg-white"
                    class:opacity-0={mobileMenuOpen}
                ></span>
                <span 
                    class="w-6 h-0.5 bg-offwhite rounded-full transition-all duration-300 group-hover:bg-white"
                    class:-rotate-45={mobileMenuOpen}
                    class:-translate-y-2={mobileMenuOpen}
                ></span>
            </button>
        </div>
    </div>
</nav>

{#if mobileMenuOpen}
    <div 
        class="fixed inset-0 z-30 lg:hidden"
        onclick={() => mobileMenuOpen = false}
    >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"></div>
        
        <div 
            class="absolute top-20 right-4 left-4 bg-secondary/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-slide-down"
            onclick={(e) => e.stopPropagation()}
        >
            <div class="p-6 space-y-2">
                {#each navLinks as link}
                    <NavbarItem 
                        href={link.href}
                        class="block px-4 py-3 text-white font-medium rounded-lg transition-all duration-300 hover:bg-white/90 hover:translate-x-2"
                        onclick={() => mobileMenuOpen = false}
                    >
                        <span class="flex items-center gap-3">
                            {#if isActive(link.href)}
                                <span class="w-1.5 h-1.5 bg-accent rounded-full"></span>
                            {/if}
                            {link.label}
                        </span>
                    </NavbarItem>
                {/each}

                <div class="h-px bg-white/10 my-4"></div>

                <NavbarItem 
                    href="https://kent-hack-enough-2026.devpost.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 px-4 py-3 text-white font-medium rounded-lg transition-all duration-300 hover:bg-white/90"
                >
                    <img src={devPost} width={24} alt="DevPost" />
                    Submit on DevPost
                </NavbarItem>

                {#if $session.data}
                    <NavbarItem 
                        href="/profile" 
                        class="block px-4 py-3 text-center text-white font-semibold bg-accent/20 hover:bg-accent/30 rounded-lg transition-all duration-300"
                        onclick={() => mobileMenuOpen = false}
                    >
                        {$session.data.user.email}
                    </NavbarItem>
                {:else}
                    <NavbarItem 
                        href="/auth/login" 
                        class="block px-4 py-3 text-center text-white font-bold bg-gradient-to-r from-accent to-primary hover:from-primary hover:to-accent rounded-lg transition-all duration-300 hover:shadow-lg"
                        onclick={() => mobileMenuOpen = false}
                    >
                        Login
                    </NavbarItem>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slide-down {
        from {
            opacity: 0;
            transform: translateY(-1rem);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }

    .animate-slide-down {
        animation: slide-down 0.3s ease-out;
    }
</style>
