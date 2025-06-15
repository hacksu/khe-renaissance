<script>

    import { authClient } from "$lib/client";
    import Icon from "@iconify/svelte";
    import Button from "../../components/Button.svelte";
    import Card from "../../components/Card.svelte";

</script>


<div class="py-24 px-4 md:px-24 lg:px-60 xl:px-96 h-screen w-screen flex flex-row items-center justify-center">
    <div class="w-full h-1/2">
        <Card>
            <div class="h-full flex gap-2 p-4 items-center text-center w-full">
                <p class="w-full text-xl">Welcome to Kent Hack Enough!</p>
                <div class="w-full flex flex-col gap-2">
                    <Button onclick={async () => await authClient.signIn.social({ provider: "discord" })} ><Icon icon="logos:discord-icon" />Login with Discord</Button>
                    <Button onclick={async () => await authClient.signIn.social({ provider: "github" })} ><Icon icon="logos:github-icon"/>Login with Github</Button>
                </div>
            </div>
        </Card>
    </div>
</div>
