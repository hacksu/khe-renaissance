<script>
    import { authClient } from "$lib/client";
    import Icon from "@iconify/svelte";
    import Button from "../../../components/Button.svelte";
    import Card from "../../../components/Card.svelte";

    const { data } = $props();

    const embers = Array.from({ length: 24 }, () => ({
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        duration: Math.random() * 7 + 5,
        delay: -(Math.random() * 12),
        opacity: Math.random() * 0.5 + 0.3,
    }));
</script>

<style>
    @keyframes float-up {
        0%   { transform: translateY(0) translateX(0) scale(1); opacity: var(--op); }
        50%  { transform: translateY(-45vh) translateX(8px) scale(0.7); }
        100% { transform: translateY(-95vh) translateX(-4px) scale(0.2); opacity: 0; }
    }
    .ember {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, #ffe066 0%, #ff6b1a 60%, transparent 100%);
        animation: float-up ease-in infinite;
        pointer-events: none;
        bottom: 0;
    }
</style>

<div class="relative min-h-screen w-screen flex items-center justify-center overflow-hidden"
     style="background: radial-gradient(ellipse at bottom, #1a2e4a 0%, #0a1628 60%, #06101e 100%)">

    <!-- Embers -->
    {#each embers as e}
        <div
            class="ember"
            style="
                width: {e.size}px;
                height: {e.size}px;
                left: {e.left}%;
                animation-duration: {e.duration}s;
                animation-delay: {e.delay}s;
                --op: {e.opacity};
            "
        ></div>
    {/each}

    <div class="relative z-10 w-full max-w-sm px-4 flex flex-col gap-6">
        <div class="text-center">
            <h1 class="text-5xl font-black text-white tracking-tight leading-none">Kent Hack<br/>Enough</h1>
            <p class="text-castle-torchAmber/80 mt-3 text-lg font-light tracking-wide">Build something legendary.</p>
        </div>

        <Card>
            <div class="p-6 flex flex-col gap-3">
                <p class="text-center text-white/50 text-sm">Sign in to apply</p>
                {#each data.providers as { name, provider, icon }}
                    <Button onclick={async () => await authClient.signIn.social({ provider })}>
                        <Icon icon={`logos:${icon}-icon`} class="text-lg" />
                        Continue with {name}
                    </Button>
                {/each}
            </div>
        </Card>

        <p class="text-center text-white/20 text-xs">Spring 2027 · Free to attend · Open to all skill levels</p>
    </div>
</div>
