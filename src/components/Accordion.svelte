<script lang="ts">
    import type { Snippet } from 'svelte';
    import { slide } from 'svelte/transition';
    import Icon from '@iconify/svelte';

    type Props = { name: Snippet; content: Snippet };
    const { name, content, }: Props = $props();

    let open = $state(true);
</script>

<div class="accordion-item">
    <button class="accordion-trigger {open ? 'open' : ''}" onclick={() => open = !open}>
        <Icon class="trigger-icon" icon={open ? 'mingcute:down-fill' : 'mingcute:right-fill'} />
        <span class="flex-1 text-left">
            {@render name()}
        </span>
        <span class="torch-dot {open ? 'lit' : ''}"></span>
    </button>

    {#if open}
        <div transition:slide={{ duration: 200 }} class="accordion-body">
            {@render content()}
        </div>
    {/if}
</div>

<style>
    .accordion-item {
        border-bottom: 1px solid rgba(74, 74, 92, 0.4);
    }
    .accordion-item:last-child { border-bottom: none; }

    .accordion-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 1.1rem 1.25rem;
        text-align: left;
        font-weight: 600;
        font-size: 0.95rem;
        color: #8e8ea8;
        background: transparent;
        cursor: pointer;
        transition: color 0.2s, background 0.2s;
    }
    .accordion-trigger:hover {
        color: #ffe066;
        background: rgba(255, 107, 26, 0.04);
    }
    .accordion-trigger.open {
        color: #ffe066;
        background: rgba(255, 107, 26, 0.06);
    }

    .torch-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(74, 74, 92, 0.6);
        flex-shrink: 0;
        transition: background 0.2s, box-shadow 0.2s;
    }
    .torch-dot.lit {
        background: #ff6b1a;
        box-shadow: 0 0 8px rgba(255, 107, 26, 0.7);
    }

    .accordion-body {
        padding: 0.5rem 1.25rem 1.25rem 3.125rem;
        color: #8e8ea8;
        font-size: 0.9rem;
        line-height: 1.7;
    }
</style>
