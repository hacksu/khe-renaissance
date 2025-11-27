<script lang="ts">
    import type { Snippet } from "svelte";
    import Button from "./Button.svelte";

    type Props = {
        show: boolean;
        title: string;
        message?: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
        onCancel: () => void;
        children?: Snippet;
    };

    const {
        show,
        title,
        message,
        confirmText = "Confirm",
        cancelText = "Cancel",
        onConfirm,
        onCancel,
        children
    }: Props = $props();

    const handleBackdropClick = (e: MouseEvent) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };
</script>

{#if show}
    <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onclick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
    >
        <div class="bg-secondary border-2 border-white rounded-md p-6 max-w-md w-full mx-4">
            <h2 class="text-xl font-bold text-white mb-4">{title}</h2>
            
            {#if message}
                <p class="text-white mb-6">{message}</p>
            {/if}

            {#if children}
                <div class="text-white mb-6">
                    {@render children()}
                </div>
            {/if}

            <div class="flex gap-2 justify-end">
                <div class="flex-1">
                    <Button type="button" onclick={onCancel}>
                        {cancelText}
                    </Button>
                </div>
                <div class="flex-1">
                    <Button type="button" onclick={onConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    </div>
{/if}
