<script lang="ts">
    import { page } from "$app/stores";
    import Icon from "@iconify/svelte";

    let links = [
        { href: "/staff", label: "Dashboard", icon: "mdi:view-dashboard" },
        { href: "/staff/team", label: "Team", icon: "mdi:shield-account" },
        { href: "/staff/judging", label: "Judging", icon: "mdi:gavel" },
        { href: "/staff/judges", label: "Judges", icon: "mdi:account-group" },
        { href: "/staff/scores", label: "Results", icon: "mdi:podium" },
        { href: "/staff/config", label: "Config", icon: "mdi:cog" },
    ];
</script>

<div class="min-h-screen flex flex-col relative pb-20">
    <!-- Main Content Slot -->
    <div class="flex-1">
        <slot />
    </div>

    <!-- Fixed Bottom Staff Navigation -->
    <div class="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-secondary/10 shadow-lg z-50">
        <div class="max-w-4xl mx-auto flex justify-around p-2">
            {#each links as link}
                {@const active = $page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href) && link.href !== "/staff")}
                <a 
                    href={link.href}
                    class="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 group
                    {active ? 'text-accent bg-accent/5' : 'text-secondary/60 hover:text-secondary hover:bg-secondary/5'}"
                >
                    <Icon icon={link.icon} width="24" height="24" class="mb-1 transition-transform group-active:scale-95 {active ? 'scale-110' : ''}" />
                    <span class="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
                </a>
            {/each}
        </div>
    </div>
</div>
