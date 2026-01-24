<script lang="ts">
    import Button from "./Button.svelte";
    import Card from "./Card.svelte";

    let { 
        open = false, 
        title = "Warning", 
        message = "", 
        onConfirm, 
        onCancel,
        children
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
                    <Button type="button" onclick={onCancel} class="bg-gray-200 hover:bg-gray-300 text-black">Cancel</Button>
                    <Button type="button" onclick={onConfirm} class="bg-red-600 hover:bg-red-700 text-white">Confirm</Button>
                </div>
            </Card>
        </div>
    </div>
{/if}
