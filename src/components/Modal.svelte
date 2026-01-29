<script lang="ts">
    import Button from "./Button.svelte";
    import Card from "./Card.svelte";

    import type { Snippet } from 'svelte';

    let { 
        open = false, 
        title = "Warning", 
        message = "", 
        confirmText = "Confirm",
        cancelText = "Cancel",
        onConfirm, 
        onCancel,
        children
    }: {
        open?: boolean;
        title?: string;
        message?: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
        onCancel?: () => void;
        children?: Snippet;
    } = $props();
</script>

{#if open}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="w-full max-w-md">
            <Card padded>
                <h3 class="text-xl font-bold mb-2 text-red-600">{title}</h3>
                {#if message}
                    <p class="mb-6 text-gray-100">{message}</p>
                {/if}
                {@render children?.()}
                <div class="flex justify-end gap-2 mt-4">
                    <Button type="button" onclick={onCancel} class="bg-gray-200 hover:bg-gray-300 text-black">{cancelText}</Button>
                    <Button type="button" onclick={onConfirm} class="bg-red-600 hover:bg-red-700 text-white">{confirmText}</Button>
                </div>
            </Card>
        </div>
    </div>
{/if}
