<script>

    import { authClient } from "$lib/client";
    import Icon from "@iconify/svelte";
    import Button from "../../../components/Button.svelte";
    import Card from "../../../components/Card.svelte";

    const { data } = $props();

</script>


<div class="px-4 md:px-24 lg:px-60 xl:px-96 h-screen w-screen flex flex-row items-center justify-center">
    <div class="w-full h-1/2">
        <Card>
            <div class="h-full flex gap-2 p-4 items-center text-center w-full flex-col justify-center">
                <p class="w-full text-xl">Welcome to Kent Hack Enough!</p>
                <div class="w-full flex flex-col gap-2">
                    {#each data.providers as { name, provider, icon }}
                        <Button onclick={async () => await authClient.signIn.social({ provider })} ><Icon icon={`logos:${icon}-icon`} />Login with {name}</Button>
                    {/each}
                </div>
            </div>
        </Card>
    </div>
</div>
